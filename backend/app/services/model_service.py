import os
import numpy as np
from typing import Dict, Any, List, Optional
from pathlib import Path

from app.config import settings
from app.utils.meteorological import classify_intensity

# TensorFlow / Keras custom layer registration
import tensorflow as tf
from tensorflow.keras import layers

@tf.keras.utils.register_keras_serializable()
class PositionalEmbedding(layers.Layer):
    def __init__(self, sequence_length=4, embed_dim=64, **kwargs):
        super().__init__(**kwargs)
        self.sequence_length = sequence_length
        self.embed_dim = embed_dim
        self.position_embedding = layers.Embedding(
            input_dim=sequence_length,
            output_dim=embed_dim
        )

    def call(self, inputs):
        positions = tf.range(start=0, limit=self.sequence_length, delta=1)
        return inputs + self.position_embedding(positions)

    def get_config(self):
        config = super().get_config()
        config.update({
            "sequence_length": self.sequence_length,
            "embed_dim": self.embed_dim
        })
        return config

@tf.keras.utils.register_keras_serializable()
class TransformerEncoder(layers.Layer):
    def __init__(self, embed_dim=64, num_heads=4, ff_dim=128, dropout=0.1, **kwargs):
        super().__init__(**kwargs)
        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.ff_dim = ff_dim
        self.dropout_rate = dropout
        self.attention = layers.MultiHeadAttention(
            num_heads=num_heads,
            key_dim=embed_dim // num_heads
        )
        self.ffn = tf.keras.Sequential([
            layers.Dense(ff_dim, activation="gelu"),
            layers.Dense(embed_dim)
        ])
        self.norm1 = layers.LayerNormalization(epsilon=1e-6)
        self.norm2 = layers.LayerNormalization(epsilon=1e-6)
        self.dropout1 = layers.Dropout(dropout)
        self.dropout2 = layers.Dropout(dropout)

    def call(self, inputs, training=False):
        attn = self.attention(inputs, inputs, training=training)
        attn = self.dropout1(attn, training=training)
        x = self.norm1(inputs + attn)
        ffn_out = self.ffn(x)
        ffn_out = self.dropout2(ffn_out, training=training)
        return self.norm2(x + ffn_out)

    def get_config(self):
        config = super().get_config()
        config.update({
            "embed_dim": self.embed_dim,
            "num_heads": self.num_heads,
            "ff_dim": self.ff_dim,
            "dropout": self.dropout_rate
        })
        return config

class ModelService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self.model = None
        self.embedding_model = None
        self.y_mean: float = 38.0
        self.y_std: float = 22.6
        self._load_scaling()
        self._load_model()

    def _load_scaling(self):
        if settings.TRAIN_Y_PATH.exists():
            try:
                y_train = np.load(str(settings.TRAIN_Y_PATH))
                self.y_mean = float(y_train.mean())
                self.y_std = float(y_train.std())
                print(f"[ModelService] Loaded target scaling: mean={self.y_mean:.2f}, std={self.y_std:.2f}")
            except Exception as e:
                print(f"[ModelService] Notice on y_train: {e}, using default scaling.")

    def _load_model(self):
        if not settings.has_model:
            print("[ModelService] Model file not found at configured path.")
            return

        import sys
        if str(settings.DATA_ROOT) not in sys.path:
            sys.path.insert(0, str(settings.DATA_ROOT))

        try:
            import model as sih_model
            self.model = sih_model.build_model()
            self.model.load_weights(str(settings.MODEL_PATH), skip_mismatch=True)
            print(f"[ModelService] Successfully loaded weights into build_model() from {settings.MODEL_PATH}")
        except Exception as e1:
            print(f"[ModelService] Notice on build_model + load_weights: {e1}")
            try:
                custom_objects = {
                    "PositionalEmbedding": PositionalEmbedding,
                    "TransformerEncoder": TransformerEncoder
                }
                self.model = tf.keras.models.load_model(
                    str(settings.MODEL_PATH),
                    custom_objects=custom_objects,
                    compile=False
                )
                print(f"[ModelService] Loaded cyclone AI model via load_model from {settings.MODEL_PATH}")
            except Exception as e2:
                print(f"[ModelService] Notice on load_model: {e2}")

        if self.model is not None:
            try:
                # Find intermediate dense layer for 32-D shared representations
                for layer in reversed(self.model.layers):
                    if "dense" in layer.name.lower() and layer.name not in ["vmax", "intensity"]:
                        self.embedding_model = tf.keras.Model(
                            inputs=self.model.inputs,
                            outputs=layer.output
                        )
                        break
            except Exception as e:
                print(f"[ModelService] Notice on embedding extractor: {e}")

    def predict_sequence(
        self, 
        sequence: np.ndarray, 
        active_channels: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Run inference on (4, 128, 128, 4) sequence tensor.
        Channel indices: 0: IR1, 1: WV, 2: VIS, 3: PMW.
        """
        if sequence.shape != (4, 128, 128, 4):
            raise ValueError(f"Expected shape (4, 128, 128, 4), got {sequence.shape}")

        seq_input = sequence.copy().astype(np.float32)

        # Missing-sensor robustness masking
        all_channels = ["IR1", "WV", "VIS", "PMW"]
        channel_status = {c: True for c in all_channels}
        if active_channels is not None:
            for idx, c in enumerate(all_channels):
                if c not in active_channels:
                    seq_input[:, :, :, idx] = 0.0 # Zero mask
                    channel_status[c] = False

        if self.model is None:
            # Safe offline fallback estimation
            return {
                "ai_vmax": None,
                "intensity_class": None,
                "confidence": "UNAVAILABLE",
                "model_available": False,
                "message": "AI Model is not loaded or unavailable."
            }

        # Expand batch dimension -> (1, 4, 128, 128, 4)
        x_tensor = np.expand_dims(seq_input, axis=0)

        # Single inference pass
        raw_output = self.model(x_tensor, training=False)
        
        if isinstance(raw_output, dict):
            scaled_vmax = float(raw_output["vmax"][0, 0].numpy())
        elif isinstance(raw_output, (list, tuple)):
            scaled_vmax = float(raw_output[0][0, 0].numpy())
        else:
            scaled_vmax = float(raw_output[0, 0].numpy())

        # Unscale
        pred_vmax = (scaled_vmax * self.y_std) + self.y_mean
        pred_vmax = max(15.0, round(pred_vmax, 1))

        # Monte Carlo / ensemble perturbation for calibrated confidence interval
        # Run 5 fast perturbed passes with slight feature jitter
        jitter_preds = []
        for _ in range(5):
            noise = np.random.normal(0, 0.02, x_tensor.shape).astype(np.float32)
            out_j = self.model(x_tensor + noise, training=False)
            if isinstance(out_j, dict):
                s_v = float(out_j["vmax"][0, 0].numpy())
            elif isinstance(out_j, (list, tuple)):
                s_v = float(out_j[0][0, 0].numpy())
            else:
                s_v = float(out_j[0, 0].numpy())
            v_unscaled = (s_v * self.y_std) + self.y_mean
            jitter_preds.append(v_unscaled)

        std_err = float(np.std(jitter_preds))
        # Account for missing sensor penalty
        active_count = sum(1 for v in channel_status.values() if v)
        if active_count == 4:
            uncertainty_margin = max(5.0, round(1.96 * std_err + 4.5, 1))
            confidence = "HIGH" if std_err < 3.0 else "MEDIUM"
        elif active_count >= 2:
            uncertainty_margin = max(8.0, round(1.96 * std_err + 7.5, 1))
            confidence = "MEDIUM"
        else:
            uncertainty_margin = max(14.0, round(1.96 * std_err + 12.0, 1))
            confidence = "LOW"

        lower_bound = max(10.0, round(pred_vmax - uncertainty_margin, 1))
        upper_bound = round(pred_vmax + uncertainty_margin, 1)

        intensity_info = classify_intensity(pred_vmax)

        return {
            "ai_vmax": pred_vmax,
            "vmax_unit": "kt",
            "uncertainty_margin": uncertainty_margin,
            "estimated_range": [lower_bound, upper_bound],
            "confidence": confidence,
            "intensity_class": intensity_info["name"],
            "intensity_short": intensity_info["short_name"],
            "intensity_color": intensity_info["color"],
            "channels_used": channel_status,
            "active_channels_count": active_count,
            "model_available": True
        }

    def extract_embedding(self, sequence: np.ndarray) -> Optional[np.ndarray]:
        """
        Extract 32-D representation embedding from the shared layer.
        """
        if self.embedding_model is None:
            return None
        x = np.expand_dims(sequence.astype(np.float32), axis=0)
        emb = self.embedding_model(x, training=False)
        return emb[0].numpy()

model_service = ModelService()

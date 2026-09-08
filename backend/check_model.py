import sys
import traceback
from pathlib import Path

out_log = Path("check_log.txt")

try:
    with open(out_log, "w", encoding="utf-8") as f:
        f.write("Starting check...\n")

    data_root = Path(r"C:\SIH26")
    sys.path.insert(0, str(data_root))

    import tensorflow as tf
    with open(out_log, "a", encoding="utf-8") as f:
        f.write(f"TF Version: {tf.__version__}\n")

    from model import build_model, TransformerEncoder, PositionalEmbedding

    model_path = data_root / "best_cyclone_model.keras"
    with open(out_log, "a", encoding="utf-8") as f:
        f.write(f"Model Path exists: {model_path.exists()}\n")

    m = build_model()
    with open(out_log, "a", encoding="utf-8") as f:
        f.write("Model built successfully!\n")

    m.load_weights(str(model_path), skip_mismatch=True)
    with open(out_log, "a", encoding="utf-8") as f:
        f.write("Weights loaded with skip_mismatch=True!\n")

    dummy = tf.random.normal((1, 4, 128, 128, 4))
    out = m(dummy)
    with open(out_log, "a", encoding="utf-8") as f:
        f.write(f"Forward pass success! out={out}\n")

except Exception as e:
    with open(out_log, "a", encoding="utf-8") as f:
        f.write("Exception:\n")
        traceback.print_exc(file=f)

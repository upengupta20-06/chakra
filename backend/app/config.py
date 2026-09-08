import os
from pathlib import Path
from dotenv import load_dotenv

# Search for .env in current folder or parent folders
base_dir = Path(__file__).resolve().parent.parent.parent
env_path = base_dir / ".env"
if env_path.exists():
    load_dotenv(env_path)
else:
    load_dotenv()

class Settings:
    # Basic Server Settings
    BACKEND_HOST: str = os.getenv("BACKEND_HOST", "127.0.0.1")
    BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", "8000"))
    FRONTEND_PORT: int = int(os.getenv("FRONTEND_PORT", "5173"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Data Root & Auto-Discovery
    DEFAULT_DATA_ROOT: Path = Path(r"C:\SIH26")
    DATA_ROOT: Path = Path(os.getenv("DATA_ROOT", str(DEFAULT_DATA_ROOT)))

    # Dataset Files
    CYCLONE_H5_PATH: Path = Path(os.getenv("CYCLONE_H5_PATH", str(DATA_ROOT / "Cyclone_Images.h5")))
    CYCLONE_METADATA_PATH: Path = Path(os.getenv("CYCLONE_METADATA_PATH", str(DATA_ROOT / "cyclone_metadata.csv")))
    SEQUENCE_METADATA_PATH: Path = Path(os.getenv("SEQUENCE_METADATA_PATH", str(DATA_ROOT / "sequence_metadata.csv")))
    
    # Model Files
    MODEL_PATH: Path = Path(os.getenv("MODEL_PATH", str(DATA_ROOT / "best_cyclone_model.keras")))
    TRAIN_Y_PATH: Path = Path(os.getenv("TRAIN_Y_PATH", str(DATA_ROOT / "y_train.npy")))
    
    # Evaluation Files
    TEST_PREDICTIONS_PATH: Path = Path(os.getenv("TEST_PREDICTIONS_PATH", str(DATA_ROOT / "test_predictions.csv")))
    CLASSIFICATION_PREDICTIONS_PATH: Path = Path(os.getenv("CLASSIFICATION_PREDICTIONS_PATH", str(DATA_ROOT / "classification_predictions.csv")))
    
    # NOAA Layer
    NOAA_DATA_PATH: str = os.getenv("NOAA_DATA_PATH", "")

    # Execution controls
    DEMO_FALLBACK: bool = os.getenv("DEMO_FALLBACK", "true").lower() == "true"
    ENABLE_GPU: bool = os.getenv("ENABLE_GPU", "false").lower() == "true"

    @property
    def has_h5_data(self) -> bool:
        return self.CYCLONE_H5_PATH.exists() and self.CYCLONE_H5_PATH.is_file()

    @property
    def has_metadata(self) -> bool:
        return self.CYCLONE_METADATA_PATH.exists() and self.CYCLONE_METADATA_PATH.is_file()

    @property
    def has_sequence_metadata(self) -> bool:
        return self.SEQUENCE_METADATA_PATH.exists() and self.SEQUENCE_METADATA_PATH.is_file()

    @property
    def has_model(self) -> bool:
        return self.MODEL_PATH.exists() and self.MODEL_PATH.is_file()

    @property
    def has_test_predictions(self) -> bool:
        return self.TEST_PREDICTIONS_PATH.exists() and self.TEST_PREDICTIONS_PATH.is_file()

    @property
    def has_noaa_layer(self) -> bool:
        if not self.NOAA_DATA_PATH:
            return False
        return Path(self.NOAA_DATA_PATH).exists()

    def get_status_summary(self) -> dict:
        return {
            "data_root": str(self.DATA_ROOT),
            "h5_data_found": self.has_h5_data,
            "h5_file": str(self.CYCLONE_H5_PATH) if self.has_h5_data else None,
            "metadata_found": self.has_metadata,
            "sequence_metadata_found": self.has_sequence_metadata,
            "model_found": self.has_model,
            "model_path": str(self.MODEL_PATH) if self.has_model else None,
            "test_predictions_found": self.has_test_predictions,
            "noaa_layer_connected": self.has_noaa_layer,
            "environment": self.ENVIRONMENT
        }

settings = Settings()

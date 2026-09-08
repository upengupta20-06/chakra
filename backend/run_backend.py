import sys
import os
from pathlib import Path

# Add backend directory to sys.path so app modules import cleanly
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

import uvicorn
from app.config import settings

if __name__ == "__main__":
    print("=" * 75)
    print("STARTING CYCLONE INTELLIGENCE BACKEND SERVER")
    print("=" * 75)
    print(f"Host: {settings.BACKEND_HOST}")
    print(f"Port: {settings.BACKEND_PORT}")
    print(f"Data Root: {settings.DATA_ROOT}")
    print(f"H5 Found: {settings.has_h5_data}")
    print(f"Model Found: {settings.has_model}")
    print("=" * 75)

    uvicorn.run(
        "app.main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=False
    )

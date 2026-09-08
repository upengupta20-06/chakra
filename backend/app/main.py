from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any

from app.config import settings
from app.api.cyclones import router as cyclones_router
from app.api.predict import router as predict_router
from app.api.explain import router as explain_router
from app.api.performance import router as performance_router
from app.api.alerts import router as alerts_router
from app.api.noaa import router as noaa_router

app = FastAPI(
    title="Cyclone Intelligence Platform API",
    description="AI-Based Tropical Cyclone Identification, Classification, Prediction & Early-Warning Platform for SIH.",
    version="1.0.0"
)

# CORS configuration for development and local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers under /api
app.include_router(cyclones_router, prefix="/api")
app.include_router(predict_router, prefix="/api")
app.include_router(explain_router, prefix="/api")
app.include_router(performance_router, prefix="/api")
app.include_router(alerts_router, prefix="/api")
app.include_router(noaa_router, prefix="/api")

@app.get("/api/health", tags=["System"])
def health_check() -> Dict[str, Any]:
    return {
        "status": "healthy",
        "service": "Cyclone Intelligence Platform",
        "version": "1.0.0"
    }

@app.get("/api/data-status", tags=["System"])
def data_status() -> Dict[str, Any]:
    """
    Report the status of connected datasets (TCIR, HDF5, CSV, NOAA) and AI models.
    """
    summary = settings.get_status_summary()
    return {
        "system": "Cyclone Intelligence Platform",
        "configuration": summary,
        "active_layers": {
            "tcir_satellite_imagery": "Connected" if summary["h5_data_found"] else "Unavailable (Demo fallback)",
            "tcir_metadata": "Connected" if summary["metadata_found"] else "Unavailable",
            "spatiotemporal_ai_model": "Loaded" if summary["model_found"] else "Offline fallback",
            "offline_test_eval": "Available" if summary["test_predictions_found"] else "Reference mode",
            "noaa_adt_hursat_layer": "Connected" if summary["noaa_layer_connected"] else "Not connected (Optional layer)",
            "live_windy_layer": "Connected (External Web/Radar)"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.BACKEND_HOST, port=settings.BACKEND_PORT, reload=True)

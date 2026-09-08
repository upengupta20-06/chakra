import numpy as np
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.services.data_loader import data_loader
from app.services.model_service import model_service
from app.services.forecast_service import forecast_service

router = APIRouter(prefix="/predict", tags=["Prediction"])

class IntensityPredictRequest(BaseModel):
    cyclone_id: str
    active_channels: Optional[List[str]] = Field(
        default=["IR1", "WV", "VIS", "PMW"],
        description="List of active channels to simulate missing sensor conditions"
    )

class ForecastPredictRequest(BaseModel):
    cyclone_id: str
    current_vmax: Optional[float] = None

@router.post("/intensity")
def predict_intensity(req: IntensityPredictRequest):
    """
    Run spatiotemporal ConvLSTM + Transformer model inference on the 4-step sequence
    of multi-channel satellite data (128x128x4 x 4 frames).
    Supports sensor masking to test missing-sensor robustness.
    """
    detail = data_loader.get_cyclone_detail(req.cyclone_id)
    if detail is None:
        raise HTTPException(status_code=404, detail=f"Cyclone '{req.cyclone_id}' not found.")

    indices = detail.get("sequence_image_indices", [])
    if len(indices) < 4:
        raise HTTPException(status_code=400, detail="Insufficient temporal frames for sequence model.")

    # Load 4 frames from HDF5
    frames = []
    for idx in indices[:4]:
        raw = data_loader.get_raw_image(idx)
        if raw is None:
            # Fallback zero tensor
            raw = np.zeros((128, 128, 4), dtype=np.float32)
        frames.append(raw)

    sequence_tensor = np.stack(frames, axis=0) # (4, 128, 128, 4)

    # Run model prediction
    prediction = model_service.predict_sequence(
        sequence_tensor, 
        active_channels=req.active_channels
    )

    # Attach ground truth reference for comparison
    prediction["reference_vmax"] = detail["current_vmax"]
    prediction["reference_source"] = "[TCIR GROUND TRUTH]"
    prediction["prediction_source"] = "[AI PREDICTION]"
    prediction["cyclone_id"] = req.cyclone_id
    prediction["error_delta"] = round(prediction["ai_vmax"] - detail["current_vmax"], 1) if prediction["ai_vmax"] else None

    return prediction

@router.post("/forecast")
def predict_forecast(req: ForecastPredictRequest):
    """
    Generate +3h and +6h intensity forecast using temporal trend analysis.
    Explicitly marks +12h/+24h horizons as unavailable to prevent fake data.
    """
    detail = data_loader.get_cyclone_detail(req.cyclone_id)
    if detail is None:
        raise HTTPException(status_code=404, detail=f"Cyclone '{req.cyclone_id}' not found.")

    vmax_hist = [h["vmax"] for h in detail.get("history", [])][-4:]
    curr_v = req.current_vmax if req.current_vmax is not None else detail["current_vmax"]

    forecast_res = forecast_service.predict_short_term_forecast(
        vmax_sequence=vmax_hist,
        current_ai_vmax=curr_v
    )

    forecast_res["cyclone_id"] = req.cyclone_id
    forecast_res["source"] = "[AI FORECAST]"
    return forecast_res

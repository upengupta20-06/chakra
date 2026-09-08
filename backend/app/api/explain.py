import numpy as np
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List

from app.services.data_loader import data_loader
from app.services.explain_service import explain_service
from app.services.similarity_service import similarity_service

router = APIRouter(prefix="", tags=["Explainability & Similarity"])

class ExplainRequest(BaseModel):
    cyclone_id: str
    base_channel: int = Field(0, ge=0, le=3, description="Base channel for overlay (0: IR1, 1: WV, 2: VIS, 3: PMW)")

class SimilarityRequest(BaseModel):
    cyclone_id: str
    current_vmax: Optional[float] = None
    limit: int = Field(4, ge=1, le=10)

@router.post("/explain")
def get_explainability(req: ExplainRequest):
    """
    Generate Grad-CAM spatial feature attribution heatmap and channel contribution breakdown
    (IR1, WV, VIS, PMW) for the cyclone's current state.
    """
    detail = data_loader.get_cyclone_detail(req.cyclone_id)
    if detail is None:
        raise HTTPException(status_code=404, detail=f"Cyclone '{req.cyclone_id}' not found.")

    indices = detail.get("sequence_image_indices", [])
    frames = []
    for idx in indices[:4]:
        raw = data_loader.get_raw_image(idx)
        if raw is None:
            raw = np.zeros((128, 128, 4), dtype=np.float32)
        frames.append(raw)

    seq_tensor = np.stack(frames, axis=0) # (4, 128, 128, 4)

    attribution = explain_service.compute_attribution(
        sequence=seq_tensor,
        base_channel=req.base_channel
    )
    attribution["cyclone_id"] = req.cyclone_id
    attribution["source"] = "[MODEL FEATURE ATTRIBUTION]"
    return attribution

@router.post("/similar")
def get_similar_cyclones(req: SimilarityRequest):
    """
    Compute embedding cosine similarity against historical cyclone benchmarks.
    Returns nearest historical patterns with representation similarity percentage.
    """
    detail = data_loader.get_cyclone_detail(req.cyclone_id)
    if detail is None:
        raise HTTPException(status_code=404, detail=f"Cyclone '{req.cyclone_id}' not found.")

    vmax = req.current_vmax if req.current_vmax is not None else detail["current_vmax"]
    
    # Load sequence if available
    indices = detail.get("sequence_image_indices", [])
    frames = []
    for idx in indices[:4]:
        raw = data_loader.get_raw_image(idx)
        if raw is not None:
            frames.append(raw)

    seq = np.stack(frames, axis=0) if len(frames) == 4 else None

    matches = similarity_service.find_similar_cyclones(
        current_vmax=vmax,
        sequence=seq,
        limit=req.limit
    )

    return {
        "cyclone_id": req.cyclone_id,
        "current_vmax": vmax,
        "source": "[REPRESENTATION SIMILARITY]",
        "matches": matches,
        "disclaimer": "Representation similarity reflects shared neural embedding distance. It does not guarantee identical future trajectory or physical behavior."
    }

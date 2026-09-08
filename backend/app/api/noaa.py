from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.data_loader import data_loader
from app.services.noaa_service import noaa_service

router = APIRouter(prefix="/noaa", tags=["NOAA ADT-HURSAT & Morphology"])

@router.get("/{cyclone_id}")
def get_noaa_and_morphology(
    cyclone_id: str,
    timestamp: Optional[str] = Query(None, description="Observation timestamp")
):
    """
    Retrieve NOAA ADT-HURSAT descriptors (CI, RawT, EyeScene, CloudSym, etc.)
    and AI-derived structural profile.
    Strictly differentiates between NOAA physical records and AI-derived estimates.
    """
    detail = data_loader.get_cyclone_detail(cyclone_id)
    if detail is None:
        raise HTTPException(status_code=404, detail=f"Cyclone '{cyclone_id}' not found.")

    # 1. Physical NOAA layer query
    noaa_record = noaa_service.get_cyclone_noaa_data(
        cyclone_id=cyclone_id,
        timestamp=timestamp or detail["current_time"]
    )

    # 2. AI-derived structural profile
    raw_img = data_loader.get_raw_image(detail.get("latest_image_index", 0))
    ai_profile = noaa_service.derive_ai_structural_profile(
        current_vmax=detail["current_vmax"],
        raw_frame=raw_img
    )

    return {
        "cyclone_id": cyclone_id,
        "basin": detail["basin"],
        "timestamp": timestamp or detail["current_time"],
        "noaa_adt_hursat": noaa_record,
        "ai_structural_profile": ai_profile
    }

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from app.services.data_loader import data_loader

router = APIRouter(prefix="/cyclones", tags=["Cyclones"])

@router.get("")
def list_cyclones(
    basin: Optional[str] = Query(None, description="Basin filter: ATLN, EPAC, WPAC, or ALL"),
    search: Optional[str] = Query(None, description="Search by Cyclone ID or Basin"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    """
    List tracked tropical cyclones with aggregated intensity, basin, and coordinates.
    """
    summary = data_loader.get_cyclones_summary(basin=basin, search=search, limit=limit, offset=offset)
    return summary

@router.get("/{cyclone_id}")
def get_cyclone(cyclone_id: str):
    """
    Get full timeline, current status, movement vector, and life-cycle for a specific cyclone.
    """
    detail = data_loader.get_cyclone_detail(cyclone_id)
    if detail is None:
        raise HTTPException(status_code=404, detail=f"Cyclone '{cyclone_id}' not found.")
    return detail

@router.get("/{cyclone_id}/satellite")
def get_cyclone_satellite(
    cyclone_id: str,
    timesteps: int = Query(4, ge=1, le=4, description="Number of temporal frames (up to 4)")
):
    """
    Fetch multi-source satellite imagery (IR1, WV, VIS, PMW) for the cyclone's observation sequence.
    Returns base64 PNGs for each channel across T-9h, T-6h, T-3h, and CURRENT.
    """
    detail = data_loader.get_cyclone_detail(cyclone_id)
    if detail is None:
        raise HTTPException(status_code=404, detail=f"Cyclone '{cyclone_id}' not found.")

    indices = detail.get("sequence_image_indices", [])
    if not indices:
        raise HTTPException(status_code=404, detail="No satellite images available for this cyclone.")

    sequence_frames = data_loader.get_satellite_sequence(indices[:timesteps])
    return {
        "cyclone_id": cyclone_id,
        "basin": detail["basin"],
        "frames_count": len(sequence_frames),
        "frames": sequence_frames
    }

from fastapi import APIRouter
from app.services.metrics_service import metrics_service

router = APIRouter(prefix="/performance", tags=["Model Performance"])

@router.get("")
def get_model_performance():
    """
    Retrieve rigorous offline test set evaluation metrics and validation charts data.
    """
    metrics = metrics_service.get_test_performance_metrics()
    return metrics

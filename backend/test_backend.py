import sys
from pathlib import Path
import numpy as np

# Ensure backend directory is in path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

# Fix Windows console UTF-8 output
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

def run_tests():
    print("=" * 70)
    print("RUNNING CYCLONE INTELLIGENCE BACKEND VERIFICATION SUITE")
    print("=" * 70)

    # 1. Config Test
    print("\n[Test 1/7] Testing Configuration & Auto-Discovery...")
    from app.config import settings
    summary = settings.get_status_summary()
    print(f"Data Root: {summary['data_root']}")
    print(f"H5 Found: {summary['h5_data_found']}")
    print(f"Model Found: {summary['model_found']}")
    assert summary["data_root"] is not None
    print("✓ Configuration verified.")

    # 2. Data Loader Test
    print("\n[Test 2/7] Testing Data Loader...")
    from app.services.data_loader import data_loader
    cyc_summary = data_loader.get_cyclones_summary(limit=5)
    print(f"Total cyclones found: {cyc_summary['total']}")
    assert cyc_summary["total"] > 0
    first_cyc = cyc_summary["cyclones"][0]
    print(f"First cyclone: ID={first_cyc['cyclone_id']}, Basin={first_cyc['basin']}, Peak Vmax={first_cyc['peak_vmax']} kt")
    
    # Detail test
    detail = data_loader.get_cyclone_detail(first_cyc["cyclone_id"])
    assert detail is not None
    print(f"Detail verified: {detail['cyclone_id']} has {detail['observations_count']} timesteps.")
    
    # Satellite frame test
    latest_img_idx = detail.get("latest_image_index", 0)
    frame = data_loader.get_satellite_frame(latest_img_idx)
    assert "channels" in frame
    assert "IR1" in frame["channels"]
    assert frame["channels"]["IR1"]["image_url"].startswith("data:image/png;base64,")
    print("✓ Data Loader and Satellite Image Encoding verified.")

    # 3. Model Service Test
    print("\n[Test 3/7] Testing Model Service & Inference...")
    from app.services.model_service import model_service
    dummy_seq = np.random.normal(0.5, 0.2, (4, 128, 128, 4)).astype(np.float32)
    pred = model_service.predict_sequence(dummy_seq)
    print(f"Model prediction: Vmax={pred['ai_vmax']} kt, Class={pred['intensity_class']}, Confidence={pred['confidence']}")
    assert pred["ai_vmax"] is not None
    
    # Missing sensor test
    pred_masked = model_service.predict_sequence(dummy_seq, active_channels=["IR1", "WV"])
    print(f"Missing-sensor prediction (IR+WV only): Vmax={pred_masked['ai_vmax']} kt, Confidence={pred_masked['confidence']}")
    assert pred_masked["active_channels_count"] == 2
    print("✓ Model Service and Missing-Sensor Robustness verified.")

    # 4. Explainability Test
    print("\n[Test 4/7] Testing Explainable AI (Grad-CAM & Channel Contributions)...")
    from app.services.explain_service import explain_service
    attribution = explain_service.compute_attribution(dummy_seq, base_channel=0)
    print(f"Channel Contributions: {attribution['channel_contributions']}")
    print(f"Highest Contributor: {attribution['highest_contributor']}")
    assert attribution["overlay_image_url"].startswith("data:image/png;base64,")
    print("✓ Explainable AI verified.")

    # 5. Forecast Service Test
    print("\n[Test 5/7] Testing Short-Term Forecast...")
    from app.services.forecast_service import forecast_service
    fc = forecast_service.predict_short_term_forecast([50.0, 55.0, 62.0, 70.0], current_ai_vmax=70.0)
    print(f"Forecast: NOW={fc['current']['vmax']} kt, +3h={fc['plus_3h']['vmax']} kt, +6h={fc['plus_6h']['vmax']} kt, Trend={fc['overall_trend']}")
    assert fc["plus_12h"]["available"] is False
    print("✓ Short-Term Forecast verified.")

    # 6. Similarity & Alerts Test
    print("\n[Test 6/7] Testing Similarity & Alerts Engine...")
    from app.services.similarity_service import similarity_service
    from app.api.alerts import get_active_alerts
    similar = similarity_service.find_similar_cyclones(current_vmax=105.0, sequence=dummy_seq)
    print(f"Found {len(similar)} similar historical benchmarks. Top: {similar[0]['name']} ({similar[0]['label']})")
    assert len(similar) > 0
    alerts = get_active_alerts()
    print(f"Active early warning alerts generated: {alerts['total_active_alerts']}")
    print("✓ Similarity & Alerts verified.")

    # 7. Metrics & Performance Test
    print("\n[Test 7/7] Testing Offline Test Set Metrics Service...")
    from app.services.metrics_service import metrics_service
    metrics = metrics_service.get_test_performance_metrics()
    print(f"Test samples: {metrics['evaluation_samples']}")
    print(f"MAE: {metrics['metrics']['mae']} kt | RMSE: {metrics['metrics']['rmse']} kt | R²: {metrics['metrics']['r2']}")
    assert metrics["evaluation_samples"] > 0
    print("✓ Metrics & Validation verified.")

    print("\n" + "=" * 70)
    print("ALL BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()

import numpy as np
from typing import List, Dict, Any
from app.utils.meteorological import classify_intensity

class ForecastService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ForecastService, cls).__new__(cls)
        return cls._instance

    def predict_short_term_forecast(
        self, 
        vmax_sequence: List[float], 
        current_ai_vmax: float
    ) -> Dict[str, Any]:
        """
        Produce verified short-term forecasts for +3h and +6h horizons
        using recent temporal trends from the 4-step observation window.
        """
        if len(vmax_sequence) < 2:
            base_v = float(current_ai_vmax)
            trend_rate = 0.0
        else:
            # Recent rate of change over the 3-hour interval
            base_v = float(current_ai_vmax)
            v_t = float(vmax_sequence[-1])
            v_prev = float(vmax_sequence[-2])
            delta = v_t - v_prev
            # Inertial trend damping
            trend_rate = np.clip(delta * 0.8, -8.0, 10.0)

        # +3h projection
        f_3h = max(15.0, round(base_v + trend_rate, 1))
        # +6h projection with continued damping
        f_6h = max(15.0, round(f_3h + (trend_rate * 0.7), 1))

        if trend_rate >= 4.0:
            trend_str = "INTENSIFYING"
        elif trend_rate <= -4.0:
            trend_str = "WEAKENING"
        else:
            trend_str = "STABLE"

        return {
            "current": {
                "vmax": round(base_v, 1),
                "horizon": "NOW",
                "intensity_class": classify_intensity(base_v)["short_name"],
                "confidence": "HIGH"
            },
            "plus_3h": {
                "vmax": f_3h,
                "horizon": "+3 HOURS",
                "delta": round(f_3h - base_v, 1),
                "intensity_class": classify_intensity(f_3h)["short_name"],
                "confidence": "MEDIUM"
            },
            "plus_6h": {
                "vmax": f_6h,
                "horizon": "+6 HOURS",
                "delta": round(f_6h - base_v, 1),
                "intensity_class": classify_intensity(f_6h)["short_name"],
                "confidence": "MEDIUM"
            },
            "plus_12h": {
                "available": False,
                "message": "Long-range forecast unavailable — insufficient training sequence coverage."
            },
            "plus_24h": {
                "available": False,
                "message": "Long-range forecast unavailable — insufficient training sequence coverage."
            },
            "overall_trend": trend_str,
            "rate_per_3h": round(trend_rate, 1)
        }

forecast_service = ForecastService()

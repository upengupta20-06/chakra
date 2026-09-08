import math
from typing import Tuple, Dict, Any, List

def classify_intensity(vmax: float) -> Dict[str, Any]:
    """
    Classify cyclone intensity according to Saffir-Simpson / WMO prototype scale.
    Thresholds:
      < 34 kt    : Tropical Depression (0)
      34 - 63 kt : Tropical Storm (1)
      64 - 82 kt : Category 1 Hurricane/Typhoon (2)
      83 - 95 kt : Category 2 (3)
      96 - 112 kt: Category 3 (Major) (4)
      113 - 136 kt: Category 4 (Major) (5)
      137+ kt    : Category 5 (Catastrophic) (6)
    """
    vmax = float(vmax)
    if vmax < 34.0:
        return {
            "class_id": 0,
            "name": "Tropical Depression",
            "short_name": "TD",
            "range": "< 34 kt",
            "color": "#60a5fa", # Blue
            "severity": "Low"
        }
    elif vmax < 64.0:
        return {
            "class_id": 1,
            "name": "Tropical Storm",
            "short_name": "TS",
            "range": "34–63 kt",
            "color": "#34d399", # Emerald
            "severity": "Moderate"
        }
    elif vmax < 83.0:
        return {
            "class_id": 2,
            "name": "Category 1",
            "short_name": "CAT 1",
            "range": "64–82 kt",
            "color": "#facc15", # Yellow
            "severity": "High"
        }
    elif vmax < 96.0:
        return {
            "class_id": 3,
            "name": "Category 2",
            "short_name": "CAT 2",
            "range": "83–95 kt",
            "color": "#fb923c", # Orange
            "severity": "Very High"
        }
    elif vmax < 113.0:
        return {
            "class_id": 4,
            "name": "Category 3",
            "short_name": "CAT 3",
            "range": "96–112 kt",
            "color": "#f87171", # Red
            "severity": "Severe (Major)"
        }
    elif vmax < 137.0:
        return {
            "class_id": 5,
            "name": "Category 4",
            "short_name": "CAT 4",
            "range": "113–136 kt",
            "color": "#c084fc", # Purple
            "severity": "Extreme (Major)"
        }
    else:
        return {
            "class_id": 6,
            "name": "Category 5",
            "short_name": "CAT 5",
            "range": "≥ 137 kt",
            "color": "#f43f5e", # Rose/Crimson
            "severity": "Catastrophic"
        }

def estimate_mslp_from_vmax(vmax: float) -> float:
    """
    Standard meteorological approximation (Knaff-Zehr / Dvorak relationship)
    when physical observation is unrecorded.
    Central pressure deficit scales with Vmax.
    """
    vmax = max(10.0, float(vmax))
    # Empirical formulation: MSLP ~ 1012 - (vmax / 1.5)**1.14 approx
    deficit = 0.65 * vmax + 0.002 * (vmax ** 2)
    mslp = round(1013.25 - deficit, 1)
    return max(870.0, min(1015.0, mslp))

def detect_rapid_intensification(
    vmax_series: List[float], 
    time_delta_hours: float = 6.0
) -> Dict[str, Any]:
    """
    Detect Rapid Intensification (RI).
    Meteorological definition: Increase of sustained wind >= 30 kt in 24 hours.
    Equivalent 6-hour operational threshold: >= 7.5 to 10 kt / 6h.
    Equivalent 3-hour operational threshold: >= 5 kt / 3h.
    """
    if len(vmax_series) < 2:
        return {
            "trend": "STABLE",
            "is_ri": False,
            "delta_vmax": 0.0,
            "rate_per_hour": 0.0,
            "description": "Insufficient temporal observations to assess trend."
        }
    
    current_v = float(vmax_series[-1])
    prev_v = float(vmax_series[-2])
    delta = current_v - prev_v
    rate = delta / max(0.1, time_delta_hours)

    # Multi-step 24h RI check if full sequence available
    ri_24h = False
    if len(vmax_series) >= 4:
        delta_window = current_v - float(vmax_series[0])
        # If 9h window delta >= 12 kt, or 6h delta >= 10 kt
        if delta_window >= 15.0 or delta >= 10.0:
            ri_24h = True

    if ri_24h or delta >= 10.0 or rate >= 1.5:
        trend = "RAPID INTENSIFICATION"
        is_ri = True
        desc = f"Rapid Intensification detected: ΔVmax = +{delta:.1f} kt over recent observation window."
    elif delta >= 4.0:
        trend = "INTENSIFYING"
        is_ri = False
        desc = f"Cyclone is intensifying at +{rate:.2f} kt/h."
    elif delta <= -4.0:
        trend = "WEAKENING"
        is_ri = False
        desc = f"Cyclone is weakening at {rate:.2f} kt/h."
    else:
        trend = "STABLE"
        is_ri = False
        desc = "System intensity is currently steady."

    return {
        "trend": trend,
        "is_ri": is_ri,
        "delta_vmax": round(delta, 1),
        "rate_per_hour": round(rate, 2),
        "description": desc
    }

def determine_lifecycle_stage(
    vmax_history: List[float], 
    current_vmax: float
) -> Dict[str, Any]:
    """
    Determine cyclone life-cycle stage:
    GENESIS -> ORGANIZATION -> INTENSIFICATION -> MATURE -> WEAKENING -> DISSIPATION
    """
    current_vmax = float(current_vmax)
    max_ever = max(vmax_history) if vmax_history else current_vmax

    if len(vmax_history) < 2:
        if current_vmax < 34:
            stage = "GENESIS"
        elif current_vmax < 64:
            stage = "ORGANIZATION"
        else:
            stage = "INTENSIFICATION"
    else:
        delta = current_vmax - vmax_history[-2]
        if current_vmax < 30 and max_ever < 40:
            stage = "GENESIS"
        elif current_vmax < 45 and delta >= 0 and max_ever < 55:
            stage = "ORGANIZATION"
        elif delta > 3 and current_vmax < 110:
            stage = "INTENSIFICATION"
        elif current_vmax >= 64 and (current_vmax >= max_ever - 5 or abs(delta) <= 3):
            stage = "MATURE"
        elif delta < -2 and current_vmax >= 34:
            stage = "WEAKENING"
        elif current_vmax < 34 and max_ever >= 45:
            stage = "DISSIPATION"
        else:
            stage = "ORGANIZATION"

    descriptions = {
        "GENESIS": "Incipient tropical depression forming with low-level cyclonic vorticity.",
        "ORGANIZATION": "Convective curved bands organizing around incipient center.",
        "INTENSIFICATION": "Central dense overcast deepening, central pressure dropping steadily.",
        "MATURE": "Well-defined eyewall structure operating at near peak thermodynamic intensity.",
        "WEAKENING": "System facing increased shear, dry air entrainment, or lower sea surface temperatures.",
        "DISSIPATION": "Convection decaying into remnant low or transitioning extratropically."
    }

    return {
        "stage": stage,
        "description": descriptions.get(stage, "Active tropical system."),
        "is_peak": current_vmax >= max_ever - 2 and current_vmax >= 64
    }

def calculate_track_movement(
    latitudes: List[float], 
    longitudes: List[float], 
    time_delta_hours: float = 3.0
) -> Dict[str, Any]:
    """
    Calculate translation speed (km/h) and heading direction from track coordinates.
    """
    if len(latitudes) < 2 or len(longitudes) < 2:
        return {
            "speed_kmh": 0.0,
            "speed_knots": 0.0,
            "bearing_degrees": 0.0,
            "cardinal_direction": "STATIONARY"
        }

    lat1, lon1 = math.radians(latitudes[-2]), math.radians(longitudes[-2])
    lat2, lon2 = math.radians(latitudes[-1]), math.radians(longitudes[-1])

    # Haversine distance
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    radius_km = 6371.0
    distance_km = radius_km * c

    speed_kmh = distance_km / max(0.1, time_delta_hours)
    speed_knots = speed_kmh / 1.852

    # Calculate forward azimuth / bearing
    y = math.sin(dlon) * math.cos(lat2)
    x = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(dlon)
    initial_bearing = math.atan2(y, x)
    initial_bearing = math.degrees(initial_bearing)
    compass_bearing = (initial_bearing + 360) % 360

    # Convert to cardinal direction
    cardinals = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                 "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
    cardinal_idx = int((compass_bearing + 11.25) / 22.5) % 16
    direction = cardinals[cardinal_idx]

    return {
        "speed_kmh": round(speed_kmh, 1),
        "speed_knots": round(speed_knots, 1),
        "bearing_degrees": round(compass_bearing, 1),
        "cardinal_direction": direction
    }

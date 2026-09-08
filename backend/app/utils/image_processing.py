import io
import base64
import numpy as np
from PIL import Image

def apply_channel_colormap(array_2d: np.ndarray, channel_idx: int) -> np.ndarray:
    """
    Apply scientifically appropriate meteorological colormap to a single 2D channel array (128x128).
    Returns an RGB image of shape (128, 128, 3) in uint8 (0-255).
    """
    data = np.asarray(array_2d, dtype=np.float32)
    # Replace NaN or Inf
    data = np.nan_to_num(data, nan=0.0, posinf=1.0, neginf=0.0)

    # Robust percentile normalization (1st to 99th percentile)
    p_low, p_high = np.percentile(data, [1, 99])
    if p_high - p_low < 1e-5:
        norm = np.zeros_like(data)
    else:
        norm = np.clip((data - p_low) / (p_high - p_low), 0.0, 1.0)

    h, w = norm.shape
    rgb = np.zeros((h, w, 3), dtype=np.uint8)

    if channel_idx == 0:
        # Channel 0: IR1 (Infrared 10.8µm)
        # Cold convective cloud tops (high in norm if inverted or depending on calibration)
        # We produce a Dvorak / BD-curve style thermal colormap
        # 0.0 -> Warm sea/background (Dark gray)
        # 0.5 -> Mid clouds (Cyan / Green)
        # 0.75 -> Deep cold convection (Yellow / Orange)
        # 1.0 -> Overshooting tops (Crimson / Magenta)
        for i in range(h):
            for j in range(w):
                v = norm[i, j]
                if v < 0.3:
                    # Dark navy to slate
                    rgb[i, j] = [int(v * 80), int(v * 100), int(40 + v * 150)]
                elif v < 0.55:
                    # Cyan to emerald green
                    t = (v - 0.3) / 0.25
                    rgb[i, j] = [int(20 + t * 30), int(100 + t * 140), int(160 - t * 40)]
                elif v < 0.75:
                    # Yellow to orange
                    t = (v - 0.55) / 0.2
                    rgb[i, j] = [int(240 + t * 15), int(220 - t * 80), int(40)]
                elif v < 0.9:
                    # Orange to red
                    t = (v - 0.75) / 0.15
                    rgb[i, j] = [int(255), int(120 - t * 100), int(20)]
                else:
                    # Overshooting top: pink / white
                    t = (v - 0.9) / 0.1
                    rgb[i, j] = [int(255), int(40 + t * 215), int(180 + t * 75)]

    elif channel_idx == 1:
        # Channel 1: WV (Water Vapor 6.7µm)
        # Highlights upper-tropospheric moisture and dry intrusions
        # Dry = dark brown/amber, Moist = cyan/deep royal blue
        for i in range(h):
            for j in range(w):
                v = norm[i, j]
                if v < 0.4:
                    # Dry slot: reddish-brown
                    rgb[i, j] = [int(120 + v * 150), int(40 + v * 60), int(20)]
                elif v < 0.7:
                    # Transitional: greenish-cyan
                    t = (v - 0.4) / 0.3
                    rgb[i, j] = [int(180 - t * 160), int(100 + t * 100), int(140 + t * 80)]
                else:
                    # High moisture: intense cyan to pure white
                    t = (v - 0.7) / 0.3
                    rgb[i, j] = [int(20 + t * 235), int(200 + t * 55), int(220 + t * 35)]

    elif channel_idx == 2:
        # Channel 2: VIS (Visible 0.65µm)
        # Solar reflectance / cloud albedo
        # Deep ocean = dark charcoal, dense clouds = crisp brilliant white
        gray = (norm * 255).astype(np.uint8)
        rgb[:, :, 0] = gray
        rgb[:, :, 1] = gray
        rgb[:, :, 2] = gray

    elif channel_idx == 3:
        # Channel 3: PMW (Passive Microwave 85-91 GHz)
        # Penetrates cirrus to resolve eyewall convection and rainbands
        # Low scattering = teal/blue, High scattering (heavy ice/graupel) = bright orange/yellow
        for i in range(h):
            for j in range(w):
                v = norm[i, j]
                if v < 0.4:
                    # Oceanic background
                    rgb[i, j] = [int(15 + v * 40), int(30 + v * 80), int(60 + v * 140)]
                elif v < 0.7:
                    # Moderate precipitation / spiral rainband
                    t = (v - 0.4) / 0.3
                    rgb[i, j] = [int(30 + t * 190), int(110 + t * 100), int(180 - t * 140)]
                else:
                    # Heavy convective eyewall core
                    t = (v - 0.7) / 0.3
                    rgb[i, j] = [int(220 + t * 35), int(180 - t * 120), int(20)]

    else:
        # Default grayscale
        gray = (norm * 255).astype(np.uint8)
        rgb[:, :, 0] = gray
        rgb[:, :, 1] = gray
        rgb[:, :, 2] = gray

    return rgb

def array_to_png_base64(array_2d: np.ndarray, channel_idx: int) -> str:
    """
    Takes a 2D numpy channel array, applies colormap, encodes to PNG,
    and returns a base64 Data URL string for web consumption.
    """
    rgb = apply_channel_colormap(array_2d, channel_idx)
    img = Image.fromarray(rgb)
    buffer = io.BytesIO()
    img.save(buffer, format="PNG", optimize=True)
    b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"

def overlay_heatmap_on_rgb(
    base_rgb: np.ndarray, 
    heatmap_2d: np.ndarray, 
    alpha: float = 0.5
) -> str:
    """
    Overlays a 2D attention/Grad-CAM heatmap over a base RGB image
    and returns a base64 Data URL string.
    """
    h_norm = np.clip(heatmap_2d, 0.0, 1.0)
    h, w = h_norm.shape

    # Jet-style heatmap
    heat_rgb = np.zeros((h, w, 3), dtype=np.float32)
    for i in range(h):
        for j in range(w):
            v = h_norm[i, j]
            if v < 0.25:
                heat_rgb[i, j] = [0, 4 * v * 255, 255]
            elif v < 0.5:
                heat_rgb[i, j] = [0, 255, (1.0 - 4 * (v - 0.25)) * 255]
            elif v < 0.75:
                heat_rgb[i, j] = [4 * (v - 0.5) * 255, 255, 0]
            else:
                heat_rgb[i, j] = [255, (1.0 - 4 * (v - 0.75)) * 255, 0]

    base_f = base_rgb.astype(np.float32)
    blended = np.clip((1.0 - alpha) * base_f + alpha * heat_rgb, 0, 255).astype(np.uint8)
    
    img = Image.fromarray(blended)
    buffer = io.BytesIO()
    img.save(buffer, format="PNG", optimize=True)
    b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"

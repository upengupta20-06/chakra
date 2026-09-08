import h5py
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional
from functools import lru_cache
from pathlib import Path

from app.config import settings
from app.utils.image_processing import array_to_png_base64
from app.utils.meteorological import (
    classify_intensity, 
    detect_rapid_intensification, 
    determine_lifecycle_stage,
    calculate_track_movement,
    estimate_mslp_from_vmax
)

class CycloneDataLoader:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(CycloneDataLoader, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self.metadata_df: Optional[pd.DataFrame] = None
        self.sequence_df: Optional[pd.DataFrame] = None
        self.h5_file = None
        self._load_metadata()

    def _load_metadata(self):
        if settings.has_metadata:
            try:
                df = pd.read_csv(settings.CYCLONE_METADATA_PATH)
                df["time"] = pd.to_datetime(df["time"].astype(str), errors="coerce")
                df["lon"] = pd.to_numeric(df["lon"], errors="coerce")
                df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
                df["Vmax"] = pd.to_numeric(df["Vmax"], errors="coerce").fillna(0.0)
                df["MSLP"] = pd.to_numeric(df["MSLP"], errors="coerce")
                df["R35"] = pd.to_numeric(df["R35"], errors="coerce").fillna(0.0)
                df["image_index"] = df["image_index"].astype(int)
                self.metadata_df = df
                print(f"[DataLoader] Loaded {len(df)} metadata rows across {df['ID'].nunique()} cyclones.")
            except Exception as e:
                print(f"[DataLoader] Warning loading metadata: {e}")

        if settings.has_sequence_metadata:
            try:
                sdf = pd.read_csv(settings.SEQUENCE_METADATA_PATH)
                self.sequence_df = sdf
                print(f"[DataLoader] Loaded {len(sdf)} valid 4-step sequence windows.")
            except Exception as e:
                print(f"[DataLoader] Warning loading sequence metadata: {e}")

    def _get_h5_dataset(self):
        if not settings.has_h5_data:
            return None
        if self.h5_file is None:
            try:
                # Open read-only with SWMR / caching
                self.h5_file = h5py.File(str(settings.CYCLONE_H5_PATH), "r")
            except Exception as e:
                print(f"[DataLoader] Error opening H5 file: {e}")
                return None
        return self.h5_file.get("Images")

    def get_cyclones_summary(
        self, 
        basin: Optional[str] = None, 
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Get aggregated summary of unique cyclones.
        """
        if self.metadata_df is None:
            return {"total": 0, "cyclones": []}

        df = self.metadata_df

        if basin and basin.upper() != "ALL":
            df = df[df["data_set"].str.upper() == basin.upper()]

        if search:
            s = search.strip().upper()
            df = df[df["ID"].astype(str).str.upper().str.contains(s) | 
                    df["data_set"].str.upper().str.contains(s)]

        grouped = df.groupby(["data_set", "ID"], sort=False)
        total_unique = len(grouped)

        cyclones = []
        for (b, cid), group in grouped:
            group_sorted = group.sort_values("time")
            first_row = group_sorted.iloc[0]
            last_row = group_sorted.iloc[-1]
            max_vmax = float(group_sorted["Vmax"].max())
            current_vmax = float(last_row["Vmax"])
            intensity_info = classify_intensity(current_vmax)
            
            # RI check on recent frames
            recent_vmax = group_sorted["Vmax"].tail(4).tolist()
            ri_info = detect_rapid_intensification(recent_vmax)

            cyclones.append({
                "cyclone_id": str(cid),
                "basin": str(b),
                "observations_count": len(group_sorted),
                "start_time": str(first_row["time"]),
                "end_time": str(last_row["time"]),
                "peak_vmax": max_vmax,
                "current_vmax": current_vmax,
                "current_latitude": float(last_row["latitude"]),
                "current_longitude": float(last_row["lon"]),
                "current_mslp": float(last_row["MSLP"]) if pd.notna(last_row["MSLP"]) else estimate_mslp_from_vmax(current_vmax),
                "current_r35": float(last_row["R35"]),
                "intensity_class": intensity_info["name"],
                "intensity_short": intensity_info["short_name"],
                "intensity_color": intensity_info["color"],
                "trend": ri_info["trend"],
                "is_ri": ri_info["is_ri"],
                "latest_image_index": int(last_row["image_index"])
            })

        # Sort by peak Vmax descending or latest time
        cyclones.sort(key=lambda x: (x["peak_vmax"], x["current_vmax"]), reverse=True)
        paginated = cyclones[offset:offset + limit]

        return {
            "total": total_unique,
            "limit": limit,
            "offset": offset,
            "cyclones": paginated
        }

    def get_cyclone_detail(self, cyclone_id: str) -> Optional[Dict[str, Any]]:
        """
        Get comprehensive historical timeline and latest status for a cyclone.
        """
        if self.metadata_df is None:
            return None

        df = self.metadata_df[self.metadata_df["ID"].astype(str) == str(cyclone_id)]
        if df.empty:
            return None

        df_sorted = df.sort_values("time").reset_index(drop=True)
        basin = str(df_sorted.iloc[0]["data_set"])
        
        history = []
        lats, lons, times, vmax_list, mslp_list, r35_list = [], [], [], [], [], []

        for _, row in df_sorted.iterrows():
            vmax = float(row["Vmax"])
            mslp = float(row["MSLP"]) if pd.notna(row["MSLP"]) else estimate_mslp_from_vmax(vmax)
            r35 = float(row["R35"])
            lat = float(row["latitude"])
            lon = float(row["lon"])
            t_str = str(row["time"])

            lats.append(lat)
            lons.append(lon)
            times.append(t_str)
            vmax_list.append(vmax)
            mslp_list.append(mslp)
            r35_list.append(r35)

            history.append({
                "time": t_str,
                "latitude": lat,
                "longitude": lon,
                "vmax": vmax,
                "mslp": mslp,
                "r35": r35,
                "image_index": int(row["image_index"]),
                "intensity_class": classify_intensity(vmax)["short_name"]
            })

        current_row = df_sorted.iloc[-1]
        current_vmax = float(current_row["Vmax"])
        current_mslp = float(current_row["MSLP"]) if pd.notna(current_row["MSLP"]) else estimate_mslp_from_vmax(current_vmax)
        current_r35 = float(current_row["R35"])

        intensity_info = classify_intensity(current_vmax)
        ri_info = detect_rapid_intensification(vmax_list[-4:] if len(vmax_list) >= 4 else vmax_list)
        lifecycle = determine_lifecycle_stage(vmax_list, current_vmax)
        movement = calculate_track_movement(lats, lons)

        # Check if there is a 4-step sequence ready for AI inference
        sequence_indices = df_sorted["image_index"].tail(4).tolist()
        if len(sequence_indices) < 4:
            # Pad with first available
            sequence_indices = [sequence_indices[0]] * (4 - len(sequence_indices)) + sequence_indices

        return {
            "cyclone_id": str(cyclone_id),
            "basin": basin,
            "observations_count": len(df_sorted),
            "start_time": times[0],
            "end_time": times[-1],
            "current_time": times[-1],
            "current_latitude": float(current_row["latitude"]),
            "current_longitude": float(current_row["lon"]),
            "current_vmax": current_vmax,
            "current_mslp": current_mslp,
            "current_r35": current_r35,
            "peak_vmax": max(vmax_list),
            "min_mslp": min(mslp_list),
            "intensity_class": intensity_info["name"],
            "intensity_short": intensity_info["short_name"],
            "intensity_color": intensity_info["color"],
            "severity": intensity_info["severity"],
            "lifecycle_stage": lifecycle["stage"],
            "lifecycle_desc": lifecycle["description"],
            "trend": ri_info["trend"],
            "is_ri": ri_info["is_ri"],
            "trend_desc": ri_info["description"],
            "delta_vmax": ri_info["delta_vmax"],
            "movement": movement,
            "sequence_image_indices": sequence_indices,
            "history": history
        }

    def get_raw_image(self, image_index: int) -> Optional[np.ndarray]:
        """
        Fetch raw (128, 128, 4) multi-channel array for an image index.
        """
        images = self._get_h5_dataset()
        if images is None:
            return None
        if 0 <= image_index < images.shape[0]:
            return np.asarray(images[image_index], dtype=np.float32)
        return None

    def get_satellite_frame(self, image_index: int) -> Dict[str, Any]:
        """
        Returns base64 PNGs for each of the 4 channels (IR, WV, VIS, PMW).
        """
        raw = self.get_raw_image(image_index)
        channels = ["IR1", "WV", "VIS", "PMW"]
        channel_names = [
            "Infrared (10.8 µm)",
            "Water Vapor (6.7 µm)",
            "Visible (0.65 µm)",
            "Passive Microwave (85–91 GHz)"
        ]
        
        result = {
            "image_index": image_index,
            "channels": {}
        }

        if raw is not None:
            for c_idx, code in enumerate(channels):
                chan_2d = raw[:, :, c_idx]
                b64 = array_to_png_base64(chan_2d, c_idx)
                result["channels"][code] = {
                    "code": code,
                    "name": channel_names[c_idx],
                    "image_url": b64,
                    "min": float(np.min(chan_2d)),
                    "max": float(np.max(chan_2d)),
                    "mean": float(np.mean(chan_2d)),
                    "has_data": True
                }
        else:
            # Fallback synthetic pattern for UI when H5 unavailable
            for c_idx, code in enumerate(channels):
                dummy = np.zeros((128, 128), dtype=np.float32)
                result["channels"][code] = {
                    "code": code,
                    "name": channel_names[c_idx],
                    "image_url": array_to_png_base64(dummy, c_idx),
                    "min": 0.0,
                    "max": 0.0,
                    "mean": 0.0,
                    "has_data": False
                }

        return result

    def get_satellite_sequence(self, image_indices: List[int]) -> List[Dict[str, Any]]:
        """
        Returns 4 frames representing T-9h, T-6h, T-3h, CURRENT.
        """
        labels = ["T-9h", "T-6h", "T-3h", "CURRENT"]
        frames = []
        for i, idx in enumerate(image_indices[:4]):
            frame_data = self.get_satellite_frame(idx)
            frame_data["timestep_label"] = labels[i] if i < len(labels) else f"T{i}"
            frames.append(frame_data)
        return frames

data_loader = CycloneDataLoader()

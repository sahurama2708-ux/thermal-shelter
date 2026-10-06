"""
Loads the trained thermal-comfort model and every helper artifact exactly
once, at application startup. Nothing here retrains, modifies, or replaces
the model - it is a pure inference wrapper around the artifacts produced by
the project's notebook (see /artifacts).
"""
import logging
import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from app.config import get_settings

logger = logging.getLogger("shelter.model")

REQUIRED_ARTIFACTS = [
    "thermal_comfort_ewc_model.keras",
    "thermal_scaler.pkl",
    "thermal_label_encoder.pkl",
    "climate_scaler.pkl",
    "climate_kmeans.pkl",
    "climate_feature_order.pkl",
    "nn_feature_order.pkl",
]


class ArtifactLoadError(RuntimeError):
    """Raised when a required ML artifact is missing or fails to load."""


class ModelService:
    """Singleton-style holder for all loaded ML artifacts."""

    def __init__(self) -> None:
        self._loaded = False
        self.model = None
        self.thermal_scaler = None
        self.label_encoder = None
        self.climate_scaler = None
        self.climate_kmeans = None
        self.climate_feature_order: list[str] = []
        self.nn_feature_order: list[str] = []

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    def load(self) -> None:
        settings = get_settings()
        artifacts_dir = Path(settings.ARTIFACTS_DIR)

        missing = [
            name for name in REQUIRED_ARTIFACTS
            if not (artifacts_dir / name).is_file()
        ]
        if missing:
            raise ArtifactLoadError(
                f"Missing required ML artifact(s) in {artifacts_dir}: {', '.join(missing)}"
            )

        try:
            # TensorFlow is imported lazily so the rest of the app can start
            # (and be tested) even in environments without it installed for
            # non-ML test runs; here it is required.
            from tensorflow import keras

            self.model = keras.models.load_model(artifacts_dir / "thermal_comfort_ewc_model.keras")
            self.thermal_scaler = joblib.load(artifacts_dir / "thermal_scaler.pkl")
            self.label_encoder = joblib.load(artifacts_dir / "thermal_label_encoder.pkl")
            self.climate_scaler = joblib.load(artifacts_dir / "climate_scaler.pkl")
            self.climate_kmeans = joblib.load(artifacts_dir / "climate_kmeans.pkl")
            self.climate_feature_order = list(joblib.load(artifacts_dir / "climate_feature_order.pkl"))
            self.nn_feature_order = list(joblib.load(artifacts_dir / "nn_feature_order.pkl"))
        except Exception as exc:  # noqa: BLE001 - we want to fail fast with context
            raise ArtifactLoadError(f"Failed to load ML artifacts: {exc}") from exc

        self._loaded = True
        logger.info("ML artifacts loaded successfully from %s", artifacts_dir)

    def compute_climate_regime(self, weather_row: dict) -> int:
        """Reproduces the notebook's climate-regime clustering exactly."""
        ordered = [[weather_row[col] for col in self.climate_feature_order]]
        df = pd.DataFrame(ordered, columns=self.climate_feature_order)
        scaled = self.climate_scaler.transform(df)
        regime = int(self.climate_kmeans.predict(scaled)[0])
        return regime

    def predict(self, feature_row: dict) -> tuple[str, float]:
        """Runs the neural network on a single fully-engineered feature row."""
        input_df = pd.DataFrame([feature_row])[self.nn_feature_order]
        input_scaled = self.thermal_scaler.transform(input_df)

        prediction = self.model.predict(input_scaled, verbose=0)
        predicted_class = int(np.argmax(prediction, axis=1)[0])
        thermal_condition = self.label_encoder.inverse_transform([predicted_class])[0]
        confidence = float(np.max(prediction) * 100)

        return str(thermal_condition), confidence


model_service = ModelService()

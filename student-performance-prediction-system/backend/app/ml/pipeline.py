from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
MODEL_PATH = ROOT_DIR / "models" / "student_model.joblib"
METRICS_PATH = ROOT_DIR / "models" / "model_metrics.json"

FEATURE_NAMES = [
    "attendance",
    "previous_marks",
    "study_hours",
    "assignment_completion"
]

# Baseline means for calculating directional feature influence
BASELINE_MEANS = {
    "attendance": 75.0,
    "previous_marks": 68.0,
    "study_hours": 3.5,
    "assignment_completion": 70.0
}


def categorize_performance(score: float) -> str:
    """Project-defined categories based on predicted score."""
    if score >= 85.0:
        return "Excellent"
    elif score >= 70.0:
        return "Good"
    elif score >= 50.0:
        return "Average"
    else:
        return "At Risk"


class ModelPipelineManager:
    _instance = None

    def __init__(self):
        self.pipeline = None
        self.metrics = None
        self.feature_importance = {}
        self.model_version = "rf-v1.0"
        self.load_model()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = ModelPipelineManager()
        return cls._instance

    def load_model(self):
        """Loads trained pipeline and metrics from disk."""
        if MODEL_PATH.exists():
            try:
                self.pipeline = joblib.load(MODEL_PATH)
            except Exception as e:
                print(f"Error loading model from {MODEL_PATH}: {e}")
                self.pipeline = None
        else:
            self.pipeline = None

        if METRICS_PATH.exists():
            try:
                with open(METRICS_PATH, "r", encoding="utf-8") as f:
                    self.metrics = json.load(f)
                    self.feature_importance = self.metrics.get("feature_importance", {})
                    self.model_version = self.metrics.get("model_version", "rf-v1.0")
            except Exception as e:
                print(f"Error loading metrics from {METRICS_PATH}: {e}")
                self.metrics = None
        else:
            self.metrics = None

    def is_ready(self) -> bool:
        return self.pipeline is not None

    def predict_one(self, attendance: float, previous_marks: float, study_hours: float, assignment_completion: float) -> float:
        """Runs inference for a single student."""
        if not self.is_ready():
            # If not yet trained, reload or raise
            self.load_model()
            if not self.is_ready():
                raise RuntimeError("Machine Learning Model pipeline is not trained or loaded yet.")

        df_input = pd.DataFrame([{
            "attendance": float(attendance),
            "previous_marks": float(previous_marks),
            "study_hours": float(study_hours),
            "assignment_completion": float(assignment_completion)
        }])[FEATURE_NAMES]

        pred = float(self.pipeline.predict(df_input)[0])
        # Bound between 0 and 100
        return float(np.clip(round(pred, 1), 0.0, 100.0))

    def predict_batch(self, df: pd.DataFrame) -> np.ndarray:
        """Runs batch inference for multiple student records."""
        if not self.is_ready():
            self.load_model()
            if not self.is_ready():
                raise RuntimeError("Machine Learning Model pipeline is not trained or loaded yet.")

        df_features = df[FEATURE_NAMES].astype(float)
        preds = self.pipeline.predict(df_features)
        return np.clip(np.round(preds, 1), 0.0, 100.0)

    def calculate_contributions(self, attendance: float, previous_marks: float, study_hours: float, assignment_completion: float) -> dict:
        """
        Calculates directional feature contributions (positive or negative impact relative to benchmark mean)
        weighted by the model's feature importance.
        """
        inputs = {
            "attendance": attendance,
            "previous_marks": previous_marks,
            "study_hours": study_hours,
            "assignment_completion": assignment_completion
        }

        # Normalize importance weights
        weights = self.feature_importance or {
            "previous_marks": 38.0,
            "attendance": 24.0,
            "assignment_completion": 20.0,
            "study_hours": 18.0
        }

        contributions = {}
        for feat, val in inputs.items():
            base = BASELINE_MEANS[feat]
            # Standardize scale difference
            scale = 100.0 if feat != "study_hours" else 10.0
            diff = (val - base) / scale
            weight = weights.get(feat, 25.0) / 100.0
            impact = round(diff * weight * 25.0, 1)  # marks impact delta
            contributions[feat] = impact

        return contributions


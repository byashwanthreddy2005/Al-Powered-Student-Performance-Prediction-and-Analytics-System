"""
Model Training Script for Student Performance Prediction.
Trains Linear Regression and Random Forest Regressor models,
evaluates cross-validation and test metrics (MAE, RMSE, R2),
and saves the fitted scikit-learn pipeline and metrics to disk.
"""

from pathlib import Path
from datetime import datetime, timezone
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
DATA_PATH = ROOT_DIR / "data" / "synthetic_student_dataset.csv"
MODELS_DIR = ROOT_DIR / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

MODEL_OUTPUT_PATH = MODELS_DIR / "student_model.joblib"
METRICS_OUTPUT_PATH = MODELS_DIR / "model_metrics.json"

FEATURE_COLUMNS = [
    "attendance",
    "previous_marks",
    "study_hours",
    "assignment_completion"
]
TARGET_COLUMN = "final_marks"


def train_models():
    print("=" * 60)
    print("STARTING STUDENT PERFORMANCE MODEL TRAINING PIPELINE")
    print("=" * 60)

    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Training data not found at: {DATA_PATH}. Please run generate_demo_data.py first.")

    # 1. Load dataset
    df = pd.read_csv(DATA_PATH)
    print(f"Loaded {len(df)} records from {DATA_PATH.name}")

    # 2. Data Cleaning & Validation
    df_clean = df.dropna(subset=FEATURE_COLUMNS + [TARGET_COLUMN]).copy()
    print(f"Valid records after null check: {len(df_clean)}")

    # Ensure bounds
    df_clean = df_clean[
        (df_clean["attendance"] >= 0) & (df_clean["attendance"] <= 100) &
        (df_clean["previous_marks"] >= 0) & (df_clean["previous_marks"] <= 100) &
        (df_clean["study_hours"] >= 0) & (df_clean["study_hours"] <= 24) &
        (df_clean["assignment_completion"] >= 0) & (df_clean["assignment_completion"] <= 100) &
        (df_clean["final_marks"] >= 0) & (df_clean["final_marks"] <= 100)
    ]
    print(f"Records after range validation: {len(df_clean)}")

    X = df_clean[FEATURE_COLUMNS]
    y = df_clean[TARGET_COLUMN]

    # 3. Train-Test Split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    print(f"Training set: {len(X_train)} samples | Testing set: {len(X_test)} samples")

    # 4. Define Candidate Models
    models = {
        "Random Forest Regressor": Pipeline([
            ("scaler", StandardScaler()),
            ("regressor", RandomForestRegressor(
                n_estimators=120,
                max_depth=12,
                min_samples_split=4,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=1
            ))
        ]),
        "Linear Regression": Pipeline([
            ("scaler", StandardScaler()),
            ("regressor", LinearRegression())
        ])
    }

    comparison_results = []
    trained_pipelines = {}

    cv = KFold(n_splits=5, shuffle=True, random_state=42)

    for name, pipeline in models.items():
        print(f"\n--- Evaluating {name} ---")
        # 5-fold cross validation on training data
        cv_scores = cross_val_score(pipeline, X_train, y_train, cv=cv, scoring="r2")
        cv_mean = float(np.mean(cv_scores))
        cv_std = float(np.std(cv_scores))
        print(f"5-Fold CV R²: {cv_mean:.4f} (+/- {cv_std:.4f})")

        # Fit on full training set
        pipeline.fit(X_train, y_train)
        trained_pipelines[name] = pipeline

        # Predict on held-out test set
        y_pred = pipeline.predict(X_test)
        y_pred = np.clip(y_pred, 0.0, 100.0)

        mae = float(mean_absolute_error(y_test, y_pred))
        rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        r2 = float(r2_score(y_test, y_pred))

        print(f"Test MAE:  {mae:.3f} marks")
        print(f"Test RMSE: {rmse:.3f} marks")
        print(f"Test R²:   {r2:.4f}")

        comparison_results.append({
            "model_name": name,
            "mae": round(mae, 3),
            "rmse": round(rmse, 3),
            "r2_score": round(r2, 4),
            "cv_mean_r2": round(cv_mean, 4),
            "cv_std_r2": round(cv_std, 4)
        })

    # Pick the champion model based on highest test R²
    comparison_results.sort(key=lambda x: x["r2_score"], reverse=True)
    best_model_name = comparison_results[0]["model_name"]
    best_pipeline = trained_pipelines[best_model_name]
    print(f"\nChampion Model Selected: {best_model_name}")

    # Extract Feature Importance
    feature_importance_dict = {}
    rf_pipeline = trained_pipelines["Random Forest Regressor"]
    rf_model = rf_pipeline.named_steps["regressor"]
    raw_importances = rf_model.feature_importances_
    total_imp = np.sum(raw_importances)
    for col, imp in zip(FEATURE_COLUMNS, raw_importances):
        feature_importance_dict[col] = round(float(imp / total_imp) * 100, 2)

    print("\nFeature Importances (Random Forest):")
    for feat, imp in feature_importance_dict.items():
        print(f"  - {feat:25s}: {imp:5.2f}%")

    # 5. Save the trained pipeline
    joblib.dump(best_pipeline, MODEL_OUTPUT_PATH)
    print(f"\nSaved trained model pipeline to: {MODEL_OUTPUT_PATH}")

    # 6. Save model metrics JSON
    metrics_payload = {
        "status": "ready",
        "active_model": best_model_name,
        "model_version": "rf-v1.0",
        "dataset_size": len(df_clean),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "feature_columns": FEATURE_COLUMNS,
        "target_column": TARGET_COLUMN,
        "metrics": {
            "mae": comparison_results[0]["mae"],
            "rmse": comparison_results[0]["rmse"],
            "r2_score": comparison_results[0]["r2_score"],
            "cv_mean_r2": comparison_results[0]["cv_mean_r2"],
            "cv_std_r2": comparison_results[0]["cv_std_r2"]
        },
        "feature_importance": feature_importance_dict,
        "comparison": comparison_results,
        "training_timestamp": datetime.now(timezone.utc).isoformat(),
        "is_demo": True,
        "description": "Supervised regression pipeline trained on synthetic student academic features (80/20 train-test split, 5-fold CV)."
    }

    with open(METRICS_OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics_payload, f, indent=2)

    print(f"Saved model metrics and evaluation info to: {METRICS_OUTPUT_PATH}")
    print("=" * 60)
    print("MODEL TRAINING COMPLETED SUCCESSFULLY")
    print("=" * 60)


if __name__ == "__main__":
    train_models()

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class PredictionInput(BaseModel):
    attendance: float = Field(..., ge=0.0, le=100.0, description="Attendance percentage (0-100)")
    previous_marks: float = Field(..., ge=0.0, le=100.0, description="Previous exam marks (0-100)")
    study_hours: float = Field(..., ge=0.0, le=24.0, description="Daily study hours (0-24)")
    assignment_completion: float = Field(..., ge=0.0, le=100.0, description="Assignment completion % (0-100)")
    student_id: Optional[str] = Field(None, description="Optional Student ID")
    student_name: Optional[str] = Field(None, description="Optional Student Name")


class RecommendationItem(BaseModel):
    area: str
    priority: str  # High, Medium, Low, Positive
    title: str
    message: str


class PredictionResult(BaseModel):
    student_id: Optional[str] = None
    student_name: Optional[str] = None
    attendance: float
    previous_marks: float
    study_hours: float
    assignment_completion: float
    predicted_marks: float
    performance_category: str  # Excellent (85-100), Good (70-84), Average (50-69), At Risk (<50)
    model_version: str
    recommendations: List[RecommendationItem]
    feature_contributions: Optional[Dict[str, float]] = None
    disclaimer: str = "Recommendations and predictions are algorithmic guidance and do not guarantee final examination marks."


class BulkPredictionRequest(BaseModel):
    students: List[PredictionInput]


class BulkPredictionResponse(BaseModel):
    total_processed: int
    average_predicted_marks: float
    category_counts: Dict[str, int]
    at_risk_count: int
    predictions: List[PredictionResult]


class ModelMetricInfo(BaseModel):
    model_name: str
    mae: float
    rmse: float
    r2_score: float
    cv_mean_r2: float
    cv_std_r2: float


class ModelMetricsResponse(BaseModel):
    status: str
    active_model: str
    metrics: Dict[str, Any]
    feature_importance: Dict[str, float]
    comparison: List[ModelMetricInfo]
    training_timestamp: str
    dataset_size: int


from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class CategoryDistribution(BaseModel):
    category: str
    count: int
    percentage: float
    color: str


class ScatterPoint(BaseModel):
    id: Optional[int] = None
    student_id: Optional[str] = None
    name: Optional[str] = None
    x: float
    y: float
    category: Optional[str] = None


class ActualVsPredictedPoint(BaseModel):
    student_id: str
    name: str
    actual: float
    predicted: float
    difference: float


class ClassSectionSummary(BaseModel):
    class_name: str
    section: str
    total_students: int
    avg_attendance: float
    avg_previous_marks: float
    avg_predicted_marks: float
    at_risk_count: int


class DashboardSummary(BaseModel):
    total_students: int
    avg_attendance: float
    avg_previous_marks: float
    avg_predicted_marks: float
    at_risk_students_count: int
    category_distribution: List[CategoryDistribution]
    attendance_vs_performance: List[ScatterPoint]
    study_hours_vs_marks: List[ScatterPoint]
    assignment_vs_performance: List[ScatterPoint]
    actual_vs_predicted: List[ActualVsPredictedPoint]
    feature_importance: Dict[str, float]
    recent_predictions: List[Dict[str, Any]]


from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from app.database.session import Base


class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), nullable=True, index=True)
    student_name = Column(String(100), nullable=True)
    attendance = Column(Float, nullable=False)
    previous_marks = Column(Float, nullable=False)
    study_hours = Column(Float, nullable=False)
    assignment_completion = Column(Float, nullable=False)
    predicted_marks = Column(Float, nullable=False)
    performance_category = Column(String(50), nullable=False)  # Excellent, Good, Average, At Risk
    model_version = Column(String(50), default="rf-v1.0")
    recommendations = Column(Text, nullable=True)  # JSON formatted recommendations list
    prediction_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "student_name": self.student_name,
            "attendance": self.attendance,
            "previous_marks": self.previous_marks,
            "study_hours": self.study_hours,
            "assignment_completion": self.assignment_completion,
            "predicted_marks": self.predicted_marks,
            "performance_category": self.performance_category,
            "model_version": self.model_version,
            "recommendations": self.recommendations,
            "prediction_date": self.prediction_date.isoformat() if self.prediction_date else None,
        }


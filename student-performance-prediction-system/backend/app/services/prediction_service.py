import json
from typing import List, Optional
from sqlalchemy.orm import Session

from app.ml.pipeline import ModelPipelineManager, categorize_performance
from app.services.recommendation_service import RecommendationEngine
from app.schemas.prediction import (
    PredictionResult,
    BulkPredictionResponse,
    PredictionInput
)
from app.models.prediction import PredictionHistory
from app.database.session import SessionLocal


class PredictionService:
    def __init__(self):
        self.ml_manager = ModelPipelineManager.get_instance()

    def predict(
        self,
        attendance: float,
        previous_marks: float,
        study_hours: float,
        assignment_completion: float,
        student_id: Optional[str] = None,
        student_name: Optional[str] = None,
        persist_history: bool = True,
        db: Optional[Session] = None
    ) -> PredictionResult:
        predicted_marks = self.ml_manager.predict_one(
            attendance=attendance,
            previous_marks=previous_marks,
            study_hours=study_hours,
            assignment_completion=assignment_completion
        )

        category = categorize_performance(predicted_marks)

        recommendations = RecommendationEngine.generate_recommendations(
            attendance=attendance,
            previous_marks=previous_marks,
            study_hours=study_hours,
            assignment_completion=assignment_completion,
            predicted_marks=predicted_marks
        )

        contributions = self.ml_manager.calculate_contributions(
            attendance=attendance,
            previous_marks=previous_marks,
            study_hours=study_hours,
            assignment_completion=assignment_completion
        )

        if persist_history:
            close_session = False
            if db is None:
                db = SessionLocal()
                close_session = True

            try:
                rec_json = json.dumps([r.model_dump() for r in recommendations])
                history_entry = PredictionHistory(
                    student_id=student_id,
                    student_name=student_name,
                    attendance=attendance,
                    previous_marks=previous_marks,
                    study_hours=study_hours,
                    assignment_completion=assignment_completion,
                    predicted_marks=predicted_marks,
                    performance_category=category,
                    model_version=self.ml_manager.model_version,
                    recommendations=rec_json
                )
                db.add(history_entry)
                db.commit()
            except Exception as e:
                db.rollback()
                print(f"Error persisting prediction history: {e}")
            finally:
                if close_session:
                    db.close()

        return PredictionResult(
            student_id=student_id,
            student_name=student_name,
            attendance=attendance,
            previous_marks=previous_marks,
            study_hours=study_hours,
            assignment_completion=assignment_completion,
            predicted_marks=predicted_marks,
            performance_category=category,
            model_version=self.ml_manager.model_version,
            recommendations=recommendations,
            feature_contributions=contributions
        )

    def predict_bulk(self, items: List[PredictionInput], db: Optional[Session] = None) -> BulkPredictionResponse:
        results: List[PredictionResult] = []
        category_counts = {"Excellent": 0, "Good": 0, "Average": 0, "At Risk": 0}
        total_score = 0.0
        at_risk_count = 0

        for item in items:
            res = self.predict(
                attendance=item.attendance,
                previous_marks=item.previous_marks,
                study_hours=item.study_hours,
                assignment_completion=item.assignment_completion,
                student_id=item.student_id,
                student_name=item.student_name,
                persist_history=True,
                db=db
            )
            results.append(res)
            total_score += res.predicted_marks
            category_counts[res.performance_category] = category_counts.get(res.performance_category, 0) + 1
            if res.performance_category == "At Risk":
                at_risk_count += 1

        total = len(items)
        avg_score = round(total_score / total, 1) if total > 0 else 0.0

        return BulkPredictionResponse(
            total_processed=total,
            average_predicted_marks=avg_score,
            category_counts=category_counts,
            at_risk_count=at_risk_count,
            predictions=results
        )

    def get_metrics(self) -> dict:
        if self.ml_manager.metrics:
            return self.ml_manager.metrics
        return {
            "status": "not_trained",
            "message": "Model has not been trained yet. Run train_model.py to initialize."
        }


_prediction_service = None


def get_prediction_service() -> PredictionService:
    global _prediction_service
    if _prediction_service is None:
        _prediction_service = PredictionService()
    return _prediction_service


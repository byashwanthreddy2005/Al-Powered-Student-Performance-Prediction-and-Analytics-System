from typing import Dict, Any, List
import io
import csv
from sqlalchemy.orm import Session
import numpy as np

from app.models.student import Student
from app.models.prediction import PredictionHistory
from app.ml.pipeline import ModelPipelineManager, categorize_performance


class AnalyticsService:
    @staticmethod
    def get_dashboard_summary(db: Session) -> Dict[str, Any]:
        students = db.query(Student).all()
        ml_mgr = ModelPipelineManager.get_instance()

        total = len(students)
        if total == 0:
            return {
                "total_students": 0,
                "avg_attendance": 0.0,
                "avg_previous_marks": 0.0,
                "avg_predicted_marks": 0.0,
                "at_risk_students_count": 0,
                "category_distribution": [
                    {"category": "Excellent", "count": 0, "percentage": 0.0, "color": "#06b6d4"},
                    {"category": "Good", "count": 0, "percentage": 0.0, "color": "#3b82f6"},
                    {"category": "Average", "count": 0, "percentage": 0.0, "color": "#f59e0b"},
                    {"category": "At Risk", "count": 0, "percentage": 0.0, "color": "#ef4444"},
                ],
                "attendance_vs_performance": [],
                "study_hours_vs_marks": [],
                "assignment_vs_performance": [],
                "actual_vs_predicted": [],
                "feature_importance": ml_mgr.feature_importance,
                "recent_predictions": []
            }

        attendances = [s.attendance for s in students]
        prev_marks = [s.previous_marks for s in students]

        predictions = []
        attendance_scatter = []
        study_hours_scatter = []
        assignment_scatter = []
        actual_vs_pred = []

        categories_count = {"Excellent": 0, "Good": 0, "Average": 0, "At Risk": 0}

        for s in students:
            if ml_mgr.is_ready():
                pred = ml_mgr.predict_one(s.attendance, s.previous_marks, s.study_hours, s.assignment_completion)
            else:
                pred = s.previous_marks  # fallback

            cat = categorize_performance(pred)
            categories_count[cat] = categories_count.get(cat, 0) + 1
            predictions.append(pred)

            attendance_scatter.append({
                "id": s.id,
                "student_id": s.student_id,
                "name": s.name,
                "x": s.attendance,
                "y": pred,
                "category": cat
            })

            study_hours_scatter.append({
                "id": s.id,
                "student_id": s.student_id,
                "name": s.name,
                "x": s.study_hours,
                "y": s.previous_marks,
                "category": cat
            })

            assignment_scatter.append({
                "id": s.id,
                "student_id": s.student_id,
                "name": s.name,
                "x": s.assignment_completion,
                "y": pred,
                "category": cat
            })

            if s.actual_final_marks is not None:
                actual_vs_pred.append({
                    "student_id": s.student_id,
                    "name": s.name,
                    "actual": round(s.actual_final_marks, 1),
                    "predicted": pred,
                    "difference": round(abs(s.actual_final_marks - pred), 1)
                })

        category_colors = {
            "Excellent": "#06b6d4",
            "Good": "#3b82f6",
            "Average": "#f59e0b",
            "At Risk": "#ef4444"
        }

        category_distribution = [
            {
                "category": cat,
                "count": count,
                "percentage": round((count / total) * 100, 1),
                "color": category_colors.get(cat, "#94a3b8")
            }
            for cat, count in categories_count.items()
        ]

        recent_history = (
            db.query(PredictionHistory)
            .order_by(PredictionHistory.id.desc())
            .limit(10)
            .all()
        )

        return {
            "total_students": total,
            "avg_attendance": round(float(np.mean(attendances)), 1),
            "avg_previous_marks": round(float(np.mean(prev_marks)), 1),
            "avg_predicted_marks": round(float(np.mean(predictions)), 1),
            "at_risk_students_count": categories_count.get("At Risk", 0),
            "category_distribution": category_distribution,
            "attendance_vs_performance": attendance_scatter[:100],
            "study_hours_vs_marks": study_hours_scatter[:100],
            "assignment_vs_performance": assignment_scatter[:100],
            "actual_vs_predicted": actual_vs_pred[:40],
            "feature_importance": ml_mgr.feature_importance,
            "recent_predictions": [h.to_dict() for h in recent_history]
        }

    @staticmethod
    def get_class_analytics(db: Session) -> List[Dict[str, Any]]:
        students = db.query(Student).all()
        ml_mgr = ModelPipelineManager.get_instance()

        class_dict = {}
        for s in students:
            key = f"{s.class_name} - {s.section}"
            if key not in class_dict:
                class_dict[key] = {
                    "class_name": s.class_name,
                    "section": s.section,
                    "students": []
                }
            class_dict[key]["students"].append(s)

        results = []
        for key, info in class_dict.items():
            studs = info["students"]
            n = len(studs)
            attendances = [s.attendance for s in studs]
            prevs = [s.previous_marks for s in studs]

            preds = []
            at_risk = 0
            for s in studs:
                pred = ml_mgr.predict_one(s.attendance, s.previous_marks, s.study_hours, s.assignment_completion) if ml_mgr.is_ready() else s.previous_marks
                preds.append(pred)
                if categorize_performance(pred) == "At Risk":
                    at_risk += 1

            results.append({
                "group_label": key,
                "class_name": info["class_name"],
                "section": info["section"],
                "total_students": n,
                "avg_attendance": round(float(np.mean(attendances)), 1),
                "avg_previous_marks": round(float(np.mean(prevs)), 1),
                "avg_predicted_marks": round(float(np.mean(preds)), 1),
                "at_risk_count": at_risk,
                "risk_rate": round((at_risk / n) * 100, 1) if n > 0 else 0.0
            })

        results.sort(key=lambda x: x["group_label"])
        return results

    @staticmethod
    def export_csv_report(db: Session, filter_at_risk_only: bool = False) -> str:
        students = db.query(Student).all()
        ml_mgr = ModelPipelineManager.get_instance()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Student ID", "Student Name", "Class", "Section",
            "Attendance (%)", "Previous Marks", "Daily Study Hours",
            "Assignment Completion (%)", "Actual Final Marks",
            "Predicted Marks", "Performance Category", "At Risk Status"
        ])

        for s in students:
            pred = ml_mgr.predict_one(s.attendance, s.previous_marks, s.study_hours, s.assignment_completion) if ml_mgr.is_ready() else 0.0
            cat = categorize_performance(pred)
            is_risk = "YES" if cat == "At Risk" else "NO"

            if filter_at_risk_only and cat != "At Risk":
                continue

            writer.writerow([
                s.student_id,
                s.name,
                s.class_name,
                s.section,
                s.attendance,
                s.previous_marks,
                s.study_hours,
                s.assignment_completion,
                s.actual_final_marks if s.actual_final_marks is not None else "N/A",
                pred,
                cat,
                is_risk
            ])

        return output.getvalue()


"""
Database Seeding Script.
Populates SQLite database with realistic student records and initial prediction logs.
"""

import sys
from pathlib import Path

# Automatically ensure backend is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import pandas as pd
from app.database.session import Base, SessionLocal, engine
from app.models.student import Student
from app.models.prediction import PredictionHistory
from app.services.prediction_service import get_prediction_service

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
DATA_PATH = ROOT_DIR / "data" / "synthetic_student_dataset.csv"


def seed_database(limit: int = 80):
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing_count = db.query(Student).count()
        if existing_count > 0:
            print(f"Database already contains {existing_count} students. Clearing old seed...")
            db.query(Student).delete()
            db.query(PredictionHistory).delete()
            db.commit()

        if not DATA_PATH.exists():
            print("Dataset file not found! Generating sample records directly...")
            from scripts.generate_demo_data import main as gen_main
            gen_main()

        df = pd.read_csv(DATA_PATH)
        sample_subset = df.head(limit)

        pred_service = get_prediction_service()

        print(f"Seeding {len(sample_subset)} students into SQLite database...")
        for _, row in sample_subset.iterrows():
            # Keep actual final marks for 60% of students for actual-vs-predicted comparison
            actual_marks = float(row["final_marks"]) if np_chance(0.6) else None

            student = Student(
                student_id=str(row["student_id"]),
                name=str(row["name"]),
                class_name=str(row["class_name"]),
                section=str(row["section"]),
                attendance=float(row["attendance"]),
                previous_marks=float(row["previous_marks"]),
                study_hours=float(row["study_hours"]),
                assignment_completion=float(row["assignment_completion"]),
                actual_final_marks=actual_marks
            )
            db.add(student)

        db.commit()
        print(f"Successfully seeded {limit} student records.")

        # Seed initial prediction history for a subset
        first_few = db.query(Student).limit(20).all()
        for s in first_few:
            pred_res = pred_service.predict(
                attendance=s.attendance,
                previous_marks=s.previous_marks,
                study_hours=s.study_hours,
                assignment_completion=s.assignment_completion,
                student_id=s.student_id,
                student_name=s.name,
                persist_history=False
            )
            import json
            recs_json = json.dumps([r.model_dump() for r in pred_res.recommendations])
            history_entry = PredictionHistory(
                student_id=s.student_id,
                student_name=s.name,
                attendance=s.attendance,
                previous_marks=s.previous_marks,
                study_hours=s.study_hours,
                assignment_completion=s.assignment_completion,
                predicted_marks=pred_res.predicted_marks,
                performance_category=pred_res.performance_category,
                model_version=pred_res.model_version,
                recommendations=recs_json
            )
            db.add(history_entry)

        db.commit()
        print(f"Successfully seeded 20 prediction history records.")

    finally:
        db.close()


def np_chance(prob: float) -> bool:
    import random
    return random.random() < prob


if __name__ == "__main__":
    seed_database()


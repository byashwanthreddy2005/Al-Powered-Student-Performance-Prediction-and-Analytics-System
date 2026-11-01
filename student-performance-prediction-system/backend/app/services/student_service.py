from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.student import Student
from app.schemas.student import StudentCreate, StudentUpdate
from app.ml.pipeline import ModelPipelineManager, categorize_performance


class StudentService:
    @staticmethod
    def get_students(
        db: Session,
        search: Optional[str] = None,
        class_name: Optional[str] = None,
        section: Optional[str] = None,
        category: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> Tuple[List[dict], int]:
        query = db.query(Student)

        if isinstance(search, str) and search.strip():
            search_term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Student.name.ilike(search_term),
                    Student.student_id.ilike(search_term)
                )
            )

        if isinstance(class_name, str) and class_name.strip() and class_name.lower() != "all":
            query = query.filter(Student.class_name == class_name.strip())

        if isinstance(section, str) and section.strip() and section.lower() != "all":
            query = query.filter(Student.section == section.strip())

        total = query.count()
        records = query.order_by(Student.id.desc()).offset(skip).limit(limit).all()

        ml_mgr = ModelPipelineManager.get_instance()
        results = []
        for s in records:
            d = s.to_dict()
            if ml_mgr.is_ready():
                try:
                    pred = ml_mgr.predict_one(
                        s.attendance, s.previous_marks, s.study_hours, s.assignment_completion
                    )
                    cat = categorize_performance(pred)
                    d["predicted_marks"] = pred
                    d["performance_category"] = cat
                except Exception:
                    d["predicted_marks"] = None
                    d["performance_category"] = None
            else:
                d["predicted_marks"] = None
                d["performance_category"] = None

            # Category filter (applied in memory if specified)
            if isinstance(category, str) and category.strip() and category.lower() != "all":
                if d["performance_category"] != category:
                    continue

            results.append(d)

        # If filtered by category in memory, adjust total
        if isinstance(category, str) and category.strip() and category.lower() != "all":
            total = len(results)

        return results, total

    @staticmethod
    def get_student_by_id(db: Session, id_val: int) -> Optional[dict]:
        s = db.query(Student).filter(Student.id == id_val).first()
        if not s:
            return None
        d = s.to_dict()
        ml_mgr = ModelPipelineManager.get_instance()
        if ml_mgr.is_ready():
            try:
                pred = ml_mgr.predict_one(
                    s.attendance, s.previous_marks, s.study_hours, s.assignment_completion
                )
                d["predicted_marks"] = pred
                d["performance_category"] = categorize_performance(pred)
            except Exception:
                d["predicted_marks"] = None
                d["performance_category"] = None
        return d

    @staticmethod
    def get_student_by_student_id(db: Session, student_id: str) -> Optional[Student]:
        return db.query(Student).filter(Student.student_id == student_id.strip().upper()).first()

    @staticmethod
    def create_student(db: Session, data: StudentCreate) -> dict:
        existing = StudentService.get_student_by_student_id(db, data.student_id)
        if existing:
            raise ValueError(f"Student with ID '{data.student_id}' already exists.")

        student = Student(
            student_id=data.student_id,
            name=data.name,
            class_name=data.class_name,
            section=data.section,
            attendance=data.attendance,
            previous_marks=data.previous_marks,
            study_hours=data.study_hours,
            assignment_completion=data.assignment_completion,
            actual_final_marks=data.actual_final_marks
        )
        db.add(student)
        db.commit()
        db.refresh(student)

        d = student.to_dict()
        ml_mgr = ModelPipelineManager.get_instance()
        if ml_mgr.is_ready():
            try:
                pred = ml_mgr.predict_one(
                    student.attendance, student.previous_marks, student.study_hours, student.assignment_completion
                )
                d["predicted_marks"] = pred
                d["performance_category"] = categorize_performance(pred)
            except Exception:
                pass
        return d

    @staticmethod
    def update_student(db: Session, id_val: int, data: StudentUpdate) -> Optional[dict]:
        student = db.query(Student).filter(Student.id == id_val).first()
        if not student:
            return None

        update_dict = data.model_dump(exclude_unset=True)
        for key, val in update_dict.items():
            setattr(student, key, val)

        db.commit()
        db.refresh(student)

        d = student.to_dict()
        ml_mgr = ModelPipelineManager.get_instance()
        if ml_mgr.is_ready():
            try:
                pred = ml_mgr.predict_one(
                    student.attendance, student.previous_marks, student.study_hours, student.assignment_completion
                )
                d["predicted_marks"] = pred
                d["performance_category"] = categorize_performance(pred)
            except Exception:
                pass
        return d

    @staticmethod
    def delete_student(db: Session, id_val: int) -> bool:
        student = db.query(Student).filter(Student.id == id_val).first()
        if not student:
            return False
        db.delete(student)
        db.commit()
        return True

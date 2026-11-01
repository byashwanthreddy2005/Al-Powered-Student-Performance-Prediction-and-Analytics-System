from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database.session import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    class_name = Column(String(50), nullable=False)
    section = Column(String(20), nullable=False)
    attendance = Column(Float, nullable=False)  # 0 to 100
    previous_marks = Column(Float, nullable=False)  # 0 to 100
    study_hours = Column(Float, nullable=False)  # hours per day (e.g. 0 to 24)
    assignment_completion = Column(Float, nullable=False)  # 0 to 100
    actual_final_marks = Column(Float, nullable=True)  # optional, 0 to 100 for evaluation only
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "name": self.name,
            "class_name": self.class_name,
            "section": self.section,
            "attendance": self.attendance,
            "previous_marks": self.previous_marks,
            "study_hours": self.study_hours,
            "assignment_completion": self.assignment_completion,
            "actual_final_marks": self.actual_final_marks,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


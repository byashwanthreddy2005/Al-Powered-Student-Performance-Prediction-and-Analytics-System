from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, ConfigDict


class StudentBase(BaseModel):
    student_id: str = Field(..., min_length=2, max_length=50, description="Unique identifier for the student")
    name: str = Field(..., min_length=2, max_length=100, description="Student's full name")
    class_name: str = Field(..., min_length=1, max_length=50, description="Grade or Class (e.g. Grade 10, AI-Year2)")
    section: str = Field(..., min_length=1, max_length=20, description="Section (e.g. A, B, C)")
    attendance: float = Field(..., ge=0.0, le=100.0, description="Attendance percentage (0-100)")
    previous_marks: float = Field(..., ge=0.0, le=100.0, description="Previous examination marks (0-100)")
    study_hours: float = Field(..., ge=0.0, le=24.0, description="Daily self-study hours (0-24)")
    assignment_completion: float = Field(..., ge=0.0, le=100.0, description="Assignment completion percentage (0-100)")
    actual_final_marks: Optional[float] = Field(None, ge=0.0, le=100.0, description="Actual final examination marks if available")

    @field_validator('student_id')
    @classmethod
    def clean_student_id(cls, v: str) -> str:
        return v.strip().upper()

    @field_validator('name')
    @classmethod
    def clean_name(cls, v: str) -> str:
        return v.strip()


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    class_name: Optional[str] = Field(None, min_length=1, max_length=50)
    section: Optional[str] = Field(None, min_length=1, max_length=20)
    attendance: Optional[float] = Field(None, ge=0.0, le=100.0)
    previous_marks: Optional[float] = Field(None, ge=0.0, le=100.0)
    study_hours: Optional[float] = Field(None, ge=0.0, le=24.0)
    assignment_completion: Optional[float] = Field(None, ge=0.0, le=100.0)
    actual_final_marks: Optional[float] = Field(None, ge=0.0, le=100.0)


class StudentResponse(StudentBase):
    id: int
    created_at: Optional[datetime] = None
    predicted_marks: Optional[float] = None
    performance_category: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

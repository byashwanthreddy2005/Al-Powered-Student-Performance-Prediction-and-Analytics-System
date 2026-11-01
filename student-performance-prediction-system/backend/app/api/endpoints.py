import io
import csv
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Response, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
import pandas as pd

from app.database.session import get_db
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse
from app.schemas.prediction import (
    PredictionInput,
    PredictionResult,
    BulkPredictionRequest,
    BulkPredictionResponse,
    ModelMetricsResponse
)
from app.schemas.analytics import DashboardSummary
from app.services.student_service import StudentService
from app.services.prediction_service import get_prediction_service
from app.services.analytics_service import AnalyticsService

router = APIRouter()
prediction_service = get_prediction_service()


@router.get("/health", tags=["System"])
def health_check():
    """Health check endpoint to verify backend status."""
    ml_mgr = prediction_service.ml_manager
    return {
        "status": "healthy",
        "service": "AI-Powered Student Performance Prediction System",
        "model_loaded": ml_mgr.is_ready(),
        "model_version": ml_mgr.model_version
    }


@router.get("/dashboard/summary", response_model=DashboardSummary, tags=["Dashboard"])
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Retrieve aggregate statistics, distributions, and scatter data for the dashboard."""
    return AnalyticsService.get_dashboard_summary(db)


@router.get("/analytics/classes", tags=["Analytics"])
def get_class_analytics(db: Session = Depends(get_db)):
    """Retrieve performance and risk breakdown grouped by class and section."""
    return AnalyticsService.get_class_analytics(db)


@router.get("/students", tags=["Students"])
def list_students(
    search: Optional[str] = Query(None, description="Search by student name or ID"),
    class_name: Optional[str] = Query(None, description="Filter by class name"),
    section: Optional[str] = Query(None, description="Filter by section"),
    category: Optional[str] = Query(None, description="Filter by performance category (Excellent, Good, Average, At Risk)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """List students with optional search, filtering, and pagination."""
    students, total = StudentService.get_students(
        db=db,
        search=search,
        class_name=class_name,
        section=section,
        category=category,
        skip=skip,
        limit=limit
    )
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "students": students
    }


@router.post("/students", response_model=StudentResponse, status_code=status.HTTP_201_CREATED, tags=["Students"])
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    """Add a new student record."""
    try:
        return StudentService.create_student(db, student)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create student: {e}")


@router.get("/students/{student_id_val}", response_model=StudentResponse, tags=["Students"])
def get_student(student_id_val: int, db: Session = Depends(get_db)):
    """Get student details by internal ID."""
    student = StudentService.get_student_by_id(db, student_id_val)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Student #{student_id_val} not found.")
    return student


@router.put("/students/{student_id_val}", response_model=StudentResponse, tags=["Students"])
def update_student(student_id_val: int, update_data: StudentUpdate, db: Session = Depends(get_db)):
    """Update student academic or demographic details."""
    updated = StudentService.update_student(db, student_id_val, update_data)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Student #{student_id_val} not found.")
    return updated


@router.delete("/students/{student_id_val}", tags=["Students"])
def delete_student(student_id_val: int, db: Session = Depends(get_db)):
    """Delete a student record."""
    success = StudentService.delete_student(db, student_id_val)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Student #{student_id_val} not found.")
    return {"status": "success", "message": f"Student #{student_id_val} successfully deleted."}


@router.post("/predict", response_model=PredictionResult, tags=["Machine Learning"])
def predict_performance(input_data: PredictionInput, db: Session = Depends(get_db)):
    """
    Predict final examination score using the trained ML model,
    determine risk status, and generate tailored recommendations.
    """
    try:
        return prediction_service.predict(
            attendance=input_data.attendance,
            previous_marks=input_data.previous_marks,
            study_hours=input_data.study_hours,
            assignment_completion=input_data.assignment_completion,
            student_id=input_data.student_id,
            student_name=input_data.student_name,
            persist_history=True,
            db=db
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Prediction failed: {e}")


@router.post("/predict/bulk", response_model=BulkPredictionResponse, tags=["Machine Learning"])
def bulk_predict(payload: BulkPredictionRequest, db: Session = Depends(get_db)):
    """Run predictions on multiple student records simultaneously."""
    if not payload.students:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No student records provided.")
    try:
        return prediction_service.predict_bulk(payload.students, db=db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Bulk prediction failed: {e}")


@router.post("/predict/upload-csv", tags=["Machine Learning"])
async def upload_csv_and_predict(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Accepts CSV upload, validates required columns, runs batch ML predictions,
    and returns comprehensive table records and aggregate summary.
    """
    if not file.filename.endswith(('.csv', '.CSV')):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type. Please upload a .csv file.")

    contents = await file.read()
    try:
        decoded = contents.decode('utf-8-sig')
    except UnicodeDecodeError:
        try:
            decoded = contents.decode('latin-1')
        except Exception:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unable to decode file. Ensure standard UTF-8 encoding.")

    try:
        df = pd.read_csv(io.StringIO(decoded))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"CSV Parsing failed: {str(e)}")

    # Clean headers (strip whitespace and lower)
    df.columns = [c.strip().lower() for c in df.columns]

    # Required column mapping
    required_cols = ["attendance", "previous_marks", "study_hours", "assignment_completion"]
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing required columns in CSV: {', '.join(missing)}. Required columns: student_id, student_name, attendance, previous_marks, study_hours, assignment_completion"
        )

    # Convert columns and validate numeric
    students_input = []
    errors = []
    for idx, row in df.iterrows():
        row_num = idx + 2
        try:
            att = float(row["attendance"])
            prev = float(row["previous_marks"])
            hrs = float(row["study_hours"])
            assign = float(row["assignment_completion"])

            if not (0 <= att <= 100):
                errors.append(f"Row {row_num}: Attendance {att}% is out of bounds (0-100).")
            if not (0 <= prev <= 100):
                errors.append(f"Row {row_num}: Previous marks {prev} out of bounds (0-100).")
            if not (0 <= hrs <= 24):
                errors.append(f"Row {row_num}: Study hours {hrs} out of bounds (0-24).")
            if not (0 <= assign <= 100):
                errors.append(f"Row {row_num}: Assignment completion {assign}% out of bounds (0-100).")

            s_id = str(row["student_id"]).strip() if "student_id" in df.columns and pd.notna(row["student_id"]) else f"CSV-{idx+1}"
            s_name = str(row["student_name"]).strip() if "student_name" in df.columns and pd.notna(row["student_name"]) else f"Student {idx+1}"

            students_input.append(PredictionInput(
                student_id=s_id,
                student_name=s_name,
                attendance=att,
                previous_marks=prev,
                study_hours=hrs,
                assignment_completion=assign
            ))
        except (ValueError, TypeError) as e:
            errors.append(f"Row {row_num}: Non-numeric value encountered in academic fields ({e}).")

    if errors:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"message": "Validation errors found in CSV", "errors": errors[:15]}
        )

    response = prediction_service.predict_bulk(students_input, db=db)
    return response


@router.get("/template/sample-csv", tags=["Machine Learning"])
def download_sample_csv():
    """Generates and downloads a valid template CSV for students."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["student_id", "student_name", "attendance", "previous_marks", "study_hours", "assignment_completion"])
    writer.writerow(["STU-3001", "Aarav Sharma", 88.5, 82.0, 4.5, 90.0])
    writer.writerow(["STU-3002", "Priya Nair", 94.0, 91.0, 5.5, 96.0])
    writer.writerow(["STU-3003", "Rohan Verma", 48.0, 42.0, 1.2, 40.0])
    writer.writerow(["STU-3004", "Sneha Patel", 72.5, 68.0, 3.2, 75.0])
    writer.writerow(["STU-3005", "Vikram Malhotra", 38.0, 35.0, 1.0, 30.0])

    content = output.getvalue()
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=student_prediction_sample_template.csv"}
    )


@router.get("/model/metrics", tags=["Machine Learning"])
def get_model_metrics():
    """Retrieve detailed machine learning model evaluation metrics and comparison."""
    return prediction_service.get_metrics()


@router.get("/reports/export", tags=["Reports"])
def export_reports(
    filter_at_risk_only: bool = Query(False, description="Filter only at-risk students"),
    db: Session = Depends(get_db)
):
    """Export academic performance and prediction report in CSV format."""
    csv_data = AnalyticsService.export_csv_report(db, filter_at_risk_only=filter_at_risk_only)
    filename = "at_risk_students_report.csv" if filter_at_risk_only else "all_students_performance_report.csv"
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


import uuid
import pytest
from app.database.session import SessionLocal
from app.api.endpoints import (
    health_check,
    get_dashboard_summary,
    list_students,
    create_student,
    get_student,
    update_student,
    delete_student,
    predict_performance,
    bulk_predict,
    get_model_metrics,
    export_reports,
    download_sample_csv
)
from app.schemas.student import StudentCreate, StudentUpdate
from app.schemas.prediction import PredictionInput, BulkPredictionRequest


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_health_check_endpoint():
    res = health_check()
    assert res["status"] == "healthy"
    assert res["model_loaded"] is True
    assert "model_version" in res


def test_dashboard_summary_endpoint(db):
    res = get_dashboard_summary(db=db)
    assert res["total_students"] > 0
    assert 0 <= res["avg_attendance"] <= 100
    assert 0 <= res["avg_previous_marks"] <= 100
    assert len(res["category_distribution"]) == 4
    assert len(res["attendance_vs_performance"]) > 0


def test_student_crud_endpoints(db):
    uid = uuid.uuid4().hex[:6].upper()
    test_id = f"UNIT-{uid}"
    # 1. Create
    student_data = StudentCreate(
        student_id=test_id,
        name="Automation Student",
        class_name="AI & DS - Sem 3",
        section="B",
        attendance=88.0,
        previous_marks=82.0,
        study_hours=4.0,
        assignment_completion=85.0,
        actual_final_marks=84.0
    )
    created = create_student(student=student_data, db=db)
    pk = created["id"]
    assert created["student_id"] == test_id
    assert created["name"] == "Automation Student"
    assert created["predicted_marks"] is not None

    # 2. Get
    fetched = get_student(student_id_val=pk, db=db)
    assert fetched["id"] == pk
    assert fetched["student_id"] == test_id

    # 3. Update
    update_data = StudentUpdate(previous_marks=89.0, study_hours=5.2)
    updated = update_student(student_id_val=pk, update_data=update_data, db=db)
    assert updated["previous_marks"] == 89.0
    assert updated["study_hours"] == 5.2

    # 4. List
    list_res = list_students(search="Automation", skip=0, limit=10, db=db)
    assert list_res["total"] >= 1
    assert any(s["id"] == pk for s in list_res["students"])

    # 5. Delete
    del_res = delete_student(student_id_val=pk, db=db)
    assert del_res["status"] == "success"

    # 6. Verify 404
    with pytest.raises(Exception):
        get_student(student_id_val=pk, db=db)


def test_predict_performance_endpoint(db):
    payload = PredictionInput(
        attendance=92.0,
        previous_marks=86.0,
        study_hours=4.5,
        assignment_completion=90.0,
        student_id="PRED-TEST-1",
        student_name="High Scorer"
    )
    res = predict_performance(input_data=payload, db=db)
    assert 0 <= res.predicted_marks <= 100
    assert res.performance_category in ["Excellent", "Good", "Average", "At Risk"]
    assert len(res.recommendations) > 0
    assert res.feature_contributions is not None


def test_bulk_predict_endpoint(db):
    payload = BulkPredictionRequest(
        students=[
            PredictionInput(attendance=95.0, previous_marks=90.0, study_hours=5.0, assignment_completion=95.0, student_id="BP-1"),
            PredictionInput(attendance=40.0, previous_marks=35.0, study_hours=1.0, assignment_completion=30.0, student_id="BP-2")
        ]
    )
    res = bulk_predict(payload=payload, db=db)
    assert res.total_processed == 2
    assert len(res.predictions) == 2
    assert res.at_risk_count >= 1


def test_model_metrics_endpoint():
    res = get_model_metrics()
    assert res["status"] == "ready"
    assert "metrics" in res
    assert "mae" in res["metrics"]
    assert "r2_score" in res["metrics"]
    assert "feature_importance" in res


def test_report_export_endpoint(db):
    res = export_reports(filter_at_risk_only=False, db=db)
    body = res.body.decode("utf-8")
    assert "Student ID,Student Name" in body
    assert len(body.splitlines()) > 5


def test_sample_csv_download_endpoint():
    res = download_sample_csv()
    body = res.body.decode("utf-8")
    assert "student_id,student_name" in body
    assert "attendance" in body

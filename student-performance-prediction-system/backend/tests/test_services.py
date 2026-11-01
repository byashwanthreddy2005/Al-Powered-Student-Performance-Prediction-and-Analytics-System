from app.services.recommendation_service import RecommendationEngine


def test_recommendation_low_attendance():
    recs = RecommendationEngine.generate_recommendations(
        attendance=55.0,
        previous_marks=75.0,
        study_hours=4.0,
        assignment_completion=80.0,
        predicted_marks=68.0
    )
    att_rec = next((r for r in recs if r.area == "Attendance"), None)
    assert att_rec is not None
    assert att_rec.priority == "High"
    assert "Critical Attendance Shortage" in att_rec.title


def test_recommendation_high_performer():
    recs = RecommendationEngine.generate_recommendations(
        attendance=96.0,
        previous_marks=92.0,
        study_hours=6.0,
        assignment_completion=98.0,
        predicted_marks=93.0
    )
    excel_rec = next((r for r in recs if r.area == "Excellence"), None)
    assert excel_rec is not None
    assert excel_rec.priority == "Positive"


def test_recommendation_at_risk():
    recs = RecommendationEngine.generate_recommendations(
        attendance=45.0,
        previous_marks=40.0,
        study_hours=1.0,
        assignment_completion=35.0,
        predicted_marks=42.0
    )
    intervention = next((r for r in recs if r.area == "Intervention"), None)
    assert intervention is not None
    assert intervention.priority == "High"


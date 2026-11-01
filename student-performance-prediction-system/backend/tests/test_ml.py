from app.ml.pipeline import ModelPipelineManager, categorize_performance


def test_model_pipeline_loaded():
    mgr = ModelPipelineManager.get_instance()
    assert mgr.is_ready() is True
    assert mgr.pipeline is not None
    assert mgr.metrics is not None


def test_predict_bounds():
    mgr = ModelPipelineManager.get_instance()

    # Extreme low
    pred_low = mgr.predict_one(0.0, 0.0, 0.0, 0.0)
    assert 0.0 <= pred_low <= 100.0

    # Extreme high
    pred_high = mgr.predict_one(100.0, 100.0, 12.0, 100.0)
    assert 0.0 <= pred_high <= 100.0
    assert pred_high > pred_low


def test_performance_categorization():
    assert categorize_performance(92.5) == "Excellent"
    assert categorize_performance(85.0) == "Excellent"
    assert categorize_performance(77.0) == "Good"
    assert categorize_performance(70.0) == "Good"
    assert categorize_performance(62.0) == "Average"
    assert categorize_performance(50.0) == "Average"
    assert categorize_performance(49.9) == "At Risk"
    assert categorize_performance(15.0) == "At Risk"


def test_feature_contributions():
    mgr = ModelPipelineManager.get_instance()
    contribs = mgr.calculate_contributions(
        attendance=95.0,
        previous_marks=90.0,
        study_hours=5.0,
        assignment_completion=95.0
    )
    assert "attendance" in contribs
    assert "previous_marks" in contribs
    assert "study_hours" in contribs
    assert "assignment_completion" in contribs
    # All are above benchmark mean so should be positive
    assert contribs["previous_marks"] > 0


import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  Percent,
  Award,
  Clock,
  CheckSquare,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Info,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';

export default function PredictPerformance({ predictPrefill, showNotification }) {
  const [formData, setFormData] = useState({
    student_id: '',
    student_name: '',
    attendance: 80.0,
    previous_marks: 75.0,
    study_hours: 3.5,
    assignment_completion: 80.0,
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (predictPrefill) {
      setFormData({
        student_id: predictPrefill.student_id || '',
        student_name: predictPrefill.student_name || predictPrefill.name || '',
        attendance: predictPrefill.attendance !== undefined ? predictPrefill.attendance : 80.0,
        previous_marks: predictPrefill.previous_marks !== undefined ? predictPrefill.previous_marks : 75.0,
        study_hours: predictPrefill.study_hours !== undefined ? predictPrefill.study_hours : 3.5,
        assignment_completion: predictPrefill.assignment_completion !== undefined ? predictPrefill.assignment_completion : 80.0,
      });
      // Automatically run prediction if prefilled
      executePrediction({
        student_id: predictPrefill.student_id,
        student_name: predictPrefill.student_name || predictPrefill.name,
        attendance: predictPrefill.attendance,
        previous_marks: predictPrefill.previous_marks,
        study_hours: predictPrefill.study_hours,
        assignment_completion: predictPrefill.assignment_completion,
      });
    }
  }, [predictPrefill]);

  const validate = () => {
    const errs = {};
    const att = Number(formData.attendance);
    if (isNaN(att) || att < 0 || att > 100) errs.attendance = 'Attendance must be between 0 and 100%.';

    const prev = Number(formData.previous_marks);
    if (isNaN(prev) || prev < 0 || prev > 100) errs.previous_marks = 'Marks must be between 0 and 100.';

    const hrs = Number(formData.study_hours);
    if (isNaN(hrs) || hrs < 0 || hrs > 24) errs.study_hours = 'Daily study hours must be between 0 and 24.';

    const assign = Number(formData.assignment_completion);
    if (isNaN(assign) || assign < 0 || assign > 100) errs.assignment_completion = 'Assignment % must be between 0 and 100%.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const executePrediction = async (dataToPredict = formData) => {
    setLoading(true);
    try {
      const res = await api.predict({
        student_id: dataToPredict.student_id ? dataToPredict.student_id.trim() : null,
        student_name: dataToPredict.student_name ? dataToPredict.student_name.trim() : null,
        attendance: Number(dataToPredict.attendance),
        previous_marks: Number(dataToPredict.previous_marks),
        study_hours: Number(dataToPredict.study_hours),
        assignment_completion: Number(dataToPredict.assignment_completion),
      });
      setPrediction(res);
      showNotification('success', `Model predicted final score: ${res.predicted_marks} (${res.performance_category}).`);
    } catch (err) {
      showNotification('error', `Prediction failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    executePrediction();
  };

  const handleReset = () => {
    setFormData({
      student_id: '',
      student_name: '',
      attendance: 75.0,
      previous_marks: 70.0,
      study_hours: 3.5,
      assignment_completion: 75.0,
    });
    setPrediction(null);
    setErrors({});
  };

  const categoryStyles = {
    Excellent: {
      cardBg: 'from-cyan-900 via-navy-900 to-navy-950',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400',
      text: 'text-cyan-400',
      meter: 'bg-cyan-400',
    },
    Good: {
      cardBg: 'from-blue-900 via-navy-900 to-navy-950',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-400',
      text: 'text-blue-400',
      meter: 'bg-blue-400',
    },
    Average: {
      cardBg: 'from-amber-950 via-navy-900 to-navy-950',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-400',
      text: 'text-amber-400',
      meter: 'bg-amber-400',
    },
    'At Risk': {
      cardBg: 'from-rose-950 via-navy-900 to-navy-950',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-400',
      text: 'text-rose-400',
      meter: 'bg-rose-500',
    },
  };

  const activeCategoryStyle = prediction ? categoryStyles[prediction.performance_category] : categoryStyles.Good;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Introduction Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
              <Brain className="w-4 h-4" /> Machine Learning Inference
            </span>
          </div>
          <h2 className="text-xl font-bold text-navy-900 dark:text-white">
            Individual Student Score Estimation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Input student metrics below. The trained Random Forest / Linear Regression pipeline computes the expected final examination marks (0–100), detects academic vulnerability risk, and compiles tailored guidance.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-500/20 text-xs text-cyan-800 dark:text-cyan-300 max-w-xs">
          <strong>Threshold Bands:</strong>
          <ul className="mt-1 space-y-0.5 text-[11px]">
            <li>• Excellent: 85–100 marks</li>
            <li>• Good: 70–84 marks</li>
            <li>• Average: 50–69 marks</li>
            <li>• At Risk: &lt; 50 marks</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-navy-800">
              <h3 className="text-sm font-bold text-navy-900 dark:text-white uppercase tracking-wider">
                Student Input Parameters
              </h3>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Student ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                    placeholder="e.g. STU-1024"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Student Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.student_name}
                    onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                    placeholder="e.g. Priya Sharma"
                  />
                </div>
              </div>

              {/* Attendance Slider & Input */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-navy-900 dark:text-white flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-cyan-500" /> Attendance Percentage
                  </label>
                  <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                    {formData.attendance}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={formData.attendance}
                  onChange={(e) => setFormData({ ...formData, attendance: e.target.value })}
                  className="w-full h-1.5 bg-slate-200 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                {errors.attendance && <p className="text-rose-500 text-[11px] mt-1">{errors.attendance}</p>}
              </div>

              {/* Previous Marks Slider & Input */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-navy-900 dark:text-white flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-blue-500" /> Previous Examination Marks
                  </label>
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                    {formData.previous_marks} / 100
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={formData.previous_marks}
                  onChange={(e) => setFormData({ ...formData, previous_marks: e.target.value })}
                  className="w-full h-1.5 bg-slate-200 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                {errors.previous_marks && <p className="text-rose-500 text-[11px] mt-1">{errors.previous_marks}</p>}
              </div>

              {/* Study Hours Slider & Input */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-navy-900 dark:text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Daily Study Hours
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                    {formData.study_hours} hrs/day
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.25"
                  value={formData.study_hours}
                  onChange={(e) => setFormData({ ...formData, study_hours: e.target.value })}
                  className="w-full h-1.5 bg-slate-200 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                {errors.study_hours && <p className="text-rose-500 text-[11px] mt-1">{errors.study_hours}</p>}
              </div>

              {/* Assignment Completion Slider & Input */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-navy-900 dark:text-white flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-purple-500" /> Assignment Completion
                  </label>
                  <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                    {formData.assignment_completion}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={formData.assignment_completion}
                  onChange={(e) => setFormData({ ...formData, assignment_completion: e.target.value })}
                  className="w-full h-1.5 bg-slate-200 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                {errors.assignment_completion && <p className="text-rose-500 text-[11px] mt-1">{errors.assignment_completion}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 hover:brightness-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? 'Evaluating ML Model...' : 'Predict Performance'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Visual Result Card & Recommendations */}
        <div className="lg:col-span-7 space-y-6">
          {prediction ? (
            <>
              {/* Premium Result Card */}
              <div className={`p-8 rounded-3xl bg-gradient-to-br ${activeCategoryStyle.cardBg} text-white shadow-2xl border border-white/10 relative overflow-hidden animate-slide-up`}>
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> AI Prediction Output
                      </span>
                      <h3 className="text-xl font-bold mt-1 text-white">
                        {prediction.student_name || 'Individual Student Candidate'}
                      </h3>
                      {prediction.student_id && (
                        <p className="text-xs text-slate-300 font-mono">ID: {prediction.student_id}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full border ${activeCategoryStyle.badge}`}>
                        {prediction.performance_category}
                      </span>
                    </div>
                  </div>

                  {/* Main Score Display */}
                  <div className="py-6 flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                        Predicted Final Examination Score
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black text-white tracking-tight">
                          {prediction.predicted_marks}
                        </span>
                        <span className="text-lg font-bold text-slate-400">/ 100 Marks</span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 block mb-1">Risk Evaluation</span>
                      {prediction.performance_category === 'At Risk' ? (
                        <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Academic Intervention Required</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Above Academic Risk Threshold</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Gauge Bar */}
                  <div className="space-y-1 mb-6">
                    <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${activeCategoryStyle.meter}`}
                        style={{ width: `${Math.min(prediction.predicted_marks, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>0</span>
                      <span>50 (Passing Threshold)</span>
                      <span>70</span>
                      <span>85</span>
                      <span>100</span>
                    </div>
                  </div>

                  {/* Feature Directional Deltas */}
                  {prediction.feature_contributions && (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 block mb-2.5">
                        Feature Impact On Predicted Score (vs Cohort Benchmarks)
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {Object.entries(prediction.feature_contributions).map(([feat, delta]) => {
                          const isPositive = delta >= 0;
                          return (
                            <div key={feat} className="p-2 rounded-xl bg-black/20">
                              <span className="text-[10px] text-slate-400 block capitalize truncate">
                                {feat.replace('_', ' ')}
                              </span>
                              <div className="flex items-center gap-1 mt-0.5">
                                {isPositive ? (
                                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                                )}
                                <span className={`font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {isPositive ? `+${delta}` : delta} pts
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Disclaimer Note */}
                  <p className="text-[11px] text-slate-400 italic mt-4">
                    {prediction.disclaimer}
                  </p>
                </div>

                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              </div>

              {/* Personalized Recommendations Section */}
              <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-navy-900 dark:text-white">
                    Personalized Academic Improvement Recommendations
                  </h3>
                </div>

                <div className="space-y-3">
                  {prediction.recommendations.map((rec, idx) => {
                    const badgeStyles = {
                      High: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
                      Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
                      Positive: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
                    };

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-slate-100 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/50 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-navy-900 dark:text-white">
                            {rec.title}
                          </h4>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badgeStyles[rec.priority] || badgeStyles.Medium}`}>
                            {rec.area} • {rec.priority} Priority
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {rec.message}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full min-h-[400px] p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-navy-800 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-4">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-navy-900 dark:text-white">
                Awaiting Prediction Inputs
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                Adjust the attendance, previous examination marks, study hours, and assignment completion sliders on the left, then click <strong>Predict Performance</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


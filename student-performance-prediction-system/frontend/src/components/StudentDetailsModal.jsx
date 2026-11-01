import React, { useState } from 'react';
import { X, User, Award, BookOpen, Clock, CheckSquare, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function StudentDetailsModal({ isOpen, onClose, student, onNavigatePredict }) {
  const [livePrediction, setLivePrediction] = useState(null);
  const [loadingPred, setLoadingPred] = useState(false);

  if (!isOpen || !student) return null;

  const handlePredictDirectly = async () => {
    setLoadingPred(true);
    try {
      const res = await api.predict({
        student_id: student.student_id,
        student_name: student.name,
        attendance: student.attendance,
        previous_marks: student.previous_marks,
        study_hours: student.study_hours,
        assignment_completion: student.assignment_completion,
      });
      setLivePrediction(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPred(false);
    }
  };

  const category = livePrediction ? livePrediction.performance_category : student.performance_category || 'Pending';
  const predictedScore = livePrediction ? livePrediction.predicted_marks : student.predicted_marks;

  const categoryStyles = {
    Excellent: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-400',
    Good: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-400',
    Average: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-400',
    'At Risk': 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-400',
    Pending: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-navy-800 flex items-start justify-between bg-slate-50/50 dark:bg-navy-950/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-cyan-500/20">
              {student.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-navy-900 dark:text-white">
                  {student.name}
                </h3>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                  {student.student_id}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {student.class_name} • Section {student.section}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Attendance
              </span>
              <p className="text-xl font-extrabold text-navy-900 dark:text-white">
                {student.attendance}%
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Previous Marks
              </span>
              <p className="text-xl font-extrabold text-navy-900 dark:text-white">
                {student.previous_marks}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Daily Study
              </span>
              <p className="text-xl font-extrabold text-navy-900 dark:text-white">
                {student.study_hours} hrs
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Assignment
              </span>
              <p className="text-xl font-extrabold text-navy-900 dark:text-white">
                {student.assignment_completion}%
              </p>
            </div>
          </div>

          {/* Machine Learning Prediction Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-navy-900 to-navy-950 text-white border border-cyan-500/30 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Model Prediction
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-4xl font-black text-white">
                    {predictedScore !== null && predictedScore !== undefined ? predictedScore : '—'}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">/ 100 Marks</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${categoryStyles[category] || categoryStyles.Pending}`}>
                    {category}
                  </span>
                </div>
                {student.actual_final_marks !== null && student.actual_final_marks !== undefined && (
                  <p className="text-xs text-slate-300 mt-2">
                    Actual Exam Marks Recorded: <strong className="text-cyan-300 font-semibold">{student.actual_final_marks}</strong> (Delta: {Math.abs(student.actual_final_marks - (predictedScore || 0)).toFixed(1)} marks)
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <button
                  onClick={handlePredictDirectly}
                  disabled={loadingPred}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
                >
                  {loadingPred ? 'Running Model...' : 'Re-Run Prediction'}
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onNavigatePredict(student);
                  }}
                  className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-navy-700"
                >
                  <span>Open Full Predictor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Recommendations Section */}
          {livePrediction?.recommendations && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Personalized Academic Recommendations
              </h4>
              <div className="space-y-2">
                {livePrediction.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/50 flex items-start gap-3"
                  >
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md mt-0.5 ${
                        rec.priority === 'High'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : rec.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {rec.area}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-navy-900 dark:text-white">
                        {rec.title}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                        {rec.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


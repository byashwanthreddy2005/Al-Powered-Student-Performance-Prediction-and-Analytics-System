import React, { useState, useEffect } from 'react';
import {
  Users,
  Percent,
  Award,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Clock,
  ArrowUpRight,
  Brain
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  Line
} from 'recharts';
import { api } from '../services/api';
import MetricCard from '../components/MetricCard';

export default function Dashboard({ setActivePage, setPredictPrefill, showNotification }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const summary = await api.getDashboardSummary();
      setData(summary);
      if (isRefresh) showNotification('success', 'Dashboard metrics synchronized with live database.');
    } catch (err) {
      showNotification('error', `Failed to load dashboard: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading student analytics...</p>
      </div>
    );
  }

  const {
    total_students = 0,
    avg_attendance = 0,
    avg_previous_marks = 0,
    avg_predicted_marks = 0,
    at_risk_students_count = 0,
    category_distribution = [],
    attendance_vs_performance = [],
    study_hours_vs_marks = [],
    assignment_vs_performance = [],
    actual_vs_predicted = [],
    feature_importance = {},
    recent_predictions = []
  } = data || {};

  const featureImportanceData = Object.entries(feature_importance || {}).map(([key, val]) => ({
    feature: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    importance: val,
  })).sort((a, b) => b.importance - a.importance);

  const categoryColorMap = {
    Excellent: '#06b6d4',
    Good: '#3b82f6',
    Average: '#f59e0b',
    'At Risk': '#ef4444'
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner / Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-800 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Institutional AI Intelligence
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Academic Performance Overview
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Live machine learning analytics evaluating attendance, continuous assessments, and study behavior to predict final scores and detect academic vulnerability early.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-950/80 hover:bg-navy-950 text-slate-200 text-xs font-semibold border border-navy-700/80 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Database'}</span>
          </button>
          <button
            onClick={() => setActivePage('predict')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-navy-950 text-xs font-bold shadow-lg shadow-cyan-500/20 hover:brightness-105 transition-all"
          >
            <Brain className="w-4 h-4" />
            <span>Launch Predictor</span>
          </button>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Students"
          value={total_students}
          unit="Enrolled"
          subtitle="Active cohort records"
          icon={Users}
          badgeText="Live DB"
          badgeColor="cyan"
          onClick={() => setActivePage('students')}
        />
        <MetricCard
          title="Avg Attendance"
          value={avg_attendance}
          unit="%"
          subtitle="Lecture & lab presence"
          icon={Percent}
          badgeText={avg_attendance >= 75 ? 'Optimal' : 'Needs Focus'}
          badgeColor={avg_attendance >= 75 ? 'emerald' : 'amber'}
        />
        <MetricCard
          title="Avg Previous Marks"
          value={avg_previous_marks}
          unit="/ 100"
          subtitle="Midterm baseline"
          icon={Award}
          badgeText="Internal Assessment"
          badgeColor="blue"
        />
        <MetricCard
          title="Predicted Final Score"
          value={avg_predicted_marks}
          unit="/ 100"
          subtitle="ML Regressor estimation"
          icon={TrendingUp}
          badgeText="AI Forecast"
          badgeColor="cyan"
          onClick={() => setActivePage('predict')}
        />
        <MetricCard
          title="At-Risk Students"
          value={at_risk_students_count}
          unit="Students"
          subtitle="Predicted score < 50"
          icon={AlertTriangle}
          badgeText="Immediate Action"
          badgeColor="rose"
          onClick={() => setActivePage('analytics')}
        />
      </div>

      {/* Row 1: Interactive Charts (Scatter Attendance vs Performance & Distribution Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance vs Predicted Performance */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-navy-900 dark:text-white">
                1. Attendance vs Academic Performance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                X-Axis: Attendance Percentage (%) | Y-Axis: Predicted Final Marks
              </p>
            </div>
            <span className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/20">
              Positive Correlation
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Attendance"
                  unit="%"
                  domain={[30, 100]}
                  stroke="#94a3b8"
                  fontSize={11}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Predicted Marks"
                  unit=" marks"
                  domain={[0, 100]}
                  stroke="#94a3b8"
                  fontSize={11}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-3 bg-navy-900 text-white rounded-xl shadow-xl text-xs border border-navy-700">
                          <p className="font-bold text-cyan-300">{d.name} ({d.student_id})</p>
                          <p className="mt-1">Attendance: <strong className="text-white">{d.x}%</strong></p>
                          <p>Predicted Score: <strong className="text-white">{d.y}</strong></p>
                          <p>Category: <strong className="text-cyan-400">{d.category}</strong></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Students" data={attendance_vs_performance} fill="#06b6d4" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Performance Category Distribution */}
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-navy-900 dark:text-white">
              3. Student Performance Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Proportion of cohort categorized across performance tiers
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={category_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={78}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="category"
                >
                  {category_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={categoryColorMap[entry.category] || entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-navy-900 text-white rounded-xl text-xs border border-navy-700">
                          <p className="font-bold">{d.category}</p>
                          <p>{d.count} students ({d.percentage}%)</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-navy-800">
            {category_distribution.map((cat) => (
              <div key={cat.category} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: categoryColorMap[cat.category] || cat.color }}
                />
                <span className="text-xs text-slate-600 dark:text-slate-300 truncate">
                  {cat.category}: <strong>{cat.count}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Charts (Study Hours vs Marks & Predicted vs Actual) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Hours vs Examination Marks */}
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-navy-900 dark:text-white">
                2. Study Hours vs Examination Marks
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                X-Axis: Daily Self-Study Hours | Y-Axis: Previous Marks
              </p>
            </div>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-500/20">
              Effort Matrix
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Study Hours"
                  unit=" hrs"
                  domain={[0, 10]}
                  stroke="#94a3b8"
                  fontSize={11}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Marks"
                  domain={[20, 100]}
                  stroke="#94a3b8"
                  fontSize={11}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-3 bg-navy-900 text-white rounded-xl shadow-xl text-xs border border-navy-700">
                          <p className="font-bold text-cyan-300">{d.name}</p>
                          <p className="mt-1">Study: <strong className="text-white">{d.x} hrs/day</strong></p>
                          <p>Exam Marks: <strong className="text-white">{d.y}</strong></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Study Effort" data={study_hours_vs_marks} fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Predicted Marks vs Actual Marks */}
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-navy-900 dark:text-white">
                4. Predicted Marks vs Actual Marks
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evaluation on students with verified final examination results
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              R² ≈ 0.90 Precision
            </span>
          </div>

          <div className="h-64 w-full">
            {actual_vs_predicted.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={actual_vs_predicted.slice(0, 10)} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                  <XAxis dataKey="student_id" stroke="#94a3b8" fontSize={10} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    content={({ payload }) => {
                      if (payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="p-3 bg-navy-900 text-white rounded-xl shadow-xl text-xs border border-navy-700">
                            <p className="font-bold text-cyan-300">{d.name} ({d.student_id})</p>
                            <p className="mt-1">Actual: <strong className="text-emerald-400">{d.actual}</strong></p>
                            <p>Predicted: <strong className="text-cyan-400">{d.predicted}</strong></p>
                            <p>Error (Delta): <strong className="text-amber-300">{d.difference} marks</strong></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="actual" name="Actual Final Marks" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="predicted" name="ML Predicted Marks" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No actual examination results recorded yet for direct side-by-side comparison.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Assignment vs Performance & ML Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 5. Assignment Completion vs Performance */}
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-navy-900 dark:text-white">
                5. Assignment Completion vs Performance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                X-Axis: Assignment Completion (%) | Y-Axis: Predicted Score
              </p>
            </div>
            <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-500/20">
              Curricular Adherence
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Assignment Completion"
                  unit="%"
                  domain={[20, 100]}
                  stroke="#94a3b8"
                  fontSize={11}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Score"
                  domain={[20, 100]}
                  stroke="#94a3b8"
                  fontSize={11}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-3 bg-navy-900 text-white rounded-xl shadow-xl text-xs border border-navy-700">
                          <p className="font-bold text-cyan-300">{d.name}</p>
                          <p className="mt-1">Assignment: <strong className="text-white">{d.x}%</strong></p>
                          <p>Predicted Score: <strong className="text-white">{d.y}</strong></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Assignments" data={assignment_vs_performance} fill="#8b5cf6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Machine Learning Feature Importance */}
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-navy-900 dark:text-white">
                6. Machine Learning Feature Importance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gini relative weight distribution derived from the fitted Random Forest estimator
              </p>
            </div>
            <button
              onClick={() => setActivePage('model')}
              className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Inspect Model</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={featureImportanceData}
                margin={{ top: 10, right: 30, bottom: 10, left: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis type="number" unit="%" domain={[0, 60]} stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={11} width={110} />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Relative Weight']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="importance" fill="#06b6d4" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Prediction Logs */}
      {recent_predictions.length > 0 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-navy-900 dark:text-white">
                Live Inference History Feed
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Most recent predictions logged to the SQLite database
              </p>
            </div>
            <button
              onClick={() => setActivePage('predict')}
              className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Test New Student &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-navy-800 text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="py-3 px-3">Student</th>
                  <th className="py-3 px-3">Attendance</th>
                  <th className="py-3 px-3">Previous</th>
                  <th className="py-3 px-3">Study Time</th>
                  <th className="py-3 px-3">Assignments</th>
                  <th className="py-3 px-3">Predicted Score</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800/60">
                {recent_predictions.map((p) => {
                  const catStyle = categoryColorMap[p.performance_category] || '#94a3b8';
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-800/30">
                      <td className="py-2.5 px-3 font-semibold text-navy-900 dark:text-white">
                        {p.student_name || 'Anonymous'} <span className="text-[10px] text-slate-400">({p.student_id || 'Direct'})</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{p.attendance}%</td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{p.previous_marks}</td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{p.study_hours}h</td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{p.assignment_completion}%</td>
                      <td className="py-2.5 px-3 font-bold text-cyan-600 dark:text-cyan-400">{p.predicted_marks} / 100</td>
                      <td className="py-2.5 px-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            backgroundColor: `${catStyle}15`,
                            color: catStyle,
                            border: `1px solid ${catStyle}30`
                          }}
                        >
                          {p.performance_category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {p.prediction_date ? new Date(p.prediction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


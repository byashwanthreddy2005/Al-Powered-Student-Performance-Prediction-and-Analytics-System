import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  Award,
  CheckCircle2,
  TrendingUp,
  BarChart2,
  ShieldCheck,
  AlertCircle,
  Sliders,
  Sparkles,
  BookOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import { api } from '../services/api';

export default function ModelInsights({ showNotification }) {
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Feature influence simulator state
  const [simAttendance, setSimAttendance] = useState(75);
  const [simPrevious, setSimPrevious] = useState(70);
  const [simHours, setSimHours] = useState(3.5);
  const [simAssignment, setSimAssignment] = useState(75);
  const [simScore, setSimScore] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.getModelMetrics();
        setMetricsData(res);
      } catch (err) {
        showNotification('error', `Failed to load model insights: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const runSimulation = async () => {
    setSimLoading(true);
    try {
      const res = await api.predict({
        attendance: simAttendance,
        previous_marks: simPrevious,
        study_hours: simHours,
        assignment_completion: simAssignment,
      });
      setSimScore(res.predicted_marks);
    } catch (err) {
      console.error(err);
    } finally {
      setSimLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [simAttendance, simPrevious, simHours, simAssignment]);

  if (loading && !metricsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading model telemetry...</p>
      </div>
    );
  }

  const {
    active_model = 'Linear Regression',
    metrics = {},
    feature_importance = {},
    comparison = [],
    dataset_size = 1200,
    train_samples = 960,
    test_samples = 240,
    training_timestamp,
    is_demo = true
  } = metricsData || {};

  const featureChartData = Object.entries(feature_importance).map(([key, val]) => ({
    feature: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    weight: val,
  })).sort((a, b) => b.weight - a.weight);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
            <Cpu className="w-4 h-4" /> Supervised Machine Learning Pipeline
          </span>
          <h2 className="text-xl font-bold text-navy-900 dark:text-white mt-1">
            Model Evaluation & Cross-Validation Insights
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Trained on multi-dimensional student academic indicators with strict data leakage prevention. Evaluated via 5-Fold Cross-Validation and held-out test verification.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs">
          <div className="flex items-center gap-2 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Zero Data Leakage Guard</span>
          </div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
            Final Exam marks never fed as inputs during training or prediction.
          </p>
        </div>
      </div>

      {/* KPI Cards: MAE, RMSE, R2, Samples */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Coefficient of Determination (R²)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">
              {metrics.r2_score !== undefined ? metrics.r2_score : '—'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            5-Fold CV Mean: <strong>{metrics.cv_mean_r2} (±{metrics.cv_std_r2})</strong>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Mean Absolute Error (MAE)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-navy-900 dark:text-white">
              {metrics.mae !== undefined ? metrics.mae : '—'}
            </span>
            <span className="text-xs font-semibold text-slate-400">marks</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Average prediction delta on unseen test cohort
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Root Mean Squared Error (RMSE)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-navy-900 dark:text-white">
              {metrics.rmse !== undefined ? metrics.rmse : '—'}
            </span>
            <span className="text-xs font-semibold text-slate-400">marks</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Penalizes outlier deviations in final mark estimates
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Validation Samples Split</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-navy-900 dark:text-white">
              {train_samples} / {test_samples}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            80% Training • 20% Held-Out Testing ({dataset_size} total records)
          </p>
        </div>
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-navy-900 dark:text-white">
              Model Tournament & Cross-Validation Benchmarking
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct performance comparison between trained candidate regression algorithms
            </p>
          </div>
          <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-3 py-1 rounded-xl border border-cyan-500/20">
            Selected Champion: {active_model}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-950/70 text-slate-600 dark:text-slate-300 font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">Model Architecture</th>
                <th className="py-3 px-4">5-Fold CV R²</th>
                <th className="py-3 px-4">CV Std Dev</th>
                <th className="py-3 px-4">Test MAE</th>
                <th className="py-3 px-4">Test RMSE</th>
                <th className="py-3 px-4">Test R² Score</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800/60">
              {comparison.map((item, idx) => {
                const isChampion = item.model_name === active_model;
                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-50/60 dark:hover:bg-navy-800/40 ${
                      isChampion ? 'bg-cyan-50/30 dark:bg-cyan-950/20 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-navy-900 dark:text-white flex items-center gap-2">
                      {isChampion && <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0" />}
                      <span>{item.model_name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      {item.cv_mean_r2}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                      ±{item.cv_std_r2}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-200">
                      {item.mae} marks
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-200">
                      {item.rmse} marks
                    </td>
                    <td className="py-3 px-4 font-mono font-black text-cyan-600 dark:text-cyan-400">
                      {item.r2_score}
                    </td>
                    <td className="py-3 px-4">
                      {isChampion ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-400">
                          Active In Production
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-navy-800 dark:text-slate-400">
                          Candidate
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row: Feature Importance Bar Chart & Live Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Feature Importance */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-navy-900 dark:text-white">
              Model Feature Importance (Gini Impurity)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Contribution of each academic metric toward final examination marks determination
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureChartData} layout="vertical" margin={{ top: 10, right: 30, bottom: 10, left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} unit="%" domain={[0, 60]} />
                <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={11} width={120} />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Relative Weight']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="weight" fill="#06b6d4" radius={[0, 6, 6, 0]}>
                  {featureChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#06b6d4' : index === 1 ? '#3b82f6' : index === 2 ? '#8b5cf6' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-navy-800">
            Note: Continuous assessment (assignments & previous examination records) together account for over 80% of final score predictability.
          </div>
        </div>

        {/* Interactive Feature Influence Simulator */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sliders className="w-4 h-4 text-cyan-500" />
              <h3 className="text-base font-bold text-navy-900 dark:text-white">
                Live Parameter Sensitivity Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Drag parameters to observe real-time inference responses from the fitted pipeline:
            </p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">Attendance</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{simAttendance}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={simAttendance}
                  onChange={(e) => setSimAttendance(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">Previous Marks</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{simPrevious} / 100</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={simPrevious}
                  onChange={(e) => setSimPrevious(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">Daily Study Hours</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{simHours} hrs</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.25"
                  value={simHours}
                  onChange={(e) => setSimHours(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">Assignment Completion</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{simAssignment}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={simAssignment}
                  onChange={(e) => setSimAssignment(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-navy-900 to-navy-950 text-white flex items-center justify-between border border-cyan-500/30">
            <div>
              <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">
                Simulated Forecast Score
              </span>
              <span className="text-2xl font-black text-white">
                {simLoading ? 'Calculating...' : `${simScore !== null ? simScore : '—'} / 100`}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-300 bg-white/10 px-3 py-1 rounded-full">
              {simScore >= 85 ? 'Excellent' : simScore >= 70 ? 'Good' : simScore >= 50 ? 'Average' : 'At Risk'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


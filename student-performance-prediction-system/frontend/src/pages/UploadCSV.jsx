import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Table,
  BarChart2,
  Trash2,
  Percent
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../services/api';

export default function UploadCSV({ showNotification }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [processingStage, setProcessingStage] = useState('idle'); // idle, uploading, validating, predicting, complete
  const [bulkResult, setBulkResult] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile) => {
    if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.CSV')) {
      showNotification('error', 'Only standard .csv files are supported.');
      return;
    }
    setFile(selectedFile);
    setBulkResult(null);
    setErrorDetails(null);
    setProcessingStage('idle');
  };

  const handleUploadAndPredict = async () => {
    if (!file) return;

    setProcessingStage('uploading');
    setErrorDetails(null);

    try {
      // Step simulation for visual feedback
      setProcessingStage('validating');
      await new Promise(r => setTimeout(r, 400));

      setProcessingStage('predicting');
      const response = await api.uploadCsv(file);

      setProcessingStage('complete');
      setBulkResult(response);
      showNotification('success', `Successfully processed ${response.total_processed} students with machine learning!`);
    } catch (err) {
      setProcessingStage('idle');
      setErrorDetails(err.message);
      showNotification('error', `CSV Processing failed: ${err.message}`);
    }
  };

  const handleDownloadSample = () => {
    window.open(api.downloadSampleCsvUrl, '_blank');
  };

  const handleExportResultsCSV = () => {
    if (!bulkResult || !bulkResult.predictions) return;

    const headers = [
      'Student ID',
      'Student Name',
      'Attendance (%)',
      'Previous Marks',
      'Daily Study Hours',
      'Assignment Completion (%)',
      'Predicted Final Marks',
      'Performance Category',
      'At Risk'
    ];

    const rows = bulkResult.predictions.map(p => [
      p.student_id || '',
      `"${p.student_name || ''}"`,
      p.attendance,
      p.previous_marks,
      p.study_hours,
      p.assignment_completion,
      p.predicted_marks,
      p.performance_category,
      p.performance_category === 'At Risk' ? 'YES' : 'NO'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `predicted_batch_results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categoryColorMap = {
    Excellent: '#06b6d4',
    Good: '#3b82f6',
    Average: '#f59e0b',
    'At Risk': '#ef4444'
  };

  const chartData = bulkResult?.category_counts
    ? Object.entries(bulkResult.category_counts).map(([cat, count]) => ({
        category: cat,
        count,
        fill: categoryColorMap[cat] || '#06b6d4'
      }))
    : [];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
            <UploadCloud className="w-4 h-4" /> Bulk Machine Learning Module
          </span>
          <h2 className="text-xl font-bold text-navy-900 dark:text-white mt-1">
            CSV Upload & Batch Student Evaluation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Upload student records in CSV format. The system parses, validates numeric bounds, executes the ML model for all records, and produces interactive cohort distributions with CSV export.
          </p>
        </div>

        <button
          onClick={handleDownloadSample}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 text-xs font-bold hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-all flex-shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download Sample CSV Template</span>
        </button>
      </div>

      {/* Preprocessing Stage Indicator */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
          <div className={`flex items-center gap-1.5 ${file ? 'text-cyan-600 dark:text-cyan-400 font-bold' : ''}`}>
            <span className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center text-[11px]">1</span>
            <span>Select File</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-navy-700" />
          <div className={`flex items-center gap-1.5 ${processingStage === 'validating' || processingStage === 'predicting' || processingStage === 'complete' ? 'text-cyan-600 dark:text-cyan-400 font-bold' : ''}`}>
            <span className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center text-[11px]">2</span>
            <span>Schema Validation</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-navy-700" />
          <div className={`flex items-center gap-1.5 ${processingStage === 'predicting' || processingStage === 'complete' ? 'text-cyan-600 dark:text-cyan-400 font-bold' : ''}`}>
            <span className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center text-[11px]">3</span>
            <span>Batch ML Inference</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-navy-700" />
          <div className={`flex items-center gap-1.5 ${processingStage === 'complete' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}`}>
            <span className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-[11px]">4</span>
            <span>Results & Export</span>
          </div>
        </div>
      </div>

      {/* Drag-and-Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`p-10 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center ${
          dragActive
            ? 'border-cyan-500 bg-cyan-500/5'
            : 'border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4 shadow-sm">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-base font-bold text-navy-900 dark:text-white">
          {file ? file.name : 'Drag and drop your student CSV file here'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
          {file
            ? `File size: ${(file.size / 1024).toFixed(1)} KB. Ready for pipeline execution.`
            : 'Accepts standard UTF-8 CSV containing student_id, student_name, attendance, previous_marks, study_hours, assignment_completion'}
        </p>

        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
          >
            Browse Files
          </button>

          {file && (
            <button
              type="button"
              onClick={handleUploadAndPredict}
              disabled={processingStage !== 'idle' && processingStage !== 'complete'}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 hover:brightness-105 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {processingStage === 'validating'
                  ? 'Validating Columns...'
                  : processingStage === 'predicting'
                  ? 'Predicting...'
                  : 'Run Bulk Predictions'}
              </span>
            </button>
          )}

          {file && (
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setBulkResult(null);
                setErrorDetails(null);
                setProcessingStage('idle');
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Remove File"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error Details if any */}
      {errorDetails && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-rose-900 dark:text-rose-100">
              CSV Validation Error
            </h4>
            <p className="mt-1 leading-relaxed">{errorDetails}</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {bulkResult && (
        <div className="space-y-6 animate-slide-up">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Total Processed</span>
              <p className="text-2xl font-extrabold text-navy-900 dark:text-white">
                {bulkResult.total_processed}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Batch Average Score</span>
              <p className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400">
                {bulkResult.average_predicted_marks} / 100
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">At-Risk Count</span>
              <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                {bulkResult.at_risk_count}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Export Results</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Ready</span>
              </div>
              <button
                onClick={handleExportResultsCSV}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Batch Category Distribution Chart */}
          <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm">
            <h3 className="text-base font-bold text-navy-900 dark:text-white mb-1">
              Batch Performance Category Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Distribution of predicted outcomes across the uploaded student cohort
            </p>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table of Batch Prediction Results */}
          <div className="rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-navy-900 dark:text-white">
                  Prediction Results Roster ({bulkResult.predictions.length} Students)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Individual student score forecasts computed by the machine learning engine
                </p>
              </div>

              <button
                onClick={handleExportResultsCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-navy-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-800"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-50 dark:bg-navy-950 z-10">
                  <tr className="border-b border-slate-200 dark:border-navy-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Attendance</th>
                    <th className="py-3 px-4">Previous Marks</th>
                    <th className="py-3 px-4">Study Hours</th>
                    <th className="py-3 px-4">Assignment %</th>
                    <th className="py-3 px-4">Predicted Score</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Primary Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800/60">
                  {bulkResult.predictions.map((p, idx) => {
                    const topRec = p.recommendations && p.recommendations[0];
                    const catStyle = categoryColorMap[p.performance_category] || '#94a3b8';

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-navy-800/30">
                        <td className="py-2.5 px-4 font-bold text-navy-900 dark:text-white">
                          {p.student_name} <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400">({p.student_id})</span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">{p.attendance}%</td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">{p.previous_marks}</td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">{p.study_hours}h</td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">{p.assignment_completion}%</td>
                        <td className="py-2.5 px-4 font-bold text-cyan-600 dark:text-cyan-400">
                          {p.predicted_marks} / 100
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                            style={{
                              backgroundColor: `${catStyle}15`,
                              color: catStyle,
                              border: `1px solid ${catStyle}30`
                            }}
                          >
                            {p.performance_category}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                          {topRec ? `${topRec.title}: ${topRec.message}` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


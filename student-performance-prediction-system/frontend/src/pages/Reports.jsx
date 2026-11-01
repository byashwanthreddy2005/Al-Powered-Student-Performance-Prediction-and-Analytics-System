import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  AlertTriangle,
  Users,
  CheckCircle2,
  Calendar,
  FileText,
  Filter,
  Sparkles,
  Printer
} from 'lucide-react';
import { api } from '../services/api';

export default function Reports({ showNotification }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await api.getDashboardSummary();
        setSummary(data);
      } catch (err) {
        showNotification('error', `Failed to load report summary: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleExportAll = () => {
    window.open(api.exportReportUrl(false), '_blank');
    showNotification('success', 'Downloading full student performance report CSV.');
  };

  const handleExportAtRisk = () => {
    window.open(api.exportReportUrl(true), '_blank');
    showNotification('success', 'Downloading at-risk intervention roster CSV.');
  };

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4" /> Export & Compliance Center
          </span>
          <h2 className="text-xl font-bold text-navy-900 dark:text-white mt-1">
            Institutional Academic Performance Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Generate and export institutional academic audits, compliance documents, and targeted intervention rosters for students requiring academic counseling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 hover:brightness-105 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Full CSV</span>
          </button>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Comprehensive Cohort Audit */}
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-navy-900 dark:text-white">
              Complete Student Academic Audit Report
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Contains all registered student records, attendance percentages, previous examination scores, self-study hours, assignment completion rates, actual final marks, model predicted marks, performance category, and at-risk flags.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Total Student Records:</span>
                <strong className="text-navy-900 dark:text-white">{summary?.total_students || 0} Students</strong>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Average Attendance:</span>
                <strong className="text-navy-900 dark:text-white">{summary?.avg_attendance || 0}%</strong>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Forecasted Final Average:</span>
                <strong className="text-cyan-600 dark:text-cyan-400">{summary?.avg_predicted_marks || 0} / 100</strong>
              </div>
            </div>
          </div>

          <button
            onClick={handleExportAll}
            className="mt-6 w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Complete Audit CSV</span>
          </button>
        </div>

        {/* Card 2: At-Risk Intervention Roster */}
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-navy-900 dark:text-white">
              At-Risk Academic Intervention Roster
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Strictly filters and exports candidates flagged with predicted final scores below 50 marks. Designed for academic advisors, class teachers, and counseling departments to plan targeted remedial coaching.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-500/20 space-y-1 text-xs">
              <div className="flex justify-between text-rose-800 dark:text-rose-200">
                <span>Flagged At-Risk Students:</span>
                <strong className="text-rose-600 dark:text-rose-400">{summary?.at_risk_students_count || 0} Students</strong>
              </div>
              <div className="flex justify-between text-rose-800 dark:text-rose-200">
                <span>Vulnerability Threshold:</span>
                <strong>Final Score &lt; 50 Marks</strong>
              </div>
              <div className="flex justify-between text-rose-800 dark:text-rose-200">
                <span>Intervention Urgency:</span>
                <strong className="text-rose-600 dark:text-rose-400">Immediate Action</strong>
              </div>
            </div>
          </div>

          <button
            onClick={handleExportAtRisk}
            className="mt-6 w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export At-Risk Intervention Roster CSV</span>
          </button>
        </div>
      </div>

      {/* Printable Institutional Summary Sheet Preview */}
      <div className="p-8 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-lg">
        <div className="flex items-start justify-between pb-6 border-b border-slate-200 dark:border-navy-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Department of Artificial Intelligence & Data Science
            </div>
            <h3 className="text-2xl font-black text-navy-900 dark:text-white">
              Student Academic Performance Audit Sheet
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Generated: {currentDate} • Verified via Machine Learning Evaluation Engine
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
              Official Institutional Record
            </span>
          </div>
        </div>

        <div className="py-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
            <span className="text-slate-400 block mb-1">Total Enrolled Cohort</span>
            <p className="text-xl font-bold text-navy-900 dark:text-white">{summary?.total_students || 0}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
            <span className="text-slate-400 block mb-1">Attendance Benchmark</span>
            <p className="text-xl font-bold text-navy-900 dark:text-white">{summary?.avg_attendance || 0}%</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
            <span className="text-slate-400 block mb-1">Mean Exam Score</span>
            <p className="text-xl font-bold text-navy-900 dark:text-white">{summary?.avg_previous_marks || 0}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
            <span className="text-slate-400 block mb-1">Vulnerable Candidates</span>
            <p className="text-xl font-bold text-rose-600 dark:text-rose-400">{summary?.at_risk_students_count || 0}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-navy-800 text-[11px] text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row justify-between gap-2">
          <span>Prepared by: AI-Powered Student Analytics System</span>
          <span>Algorithms: Random Forest Regressor & Linear Regression (Joblib fitted pipeline)</span>
        </div>
      </div>
    </div>
  );
}


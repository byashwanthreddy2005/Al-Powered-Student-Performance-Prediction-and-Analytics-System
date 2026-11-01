import React, { useState, useEffect } from 'react';
import {
  LineChart as LineChartIcon,
  Users,
  AlertTriangle,
  Award,
  Filter,
  ArrowUpRight,
  TrendingUp,
  GraduationCap,
  Sparkles,
  Search
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../services/api';

export default function PerformanceAnalytics({ setActivePage, setPredictPrefill, showNotification }) {
  const [classAnalytics, setClassAnalytics] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchStudent, setSearchStudent] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [classRes, studRes] = await Promise.all([
        api.getClassAnalytics(),
        api.getStudents({ limit: 200 })
      ]);
      setClassAnalytics(classRes || []);
      setStudents(studRes.students || []);
    } catch (err) {
      showNotification('error', `Failed to load analytics: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered students for comparison & at-risk identification
  const filteredStudents = students.filter(s => {
    if (selectedClass !== 'All' && s.class_name !== selectedClass) return false;
    if (selectedSection !== 'All' && s.section !== selectedSection) return false;
    if (selectedCategory !== 'All' && s.performance_category !== selectedCategory) return false;
    if (searchStudent.trim()) {
      const term = searchStudent.toLowerCase();
      return s.name.toLowerCase().includes(term) || s.student_id.toLowerCase().includes(term);
    }
    return true;
  });

  const atRiskStudents = filteredStudents.filter(s => s.performance_category === 'At Risk');

  const categoryColorMap = {
    Excellent: '#06b6d4',
    Good: '#3b82f6',
    Average: '#f59e0b',
    'At Risk': '#ef4444'
  };

  // Group class data for comparison chart
  const classComparisonData = classAnalytics.map(c => ({
    name: c.group_label,
    'Avg Attendance': c.avg_attendance,
    'Avg Previous Marks': c.avg_previous_marks,
    'Avg Predicted Score': c.avg_predicted_marks,
    'At Risk Students': c.at_risk_count,
  }));

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
            <LineChartIcon className="w-4 h-4" /> Comprehensive Academic Analytics
          </span>
          <h2 className="text-xl font-bold text-navy-900 dark:text-white mt-1">
            Institutional Cohort Evaluation & Vulnerability Diagnostics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Multi-dimensional evaluation of student performance, class-wise distribution, study-hour elasticities, and identification of students requiring urgent remedial intervention.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>{atRiskStudents.length} Vulnerable Students</span>
          </span>
        </div>
      </div>

      {/* Global Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-2">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
        >
          <option value="All">All Classes</option>
          <option value="Grade 10">Grade 10</option>
          <option value="Grade 11">Grade 11</option>
          <option value="Grade 12">Grade 12</option>
          <option value="AI & DS - Sem 3">AI & DS - Sem 3</option>
          <option value="AI & DS - Sem 5">AI & DS - Sem 5</option>
        </select>

        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
        >
          <option value="All">All Sections</option>
          <option value="A">Section A</option>
          <option value="B">Section B</option>
          <option value="C">Section C</option>
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
        >
          <option value="All">All Categories</option>
          <option value="Excellent">Excellent (85–100)</option>
          <option value="Good">Good (70–84)</option>
          <option value="Average">Average (50–69)</option>
          <option value="At Risk">At Risk (&lt; 50)</option>
        </select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchStudent}
            onChange={(e) => setSearchStudent(e.target.value)}
            placeholder="Search cohort by student name or ID..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
          />
        </div>
      </div>

      {/* 1. Class-wise Performance Comparison Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-navy-900 dark:text-white">
              Class-wise Academic Comparison
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggregated attendance and examination indicators across classes and sections
            </p>
          </div>
          <span className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/20">
            Sectional Parity
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classComparisonData} margin={{ top: 10, right: 30, bottom: 25, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} interval={0} angle={-15} textAnchor="end" />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Avg Attendance" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Avg Previous Marks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Avg Predicted Score" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Urgent Intervention Roster (At-Risk Students Table) */}
      <div className="rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between bg-rose-50/40 dark:bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-900 dark:text-white">
                Academically At-Risk Student Identification
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Flagged with forecasted score &lt; 50 marks. Priority remediation recommended.
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            {atRiskStudents.length} Students Flagged
          </span>
        </div>

        <div className="overflow-x-auto max-h-[360px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-50 dark:bg-navy-950 z-10">
              <tr className="border-b border-slate-200 dark:border-navy-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Prev Marks</th>
                <th className="py-3 px-4">Study Time</th>
                <th className="py-3 px-4">Assignments</th>
                <th className="py-3 px-4">Predicted Score</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800/60">
              {atRiskStudents.length > 0 ? (
                atRiskStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-rose-50/30 dark:hover:bg-rose-950/10">
                    <td className="py-2.5 px-4 font-bold text-navy-900 dark:text-white">
                      {s.name} <span className="font-mono text-[10px] text-rose-600 dark:text-rose-400">({s.student_id})</span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                      {s.class_name} - {s.section}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-rose-600 dark:text-rose-400">
                      {s.attendance}%
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                      {s.previous_marks}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                      {s.study_hours} hrs/d
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                      {s.assignment_completion}%
                    </td>
                    <td className="py-2.5 px-4 font-black text-rose-600 dark:text-rose-400 text-sm">
                      {s.predicted_marks} / 100
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setPredictPrefill(s);
                          setActivePage('predict');
                        }}
                        className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold shadow-sm transition-all"
                      >
                        Action Plan &rarr;
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400 text-xs">
                    No students currently meet the at-risk criteria in this filtered view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Student-wise Performance Matrix Table */}
      <div className="rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between">
          <h4 className="text-sm font-bold text-navy-900 dark:text-white">
            Student-wise Performance Matrix ({filteredStudents.length} Students)
          </h4>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Interactive Cohort Ranking
          </span>
        </div>

        <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-50 dark:bg-navy-950 z-10">
              <tr className="border-b border-slate-200 dark:border-navy-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Daily Study</th>
                <th className="py-3 px-4">Prev Marks</th>
                <th className="py-3 px-4">Predicted Final Marks</th>
                <th className="py-3 px-4">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800/60">
              {filteredStudents.map((s) => {
                const catStyle = categoryColorMap[s.performance_category] || '#94a3b8';
                return (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-800/30">
                    <td className="py-2.5 px-4 font-semibold text-navy-900 dark:text-white">
                      {s.name} <span className="text-[10px] text-slate-400">({s.student_id})</span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                      {s.class_name} - {s.section}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                      {s.attendance}%
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                      {s.study_hours} hrs
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                      {s.previous_marks}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-cyan-600 dark:text-cyan-400">
                      {s.predicted_marks} / 100
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
                        {s.performance_category}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


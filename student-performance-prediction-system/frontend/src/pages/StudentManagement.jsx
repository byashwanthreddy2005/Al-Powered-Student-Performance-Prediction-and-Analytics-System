import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Brain,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';
import StudentModal from '../components/StudentModal';
import StudentDetailsModal from '../components/StudentDetailsModal';

export default function StudentManagement({ setActivePage, setPredictPrefill, showNotification }) {
  const [students, setStudents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [className, setClassName] = useState('All');
  const [section, setSection] = useState('All');
  const [category, setCategory] = useState('All');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [inspectingStudent, setInspectingStudent] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await api.getStudents({
        search,
        class_name: className,
        section,
        category,
        skip: 0,
        limit: 150,
      });
      setStudents(data.students || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      showNotification('error', `Failed to load students: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [className, section, category]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchStudents();
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  const handleSaveStudent = async (studentData, id = null) => {
    try {
      if (id) {
        await api.updateStudent(id, studentData);
        showNotification('success', `Student #${studentData.student_id} updated successfully.`);
      } else {
        await api.createStudent(studentData);
        showNotification('success', `Student #${studentData.student_id} added successfully.`);
      }
      fetchStudents();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteStudent = async (id, studentId) => {
    if (!window.confirm(`Are you sure you want to delete student ${studentId}? This action cannot be undone.`)) {
      return;
    }
    setDeletingId(id);
    try {
      await api.deleteStudent(id);
      showNotification('success', `Student ${studentId} removed from records.`);
      fetchStudents();
    } catch (err) {
      showNotification('error', `Failed to delete student: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleTriggerPredict = (student) => {
    setPredictPrefill({
      student_id: student.student_id,
      student_name: student.name,
      attendance: student.attendance,
      previous_marks: student.previous_marks,
      study_hours: student.study_hours,
      assignment_completion: student.assignment_completion,
    });
    setActivePage('predict');
  };

  const categoryColorMap = {
    Excellent: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-400/40',
    Good: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-400/40',
    Average: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-400/40',
    'At Risk': 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-400/40',
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900 dark:text-white">
            Student Academic Records
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Showing {students.length} of {totalCount} total students registered in database
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 hover:brightness-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
          <button
            onClick={fetchStudents}
            className="p-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors"
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student by name or ID (e.g. STU-1005)..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="All">All Classes</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12</option>
            <option value="AI & DS - Sem 3">AI & DS - Sem 3</option>
            <option value="AI & DS - Sem 5">AI & DS - Sem 5</option>
          </select>

          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="All">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="All">All Categories</option>
            <option value="Excellent">Excellent (85–100)</option>
            <option value="Good">Good (70–84)</option>
            <option value="Average">Average (50–69)</option>
            <option value="At Risk">At Risk (&lt; 50)</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-950/70 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Class & Sec</th>
                <th className="py-3.5 px-4">Attendance</th>
                <th className="py-3.5 px-4">Prev Marks</th>
                <th className="py-3.5 px-4">Daily Study</th>
                <th className="py-3.5 px-4">Assignments</th>
                <th className="py-3.5 px-4">Actual Final</th>
                <th className="py-3.5 px-4">Predicted Final</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800/60">
              {students.length > 0 ? (
                students.map((student) => {
                  const cat = student.performance_category || 'Pending';
                  const catClass = categoryColorMap[cat] || 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-navy-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-navy-900 dark:text-white">
                          {student.name}
                        </div>
                        <div className="font-mono text-[11px] text-cyan-600 dark:text-cyan-400">
                          {student.student_id}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {student.class_name} <span className="font-semibold text-slate-400">({student.section})</span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold ${
                            student.attendance >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {student.attendance}%
                        </span>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-200">
                        {student.previous_marks}
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {student.study_hours} hrs/d
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {student.assignment_completion}%
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-200">
                        {student.actual_final_marks !== null && student.actual_final_marks !== undefined ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{student.actual_final_marks}</span>
                        ) : (
                          <span className="text-slate-400 italic">Pending</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-bold text-cyan-600 dark:text-cyan-400">
                        {student.predicted_marks !== null && student.predicted_marks !== undefined ? (
                          `${student.predicted_marks} / 100`
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${catClass}`}>
                          {cat}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectingStudent(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 transition-colors"
                            title="Inspect Academic Profile & Predictions"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleTriggerPredict(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
                            title="Open Performance Predictor"
                          >
                            <Brain className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingStudent(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                            title="Edit Student Record"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id, student.student_id)}
                            disabled={deletingId === student.id}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors disabled:opacity-50"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400 text-xs">
                    {loading ? 'Filtering student records...' : 'No student records match the active criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <StudentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveStudent}
      />

      <StudentModal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        onSave={handleSaveStudent}
        student={editingStudent}
      />

      <StudentDetailsModal
        isOpen={!!inspectingStudent}
        onClose={() => setInspectingStudent(null)}
        student={inspectingStudent}
        onNavigatePredict={(stud) => {
          setPredictPrefill(stud);
          setActivePage('predict');
        }}
      />
    </div>
  );
}


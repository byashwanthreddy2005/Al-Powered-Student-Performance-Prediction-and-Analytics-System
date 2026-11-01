import React, { useState, useEffect } from 'react';
import { X, Save, UserPlus, AlertCircle } from 'lucide-react';

export default function StudentModal({ isOpen, onClose, onSave, student = null }) {
  const isEdit = !!student;

  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    class_name: 'Grade 10',
    section: 'A',
    attendance: 75.0,
    previous_marks: 70.0,
    study_hours: 3.5,
    assignment_completion: 75.0,
    actual_final_marks: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        student_id: student.student_id || '',
        name: student.name || '',
        class_name: student.class_name || 'Grade 10',
        section: student.section || 'A',
        attendance: student.attendance !== undefined ? student.attendance : 75.0,
        previous_marks: student.previous_marks !== undefined ? student.previous_marks : 70.0,
        study_hours: student.study_hours !== undefined ? student.study_hours : 3.5,
        assignment_completion: student.assignment_completion !== undefined ? student.assignment_completion : 75.0,
        actual_final_marks: student.actual_final_marks !== null && student.actual_final_marks !== undefined ? student.actual_final_marks : '',
      });
    } else {
      setFormData({
        student_id: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
        name: '',
        class_name: 'Grade 10',
        section: 'A',
        attendance: 75.0,
        previous_marks: 70.0,
        study_hours: 3.5,
        assignment_completion: 75.0,
        actual_final_marks: '',
      });
    }
    setErrors({});
  }, [student, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.student_id.trim()) errs.student_id = 'Student ID is required.';
    if (!formData.name.trim()) errs.name = 'Full name is required.';
    if (!formData.class_name.trim()) errs.class_name = 'Class name is required.';
    if (!formData.section.trim()) errs.section = 'Section is required.';

    const att = Number(formData.attendance);
    if (isNaN(att) || att < 0 || att > 100) errs.attendance = 'Attendance must be between 0 and 100.';

    const prev = Number(formData.previous_marks);
    if (isNaN(prev) || prev < 0 || prev > 100) errs.previous_marks = 'Marks must be between 0 and 100.';

    const hrs = Number(formData.study_hours);
    if (isNaN(hrs) || hrs < 0 || hrs > 24) errs.study_hours = 'Study hours must be between 0 and 24.';

    const assign = Number(formData.assignment_completion);
    if (isNaN(assign) || assign < 0 || assign > 100) errs.assignment_completion = 'Assignment % must be between 0 and 100.';

    if (formData.actual_final_marks !== '') {
      const act = Number(formData.actual_final_marks);
      if (isNaN(act) || act < 0 || act > 100) errs.actual_final_marks = 'Actual marks must be between 0 and 100.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        student_id: formData.student_id.trim().toUpperCase(),
        name: formData.name.trim(),
        class_name: formData.class_name.trim(),
        section: formData.section.trim(),
        attendance: Number(formData.attendance),
        previous_marks: Number(formData.previous_marks),
        study_hours: Number(formData.study_hours),
        assignment_completion: Number(formData.assignment_completion),
        actual_final_marks: formData.actual_final_marks !== '' ? Number(formData.actual_final_marks) : null,
      };
      await onSave(payload, student?.id);
      onClose();
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy-900 dark:text-white">
                {isEdit ? 'Edit Student Academic Profile' : 'Add New Student Record'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEdit ? `Updating records for #${student.student_id}` : 'Enter student credentials and academic metrics'}
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errors.form && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Student ID *
              </label>
              <input
                type="text"
                disabled={isEdit}
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-60"
                placeholder="e.g. STU-1001"
              />
              {errors.student_id && <p className="text-rose-500 text-[11px] mt-1">{errors.student_id}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g. Aarav Sharma"
              />
              {errors.name && <p className="text-rose-500 text-[11px] mt-1">{errors.name}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Class / Grade *
              </label>
              <select
                value={formData.class_name}
                onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
                <option value="AI & DS - Sem 3">AI & DS - Sem 3</option>
                <option value="AI & DS - Sem 5">AI & DS - Sem 5</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Section *
              </label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-navy-800 pt-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-3">
              Academic Predictor Features
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Attendance (%) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.attendance}
                  onChange={(e) => setFormData({ ...formData, attendance: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                {errors.attendance && <p className="text-rose-500 text-[11px] mt-1">{errors.attendance}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Previous Marks (0–100) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.previous_marks}
                  onChange={(e) => setFormData({ ...formData, previous_marks: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                {errors.previous_marks && <p className="text-rose-500 text-[11px] mt-1">{errors.previous_marks}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Daily Study Hours (0–24) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="24"
                  value={formData.study_hours}
                  onChange={(e) => setFormData({ ...formData, study_hours: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                {errors.study_hours && <p className="text-rose-500 text-[11px] mt-1">{errors.study_hours}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Assignment Completion (%) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.assignment_completion}
                  onChange={(e) => setFormData({ ...formData, assignment_completion: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                {errors.assignment_completion && <p className="text-rose-500 text-[11px] mt-1">{errors.assignment_completion}</p>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Actual Final Examination Marks (Optional, for model evaluation)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.actual_final_marks}
              onChange={(e) => setFormData({ ...formData, actual_final_marks: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Leave empty if exam not yet conducted"
            />
            {errors.actual_final_marks && <p className="text-rose-500 text-[11px] mt-1">{errors.actual_final_marks}</p>}
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-navy-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-navy-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-white text-sm font-semibold shadow-md shadow-cyan-500/20 hover:brightness-105 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : isEdit ? 'Update Student' : 'Add Student'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


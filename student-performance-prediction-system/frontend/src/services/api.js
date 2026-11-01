const API_BASE = '/api';

async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (typeof errorJson.detail === 'string') {
        errorDetail = errorJson.detail;
      } else if (Array.isArray(errorJson.detail)) {
        errorDetail = errorJson.detail.map(e => e.msg || e.message || JSON.stringify(e)).join(', ');
      } else if (errorJson.detail?.message) {
        errorDetail = `${errorJson.detail.message}: ${errorJson.detail.errors?.join('; ') || ''}`;
      }
    } catch {
      // response wasn't json
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

export const api = {
  // System Health
  getHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  // Dashboard
  getDashboardSummary: async () => {
    const res = await fetch(`${API_BASE}/dashboard/summary`);
    return handleResponse(res);
  },

  // Class Analytics
  getClassAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics/classes`);
    return handleResponse(res);
  },

  // Students CRUD
  getStudents: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.class_name && params.class_name !== 'All') query.set('class_name', params.class_name);
    if (params.section && params.section !== 'All') query.set('section', params.section);
    if (params.category && params.category !== 'All') query.set('category', params.category);
    if (params.skip !== undefined) query.set('skip', params.skip);
    if (params.limit !== undefined) query.set('limit', params.limit);

    const res = await fetch(`${API_BASE}/students?${query.toString()}`);
    return handleResponse(res);
  },

  getStudentById: async (id) => {
    const res = await fetch(`${API_BASE}/students/${id}`);
    return handleResponse(res);
  },

  createStudent: async (studentData) => {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    return handleResponse(res);
  },

  updateStudent: async (id, updateData) => {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    return handleResponse(res);
  },

  deleteStudent: async (id) => {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Predictions
  predict: async (data) => {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  predictBulk: async (students) => {
    const res = await fetch(`${API_BASE}/predict/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students }),
    });
    return handleResponse(res);
  },

  uploadCsv: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/predict/upload-csv`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  // Model Metrics
  getModelMetrics: async () => {
    const res = await fetch(`${API_BASE}/model/metrics`);
    return handleResponse(res);
  },

  // Templates and Reports
  downloadSampleCsvUrl: `${API_BASE}/template/sample-csv`,
  exportReportUrl: (atRiskOnly = false) => `${API_BASE}/reports/export?filter_at_risk_only=${atRiskOnly}`,
};


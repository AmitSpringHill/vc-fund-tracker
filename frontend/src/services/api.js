import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fundAPI = {
  getAll: () => api.get('/funds'),
  getById: (id) => api.get(`/funds/${id}`),
  create: (data) => api.post('/funds', data),
  update: (id, data) => api.put(`/funds/${id}`, data),
  delete: (id) => api.delete(`/funds/${id}`),
  getWithQuarters: (id) => api.get(`/funds/${id}/quarters`),
};

export const quarterAPI = {
  getAll: (params) => api.get('/quarters', { params }),
  getById: (id) => api.get(`/quarters/${id}`),
  create: (data) => api.post('/quarters', data),
  update: (id, data) => api.put(`/quarters/${id}`, data),
  delete: (id) => api.delete(`/quarters/${id}`),
  getWithInvestments: (id) => api.get(`/quarters/${id}/investments`),
};

export const investmentAPI = {
  getAll: (params) => api.get('/investments', { params }),
  getById: (id) => api.get(`/investments/${id}`),
  create: (data) => api.post('/investments', data),
  createBulk: (data) => api.post('/investments/bulk', data),
  update: (id, data) => api.put(`/investments/${id}`, data),
  delete: (id) => api.delete(`/investments/${id}`),
  getCompanyHistory: (companyName, fundId) =>
    api.get(`/investments/company/${encodeURIComponent(companyName)}/history`, {
      params: { fund_id: fundId },
    }),
};

export const analyticsAPI = {
  getFundTimeline: (fundId) => api.get(`/analytics/fund-timeline/${fundId}`),
  getPortfolioComposition: (quarterId) => api.get(`/analytics/portfolio-composition/${quarterId}`),
  getInvestmentComparison: (quarterId) => api.get(`/analytics/investment-comparison/${quarterId}`),
};

export const uploadAPI = {
  analyzePDF: (formData) =>
    api.post('/upload/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  confirmUpload: (data) => api.post('/upload/confirm', data),
};

export default api;

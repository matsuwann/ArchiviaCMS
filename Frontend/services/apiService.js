import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const adminReactivateUser = (id) => api.put(`/admin/users/${id}/reactivate`);

export const login = (email, password) => {
  return api.post('/auth/login', { email, password });
};

export const register = (firstName, lastName, email, password) => {
  return api.post('/auth/register', { firstName, lastName, email, password });
};

export const verifyEmail = (email, otp) => {
  return api.post('/auth/verify', { email, otp });
};

export const searchDocuments = (term) => {
  if (!term) {
    return api.get('/documents');
  }
  return api.get(`/documents/search?term=${term}`);
};

export const getPopularSearches = () => {
  return api.get('/documents/popular');
};

export const getFilters = () => {
  return api.get('/documents/filters');
};

export const filterDocuments = (filters) => {
  return api.post('/documents/filter', filters);
};

export const uploadDocument = (formData) => {
  return api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getMyUploads = () => {
  return api.get('/documents/my-uploads');
};

export const updateDocument = (id, data) => {
  return api.put(`/documents/${id}`, data);
};

export const deleteDocument = (id) => {
  return api.delete(`/documents/${id}`);
};

export const getAllUsers = () => {
  return api.get('/admin/users');
};

export const adminUpdateUser = (id, userData) => {
  return api.put(`/admin/users/${id}`, userData);
};

export const adminDeleteUser = (id) => {
  return api.delete(`/admin/users/${id}`);
};

export const adminUpdateDocument = (id, data) => {
  return api.put(`/admin/documents/${id}`, data);
};

export const adminDeleteDocument = (id) => {
  return api.delete(`/admin/documents/${id}`);
};

export const getSettings = () => {
  return api.get('/settings');
};

export const adminUpdateSettings = (settingsData) => {
  return api.put('/admin/settings', settingsData);
};

export const adminUploadIcon = (formData) => {
  return api.post('/admin/icon-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const adminUploadBgImage = (formData) => {
  return api.post('/admin/upload-bg-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const adminRemoveBgImage = () => {
  return api.post('/admin/remove-bg-image');
};

export const adminUploadBrandIcon = (formData) => {
  return api.post('/admin/upload-brand-icon', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const adminRemoveBrandIcon = () => {
  return api.post('/admin/remove-brand-icon');
};

export const adminResetSettings = () => {
  return api.post('/admin/settings/reset');
};

export const forgotPassword = (email) => {
  return api.post('/auth/forgot-password', { email });
};

export const resetPassword = (token, password) => {
  return api.post('/auth/reset-password', { token, password });
};

// User Side
export const requestDeletion = (id, reason) => {
  return api.post(`/documents/${id}/request-delete`, { reason });
};

// Admin Side
export const getDeletionRequests = () => {
  return api.get('/admin/requests');
};

export const adminApproveDeletion = (id) => {
  return api.delete(`/admin/requests/${id}/approve`);
};

export const adminRejectDeletion = (id) => {
  return api.put(`/admin/requests/${id}/reject`);
};
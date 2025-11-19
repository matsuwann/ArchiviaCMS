import axios from 'axios';

// Use Environment variable for Render, fallback to localhost
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

export const login = (email, password) => {
  return api.post('/auth/login', { email, password });
};

export const register = (firstName, lastName, email, password) => {
  return api.post('/auth/register', { firstName, lastName, email, password });
};

// New Verification Function
export const verifyEmail = (email, otp) => {
  return api.post('/auth/verify', { email, otp });
};

export const searchDocuments = (term) => {
  if (!term) {
    return api.get('/documents');
  }
  return api.get(`/documents/search?term=${term}`);
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
    headers: {
      'Content-Type': 'multipart/form-data',
    },
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
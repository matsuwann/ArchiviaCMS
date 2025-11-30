import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true 
});

export const searchDocuments = (term) => api.get(`/documents/search?term=${term}`);
export const getFilters = () => api.get('/documents/filters');
export const filterDocuments = (filters) => api.post('/documents/filter', filters);
export const getPopularSearches = () => api.get('/documents/popular');
export const uploadDocument = (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const getMyUploads = () => api.get('/documents/my-uploads');
export const updateDocument = (id, data) => api.put(`/documents/${id}`, data);
export const deleteDocument = (id) => api.delete(`/documents/${id}`);
export const requestDelete = (id, reason) => api.post(`/documents/${id}/request-delete`, { reason });

// === NEW: CITATION API ===
export const getCitation = (document, style) => api.post('/documents/citation', { document, style });

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const logout = () => Promise.resolve();
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (data) => api.put('/auth/profile', data);
export const verifyEmail = (email, otp) => api.post('/auth/verify', { email, otp });
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, newPassword) => api.post('/auth/reset-password', { 
    token, 
    password: newPassword // Rename to match backend expectation
});

export default api;a
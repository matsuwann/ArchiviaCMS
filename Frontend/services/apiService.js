import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

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

// --- NEW ADMIN FUNCTIONS ---

// --- Admin User Functions ---
export const getAllUsers = () => {
  return api.get('/admin/users');
};

export const adminUpdateUserRole = (id, isAdmin) => {
  return api.put(`/admin/users/${id}`, { is_admin: isAdmin });
};

export const adminDeleteUser = (id) => {
  return api.delete(`/admin/users/${id}`);
};

// --- Admin Document Functions ---
export const adminUpdateDocument = (id, data) => {
  return api.put(`/admin/documents/${id}`, data);
};

export const adminDeleteDocument = (id) => {
  return api.delete(`/admin/documents/${id}`);
};

// --- Admin Theme & Settings Functions ---

/**
 * (PUBLIC) Gets the current system settings (colors, etc.)
 */
export const getSettings = () => {
  return api.get('/settings');
};

/**
 * (ADMIN) Updates the system settings.
 * @param {object} settingsData - e.g., { backgroundColor: '#ffffff', foregroundColor: '#111111' }
 */
export const adminUpdateSettings = (settingsData) => {
  return api.put('/admin/settings', settingsData);
};

/**
 * (ADMIN) Uploads a new icon.
 * @param {FormData} formData - FormData object containing the 'icon' file
 */
export const adminUploadIcon = (formData) => {
  return api.post('/admin/icon-upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// --- Admin Theme Image Functions ---
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
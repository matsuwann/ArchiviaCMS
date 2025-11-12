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
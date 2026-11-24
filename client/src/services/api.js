import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medfinder_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or unauthorized, clean local storage
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if it was an attempt to /me
      if (!error.config.url.includes('/auth/me')) {
        localStorage.removeItem('medfinder_token');
        localStorage.removeItem('medfinder_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const medicineAPI = {
  getAll: (params) => api.get('/medicines', { params }),
  getById: (id) => api.get(`/medicines/${id}`),
  getCategories: () => api.get('/medicines/categories'),
  create: (data) => api.post('/medicines', data),
};

export const pharmacyAPI = {
  getAll: (params) => api.get('/pharmacies', { params }),
  getById: (id) => api.get(`/pharmacies/${id}`),
  update: (id, data) => api.put(`/pharmacies/${id}`, data),
};

export const inventoryAPI = {
  getMy: () => api.get('/inventory/my'),
  upsert: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
};

export const reservationAPI = {
  create: (data) => api.post('/reservations', data),
  getUserReservations: () => api.get('/reservations/user'),
  getPharmacyReservations: () => api.get('/reservations/pharmacy'),
  updateStatus: (id, data) => api.put(`/reservations/${id}/status`, data),
  getStats: () => api.get('/reservations/stats'),
};

export default api;

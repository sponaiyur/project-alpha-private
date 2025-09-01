// src/utils/api.js
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (only on client side)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      
      const status = error.response.status;
      const message = error.response.data?.detail || error.response.data?.message || 'An error occurred';
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/';
          }
          break;
        case 403:
          console.error('Access forbidden');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error(`Error ${status}: ${message}`);
      }
      
      // Fallback-1: Custom Error object
      const customError = new Error(message);
      customError.status = status;
      customError.response = error.response;
      return Promise.reject(customError);
      
    } else if (error.request) {
      const networkError = new Error('Network error. Please check your connection.');
      networkError.status = 0;
      return Promise.reject(networkError);
      
    } else {
      // Fallback-2: Something else happened
      return Promise.reject(error);
    }
  }
);

// Auth API methods
export const auth = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
  
  register: async (name, email, password) => {
    const response = await api.post('/api/auth/register', { name, email, password });
    return response.data;
  },
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },
  
  verifyToken: async () => {
    const response = await api.get('/api/auth/verify');
    return response.data;
  },
  
  isAuthenticated: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      return !!token; //converts any value to it's boolean equivalent, useful for null/undefined cases
    }
    return false;
  }
};

// Dashboard API methods
export const dashboard = {
  getData: async () => {
    const response = await api.get('/api/dashboard');
    return response.data;
  }
};

// Generic API methods
export const apiMethods = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
};

export default api;
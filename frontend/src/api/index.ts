import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401s globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (
        error.response.status === 401 || 
        error.response.status === 403 ||
        (error.response.status === 404 && (error.config.url === '/profile' || error.config.url === '/auth/me'))
      ) {
        // Clear token and redirect to login if unauthorized or user not found
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage'); // clear zustand persist if needed
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

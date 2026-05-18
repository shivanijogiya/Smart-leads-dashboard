import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

const baseURL =
  import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

export const api: AxiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!['/login', '/register'].includes(window.location.pathname)) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  verifyOtp: (data: any) => api.post('/auth/verify-otp', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
};

// Wallet
export const walletApi = {
  balance: () => api.get('/wallet/balance'),
  history: () => api.get('/wallet/history'),
  requestRecharge: (data: any) => api.post('/wallet/recharge', data),
  adminList: () => api.get('/admin/wallets'),
  adminPending: () => api.get('/admin/wallets/pending'),
  adminAddFunds: (userId: number, montant: number) => api.post(`/admin/wallets/${userId}/add-funds`, { montant }),
  adminUserWallet: (userId: number) => api.get(`/admin/wallets/user/${userId}`),
  adminValidateRecharge: (id: number, action: string) => api.post(`/admin/wallets/recharge/${id}/validate`, { action }),
};

// Products
export const productApi = {
  list: (params?: any) => api.get('/products', { params }),
  show: (id: number) => api.get(`/products/${id}`),
  categories: () => api.get('/categories'),
  adminList: (params?: any) => api.get('/admin/products', { params }),
  create: (data: any) => api.post('/admin/products', data),
  update: (id: number, data: any) => api.put(`/admin/products/${id}`, data),
  delete: (id: number) => api.delete(`/admin/products/${id}`),
  createCategory: (data: any) => api.post('/admin/categories', data),
  updateCategory: (id: number, data: any) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: number) => api.delete(`/admin/categories/${id}`),
};

// Leads
export const leadApi = {
  list: (params?: any) => api.get('/leads', { params }),
  show: (id: number) => api.get(`/leads/${id}`),
  create: (data: any) => api.post('/leads', data),
  dashboard: () => api.get('/leads/dashboard'),
  adminList: (params?: any) => api.get('/admin/leads', { params }),
  adminShow: (id: number) => api.get(`/admin/leads/${id}`),
  adminDashboard: () => api.get('/admin/dashboard'),
  updateStatus: (id: number, data: any) => api.put(`/admin/leads/${id}/status`, data),
  updateProduction: (id: number, statut: string) => api.put(`/admin/leads/${id}/production`, { statut }),
  updatePrint: (id: number, statut: string) => api.put(`/admin/leads/${id}/print`, { statut }),
  updateShipping: (id: number, data: any) => api.put(`/admin/leads/${id}/shipping`, data),
  printerQueue: () => api.get('/printer/queue'),
  printerUpdatePrint: (id: number, statut: string) => api.put(`/printer/leads/${id}/print`, { statut }),
};

// Users
export const userApi = {
  profile: () => api.get('/user/profile'),
  updateProfile: (data: any) => api.put('/user/profile', data),
  adminList: (params?: any) => api.get('/admin/users', { params }),
  adminShow: (id: number) => api.get(`/admin/users/${id}`),
  adminCreate: (data: any) => api.post('/admin/users', data),
  adminUpdate: (id: number, data: any) => api.put(`/admin/users/${id}`, data),
  adminDelete: (id: number) => api.delete(`/admin/users/${id}`),
};

// Last Miles
export const lastMileApi = {
  list: () => api.get('/last-miles'),
  myIntegrations: () => api.get('/last-miles/my-integrations'),
  storeIntegration: (data: any) => api.post('/last-miles/integrations', data),
  adminList: () => api.get('/admin/last-miles'),
  adminCreate: (data: any) => api.post('/admin/last-miles', data),
  adminUpdate: (id: number, data: any) => api.put(`/admin/last-miles/${id}`, data),
  adminDelete: (id: number) => api.delete(`/admin/last-miles/${id}`),
};

// Requests (Labels)
export const requestApi = {
  list: () => api.get('/requests'),
  create: (data: any) => api.post('/requests', data),
  adminList: () => api.get('/admin/requests'),
  adminValidate: (id: number, data: any) => api.put(`/admin/requests/${id}/validate`, data),
};

export default api;

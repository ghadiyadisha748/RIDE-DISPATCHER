import api from './api';
export const authService = {
  register:       (data)  => api.post('/auth/register', data),
  login:          (data)  => api.post('/auth/login', data),
  logout:         ()      => api.post('/auth/logout'),
  refreshToken:   ()      => api.post('/auth/refresh-token'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword:  (data)  => api.post('/auth/reset-password', data),
  verifyEmail:    (token) => api.get(`/auth/verify-email/${token}`),
  getProfile:     ()      => api.get('/users/me'),
};

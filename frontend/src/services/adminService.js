import api from './api';
export const adminService = {
  getStats:           ()       => api.get('/admin/stats'),
  getUsers:           (params) => api.get('/admin/users', { params }),
  updateUserStatus:   (id, data)=> api.put(`/admin/users/${id}/status`, data),
  getDrivers:         (params) => api.get('/admin/drivers', { params }),
  verifyDriver:       (id, data)=> api.put(`/admin/drivers/${id}/verify`, data),
  getRides:           (params) => api.get('/admin/rides', { params }),
  getComplaints:      (params) => api.get('/admin/complaints', { params }),
  updateComplaint:    (id, data)=> api.put(`/admin/complaints/${id}`, data),
  getRevenue:         (params) => api.get('/admin/revenue', { params }),
  getDemandAnalytics: (params) => api.get('/admin/demand', { params }),
};

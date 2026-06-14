import api from './api';
export const userService = {
  getProfile:          ()      => api.get('/users/me'),
  updateProfile:       (data)  => api.put('/users/me', data),
  changePassword:      (data)  => api.put('/users/me/password', data),
  getRideHistory:      (params)=> api.get('/users/me/rides', { params }),
  getFavorites:        ()      => api.get('/users/me/favorites'),
  addFavorite:         (data)  => api.post('/users/me/favorites', data),
  deleteFavorite:      (id)    => api.delete(`/users/me/favorites/${id}`),
  getNotifications:    ()      => api.get('/users/me/notifications'),
  markNotifRead:       (id)    => api.put(`/users/me/notifications/${id}/read`),
};

import api from './api';
export const rideService = {
  estimateFare:  (data)  => api.post('/rides/estimate', data),
  bookRide:      (data)  => api.post('/rides/book', data),
  getRide:       (id)    => api.get(`/rides/${id}`),
  cancelRide:    (id, reason) => api.put(`/rides/${id}/cancel`, { reason }),
  getStatus:     (id)    => api.get(`/rides/${id}/status`),
  submitReview:  (id, data) => api.post(`/rides/${id}/review`, data),
  getReceipt:    (id)    => api.get(`/rides/${id}/receipt`),
};

import api from './api';
export const driverService = {
  getProfile:        ()          => api.get('/drivers/me'),
  updateProfile:     (data)      => api.put('/drivers/me', data),
  updateStatus:      (status)    => api.put('/drivers/me/status', { status }),
  updateLocation:    (lat, lng)  => api.put('/drivers/me/location', { lat, lng }),
  getRides:          (params)    => api.get('/drivers/me/rides', { params }),
  getEarnings:       (params)    => api.get('/drivers/me/earnings', { params }),
  getRatings:        ()          => api.get('/drivers/me/ratings'),
  acceptRide:        (id)        => api.post(`/drivers/rides/${id}/accept`),
  rejectRide:        (id)        => api.post(`/drivers/rides/${id}/reject`),
  updateRideStatus:  (id, status)=> api.put(`/drivers/rides/${id}/status`, { status }),
};

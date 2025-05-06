import api from './axiosConfig';

export const login = async (email, password) => {
  const response = await api.post('/auth/signin', { email, password });
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/signup', userData);
  return response.data;
};

export const checkEmailExists = async (email) => {
  const response = await api.get(`/auth/check-email?email=${email}`);
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await api.get(`/auth/verify?token=${token}`);
  return response.data;
};
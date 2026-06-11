import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'https://chat-backend-uv9f.onrender.com/api',
  withCredentials: true,
});

import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'https://your-app-name.onrender.com/api',
  withCredentials: true,
});

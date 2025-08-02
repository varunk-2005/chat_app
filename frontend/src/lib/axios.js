import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
export const axiosInstance = axios.create({
    baseURL:'http://localhost:5001/api',
    isSigningUP: false,
    isloggingIn: false,
    isUpdatingProfile: false,
    withCredentials: true,
    checkAuh: async () => {
        try {
            const response = await axiosInstance.get('/auth/check');
            return response.data;
        } catch (error) {
            console.error('Error checking authentication:', error);
            throw error;
        }
    }
});
import { create } from 'zustand';
import axiosInstance from '../lib/axiosInstance';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const BaseURL = 'http://localhost:5001';

const normalizeUser = (user) => ({
  ...user,
  profilePic: user.profilePic || '/avatar.png',
  fullName: user.fullname || '',
});

export const useAuthStore = create((set, get) => ({
  authUser: null,
  onlineUsers: [],
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  socket: null,

  signup: async (formData) => {
    set({ isSigningUp: true });
    try {
      console.log('📝 Attempting signup...', axiosInstance.defaults.baseURL);
      const res = await axiosInstance.post('/auth/signup', formData);
      console.log('✅ Signup successful:', res.data);
      set({ authUser: normalizeUser(res.data.user) });
      toast.success('Account created successfully!');
      get().connectSocket();
    } catch (error) {
      console.error('❌ Signup failed:', error.response?.data || error.message);
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        toast.error('Cannot connect to server. Please check if backend is running.');
      } else {
        toast.error(error.response?.data?.message || 'Signup failed');
      }
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (formData) => {
    set({ isLoggingIn: true });
    try {
      console.log('🔐 Attempting login...', axiosInstance.defaults.baseURL);
      const res = await axiosInstance.post('/auth/login', formData);
      console.log('✅ Login successful:', res.data);
      set({ authUser: normalizeUser(res.data.user) });
      toast.success('Logged in successfully!');
      get().connectSocket();
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        toast.error('Cannot connect to server. Please check if backend is running.');
      } else {
        toast.error(error.response?.data?.message || 'Login failed');
      }
    } finally {
      set({ isLoggingIn: false });
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      console.log('🔍 Checking auth...', axiosInstance.defaults.baseURL);
      const res = await axiosInstance.get('/auth/check');
      console.log('✅ Auth check successful:', res.data);
      set({ authUser: normalizeUser(res.data.user) });
      get().connectSocket();
    } catch (error) {
      console.log('❌ Auth check failed:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        console.log('🔓 User not authenticated');
        set({ authUser: null });
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        console.error('🌐 Network error - backend might not be running');
        toast.error('Cannot connect to server. Please check if backend is running.');
      } else {
        console.error('🚨 Other error:', error);
        toast.error(error.response?.data?.message || 'Auth check failed');
      }
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
      set({ authUser: null, onlineUsers: [] });
      toast.success('Logged out successfully!');
      get().disconnectSocket();
    } catch (error) {
      toast.error('Logout failed');
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      console.log('🔄 Updating profile...', axiosInstance.defaults.baseURL);
      const res = await axiosInstance.put('/auth/update-profile', data);
      console.log('✅ Profile update successful:', res.data);
      
      // Update the auth user with the response data from backend
      if (res.data.user) {
        set({ authUser: normalizeUser(res.data.user) });
      } else {
        // Fallback to updating with the sent data
        const currentUser = get().authUser;
        set({ 
          authUser: {
            ...currentUser,
            ...data,
            profilePic: data.profilePic || currentUser.profilePic
          }
        });
      }
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('❌ Profile update failed:', error.response?.data || error.message);
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        toast.error('Cannot connect to server. Please check if backend is running.');
      } else {
        toast.error(error.response?.data?.message || 'Profile update failed');
      }
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const socketv = io(BaseURL, {
      query: { userId: authUser._id },
    });

    socketv.on('connect', () => {
      console.log('Socket connected:', socketv.id);
    });

    socketv.on('getOnlineUsers', (usersIds) => {
      set({ onlineUsers: usersIds });
    });

    set({ socket: socketv });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
  },
}));

// Automatically check auth once on app load
useAuthStore.getState().checkAuth();

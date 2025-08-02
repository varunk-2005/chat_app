import { create } from 'zustand';
import axiosInstance from '../lib/axiosInstance';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const BaseURL = 'http://localhost:5001'; // Update if needed

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
      const res = await axiosInstance.post('/auth/signup', formData);
      set({ authUser: normalizeUser(res.data.user) });
      toast.success('Account created successfully!');
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (formData) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post('/auth/login', formData);
      set({ authUser: normalizeUser(res.data.user) });
      toast.success('Logged in successfully!');
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      set({ isLoggingIn: false });
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get('/auth/check');
      set({ authUser: normalizeUser(res.data.user) });
      get().connectSocket();
    } catch (error) {
      if (error.response?.status === 401) {
        set({ authUser: null });
      } else {
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
    } catch {
      toast.error('Logout failed');
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put('/auth/update-profile', data);

      if (res.data.user) {
        set({ authUser: normalizeUser(res.data.user) });
      } else {
        const currentUser = get().authUser;
        set({
          authUser: {
            ...currentUser,
            ...data,
            profilePic: data.profilePic || currentUser.profilePic,
          },
        });
      }

      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Profile update failed');
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
      console.log('✅ Socket connected:', socketv.id);
    });

    // Receive full online users list
    socketv.on('getOnlineUsers', (userIds) => {
      set({ onlineUsers: userIds });
    });

    // User came online
    socketv.on('user-online', (userId) => {
      set((state) => ({
        onlineUsers: [...new Set([...state.onlineUsers, userId])],
      }));
    });

    // User went offline
    socketv.on('user-offline', (userId) => {
      set((state) => ({
        onlineUsers: state.onlineUsers.filter((id) => id !== userId),
      }));
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

// ✅ Auto-check auth once on app load
useAuthStore.getState().checkAuth();

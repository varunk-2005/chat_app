login: async (formData) => {
  set({ isLoggingIn: true });
  try {
    const res = await axiosInstance.post('/auth/login', formData);
    localStorage.setItem('token', res.data.token);
    set({ authUser: normalizeUser(res.data.user) });
    toast.success('Logged in successfully!');
    get().connectSocket();
  } catch (error) {
    toast.error(error.response?.data?.message || 'Login failed');
  } finally {
    set({ isLoggingIn: false });
  }
},

signup: async (formData) => {
  set({ isSigningUp: true });
  try {
    const res = await axiosInstance.post('/auth/signup', formData);
    localStorage.setItem('token', res.data.token);
    set({ authUser: normalizeUser(res.data.user) });
    toast.success('Account created successfully!');
    get().connectSocket();
  } catch (error) {
    toast.error(error.response?.data?.message || 'Signup failed');
  } finally {
    set({ isSigningUp: false });
  }
},

logout: async () => {
  try {
    await axiosInstance.post('/auth/logout');
    localStorage.removeItem('token');
    set({ authUser: null, onlineUsers: [] });
    toast.success('Logged out successfully!');
    get().disconnectSocket();
  } catch {
    toast.error('Logout failed');
  }
},

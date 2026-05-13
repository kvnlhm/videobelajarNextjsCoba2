import api from './api/api';

const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      if (response.data.token && response.data.user) {
        return {
          success: true,
          token: response.data.token,
          user: response.data.user
        };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      // Don't log to console for 401 errors to prevent runtime errors in UI
      if (error?.response?.status !== 401) {
        console.error('Login error:', error);
      }
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed. Please try again.'
      };
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      return {
        success: true,
        message: response.data.message,
        user: response.data.user
      };
    } catch (error) {
      // Don't log to console for 401 errors to prevent runtime errors in UI
      if (error?.response?.status !== 401) {
        console.error('Registration error:', error);
      }
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        return {
          token,
          user: JSON.parse(user)
        };
      } catch (error) {
        console.error('Error parsing user data:', error);
        authService.logout();
        return null;
      }
    }
    
    return null;
  }
};

export default authService;

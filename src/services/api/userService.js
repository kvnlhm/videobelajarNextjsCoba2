import api from './api';

const API_ENDPOINT = '/users-crud';

export const userService = {
  getAll: async () => {
    try {
      const response = await api.get(API_ENDPOINT);
      console.log('userService - raw response:', response);
      console.log('userService - response data:', response.data);
      return response.data;
    } catch (error) {
      // Log all errors for debugging
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`${API_ENDPOINT}?id=${id}`);
      return response.data;
    } catch (error) {
      // Log all errors for debugging
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  create: async (userData) => {
    try {
      const response = await api.post(API_ENDPOINT, userData);
      return response.data;
    } catch (error) {
      // Log all errors for debugging
      console.error('Error creating user:', error);
      throw error;
    }
  },

  update: async (id, userData) => {
    try {
      console.log('=== UPDATE REQUEST DEBUG ===');
      console.log('Updating user ID:', id);
      console.log('Update data:', userData);
      console.log('Request URL:', `${API_ENDPOINT}?id=${id}`);
      
      const response = await api.patch(`${API_ENDPOINT}?id=${id}`, userData);
      console.log('Update response:', response);
      return response.data;
    } catch (error) {
      // Log all errors for debugging
      console.error('=== UPDATE ERROR DEBUG ===');
      console.error('Error updating user:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Error message:', error.message);
      
      // Provide more specific error messages
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData?.error) {
          throw new Error(`Validation error: ${errorData.error}`);
        } else if (errorData?.message) {
          throw new Error(`Bad request: ${errorData.message}`);
        }
      }
      
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`${API_ENDPOINT}?id=${id}`);
      return response.data;
    } catch (error) {
      // Log all errors for debugging
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

export default userService;

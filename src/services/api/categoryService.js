import api from './api';

const API_ENDPOINT = '/categories-crud';

export const categoryService = {
  getAll: async () => {
    try {
      const response = await api.get(API_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`${API_ENDPOINT}?id=${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  create: async (categoryData) => {
    try {
      const response = await api.post(API_ENDPOINT, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  update: async (id, categoryData) => {
    try {
      const response = await api.put(`${API_ENDPOINT}?id=${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`${API_ENDPOINT}?id=${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
};

export default categoryService;

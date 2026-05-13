import api from './api';

const API_ENDPOINT = '/tutors-crud';

export const tutorService = {
  getAll: async () => {
    try {
      const response = await api.get(API_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Error fetching tutors:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`${API_ENDPOINT}?id=${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tutor:', error);
      throw error;
    }
  },

  create: async (tutorData) => {
    try {
      const response = await api.post(API_ENDPOINT, tutorData);
      return response.data;
    } catch (error) {
      console.error('Error creating tutor:', error);
      throw error;
    }
  },

  update: async (id, tutorData) => {
    try {
      const response = await api.put(`${API_ENDPOINT}?id=${id}`, tutorData);
      return response.data;
    } catch (error) {
      console.error('Error updating tutor:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`${API_ENDPOINT}?id=${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting tutor:', error);
      throw error;
    }
  }
};

export default tutorService;

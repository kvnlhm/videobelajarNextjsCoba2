import api from './api';

const courseService = {
  getAll: async () => {
    const response = await api.get('/course');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/course/${id}`);
    return response.data;
  },

  create: async (courseData) => {
    const response = await api.post('/course', courseData);
    return response.data;
  },

  update: async (id, courseData) => {
    const response = await api.patch(`/course/${id}`, courseData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/course/${id}`);
    return response.data;
  }
};

export default courseService;

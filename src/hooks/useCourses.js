import { useState, useEffect } from 'react';
import courseService from '../services/api/courseService';

export const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await courseService.getAll();
      setCourses(data);
    } catch (err) {
      if (err?.response?.status !== 401) {
        console.error('useCourses - API error:', err);
      }
      setError(err.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const addCourse = async (courseData) => {
    setLoading(true);
    setError(null);
    try {
      const newCourse = await courseService.create(courseData);
      setCourses(prev => [...prev, newCourse]);
      return newCourse;
    } catch (err) {
      if (err?.response?.status !== 401) {
        console.error('useCourses - add error:', err);
      }
      setError(err.message || 'Failed to add course');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCourse = async (id, courseData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedCourse = await courseService.update(id, courseData);
      setCourses(prev => prev.map(course => course.id === id ? updatedCourse : course));
      return updatedCourse;
    } catch (err) {
      if (err?.response?.status !== 401) {
        console.error('useCourses - update error:', err);
      }
      setError(err.message || 'Failed to update course');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await courseService.delete(id);
      setCourses(prev => prev.filter(course => course.id !== id));
      return true;
    } catch (err) {
      if (err?.response?.status !== 401) {
        console.error('useCourses - delete error:', err);
      }
      setError(err.message || 'Failed to delete course');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    fetchCourses,
    addCourse,
    updateCourse,
    deleteCourse
  };
};

import { useState, useEffect } from 'react';
import tutorService from '../services/api/tutorService';

export const useTutors = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTutors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tutorService.getAll();
      setTutors(data);
    } catch (err) {
      if (err?.response?.status !== 401) {
        console.error('useTutors - API error:', err);
      }
      setError(err.message || 'Failed to fetch tutors');
    } finally {
      setLoading(false);
    }
  };

  const addTutor = async (tutorData) => {
    setLoading(true);
    setError(null);
    try {
      const newTutor = await tutorService.create(tutorData);
      setTutors(prev => [...prev, newTutor]);
      return newTutor;
    } catch (err) {
      if (err?.response?.status !== 401) {
        console.error('useTutors - add error:', err);
      }
      setError(err.message || 'Failed to add tutor');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTutor = async (id, tutorData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTutor = await tutorService.update(id, tutorData);
      setTutors(prev => prev.map(tutor => tutor.tutor_id === id ? updatedTutor : tutor));
      return updatedTutor;
    } catch (err) {
      if (err?.response?.status !== 401) {
        console.error('useTutors - update error:', err);
      }
      setError(err.message || 'Failed to update tutor');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTutor = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await tutorService.delete(id);
      setTutors(prev => prev.filter(tutor => tutor.tutor_id !== id));
      return true;
    } catch (err) {
      if (err?.response?.status !== 401) {
        console.error('useTutors - delete error:', err);
      }
      setError(err.message || 'Failed to delete tutor');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  return {
    tutors,
    loading,
    error,
    fetchTutors,
    addTutor,
    updateTutor,
    deleteTutor
  };
};

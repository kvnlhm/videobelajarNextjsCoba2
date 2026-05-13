import { useState, useEffect } from 'react';
import userService from '../services/api/userService';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAll();
      console.log('useUsers - API response data:', data);
      setUsers(data);
    } catch (err) {
      if (err?.response?.status !== 401) {
        console.error('useUsers - API error:', err);
      }
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await userService.create(userData);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      if (err?.response?.status !== 401) {
        console.error('useUsers - add error:', err);
      }
      setError(err.message || 'Failed to add user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id, userData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await userService.update(id, userData);
      setUsers(prev => prev.map(user => user.user_id === id ? updatedUser : user));
      return updatedUser;
    } catch (err) {
      if (err?.response?.status !== 401) {
        console.error('useUsers - update error:', err);
      }
      setError(err.message || 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await userService.delete(id);
      setUsers(prev => prev.filter(user => user.user_id !== id));
      return true;
    } catch (err) {
      if (err?.response?.status !== 401) {
        console.error('useUsers - delete error:', err);
      }
      setError(err.message || 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser
  };
};

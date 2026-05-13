import { useState, useEffect } from 'react';
import categoryService from '../services/api/categoryService';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      if (err?.response?.status !== 401) {
        console.error('useCategories - API error:', err);
      }
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const newCategory = await categoryService.create(categoryData);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      if (err?.response?.status !== 401) {
        console.error('useCategories - add error:', err);
      }
      setError(err.message || 'Failed to add category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id, categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedCategory = await categoryService.update(id, categoryData);
      setCategories(prev => prev.map(category => category.category_id === id ? updatedCategory : category));
      return updatedCategory;
    } catch (err) {
      if (err?.response?.status !== 401) {
        console.error('useCategories - update error:', err);
      }
      setError(err.message || 'Failed to update category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await categoryService.delete(id);
      setCategories(prev => prev.filter(category => category.category_id !== id));
      return true;
    } catch (err) {
      if (err?.response?.status !== 401) {
        console.error('useCategories - delete error:', err);
      }
      setError(err.message || 'Failed to delete category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory
  };
};

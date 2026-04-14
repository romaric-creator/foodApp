import { useState, useCallback } from 'react';
import { fetchCategories, createCategory, deleteCategory } from '../services/categoryService';

export const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchCategories();
            setCategories(data);
            return data;
        } catch (err) {
            setError(err);
            console.error("Error loading categories:", err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Auto-load categories on mount could be an option, but let's keep it manual for flexibility or add a parameter
    // For now, we expose loadCategories so the component can decide when to call it.

    const addCategory = async (categoryData) => {
        setLoading(true);
        setError(null);
        try {
            const newCategory = await createCategory(categoryData);
            setCategories(prev => [...prev, newCategory]);
            return newCategory;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removeCategory = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await deleteCategory(id);
            setCategories(prev => prev.filter(c => c.idCat !== id && c.id !== id));
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        categories,
        loading,
        error,
        loadCategories,
        addCategory,
        removeCategory
    };
};

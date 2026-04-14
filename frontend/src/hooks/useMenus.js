import { useState, useCallback } from 'react';
import { fetchMenus, createMenu, updateMenu, deleteMenu } from '../services/menuService';
import { fetchMenusByCategory } from '../services/categoryService';

export const useMenus = () => {
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadMenus = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchMenus();
            setMenus(data);
        } catch (err) {
            setError(err);
            console.error("Error loading menus:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadMenusByCategory = useCallback(async (catId) => {
        if (!catId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await fetchMenusByCategory(catId);
            setMenus(data);
        } catch (err) {
            setError(err);
            console.error("Error loading menus by category:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const addMenu = async (menuData) => {
        setLoading(true);
        setError(null);
        try {
            const newMenu = await createMenu(menuData);
            setMenus(prev => [...prev, newMenu]);
            return newMenu;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const editMenu = async (id, menuData) => {
        setLoading(true);
        setError(null);
        try {
            const updatedMenu = await updateMenu(id, menuData);
            setMenus(prev => prev.map(m => m.idMenu === id || m.id === id ? { ...m, ...updatedMenu } : m));
            return updatedMenu;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removeMenu = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await deleteMenu(id);
            setMenus(prev => prev.filter(m => m.idMenu !== id && m.id !== id));
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        menus,
        loading,
        error,
        loadMenus,
        loadMenusByCategory,
        addMenu,
        editMenu,
        removeMenu
    };
};

import api from '../config/api';

/**
 * Service de données simplifié
 * Cache en mémoire pour menus, catégories, utilisateurs, tables
 */

const cache = {
  menus: null,
  categories: null,
  users: null,
  tables: null,
  timestamps: {}
};

// Durée de cache: 5 minutes pour menus/catégories, 1 minute pour users/tables
const CACHE_DURATION = { menus: 5 * 60 * 1000, categories: 5 * 60 * 1000, users: 60 * 1000, tables: 60 * 1000 };

const isCacheValid = (key) => {
  if (!cache[key] || !cache.timestamps[key]) return false;
  const elapsed = new Date().getTime() - cache.timestamps[key];
  return elapsed < (CACHE_DURATION[key] || 60 * 1000);
};

const setCacheItem = (key, data) => {
  cache[key] = data;
  cache.timestamps[key] = new Date().getTime();
};

// MENUS
export const getMenus = async () => {
  if (isCacheValid('menus')) return cache.menus;
  
  try {
    const response = await api.get('/menus');
    const menus = response.data.menus || response.data;
    setCacheItem('menus', menus);
    return menus;
  } catch (error) {
    console.error('Erreur getMenus:', error);
    return cache.menus || [];
  }
};

export const getMenuById = async (id) => {
  const menus = await getMenus();
  return menus.find(m => m.idMenu === id);
};

export const createMenu = async (data) => {
  try {
    const response = await api.post('/menus', data);
    // Invalide le cache
    cache.menus = null;
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur création menu');
  }
};

export const updateMenu = async (id, data) => {
  try {
    const response = await api.put(`/menus/${id}`, data);
    cache.menus = null;
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur mise à jour menu');
  }
};

export const deleteMenu = async (id) => {
  try {
    await api.delete(`/menus/${id}`);
    cache.menus = null;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur suppression menu');
  }
};

// CATÉGORIES
export const getCategories = async () => {
  if (isCacheValid('categories')) return cache.categories;
  
  try {
    const response = await api.get('/categories');
    const categories = response.data.categories || response.data;
    setCacheItem('categories', categories);
    return categories;
  } catch (error) {
    console.error('Erreur getCategories:', error);
    return cache.categories || [];
  }
};

export const createCategory = async (data) => {
  try {
    const response = await api.post('/categories', data);
    cache.categories = null;
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur création catégorie');
  }
};

// UTILISATEURS
export const getUsers = async () => {
  if (isCacheValid('users')) return cache.users;
  
  try {
    const response = await api.get('/users');
    const users = response.data.users || response.data;
    setCacheItem('users', users);
    return users;
  } catch (error) {
    console.error('Erreur getUsers:', error);
    return cache.users || [];
  }
};

export const updateUser = async (id, data) => {
  try {
    const response = await api.put(`/users/${id}`, data);
    cache.users = null;
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur mise à jour utilisateur');
  }
};

// TABLES
export const getTables = async () => {
  if (isCacheValid('tables')) return cache.tables;
  
  try {
    const response = await api.get('/tables');
    const tables = response.data.tables || response.data;
    setCacheItem('tables', tables);
    return tables;
  } catch (error) {
    console.error('Erreur getTables:', error);
    return cache.tables || [];
  }
};

export const createTable = async (data) => {
  try {
    const response = await api.post('/tables', data);
    cache.tables = null;
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur création table');
  }
};

// Invalidate all caches
export const invalidateCache = () => {
  cache.menus = null;
  cache.categories = null;
  cache.users = null;
  cache.tables = null;
  cache.timestamps = {};
};

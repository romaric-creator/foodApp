import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/auth';
import * as dataApi from '../api/data';
import * as ordersApi from '../api/orders';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // État utilisateur
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // État données
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);

  // État UI
  const [theme, setTheme] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('theme')) || { dark: false, color: 'primary' };
    } catch {
      return { dark: false, color: 'primary' };
    }
  });

  const [notification, setNotification] = useState(null);

  // ===== AUTHENTIFICATION =====
  const checkAuth = useCallback(async () => {
    // Si pas de 'user' dans localStorage, on peut supposer qu'on n'est pas connecté
    // (à moins que le cookie soit encore valide, mais dans 99% des cas ça évite le 401 inutile)
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setLoading(false);
      setUser(null);
      return;
    }

    setLoading(true);
    try {
      const verifiedUser = await authApi.verify();
      setUser(verifiedUser);
    } catch (err) {
      setUser(null);
      console.error('Auth check failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await authApi.login(email, password);
      setUser(userData);
      showNotification('Connexion réussie!', 'success');
      return userData;
    } catch (err) {
      const message = err.message || 'Erreur de connexion';
      setError(message);
      showNotification(message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authApi.logout();
      setUser(null);
      dataApi.invalidateCache();
      showNotification('Déconnecté', 'success');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await authApi.register(userData);
      setUser(newUser);
      showNotification('Inscription réussie!', 'success');
      return newUser;
    } catch (err) {
      const message = err.message || 'Erreur d\'inscription';
      setError(message);
      showNotification(message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== DONNÉES =====
  const loadMenus = useCallback(async () => {
    try {
      const data = await dataApi.getMenus();
      setMenus(data);
      return data;
    } catch (err) {
      showNotification('Erreur chargement menus', 'error');
      return [];
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const data = await dataApi.getCategories();
      setCategories(data);
      return data;
    } catch (err) {
      showNotification('Erreur chargement catégories', 'error');
      return [];
    }
  }, []);

  const loadTables = useCallback(async () => {
    try {
      const data = await dataApi.getTables();
      setTables(data);
      return data;
    } catch (err) {
      showNotification('Erreur chargement tables', 'error');
      return [];
    }
  }, []);

  const loadOrders = useCallback(async (filters = {}) => {
    try {
      const data = await ordersApi.getOrders(filters);
      setOrders(data);
      return data;
    } catch (err) {
      showNotification('Erreur chargement commandes', 'error');
      return [];
    }
  }, []);

  // ===== COMMANDES =====
  const createOrder = useCallback(async (orderData) => {
    try {
      const newOrder = await ordersApi.createOrder(orderData);
      setOrders(prev => [...prev, newOrder]);
      showNotification('Commande créée!', 'success');
      return newOrder;
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, []);

  const updateOrderStatus = useCallback(async (id, status) => {
    try {
      const updated = await ordersApi.updateOrder(id, { statut: status });
      setOrders(prev => prev.map(o => o.idOrder === id ? updated : o));
      showNotification('Commande mise à jour!', 'success');
      return updated;
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, []);

  // ===== CUISINE =====
  const markPreparing = useCallback(async (id) => {
    try {
      await ordersApi.markOrderPreparing(id);
      showNotification('En préparation', 'success');
      await loadOrders();
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, [loadOrders]);

  const markServed = useCallback(async (id) => {
    try {
      await ordersApi.markOrderServed(id);
      showNotification('Marqué comme servi!', 'success');
      await loadOrders();
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, [loadOrders]);

  const getKitchenOrders = useCallback(async () => {
    try {
      return await ordersApi.getKitchenOrders();
    } catch (err) {
      showNotification(err.message, 'error');
      return [];
    }
  }, []);

  // ===== THÈME =====
  const updateTheme = useCallback((newTheme) => {
    const merged = { ...theme, ...newTheme };
    setTheme(merged);
    localStorage.setItem('theme', JSON.stringify(merged));
  }, [theme]);

  // ===== NOTIFICATIONS =====
  const showNotification = useCallback((message, severity = 'info', duration = 3000) => {
    setNotification({ message, severity, id: Date.now() });
    setTimeout(() => setNotification(null), duration);
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // ===== HOOK DE DÉMARRAGE =====
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = {
    // Authentification
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',

    // Données
    menus,
    categories,
    orders,
    tables,
    loadMenus,
    loadCategories,
    loadTables,
    loadOrders,

    // Commandes
    createOrder,
    updateOrderStatus,

    // Cuisine
    markPreparing,
    markServed,
    getKitchenOrders,

    // Thème
    theme,
    updateTheme,

    // Notifications
    notification,
    showNotification,
    hideNotification,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * Hook personnalisé pour utiliser le contexte
 * Exemple: const { user, login, loadMenus } = useApp();
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

/**
 * Hooks spécialisés pour des parties spécifiques du contexte
 */
export const useAuth = () => {
  const { user, loading, login, logout, register, isAuthenticated, isAdmin } = useApp();
  return { user, loading, login, logout, register, isAuthenticated, isAdmin };
};

export const useData = () => {
  const { menus, categories, tables, loadMenus, loadCategories, loadTables } = useApp();
  return { menus, categories, tables, loadMenus, loadCategories, loadTables };
};

export const useOrders = () => {
  const { orders, loadOrders, createOrder, updateOrderStatus } = useApp();
  return { orders, loadOrders, createOrder, updateOrderStatus };
};

export const useKitchen = () => {
  const { markPreparing, markServed, getKitchenOrders } = useApp();
  return { markPreparing, markServed, getKitchenOrders };
};

export const useTheme = () => {
  const { theme, updateTheme } = useApp();
  return { theme, updateTheme };
};

export const useNotification = () => {
  const { notification, showNotification, hideNotification } = useApp();
  return { notification, showNotification, hideNotification };
};

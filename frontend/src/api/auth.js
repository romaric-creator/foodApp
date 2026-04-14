import api from '../config/api';

/**
 * Service d'authentification simplifié
 * Gère login, register, verify, logout
 */

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { user } = response.data;
    
    // Stocker l'utilisateur
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('lastAuth', new Date().getTime());
    
    return user;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur de connexion');
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    const { user } = response.data;
    
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('lastAuth', new Date().getTime());
    
    return user;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur d\'inscription');
  }
};

export const verify = async () => {
  try {
    // Vérifier le cache en mémoire (max 5 minutes)
    const lastAuth = localStorage.getItem('lastAuth');
    if (lastAuth && new Date().getTime() - parseInt(lastAuth) < 5 * 60 * 1000) {
      const user = localStorage.getItem('user');
      if (user) return JSON.parse(user);
    }
    
    const response = await api.get('/auth/verify');
    const { user } = response.data;
    
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('lastAuth', new Date().getTime());
    
    return user;
  } catch (error) {
    // Token expiré ou invalide
    localStorage.removeItem('user');
    localStorage.removeItem('lastAuth');
    return null;
  }
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Erreur logout:', error);
  }
  localStorage.removeItem('user');
  localStorage.removeItem('lastAuth');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('user');
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};

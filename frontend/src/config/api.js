import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Créer une instance axios avec la configuration de base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Crucial pour les cookies HTTP-only
});

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('user');
      localStorage.removeItem('admin');
      
      const path = window.location.pathname;
      // Ne rediriger vers /login QUE si on n'est pas déjà sur une page de login 
      // et qu'on n'est pas sur une route client (le menu doit rester accessible)
      if (
        !path.startsWith('/client') && 
        path !== '/login' && 
        path !== '/admin/login'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;


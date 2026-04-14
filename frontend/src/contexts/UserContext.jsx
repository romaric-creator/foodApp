import React, { createContext, useState, useEffect } from "react";
import { verifyToken, logout as authLogout, getCurrentUser } from "../services/authService";

export const AuthContext = createContext({
  currentUser: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await verifyToken();
        setCurrentUser(user);
      } catch (error) {
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Vérifier d'abord le localStorage
    const storedUser = getCurrentUser();
    if (storedUser) {
      setCurrentUser(storedUser);
      setLoading(false);
      // Vérifier ensuite le token
      checkAuth();
    } else {
      checkAuth();
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { login: authLogin } = await import("../services/authService");
      const { user } = await authLogin(email, password);
      setCurrentUser(user);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      authLogout();
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

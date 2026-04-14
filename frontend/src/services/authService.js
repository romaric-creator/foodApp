import api from "../config/api";

export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    const { user } = response.data;

    // Stocker les informations utilisateur
    localStorage.setItem("user", JSON.stringify(user));

    if (user.role === "admin") {
      localStorage.setItem("admin", JSON.stringify(user));
    }

    return { user };
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    throw new Error(error.response?.data?.error || "Erreur lors de la connexion");
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);
    const { user } = response.data;

    // Stocker les informations utilisateur
    localStorage.setItem("user", JSON.stringify(user));

    return { user };
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    throw new Error(error.response?.data?.error || "Erreur lors de l'inscription");
  }
};

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Erreur lors de la déconnexion backend:", error);
  }
  localStorage.removeItem("user");
  localStorage.removeItem("admin");
};

export const verifyToken = async () => {
  try {
    const response = await api.get("/auth/verify");
    return response.data.user;
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    // On ne fait plus de logout() automatique ici car c'est le backend qui décide via 401
    return null;
  }
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.role === "admin";
};


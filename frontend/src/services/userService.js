import api from "../config/api";

export const createUser = async ({ name, email, password, username, telephone }) => {
  if (!name || !email || !password) {
    throw new Error("Tous les champs sont requis pour créer un utilisateur.");
  }
  try {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
      username,
      telephone,
    });
    return response.data.user;
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur :", error);
    throw new Error(error.response?.data?.error || "Erreur lors de la création de l'utilisateur");
  }
};

export const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email et mot de passe sont requis.");
  }
  try {
    const response = await api.post("/auth/login", { email, password });
    return response.data.user;
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    throw new Error(error.response?.data?.error || "Erreur lors de la connexion");
  }
};

// Ajout de la fonction fetchUserById
export const fetchUserById = async (userId) => {
  if (!userId) {
    throw new Error("L'ID utilisateur est requis.");
  }
  try {
    const response = await api.get(`/users/${userId}`);
    return {
      id: response.data.idUsers,
      ...response.data,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error);
    if (error.response?.status === 404) {
      return null;
    }
    throw new Error(error.response?.data?.error || "Erreur lors de la récupération de l'utilisateur");
  }
};

export const fetchUsers = async () => {
  try {
    const response = await api.get("/users");
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    throw new Error(error.response?.data?.error || "Erreur lors de la récupération des utilisateurs");
  }
};

export const deleteUser = async (userId) => {
  if (!userId) {
    throw new Error("L'ID utilisateur est requis.");
  }
  try {
    await api.delete(`/users/${userId}`);
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur :", error);
    throw new Error(error.response?.data?.error || "Erreur lors de la suppression de l'utilisateur");
  }
};

export const updateUser = async (userId, userData) => {
  if (!userId) {
    throw new Error("L'ID utilisateur est requis.");
  }
  try {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
    throw new Error(error.response?.data?.error || "Erreur lors de la mise à jour de l'utilisateur");
  }
};

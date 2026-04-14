import api from "../config/api";

// Obtenir les commandes en attente (pour la cuisine)
export const getPendingOrders = async () => {
  try {
    const response = await api.get("/kitchen/orders/pending");
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error);
    throw new Error(error.response?.data?.error || "Erreur lors de la récupération des commandes");
  }
};

// Obtenir toutes les commandes avec filtres
export const getOrders = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.date) params.append("date", filters.date);
    
    const response = await api.get(`/kitchen/orders?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error);
    throw new Error(error.response?.data?.error || "Erreur lors de la récupération des commandes");
  }
};

// Marquer une commande comme "en préparation"
export const markOrderAsPreparing = async (orderId) => {
  try {
    const response = await api.put(`/kitchen/orders/${orderId}/prepare`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    throw new Error(error.response?.data?.error || "Erreur lors de la mise à jour");
  }
};

// Marquer une commande comme "servie"
export const markOrderAsServed = async (orderId) => {
  try {
    const response = await api.put(`/kitchen/orders/${orderId}/serve`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    throw new Error(error.response?.data?.error || "Erreur lors de la mise à jour");
  }
};

// Obtenir les statistiques du jour
export const getTodayStats = async () => {
  try {
    const response = await api.get("/kitchen/stats/today");
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des stats:", error);
    throw new Error(error.response?.data?.error || "Erreur lors de la récupération des stats");
  }
};


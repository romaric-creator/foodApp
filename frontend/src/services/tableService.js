import api from "../config/api";

export const createTable = async (data) => {
  if (!data) throw new Error("data must be provided");
  try {
    const response = await api.post("/tables", data);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la création de la table :", error);
    return { error: error.response?.data?.error || error.message || "Une erreur est survenue" };
  }
};

export const getTables = async () => {
  try {
    const response = await api.get("/tables");
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des tables :", error);
    throw new Error(error.response?.data?.error || "Erreur lors de la récupération des tables");
  }
};

export const deleteTable = async (tableId) => {
  if (!tableId) throw new Error("L'id de la table est requis");
  try {
    await api.delete(`/tables/${tableId}`);
    console.log("Table supprimée avec succès");
    return { id: tableId };
  } catch (error) {
    console.error("Erreur lors de la suppression de la table :", error);
    throw new Error(error.response?.data?.error || "Erreur lors de la suppression de la table");
  }
};

export const fetchTableById = async (tableId) => {
  if (!tableId) throw new Error("L'ID de la table est requis.");
  try {
    const response = await api.get(`/tables/${tableId}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de la table :", error);
    if (error.response?.status === 404) {
      return null;
    }
    throw new Error(error.response?.data?.error || "Erreur lors de la récupération de la table");
  }
};

import api from "../config/api";

export const fetchMenus = async (categoryId = null) => {
  try {
    const params = categoryId ? { idCat: categoryId } : {};
    const response = await api.get("/menus", { params });
    return response.data;
  } catch (error) {
    console.error("Erreur lors du chargement du menu :", error);
    return [];
  }
};

export const createMenu = async (menuData) => {
  if (!menuData) throw new Error("menuData must be provided");
  try {
    const data =
      menuData instanceof FormData
        ? Object.fromEntries(menuData.entries())
        : menuData;
    const response = await api.post("/menus", data);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la création du menu :", error);
    throw new Error(error.response?.data?.error || "Erreur lors de la création du menu");
  }
};

export const updateMenu = async (id, menuData) => {
  if (!id) throw new Error("id must be provided");
  if (!menuData) throw new Error("menuData must be provided");
  try {
    const data =
      menuData instanceof FormData
        ? Object.fromEntries(menuData.entries())
        : menuData;
    const response = await api.put(`/menus/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du menu :", error);
    throw new Error(error.response?.data?.error || "Erreur lors de la mise à jour du menu");
  }
};

export const deleteMenu = async (id) => {
  if (!id) throw new Error("id must be provided");
  try {
    await api.delete(`/menus/${id}`);
    return { id };
  } catch (error) {
    console.error("Erreur lors de la suppression du menu :", error);
    throw new Error(error.response?.data?.error || "Erreur lors de la suppression du menu");
  }
};

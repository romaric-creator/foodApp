import api from "../config/api";

export const fetchCategories = async () => {
  try {
    const response = await api.get("/categories");
    return response.data.map(cat => ({
      idCat: cat.idCat,
      numericId: cat.idCat,
      name: cat.name,
      created_at: cat.created_at,
    }));
  } catch (error) {
    console.error("Erreur lors du chargement des catégories :", error);
    return [];
  }
};

export const fetchMenusByCategory = async (categoryId) => {
  if (!categoryId) throw new Error("categoryId must be provided");
  try {
    const response = await api.get("/menus", { params: { idCat: categoryId } });
    return response.data;
  } catch (error) {
    console.error("Erreur lors du chargement des menus par catégorie :", error);
    return [];
  }
};

export const createCategory = async (categoryData) => {
  if (!categoryData) throw new Error("categoryData must be provided");
  try {
    const response = await api.post("/categories", categoryData);
    return {
      id: response.data.idCat,
      idCat: response.data.idCat,
      numericId: response.data.idCat,
      ...response.data,
    };
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie :", error);
    throw new Error(error.response?.data?.error || "Erreur lors de la création de la catégorie");
  }
};

export const updateCategory = async (categoryId, categoryData) => {
  if (!categoryId) throw new Error("categoryId must be provided");
  if (!categoryData) throw new Error("categoryData must be provided");
  try {
    const response = await api.put(`/categories/${categoryId}`, categoryData);
    return {
      id: response.data.idCat,
      idCat: response.data.idCat,
      numericId: response.data.idCat,
      ...response.data,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la catégorie :", error);
    throw new Error(error.response?.data?.error || "Erreur lors de la mise à jour de la catégorie");
  }
};

export const deleteCategory = async (categoryId) => {
  if (!categoryId) throw new Error("categoryId must be provided");
  try {
    await api.delete(`/categories/${categoryId}`);
    return { id: categoryId };
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie :", error);
    throw new Error(error.response?.data?.error || "Erreur lors de la suppression de la catégorie");
  }
};
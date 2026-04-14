import api from "../config/api";

const defaultTheme = {
  primary: "#0e0c2b",
  secondary: "#7842af",
  background: "#e6dce4",
  id: "1",
  updated_at: new Date().toISOString()
};

export const getDashboardTheme = async () => {
  try {
    const response = await api.get("/theme");
    const themeData = response.data;
    localStorage.setItem("theme_settings", JSON.stringify(themeData));
    return themeData;
  } catch (error) {
    console.error("Erreur lors du chargement du thème dashboard:", error);
    localStorage.setItem("theme_settings", JSON.stringify(defaultTheme));
    return defaultTheme;
  }
};

export const updateDashboardTheme = async (themeData) => {
  try {
    const response = await api.put("/theme", themeData);
    const updatedTheme = response.data;
    localStorage.setItem("theme_settings", JSON.stringify(updatedTheme));
    return updatedTheme;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du thème dashboard:", error);
    throw new Error(error.response?.data?.error || "Erreur lors de la mise à jour du thème");
  }
};

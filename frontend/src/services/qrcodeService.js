import api from "../config/api";

// Générer un QR Code avec token HMAC
export const generateQRCode = async (tableId) => {
  try {
    const response = await api.get(`/qrcode/generate/${tableId}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la génération du QR Code:", error);
    throw new Error(error.response?.data?.error || "Erreur lors de la génération du QR Code");
  }
};

// Valider un token QR Code
export const validateQRToken = async (tableId, token, timestamp) => {
  try {
    const response = await api.post("/qrcode/validate", {
      tableId,
      token,
      timestamp,
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la validation du QR Code:", error);
    throw new Error(error.response?.data?.error || "QR Code invalide ou expiré");
  }
};


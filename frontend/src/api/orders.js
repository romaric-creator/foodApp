import api from '../config/api';

/**
 * Service des commandes simplifié
 * Gère les commandes, la cuisine, les QR codes
 */

// COMMANDES
export const getOrders = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/orders?${params.toString()}`);
    return response.data.orders || response.data;
  } catch (error) {
    console.error('Erreur getOrders:', error);
    return [];
  }
};

export const getOrderById = async (id) => {
  try {
    const response = await api.get(`/orders/${id}`);
    return response.data.order || response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Commande non trouvée');
  }
};

export const createOrder = async (data) => {
  try {
    const response = await api.post('/orders', data);
    return response.data.order || response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur création commande');
  }
};

export const updateOrder = async (id, data) => {
  try {
    // Le backend microservice utilise /orders/:id/status
    const response = await api.put(`/orders/${id}/status`, { statut: data.statut || data.status });
    return response.data.order || response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur mise à jour commande');
  }
};

export const deleteOrder = async (id) => {
  try {
    await api.delete(`/orders/${id}`);
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur suppression commande');
  }
};

// CUISINE
export const getKitchenOrders = async () => {
  try {
    const response = await api.get('/kitchen/orders/pending');
    return response.data.orders || response.data;
  } catch (error) {
    console.error('Erreur getKitchenOrders:', error);
    return [];
  }
};

export const markOrderPreparing = async (id) => {
  try {
    const response = await api.put(`/kitchen/orders/${id}/prepare`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur mise à jour cuisine');
  }
};

export const markOrderServed = async (id) => {
  try {
    const response = await api.put(`/kitchen/orders/${id}/serve`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur marquage servi');
  }
};

export const getKitchenStats = async () => {
  try {
    const response = await api.get('/kitchen/stats/today');
    return response.data;
  } catch (error) {
    console.error('Erreur getKitchenStats:', error);
    return { total_orders: 0, total_revenue: 0, pending_count: 0 };
  }
};

// QR CODES
export const generateQRCode = async (tableId) => {
  try {
    const response = await api.get(`/qrcode/generate/${tableId}`);
    return response.data.qrCode || response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur génération QR Code');
  }
};

export const validateQRCode = async (token) => {
  try {
    const response = await api.post('/qrcode/validate', { token });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'QR Code invalide');
  }
};

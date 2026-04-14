import api from "../config/api";

// ------------- FETCH ORDERS -------------
export const fetchOrders = async () => {
  try {
    const response = await api.get("/orders");
    return response.data;
  } catch (error) {
    console.error("Erreur lors du chargement des orders :", error);
    throw new Error(error.response?.data?.error || "Erreur lors du chargement des commandes");
  }
};

// ------------- PLACE ORDER -------------
export const placeOrder = async (order) => {
  try {
    const response = await api.post("/orders", {
      items: order.items,
      idTab: order.idTab,
      total: order.total,
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'envoi de la commande :", error);
    throw new Error(error.response?.data?.error || "Erreur lors de l'envoi de la commande");
  }
};

// ------------- UPDATE ORDER STATUS -------------
export const updateOrderStatus = async (orderId, newStatus) => {
  if (!orderId) throw new Error("orderId must be provided");
  if (newStatus === undefined || newStatus === null) throw new Error("newStatus must be provided");
  try {
    const response = await api.put(`/orders/${orderId}/status`, { statut: newStatus });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du status :", error);
    throw new Error(error.response?.data?.error || "Erreur lors de la mise à jour du statut");
  }
};

// ------------- CANCEL ORDER -------------
export const cancelOrder = async (orderId, newStatus) => {
  if (!orderId) throw new Error("orderId must be provided");
  if (newStatus === undefined || newStatus === null) throw new Error("newStatus must be provided");
  try {
    const response = await api.put(`/orders/${orderId}/status`, { statut: newStatus });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'annulation de la commande :", error);
    throw new Error(error.response?.data?.error || "Erreur lors de l'annulation de la commande");
  }
};

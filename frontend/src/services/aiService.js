import api from "../config/api";

export const sendAdminChatMessage = async (message, history = []) => {
  try {
    const response = await api.post("/ai/chat/admin/chat", {
      message,
      history
    });
    return response.data;
  } catch (error) {
    console.error('AI Chat Error:', error);
    throw error;
  }
};

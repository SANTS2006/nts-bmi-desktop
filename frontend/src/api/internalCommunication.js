import { apiRequest } from "./client.js";

const encode = (value) => encodeURIComponent(value);

const query = (params) => {
  const q = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") q.set(key, value);
  });
  const text = q.toString();
  return text ? `?${text}` : "";
};

export const getConversations = (params) => apiRequest(`/api/communication${query(params)}`);
export const getConversation = (id) => apiRequest(`/api/communication/${encode(id)}`);
export const createConversation = (data) => apiRequest("/api/communication", { method: "POST", body: data });
export const updateConversation = (id, data) => apiRequest(`/api/communication/${encode(id)}`, { method: "PATCH", body: data });
export const deleteConversation = (id) => apiRequest(`/api/communication/${encode(id)}`, { method: "DELETE" });

export const getAvailableParticipants = (id, params) => apiRequest(`/api/communication/${encode(id)}/participants/available${query(params)}`);
export const addParticipants = (id, userIds) => apiRequest(`/api/communication/${encode(id)}/participants`, { method: "POST", body: { userIds } });
export const removeParticipant = (id, userId) => apiRequest(`/api/communication/${encode(id)}/participants/${encode(userId)}`, { method: "DELETE" });
export const setParticipantMute = (id, userId, isMuted) => apiRequest(`/api/communication/${encode(id)}/participants/${encode(userId)}/mute`, { method: "PATCH", body: { isMuted } });

export const getMessages = (id, params) => apiRequest(`/api/communication/${encode(id)}/messages${query(params)}`);
export const sendMessage = (id, data) => apiRequest(`/api/communication/${encode(id)}/messages`, { method: "POST", body: data });
export const updateMessage = (id, data) => apiRequest(`/api/communication/messages/${encode(id)}`, { method: "PATCH", body: data });
export const deleteMessage = (id) => apiRequest(`/api/communication/messages/${encode(id)}`, { method: "DELETE" });
export const toggleMessageReaction = (id, type) => apiRequest(`/api/communication/messages/${encode(id)}/reactions`, { method: "POST", body: { type } });
export const markConversationRead = (id) => apiRequest(`/api/communication/${encode(id)}/read`, { method: "POST" });

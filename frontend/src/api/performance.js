import { apiRequest } from "./client.js";
const id = (value) => { if (!value) throw new Error("Performance record ID is required."); };
export const getPerformanceRecords = ({ employeeId = "", reviewerId = "", rating = "" } = {}) => {
  const q = new URLSearchParams();
  if (employeeId) q.set("employeeId", employeeId);
  if (reviewerId) q.set("reviewerId", reviewerId);
  if (rating) q.set("rating", rating);
  return apiRequest(`/api/performance${q.toString() ? `?${q}` : ""}`);
};
export const getPerformanceRecordById = (recordId) => { id(recordId); return apiRequest(`/api/performance/${encodeURIComponent(recordId)}`); };
export const createPerformanceRecord = (payload) => apiRequest("/api/performance", { method: "POST", body: payload });
export const updatePerformanceRecord = (recordId, payload) => { id(recordId); return apiRequest(`/api/performance/${encodeURIComponent(recordId)}`, { method: "PATCH", body: payload }); };
export const deletePerformanceRecord = (recordId) => { id(recordId); return apiRequest(`/api/performance/${encodeURIComponent(recordId)}`, { method: "DELETE" }); };

import { apiRequest } from "./client.js";

const encode = value => encodeURIComponent(value);
const query = params => {
  const q = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") q.set(key, value);
  });
  const text = q.toString();
  return text ? `?${text}` : "";
};

export const getAttendance = params => apiRequest(`/api/attendance${query(params)}`);
export const getAttendanceById = id => apiRequest(`/api/attendance/${encode(id)}`);
export const createAttendance = data => apiRequest("/api/attendance", { method: "POST", body: data });
export const updateAttendance = (id, data) => apiRequest(`/api/attendance/${encode(id)}`, { method: "PATCH", body: data });
export const deleteAttendance = id => apiRequest(`/api/attendance/${encode(id)}`, { method: "DELETE" });
export const clockIn = data => apiRequest("/api/attendance/clock-in", { method: "POST", body: data });
export const clockOut = data => apiRequest("/api/attendance/clock-out", { method: "POST", body: data });
export const getAttendanceStats = params => apiRequest(`/api/attendance/stats${query(params)}`);

export const getLeaveTypes = params => apiRequest(`/api/leave/types${query(params)}`);
export const createLeaveType = data => apiRequest("/api/leave/types", { method: "POST", body: data });
export const updateLeaveType = (id, data) => apiRequest(`/api/leave/types/${encode(id)}`, { method: "PATCH", body: data });
export const deleteLeaveType = id => apiRequest(`/api/leave/types/${encode(id)}`, { method: "DELETE" });
export const getLeaveRequests = params => apiRequest(`/api/leave${query(params)}`);
export const getLeaveRequestById = id => apiRequest(`/api/leave/${encode(id)}`);
export const createLeaveRequest = data => apiRequest("/api/leave", { method: "POST", body: data });
export const reviewLeaveRequest = (id, data) => apiRequest(`/api/leave/${encode(id)}/review`, { method: "POST", body: data });
export const cancelLeaveRequest = id => apiRequest(`/api/leave/${encode(id)}/cancel`, { method: "POST" });
export const getLeaveBalances = params => apiRequest(`/api/leave/balances${query(params)}`);
export const initializeLeaveBalances = (employeeId, data) => apiRequest(`/api/leave/balances/${encode(employeeId)}/initialize`, { method: "POST", body: data });
export const getLeaveStats = params => apiRequest(`/api/leave/stats${query(params)}`);

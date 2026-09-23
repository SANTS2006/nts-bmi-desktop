import { apiRequest } from "./client.js";

const query = params => {
  const q = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") q.set(key, value);
  });
  const text = q.toString();
  return text ? `?${text}` : "";
};

export const getOverviewReport = params => apiRequest(`/api/reports/overview${query(params)}`);
export const getFinancialReport = params => apiRequest(`/api/reports/financial${query(params)}`);
export const getWorkforceReport = params => apiRequest(`/api/reports/workforce${query(params)}`);
export const getProjectsReport = params => apiRequest(`/api/reports/projects${query(params)}`);
export const getActivityReport = params => apiRequest(`/api/reports/activity${query(params)}`);
export const getAuditReport = params => apiRequest(`/api/reports/audit${query(params)}`);
export const exportReportCsv = ({ report, rows, from, to }) => apiRequest("/api/reports/export/csv", { method: "POST", body: { report, rows, from, to } });

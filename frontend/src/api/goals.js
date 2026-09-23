import { apiRequest } from "./client.js";

function requireGoalId(value) {
  if (!value) {
    throw new Error("Goal ID is required.");
  }
}

export function getEmployeeGoals({
  employeeId = "",
  status = "",
} = {}) {
  const query = new URLSearchParams();

  if (employeeId) {
    query.set("employeeId", employeeId);
  }

  if (status) {
    query.set("status", status);
  }

  const queryString = query.toString();

  return apiRequest(
    `/api/employee-goals${queryString ? `?${queryString}` : ""
    }`
  );
}

export function getEmployeeGoalById(goalId) {
  requireGoalId(goalId);

  return apiRequest(
    `/api/employee-goals/${encodeURIComponent(goalId)}`
  );
}

export function createEmployeeGoal(payload) {
  return apiRequest("/api/employee-goals", {
    method: "POST",
    body: payload,
  });
}

export function updateEmployeeGoal(goalId, payload) {
  requireGoalId(goalId);

  return apiRequest(
    `/api/employee-goals/${encodeURIComponent(goalId)}`,
    {
      method: "PATCH",
      body: payload,
    }
  );
}

export function deleteEmployeeGoal(goalId) {
  requireGoalId(goalId);

  return apiRequest(
    `/api/employee-goals/${encodeURIComponent(goalId)}`,
    {
      method: "DELETE",
    }
  );
}
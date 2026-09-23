import { apiRequest } from "./client.js";

/**
 * ============================================================
 * HELPERS
 * ============================================================
 */

function requireId(value, message = "ID is required.") {
  if (!value || typeof value !== "string" || !value.trim()) {
    throw new Error(message);
  }

  return value.trim();
}

function unwrap(response) {
  return response?.data ?? response;
}

function normalizeRole(role) {
  return role === "LEAD" ? "LEAD" : "MEMBER";
}

/**
 * ============================================================
 * TEAMS
 * ============================================================
 */

/**
 * Get all teams.
 */
export const getTeams = ({
  search = "",
  departmentId = "",
  isActive = "",
} = {}) => {
  const params = new URLSearchParams();

  if (typeof search === "string" && search.trim()) {
    params.set("search", search.trim());
  }

  if (departmentId) {
    params.set("departmentId", departmentId);
  }

  if (isActive !== "" && isActive !== undefined && isActive !== null) {
    params.set("isActive", String(isActive));
  }

  const query = params.toString();

  return apiRequest(`/api/teams${query ? `?${query}` : ""}`);
};

/**
 * Get one team by ID.
 */
export const getTeamById = (teamId) => {
  const id = requireId(teamId, "Team ID is required.");

  return apiRequest(`/api/teams/${encodeURIComponent(id)}`);
};

/**
 * Create a team.
 */
export const createTeam = (payload = {}) => {
  return apiRequest("/api/teams", {
    method: "POST",
    body: payload,
  });
};

/**
 * Update a team.
 */
export const updateTeam = (teamId, payload = {}) => {
  const id = requireId(teamId, "Team ID is required.");

  return apiRequest(`/api/teams/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: payload,
  });
};

/**
 * Delete a team.
 */
export const deleteTeam = (teamId) => {
  const id = requireId(teamId, "Team ID is required.");

  return apiRequest(`/api/teams/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
};

/**
 * ============================================================
 * TEAM LEAD
 * ============================================================
 */

/**
 * Assign a team lead.
 *
 * Supported usage:
 *
 * assignTeamLead(teamId, employeeId)
 *
 * OR:
 *
 * assignTeamLead({
 *     teamId,
 *     employeeId
 * })
 */
export const assignTeamLead = (
  teamIdOrPayload,
  employeeId
) => {
  let teamId = teamIdOrPayload;

  if (
    teamIdOrPayload &&
    typeof teamIdOrPayload === "object"
  ) {
    teamId = teamIdOrPayload.teamId;
    employeeId = teamIdOrPayload.employeeId;
  }

  const validTeamId = requireId(
    teamId,
    "Team ID is required."
  );

  const validEmployeeId = requireId(
    employeeId,
    "Employee ID is required."
  );

  return apiRequest(
    `/api/teams/${encodeURIComponent(validTeamId)}/lead`,
    {
      method: "PATCH",
      body: {
        employeeId: validEmployeeId,
      },
    }
  );
};

/**
 * Remove the current team lead.
 */
export const removeTeamLead = (teamId) => {
  const id = requireId(teamId, "Team ID is required.");

  return apiRequest(
    `/api/teams/${encodeURIComponent(id)}/lead`,
    {
      method: "DELETE",
    }
  );
};

/**
 * ============================================================
 * TEAM MEMBERS
 * ============================================================
 */

/**
 * Add an employee to a team.
 *
 * Supported usage:
 *
 * addTeamMember(teamId, employeeId, role)
 *
 * OR:
 *
 * addTeamMember({
 *     teamId,
 *     employeeId,
 *     role
 * })
 */
export const addTeamMember = (
  teamIdOrPayload,
  employeeId,
  role = "MEMBER"
) => {
  let teamId = teamIdOrPayload;

  /**
   * Support object-style calls.
   *
   * This prevents the common bug where the UI does:
   *
   * addTeamMember({
   *     teamId,
   *     employeeId,
   *     role
   * })
   *
   * while the API function expects positional arguments.
   */
  if (
    teamIdOrPayload &&
    typeof teamIdOrPayload === "object"
  ) {
    teamId = teamIdOrPayload.teamId;
    employeeId = teamIdOrPayload.employeeId;
    role = teamIdOrPayload.role ?? "MEMBER";
  }

  const validTeamId = requireId(
    teamId,
    "Team ID is required."
  );

  const validEmployeeId = requireId(
    employeeId,
    "Employee ID is required."
  );

  const validRole = normalizeRole(role);

  return apiRequest(
    `/api/teams/${encodeURIComponent(validTeamId)}/members`,
    {
      method: "POST",
      body: {
        employeeId: validEmployeeId,
        role: validRole,
      },
    }
  );
};

/**
 * Remove an employee from a team.
 *
 * Supported usage:
 *
 * removeTeamMember(teamId, employeeId)
 *
 * OR:
 *
 * removeTeamMember({
 *     teamId,
 *     employeeId
 * })
 */
export const removeTeamMember = (
  teamIdOrPayload,
  employeeId
) => {
  let teamId = teamIdOrPayload;

  if (
    teamIdOrPayload &&
    typeof teamIdOrPayload === "object"
  ) {
    teamId = teamIdOrPayload.teamId;
    employeeId = teamIdOrPayload.employeeId;
  }

  const validTeamId = requireId(
    teamId,
    "Team ID is required."
  );

  const validEmployeeId = requireId(
    employeeId,
    "Employee ID is required."
  );

  return apiRequest(
    `/api/teams/${encodeURIComponent(validTeamId)}/members/${encodeURIComponent(
      validEmployeeId
    )}`,
    {
      method: "DELETE",
    }
  );
};

export { unwrap };
import { apiRequest } from "./client.js";

/* =========================================================
   HELPERS
   ========================================================= */

const requireId = (
  value,
  message = "ID is required."
) => {
  if (!value) {
    throw new Error(message);
  }
};

/* =========================================================
   GET ALL SKILLS
   ========================================================= */

export const getSkills = ({ search = "" } = {}) => {
  const query = new URLSearchParams();

  if (typeof search === "string" && search.trim()) {
    query.set("search", search.trim());
  }

  const queryString = query.toString();

  return apiRequest(
    `/api/skills${queryString ? `?${queryString}` : ""}`
  );
};

/* =========================================================
   GET SINGLE SKILL WITH ASSIGNED EMPLOYEES
   ========================================================= */

export const getSkillById = (skillId) => {
  requireId(
    skillId,
    "Skill ID is required."
  );

  return apiRequest(
    `/api/skills/${encodeURIComponent(skillId)}`
  );
};

/* =========================================================
   CREATE SKILL
   ========================================================= */

export const createSkill = (data) => {
  return apiRequest(
    "/api/skills",
    {
      method: "POST",
      body: data,
    }
  );
};

/* =========================================================
   UPDATE SKILL
   ========================================================= */

export const updateSkill = (
  skillId,
  data
) => {
  requireId(
    skillId,
    "Skill ID is required."
  );

  return apiRequest(
    `/api/skills/${encodeURIComponent(skillId)}`,
    {
      method: "PATCH",
      body: data,
    }
  );
};

/* =========================================================
   DELETE SKILL
   ========================================================= */

export const deleteSkill = (
  skillId
) => {
  requireId(
    skillId,
    "Skill ID is required."
  );

  return apiRequest(
    `/api/skills/${encodeURIComponent(skillId)}`,
    {
      method: "DELETE",
    }
  );
};

/* =========================================================
   ASSIGN SKILL TO EMPLOYEE
   ========================================================= */

export const addEmployeeSkill = (
  employeeId,
  data
) => {
  requireId(
    employeeId,
    "Employee ID is required."
  );

  return apiRequest(
    `/api/skills/employees/${encodeURIComponent(employeeId)}`,
    {
      method: "POST",
      body: data,
    }
  );
};

/* =========================================================
   UPDATE EMPLOYEE SKILL
   ========================================================= */

export const updateEmployeeSkill = (
  employeeSkillId,
  data
) => {
  requireId(
    employeeSkillId,
    "Employee skill ID is required."
  );

  return apiRequest(
    `/api/skills/employee-skills/${encodeURIComponent(
      employeeSkillId
    )}`,
    {
      method: "PATCH",
      body: data,
    }
  );
};

/* =========================================================
   REMOVE EMPLOYEE SKILL
   ========================================================= */

export const removeEmployeeSkill = (
  employeeSkillId
) => {
  requireId(
    employeeSkillId,
    "Employee skill ID is required."
  );

  return apiRequest(
    `/api/skills/employee-skills/${encodeURIComponent(
      employeeSkillId
    )}`,
    {
      method: "DELETE",
    }
  );
};
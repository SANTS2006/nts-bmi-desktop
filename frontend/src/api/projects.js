/*
 * ==================================================
 * NTS BMS PROJECT API
 * ==================================================
 */

import { apiRequest } from "./client.js";

function requireId(value, message) {
    if (value === undefined || value === null || value === "") {
        throw new Error(message);
    }
}

function responseData(response) {
    return response?.data ?? response;
}

function responseUsers(response) {
    const data = responseData(response);

    if (Array.isArray(data?.users)) return data.users;
    if (Array.isArray(response?.users)) return response.users;
    if (Array.isArray(data)) return data;
    if (Array.isArray(response)) return response;

    return [];
}

function pagination(response) {
    const data = responseData(response);
    return data?.pagination ?? response?.pagination ?? data?.meta ?? response?.meta ?? null;
}

function isActiveUser(user) {
    if (user?.status === undefined || user?.status === null) return true;
    return String(user.status).trim().toUpperCase() === "ACTIVE";
}

function getRoleNames(user) {
    const names = [];

    if (typeof user?.role === "string") names.push(user.role);
    if (user?.role?.name) names.push(user.role.name);

    if (Array.isArray(user?.roles)) {
        for (const role of user.roles) {
            if (typeof role === "string") names.push(role);
            else if (role?.name) names.push(role.name);
        }
    }

    if (Array.isArray(user?.userRoles)) {
        for (const userRole of user.userRoles) {
            if (typeof userRole === "string") names.push(userRole);
            else if (userRole?.name) names.push(userRole.name);
            else if (userRole?.role?.name) names.push(userRole.role.name);
        }
    }

    return names
        .filter(Boolean)
        .map((name) => String(name).trim().toUpperCase().replace(/[\s-]+/g, "_"));
}

function isProjectManager(user) {
    const roles = getRoleNames(user);
    return roles.includes("PROJECT_MANAGER") || roles.includes("PROJECTMANAGER");
}

async function getAllUsers({ limit = 100, activeOnly = true } = {}) {
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 100));
    const users = [];
    const seen = new Set();
    let page = 1;

    while (true) {
        const params = new URLSearchParams({
            page: String(page),
            limit: String(safeLimit),
        });

        const response = await apiRequest(`/api/users?${params.toString()}`, {
            method: "GET",
        });

        const pageUsers = responseUsers(response);

        for (const user of pageUsers) {
            if (!user?.id || seen.has(user.id)) continue;
            if (activeOnly && !isActiveUser(user)) continue;

            seen.add(user.id);
            users.push(user);
        }

        const meta = pagination(response);
        const currentPage = Number(meta?.page ?? meta?.currentPage ?? page) || page;
        const totalPages = Number(meta?.totalPages ?? meta?.pages ?? 0) || 0;
        const total = Number(meta?.total ?? responseData(response)?.total ?? response?.total ?? 0) || 0;

        if (totalPages > 0) {
            if (currentPage >= totalPages) break;
            page = currentPage + 1;
            continue;
        }

        if (total > 0) {
            const calculatedPages = Math.ceil(total / safeLimit);
            if (currentPage >= calculatedPages) break;
            page = currentPage + 1;
            continue;
        }

        if (pageUsers.length < safeLimit) break;

        page = currentPage + 1;
        if (page > 10000) {
            throw new Error("Unable to retrieve users because pagination exceeded the safety limit.");
        }
    }

    return users;
}

export async function getProjectUsers(options = {}) {
    return getAllUsers(options);
}

export async function getProjectManagers(options = {}) {
    const users = await getAllUsers(options);
    return users.filter(isProjectManager);
}

export async function getProjects({ page = 1, limit = 20, search = "", status = "", priority = "" } = {}) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    const params = new URLSearchParams({ page: String(safePage), limit: String(safeLimit) });

    if (search?.trim()) params.set("search", search.trim());
    if (status && status !== "ALL") params.set("status", status);
    if (priority && priority !== "ALL") params.set("priority", priority);

    return apiRequest(`/api/projects?${params.toString()}`, { method: "GET" });
}

export async function getProjectById(projectId) {
    requireId(projectId, "Project ID is required.");
    return apiRequest(`/api/projects/${encodeURIComponent(projectId)}`, { method: "GET" });
}

export async function createProject(data = {}) {
    const name = typeof data.name === "string" ? data.name.trim() : "";
    if (!name) throw new Error("Project name is required.");

    return apiRequest("/api/projects", {
        method: "POST",
        body: {
            name,
            description: typeof data.description === "string" && data.description.trim() ? data.description.trim() : null,
            status: data.status || "PLANNING",
            priority: data.priority || "MEDIUM",
            projectManagerId: data.projectManagerId || null,
            departmentId: data.departmentId || null,
            clientId: data.clientId || null,
            startDate: data.startDate || null,
            expectedEndDate: data.expectedEndDate || null,
        },
    });
}

export async function updateProject(projectId, data = {}) {
    requireId(projectId, "Project ID is required.");
    const name = typeof data.name === "string" ? data.name.trim() : "";
    if (!name) throw new Error("Project name is required.");

    return apiRequest(`/api/projects/${encodeURIComponent(projectId)}`, {
        method: "PATCH",
        body: {
            name,
            description: typeof data.description === "string" && data.description.trim() ? data.description.trim() : null,
            status: data.status || "PLANNING",
            priority: data.priority || "MEDIUM",
            projectManagerId: data.projectManagerId || null,
            departmentId: data.departmentId || null,
            clientId: data.clientId || null,
            startDate: data.startDate || null,
            expectedEndDate: data.expectedEndDate || null,
            actualEndDate: data.actualEndDate || null,
        },
    });
}

export async function deleteProject(projectId) {
    requireId(projectId, "Project ID is required.");
    return apiRequest(`/api/projects/${encodeURIComponent(projectId)}`, { method: "DELETE" });
}

export async function assignProjectManager(projectId, userId) {
    requireId(projectId, "Project ID is required.");
    requireId(userId, "User ID is required.");
    return apiRequest(`/api/projects/${encodeURIComponent(projectId)}/manager`, {
        method: "PATCH",
        body: { userId },
    });
}

export async function removeProjectManager(projectId) {
    requireId(projectId, "Project ID is required.");
    return apiRequest(`/api/projects/${encodeURIComponent(projectId)}/manager`, { method: "DELETE" });
}

export async function addProjectMember(projectId, { userId, role = "MEMBER" } = {}) {
    requireId(projectId, "Project ID is required.");
    requireId(userId, "User ID is required.");
    return apiRequest(`/api/projects/${encodeURIComponent(projectId)}/members`, {
        method: "POST",
        body: { userId, role },
    });
}

export async function addProjectMembers(projectId, users) {
    requireId(projectId, "Project ID is required.");
    if (!Array.isArray(users) || users.length === 0) {
        throw new Error("Please select at least one member.");
    }

    const normalized = users.map((user) => typeof user === "string"
        ? { userId: user, role: "MEMBER" }
        : { userId: user?.userId || user?.id, role: user?.role || "MEMBER" });

    for (const user of normalized) {
        requireId(user.userId, "Every project member must have a valid user ID.");
    }

    const results = [];
    for (const user of normalized) {
        results.push(await addProjectMember(projectId, user));
    }
    return results;
}

export async function removeProjectMember(projectId, userId) {
    requireId(projectId, "Project ID is required.");
    requireId(userId, "User ID is required.");
    return apiRequest(`/api/projects/${encodeURIComponent(projectId)}/members/${encodeURIComponent(userId)}`, {
        method: "DELETE",
    });
}

export async function createProjectRequirement(projectId, data = {}) {
    requireId(projectId, "Project ID is required.");
    const title = typeof data.title === "string" ? data.title.trim() : "";
    if (!title) throw new Error("Requirement title is required.");

    return apiRequest(`/api/projects/${encodeURIComponent(projectId)}/requirements`, {
        method: "POST",
        body: {
            title,
            description: typeof data.description === "string" && data.description.trim() ? data.description.trim() : null,
            status: data.status || "DRAFT",
            priority: data.priority || "MEDIUM",
        },
    });
}

export async function updateProjectRequirement(projectId, requirementId, data = {}) {
    requireId(projectId, "Project ID is required.");
    requireId(requirementId, "Requirement ID is required.");
    const title = typeof data.title === "string" ? data.title.trim() : "";
    if (!title) throw new Error("Requirement title is required.");

    return apiRequest(`/api/projects/${encodeURIComponent(projectId)}/requirements/${encodeURIComponent(requirementId)}`, {
        method: "PATCH",
        body: {
            title,
            description: typeof data.description === "string" && data.description.trim() ? data.description.trim() : null,
            status: data.status || "DRAFT",
            priority: data.priority || "MEDIUM",
        },
    });
}

export async function deleteProjectRequirement(projectId, requirementId) {
    requireId(projectId, "Project ID is required.");
    requireId(requirementId, "Requirement ID is required.");
    return apiRequest(`/api/projects/${encodeURIComponent(projectId)}/requirements/${encodeURIComponent(requirementId)}`, { method: "DELETE" });
}

export async function createProjectMilestone(projectId, data = {}) {
    requireId(projectId, "Project ID is required.");
    const name = typeof data.name === "string" ? data.name.trim() : "";
    if (!name) throw new Error("Milestone name is required.");

    return apiRequest(`/api/projects/${encodeURIComponent(projectId)}/milestones`, {
        method: "POST",
        body: {
            name,
            description: typeof data.description === "string" && data.description.trim() ? data.description.trim() : null,
            status: data.status || "PENDING",
            dueDate: data.dueDate || null,
        },
    });
}

export async function updateProjectMilestone(projectId, milestoneId, data = {}) {
    requireId(projectId, "Project ID is required.");
    requireId(milestoneId, "Milestone ID is required.");
    const name = typeof data.name === "string" ? data.name.trim() : "";
    if (!name) throw new Error("Milestone name is required.");

    return apiRequest(`/api/projects/${encodeURIComponent(projectId)}/milestones/${encodeURIComponent(milestoneId)}`, {
        method: "PATCH",
        body: {
            name,
            description: typeof data.description === "string" && data.description.trim() ? data.description.trim() : null,
            status: data.status || "PENDING",
            dueDate: data.dueDate || null,
            completedAt: data.completedAt || null,
        },
    });
}

export async function deleteProjectMilestone(projectId, milestoneId) {
    requireId(projectId, "Project ID is required.");
    requireId(milestoneId, "Milestone ID is required.");
    return apiRequest(`/api/projects/${encodeURIComponent(projectId)}/milestones/${encodeURIComponent(milestoneId)}`, { method: "DELETE" });
}

export const PROJECT_DOCUMENT_TYPES = [
    ["REQUIREMENT", "Requirement"],
    ["SPECIFICATION", "Specification"],
    ["DESIGN", "Design"],
    ["CONTRACT", "Contract"],
    ["REPORT", "Report"],
    ["OTHER", "Other"],
];

const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024;

const ALLOWED_DOCUMENT_TYPES = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    "image/jpeg",
    "image/png",
    "image/webp",
]);

function validateDocumentFile(file) {
    if (!file) return;
    if (file.size > MAX_DOCUMENT_SIZE) throw new Error("Document must be 25 MB or smaller.");
    if (file.type && !ALLOWED_DOCUMENT_TYPES.has(file.type)) throw new Error("This file type is not supported.");
}

export async function uploadProjectDocument(projectId, { file, name = "", description = "", type = "OTHER" } = {}) {
    requireId(projectId, "Project ID is required.");
    if (!file) throw new Error("Please select a document.");
    validateDocumentFile(file);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name.trim() || file.name);
    formData.append("description", description?.trim() || "");
    formData.append("type", type || "OTHER");

    return apiRequest(`/api/projects/${encodeURIComponent(projectId)}/documents`, {
        method: "POST",
        body: formData,
    });
}

export async function updateProjectDocument(projectId, documentId, { file = null, name = "", description = "", type = "OTHER" } = {}) {
    requireId(projectId, "Project ID is required.");
    requireId(documentId, "Document ID is required.");
    validateDocumentFile(file);

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description?.trim() || "");
    formData.append("type", type || "OTHER");
    if (file) formData.append("file", file);

    return apiRequest(`/api/projects/${encodeURIComponent(projectId)}/documents/${encodeURIComponent(documentId)}`, {
        method: "PATCH",
        body: formData,
    });
}

export async function deleteProjectDocument(projectId, documentId) {
    requireId(projectId, "Project ID is required.");
    requireId(documentId, "Document ID is required.");
    return apiRequest(`/api/projects/${encodeURIComponent(projectId)}/documents/${encodeURIComponent(documentId)}`, { method: "DELETE" });
}

export async function createProjectIssue(projectId, data = {}) {
    requireId(projectId, "Project ID is required.");
    const title = typeof data.title === "string" ? data.title.trim() : "";
    if (!title) throw new Error("Issue title is required.");

    return apiRequest(`/api/projects/${encodeURIComponent(projectId)}/issues`, {
        method: "POST",
        body: {
            title,
            description: typeof data.description === "string" && data.description.trim() ? data.description.trim() : null,
            status: data.status || "OPEN",
            priority: data.priority || "MEDIUM",
            assignedToId: data.assignedToId || null,
        },
    });
}

export async function updateProjectIssue(projectId, issueId, data = {}) {
    requireId(projectId, "Project ID is required.");
    requireId(issueId, "Issue ID is required.");
    const title = typeof data.title === "string" ? data.title.trim() : "";
    if (!title) throw new Error("Issue title is required.");

    return apiRequest(`/api/projects/${encodeURIComponent(projectId)}/issues/${encodeURIComponent(issueId)}`, {
        method: "PATCH",
        body: {
            title,
            description: typeof data.description === "string" && data.description.trim() ? data.description.trim() : null,
            status: data.status || "OPEN",
            priority: data.priority || "MEDIUM",
            assignedToId: data.assignedToId || null,
        },
    });
}

export async function deleteProjectIssue(projectId, issueId) {
    requireId(projectId, "Project ID is required.");
    requireId(issueId, "Issue ID is required.");
    return apiRequest(`/api/projects/${encodeURIComponent(projectId)}/issues/${encodeURIComponent(issueId)}`, { method: "DELETE" });
}


/*
 * ==================================================
 * PROJECT TASKS
 * ==================================================
 */


/*
 * ==================================================
 * CREATE TASK
 * ==================================================
 */

export async function createProjectTask(
    projectId,
    data = {}
) {

    requireId(
        projectId,
        "Project ID is required."
    );


    const title =
        typeof data.title === "string"
            ? data.title.trim()
            : "";


    if (!title) {
        throw new Error(
            "Task title is required."
        );
    }


    return apiRequest(
        `/api/projects/${encodeURIComponent(
            projectId
        )}/tasks`,
        {
            method: "POST",

            body: {

                title,

                description:
                    typeof data.description === "string" &&
                        data.description.trim()
                        ? data.description.trim()
                        : null,

                status:
                    data.status ||
                    "TODO",

                priority:
                    data.priority ||
                    "NORMAL",

                assigneeId:
                    data.assigneeId ||
                    null,

                milestoneId:
                    data.milestoneId ||
                    null,

                parentTaskId:
                    data.parentTaskId ||
                    null,

                dueDate:
                    data.dueDate ||
                    null,

                estimatedHours:
                    data.estimatedHours === "" ||
                        data.estimatedHours === null ||
                        data.estimatedHours === undefined
                        ? null
                        : Number(
                            data.estimatedHours
                        ),

                actualHours:
                    data.actualHours === "" ||
                        data.actualHours === null ||
                        data.actualHours === undefined
                        ? null
                        : Number(
                            data.actualHours
                        ),

            },

        }
    );
}


/*
 * ==================================================
 * UPDATE TASK
 * ==================================================
 */

export async function updateProjectTask(
    projectId,
    taskId,
    data = {}
) {

    requireId(
        projectId,
        "Project ID is required."
    );


    requireId(
        taskId,
        "Task ID is required."
    );


    const title =
        typeof data.title === "string"
            ? data.title.trim()
            : "";


    if (!title) {
        throw new Error(
            "Task title is required."
        );
    }


    return apiRequest(
        `/api/projects/${encodeURIComponent(
            projectId
        )}/tasks/${encodeURIComponent(
            taskId
        )}`,
        {
            method: "PATCH",

            body: {

                title,

                description:
                    typeof data.description === "string" &&
                        data.description.trim()
                        ? data.description.trim()
                        : null,

                status:
                    data.status ||
                    "TODO",

                priority:
                    data.priority ||
                    "NORMAL",

                assigneeId:
                    data.assigneeId ||
                    null,

                milestoneId:
                    data.milestoneId ||
                    null,

                parentTaskId:
                    data.parentTaskId ||
                    null,

                dueDate:
                    data.dueDate ||
                    null,

                estimatedHours:
                    data.estimatedHours === "" ||
                        data.estimatedHours === null ||
                        data.estimatedHours === undefined
                        ? null
                        : Number(
                            data.estimatedHours
                        ),

                actualHours:
                    data.actualHours === "" ||
                        data.actualHours === null ||
                        data.actualHours === undefined
                        ? null
                        : Number(
                            data.actualHours
                        ),

            },

        }
    );
}


/*
 * ==================================================
 * DELETE TASK
 * ==================================================
 */

export async function deleteProjectTask(
    projectId,
    taskId
) {

    requireId(
        projectId,
        "Project ID is required."
    );


    requireId(
        taskId,
        "Task ID is required."
    );


    return apiRequest(
        `/api/projects/${encodeURIComponent(
            projectId
        )}/tasks/${encodeURIComponent(
            taskId
        )}`,
        {
            method: "DELETE",
        }
    );
}
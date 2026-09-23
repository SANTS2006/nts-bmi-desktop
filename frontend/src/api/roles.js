import { apiRequest } from "./client";


/*
 * ==================================================
 * GET ALL ROLES
 * ==================================================
 */

export async function getRoles() {
    return apiRequest("/api/roles", {
        method: "GET",
    });
}


/*
 * ==================================================
 * GET ROLE BY ID
 * ==================================================
 */

export async function getRoleById(roleId) {
    return apiRequest(
        `/api/roles/${roleId}`,
        {
            method: "GET",
        }
    );
}


/*
 * ==================================================
 * CREATE ROLE
 * ==================================================
 */

export async function createRole({
    name,
    description,
}) {
    return apiRequest("/api/roles", {
        method: "POST",

        body: {
            name,
            description,
        },
    });
}


/*
 * ==================================================
 * UPDATE ROLE
 * ==================================================
 */

export async function updateRole(
    roleId,
    {
        name,
        description,
    }
) {
    return apiRequest(
        `/api/roles/${roleId}`,
        {
            method: "PATCH",

            body: {
                name,
                description,
            },
        }
    );
}


/*
 * ==================================================
 * DELETE ROLE
 * ==================================================
 */

export async function deleteRole(
    roleId
) {
    return apiRequest(
        `/api/roles/${roleId}`,
        {
            method: "DELETE",
        }
    );
}


/*
 * ==================================================
 * GET ROLE PERMISSIONS
 * ==================================================
 */

export async function getRolePermissions(
    roleId
) {
    return apiRequest(
        `/api/roles/${roleId}/permissions`,
        {
            method: "GET",
        }
    );
}


/*
 * ==================================================
 * ASSIGN PERMISSION
 * ==================================================
 */

export async function assignPermission(
    roleId,
    permissionId
) {
    return apiRequest(
        `/api/roles/${roleId}/permissions`,
        {
            method: "POST",

            body: {
                permissionId,
            },
        }
    );
}


/*
 * ==================================================
 * REMOVE PERMISSION
 * ==================================================
 */

export async function removePermission(
    roleId,
    permissionId
) {
    return apiRequest(
        `/api/roles/${roleId}/permissions/${permissionId}`,
        {
            method: "DELETE",
        }
    );
}

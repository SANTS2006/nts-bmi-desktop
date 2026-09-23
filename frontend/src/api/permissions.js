import { apiRequest } from "./client";


/*
 * ==================================================
 * GET ALL PERMISSIONS
 * ==================================================
 */

export async function getPermissions() {
    return apiRequest("/api/permissions", {
        method: "GET",
    });
}


/*
 * ==================================================
 * GET PERMISSION BY ID
 * ==================================================
 */

export async function getPermissionById(
    permissionId
) {
    return apiRequest(
        `/api/permissions/${permissionId}`,
        {
            method: "GET",
        }
    );
}


/*
 * ==================================================
 * CREATE PERMISSION
 * ==================================================
 */

export async function createPermission({
    name,
    description,
}) {
    return apiRequest("/api/permissions", {
        method: "POST",

        body: {
            name,
            description,
        },
    });
}


/*
 * ==================================================
 * UPDATE PERMISSION
 * ==================================================
 */

export async function updatePermission(
    permissionId,
    {
        name,
        description,
    }
) {
    return apiRequest(
        `/api/permissions/${permissionId}`,
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
 * DELETE PERMISSION
 * ==================================================
 */

export async function deletePermission(
    permissionId
) {
    return apiRequest(
        `/api/permissions/${permissionId}`,
        {
            method: "DELETE",
        }
    );
}
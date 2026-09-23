import { apiRequest } from "./client.js";


/*
 * ==================================================
 * GET ALL DEPARTMENTS
 * ==================================================
 */

export async function getDepartments() {

    const response =
        await apiRequest(
            "/api/departments"
        );

    return response.data;

}


/*
 * ==================================================
 * GET DEPARTMENT BY ID
 * ==================================================
 */

export async function getDepartment(
    departmentId
) {

    const response =
        await apiRequest(
            `/api/departments/${departmentId}`
        );

    return response.data;

}


/*
 * ==================================================
 * CREATE DEPARTMENT
 * ==================================================
 */

export async function createDepartment(
    data
) {

    const response =
        await apiRequest(
            "/api/departments",
            {
                method: "POST",
                body: data,
            }
        );

    return response.data;

}


/*
 * ==================================================
 * UPDATE DEPARTMENT
 * ==================================================
 */

export async function updateDepartment(
    departmentId,
    data
) {

    const response =
        await apiRequest(
            `/api/departments/${departmentId}`,
            {
                method: "PATCH",
                body: data,
            }
        );

    return response.data;

}


/*
 * ==================================================
 * DELETE DEPARTMENT
 * ==================================================
 */

export async function deleteDepartment(
    departmentId
) {

    const response =
        await apiRequest(
            `/api/departments/${departmentId}`,
            {
                method: "DELETE",
            }
        );

    return response.data;

}


/*
 * ==================================================
 * ASSIGN DEPARTMENT HEAD
 * ==================================================
 */

export async function assignDepartmentHead(
    departmentId,
    userId
) {

    const response =
        await apiRequest(
            `/api/departments/${departmentId}/head`,
            {
                method: "PATCH",
                body: {
                    userId,
                },
            }
        );

    return response.data;

}


/*
 * ==================================================
 * REMOVE DEPARTMENT HEAD
 * ==================================================
 */

export async function removeDepartmentHead(
    departmentId
) {

    const response =
        await apiRequest(
            `/api/departments/${departmentId}/head`,
            {
                method: "DELETE",
            }
        );

    return response.data;

}


/*
 * ==================================================
 * ADD DEPARTMENT MEMBER
 * ==================================================
 */

export async function addDepartmentMember(
    departmentId,
    userId
) {

    const response =
        await apiRequest(
            `/api/departments/${departmentId}/members`,
            {
                method: "POST",
                body: {
                    userId,
                },
            }
        );

    return response.data;

}


/*
 * ==================================================
 * REMOVE DEPARTMENT MEMBER
 * ==================================================
 */

export async function removeDepartmentMember(
    departmentId,
    userId
) {

    const response =
        await apiRequest(
            `/api/departments/${departmentId}/members/${userId}`,
            {
                method: "DELETE",
            }
        );

    return response.data;

}
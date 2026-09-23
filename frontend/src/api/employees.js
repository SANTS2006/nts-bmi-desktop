import { apiRequest } from "./client.js";

/*
 * Employee Management API
 *
 * This module deliberately uses the existing User/Department/Role
 * backend contracts. No new backend endpoints are assumed.
 */

export async function getEmployees({ page = 1, limit = 20 } = {}) {
    const response = await apiRequest(
        `/api/users?page=${page}&limit=${limit}`,
        { method: "GET" }
    );

    return response?.data ?? response;
}

export async function getEmployee(employeeId) {
    const response = await apiRequest(
        `/api/users/${employeeId}`,
        { method: "GET" }
    );

    return response?.data ?? response;
}

export async function updateEmployee(employeeId, data) {
    const response = await apiRequest(
        `/api/users/${employeeId}`,
        {
            method: "PATCH",
            body: data,
        }
    );

    return response?.data ?? response;
}

export async function updateEmployeeStatus(employeeId, status) {
    const response = await apiRequest(
        `/api/users/${employeeId}/status`,
        {
            method: "PATCH",
            body: { status },
        }
    );

    return response?.data ?? response;
}

export async function getDepartments() {
    const response = await apiRequest(
        "/api/departments",
        { method: "GET" }
    );

    return response?.data ?? response;
}

export async function getDepartment(departmentId) {
    const response = await apiRequest(
        `/api/departments/${departmentId}`,
        { method: "GET" }
    );

    return response?.data ?? response;
}

export async function addEmployeeToDepartment(
    departmentId,
    employeeId
) {
    const response = await apiRequest(
        `/api/departments/${departmentId}/members`,
        {
            method: "POST",
            body: { userId: employeeId },
        }
    );

    return response?.data ?? response;
}

export async function removeEmployeeFromDepartment(
    departmentId,
    employeeId
) {
    const response = await apiRequest(
        `/api/departments/${departmentId}/members/${employeeId}`,
        {
            method: "DELETE",
        }
    );

    return response?.data ?? response;
}

export async function getRoles() {
    const response = await apiRequest(
        "/api/roles",
        { method: "GET" }
    );

    return response?.data ?? response;
}

export async function assignRole(employeeId, roleId) {
    const response = await apiRequest(
        `/api/users/${employeeId}/roles`,
        {
            method: "POST",
            body: { roleId },
        }
    );

    return response?.data ?? response;
}

export async function removeRole(employeeId, roleId) {
    const response = await apiRequest(
        `/api/users/${employeeId}/roles/${roleId}`,
        {
            method: "DELETE",
        }
    );

    return response?.data ?? response;
}

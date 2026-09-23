import {
    apiRequest,
} from "./client.js";


/*
 * ==================================================
 * GET EMPLOYEES
 * ==================================================
 */

export async function getEmployees({

    page = 1,

    limit = 20,

    search = "",

    status = "",

    employmentType = "",

} = {}) {

    const params =
        new URLSearchParams();


    params.set(
        "page",
        String(page)
    );


    params.set(
        "limit",
        String(limit)
    );


    if (
        search?.trim()
    ) {

        params.set(
            "search",
            search.trim()
        );

    }


    if (
        status &&
        status !== "ALL"
    ) {

        params.set(
            "status",
            status
        );

    }


    if (
        employmentType &&
        employmentType !== "ALL"
    ) {

        params.set(
            "employmentType",
            employmentType
        );

    }


    const response =
        await apiRequest(
            `/api/employees?${params.toString()}`,
            {
                method:
                    "GET",
            }
        );


    return {

        employees:
            response?.data ?? [],

        pagination:
            response?.pagination ?? null,

    };

}


/*
 * ==================================================
 * GET EMPLOYEE
 * ==================================================
 */

export async function getEmployee(
    employeeId
) {

    if (!employeeId) {

        throw new Error(
            "Employee ID is required."
        );

    }


    const response =
        await apiRequest(
            `/api/employees/${encodeURIComponent(
                employeeId
            )}`,
            {
                method:
                    "GET",
            }
        );


    return response.data;

}


/*
 * ==================================================
 * CREATE EMPLOYEE
 * ==================================================
 */

export async function createEmployee(
    data
) {

    const response =
        await apiRequest(
            "/api/employees",
            {

                method:
                    "POST",

                body:
                    data,

            }
        );


    return response.data;

}


/*
 * ==================================================
 * UPDATE EMPLOYEE
 * ==================================================
 */

export async function updateEmployee(
    employeeId,
    data
) {

    if (!employeeId) {

        throw new Error(
            "Employee ID is required."
        );

    }


    const response =
        await apiRequest(
            `/api/employees/${encodeURIComponent(
                employeeId
            )}`,
            {

                method:
                    "PATCH",

                body:
                    data,

            }
        );


    return response.data;

}


/*
 * ==================================================
 * DELETE EMPLOYEE
 * ==================================================
 */

export async function deleteEmployee(
    employeeId
) {

    if (!employeeId) {

        throw new Error(
            "Employee ID is required."
        );

    }


    const response =
        await apiRequest(
            `/api/employees/${encodeURIComponent(
                employeeId
            )}`,
            {

                method:
                    "DELETE",

            }
        );


    return response.data;

}
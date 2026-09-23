import { apiRequest } from "./client";


/*
 * ==================================================
 * GET AUDIT LOGS
 * ==================================================
 *
 * Returns paginated audit logs.
 *
 * Backend:
 *
 * GET /api/audit?page=1&limit=20
 *
 */

export async function getAuditLogs({
    page = 1,
    limit = 20,
} = {}) {

    if (
        !Number.isInteger(page) ||
        page < 1
    ) {
        throw new Error(
            "Invalid audit log page."
        );
    }


    if (
        !Number.isInteger(limit) ||
        limit < 1
    ) {
        throw new Error(
            "Invalid audit log limit."
        );
    }


    return apiRequest(
        `/api/audit-logs?page=${page}&limit=${limit}`,
        {
            method: "GET",
        }
    );

}
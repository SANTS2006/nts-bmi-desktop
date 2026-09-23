import { apiRequest } from "./client";

/*
 * ==================================================
 * GET CURRENT SESSION
 * ==================================================
 */

export async function getCurrentSession() {
    return apiRequest(
        "/api/sessions/current",
        {
            method: "GET",
        }
    );
}


/*
 * ==================================================
 * GET ALL ACTIVE SESSIONS
 * ==================================================
 */

export async function getSessions() {
    return apiRequest(
        "/api/sessions",
        {
            method: "GET",
        }
    );
}


/*
 * ==================================================
 * REVOKE ONE SESSION
 * ==================================================
 */

export async function revokeSession(
    sessionId
) {
    if (!sessionId) {
        throw new Error(
            "Session ID is required."
        );
    }

    return apiRequest(
        `/api/sessions/${sessionId}`,
        {
            method: "DELETE",
        }
    );
}


/*
 * ==================================================
 * REVOKE ALL SESSIONS
 * ==================================================
 */

export async function revokeAllSessions() {
    return apiRequest(
        "/api/sessions",
        {
            method: "DELETE",
        }
    );
}
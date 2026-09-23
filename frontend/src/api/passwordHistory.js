import {
    apiRequest,
} from "./client";


/*
 * ==================================================
 * GET PASSWORD HISTORY
 * ==================================================
 */

export async function getPasswordHistory() {

    return apiRequest(
        "/api/password-history",
        {
            method: "GET",
        }
    );

}
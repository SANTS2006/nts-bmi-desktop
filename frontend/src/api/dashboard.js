import {
    apiRequest,
} from "./client.js";


/*
 * ==================================================
 * GET DASHBOARD OVERVIEW
 * ==================================================
 */

export async function getDashboardOverview() {

    const response =
        await apiRequest(
            "/api/dashboard",
            {
                method: "GET",
            }
        );


    if (
        !response?.success ||
        !response?.data
    ) {
        throw new Error(
            "Invalid dashboard response."
        );
    }


    return response.data;
}
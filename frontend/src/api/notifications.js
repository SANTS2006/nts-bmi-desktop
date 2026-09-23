import {
    apiRequest,
} from "./client";


/*
 * ==================================================
 * GET NOTIFICATIONS
 * ==================================================
 */

export async function getNotifications(
    limit = 20
) {

    return apiRequest(
        `/api/notifications?limit=${limit}`,
        {
            method: "GET",
        }
    );

}


/*
 * ==================================================
 * GET UNREAD COUNT
 * ==================================================
 */

export async function getUnreadNotificationCount() {

    return apiRequest(
        "/api/notifications/unread-count",
        {
            method: "GET",
        }
    );

}


/*
 * ==================================================
 * MARK ONE AS READ
 * ==================================================
 */

export async function markNotificationAsRead(
    notificationId
) {

    return apiRequest(
        `/api/notifications/${notificationId}/read`,
        {
            method: "PATCH",
        }
    );

}


/*
 * ==================================================
 * MARK ALL AS READ
 * ==================================================
 */

export async function markAllNotificationsAsRead() {

    return apiRequest(
        "/api/notifications/read-all",
        {
            method: "PATCH",
        }
    );

}
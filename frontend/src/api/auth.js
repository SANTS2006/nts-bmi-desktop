import {
    apiRequest,
    getCsrfToken,
} from "./client";


/*
 * ==================================================
 * INITIALIZE AUTH
 * ==================================================
 */

export async function initializeAuth() {

    return getCsrfToken();

}


/*
 * ==================================================
 * REGISTER
 * ==================================================
 */

export async function registerUser({

    firstName,

    lastName,

    email,

    password,

}) {

    return apiRequest(
        "/api/auth/register",
        {
            method: "POST",

            body: {
                firstName,
                lastName,
                email,
                password,
            },

        }
    );

}


/*
 * ==================================================
 * LOGIN
 * ==================================================
 */

export async function loginUser({

    email,

    password,

}) {

    return apiRequest(
        "/api/auth/login",
        {
            method: "POST",

            body: {
                email,
                password,
            },

        }
    );

}


/*
 * ==================================================
 * LOGOUT
 * ==================================================
 */

export async function logoutUser() {

    return apiRequest(
        "/api/auth/logout",
        {
            method: "POST",
        }
    );

}


/*
 * ==================================================
 * SWITCH ACTIVE ROLE
 * ==================================================
 */

export async function switchActiveRole(
    roleId
) {

    if (!roleId) {

        throw new Error(
            "Role ID is required."
        );

    }


    return apiRequest(
        "/api/auth/switch-role",
        {
            method: "POST",

            body: {
                roleId,
            },

        }
    );

}


/*
 * ==================================================
 * REQUEST PASSWORD RESET
 * ==================================================
 */

export async function requestPasswordReset(
    email
) {

    return apiRequest(
        "/api/auth/forgot-password",
        {
            method: "POST",

            body: {
                email,
            },

        }
    );

}


/*
 * ==================================================
 * RESET PASSWORD
 * ==================================================
 */

export async function resetPassword({

    token,

    newPassword,

}) {

    if (!token) {

        throw new Error(
            "Password reset token is required."
        );

    }


    return apiRequest(
        "/api/auth/reset-password",
        {
            method: "POST",

            body: {
                token,
                newPassword,
            },

        }
    );

}

export async function getPasswordHistory() {

    return apiRequest(
        "/api/password-history",
        {
            method: "GET",
        }
    );

}
import {
    apiRequest,
    getCsrfToken,
} from "./client";


/*
 * ==================================================
 * GET USERS
 * ==================================================
 *
 * Returns one paginated page of users.
 *
 * Usage:
 *
 * getUsers()
 * getUsers({ page: 2 })
 * getUsers({ page: 1, limit: 50 })
 *
 * The API response is returned unchanged so existing
 * pages/components that depend on the backend response
 * shape continue to work.
 * ==================================================
 */

export async function getUsers({
    page = 1,
    limit = 20,
} = {}) {

    const safePage =
        Number.isInteger(page) && page > 0
            ? page
            : 1;


    const safeLimit =
        Number.isInteger(limit) &&
            limit > 0 &&
            limit <= 100
            ? limit
            : 20;


    return apiRequest(
        `/api/users?page=${safePage}&limit=${safeLimit}`,
        {
            method: "GET",
        }
    );
}


/*
 * ==================================================
 * GET ALL USERS
 * ==================================================
 *
 * Retrieves all available user pages.
 *
 * This is useful for administrative UI such as:
 *
 * - Assign Department Head
 * - Add Department Member
 * - User selection dialogs
 * - Role assignment dialogs
 *
 * It keeps getUsers() paginated while providing a
 * convenient helper when the complete user collection
 * is required.
 * ==================================================
 */

export async function getAllUsers({
    limit = 100,
} = {}) {

    const safeLimit =
        Number.isInteger(limit) &&
            limit > 0 &&
            limit <= 100
            ? limit
            : 100;


    const allUsers = [];

    let page = 1;


    while (true) {

        const response =
            await getUsers({
                page,
                limit: safeLimit,
            });


        /*
         * Support common API response shapes:
         *
         * [
         *   user,
         *   user
         * ]
         *
         * {
         *   users: [...]
         * }
         *
         * {
         *   data: [...]
         * }
         *
         * {
         *   data: {
         *      users: [...]
         *   }
         * }
         */

        let users = [];


        if (
            Array.isArray(response)
        ) {

            users =
                response;

        } else if (
            Array.isArray(
                response?.users
            )
        ) {

            users =
                response.users;

        } else if (
            Array.isArray(
                response?.data
            )
        ) {

            users =
                response.data;

        } else if (
            Array.isArray(
                response?.data?.users
            )
        ) {

            users =
                response.data.users;

        }


        allUsers.push(
            ...users
        );


        /*
         * Determine whether another page exists.
         *
         * We support several common pagination
         * response shapes without changing the
         * backend contract.
         */

        const pagination =
            response?.pagination ||
            response?.meta ||
            response?.data?.pagination ||
            response?.data?.meta ||
            null;


        const currentPage =
            Number(
                pagination?.page ??
                pagination?.currentPage ??
                response?.page ??
                response?.currentPage ??
                page
            );


        const totalPages =
            Number(
                pagination?.totalPages ??
                pagination?.pages ??
                response?.totalPages ??
                response?.pages ??
                0
            );


        const total =
            Number(
                pagination?.total ??
                response?.total ??
                response?.data?.total ??
                0
            );


        /*
         * If the API explicitly gives total pages,
         * use that.
         */

        if (
            totalPages > 0
        ) {

            if (
                currentPage >= totalPages
            ) {

                break;

            }

            page =
                currentPage + 1;

            continue;

        }


        /*
         * If the API gives a total number of users,
         * calculate the number of pages.
         */

        if (
            total > 0
        ) {

            const calculatedTotalPages =
                Math.ceil(
                    total / safeLimit
                );


            if (
                currentPage >=
                calculatedTotalPages
            ) {

                break;

            }


            page =
                currentPage + 1;

            continue;

        }


        /*
         * If no pagination metadata is available,
         * infer the end from the page size.
         *
         * A page containing fewer records than the
         * requested limit is the final page.
         */

        if (
            users.length < safeLimit
        ) {

            break;

        }


        /*
         * Safety protection against an API repeatedly
         * returning the same full page.
         */

        if (
            users.length === 0
        ) {

            break;

        }


        page += 1;


        /*
         * Prevent an accidental infinite loop caused
         * by a malformed backend response.
         */

        if (
            page > 10000
        ) {

            throw new Error(
                "Unable to retrieve all users because pagination exceeded the safety limit."
            );

        }

    }


    return allUsers;

}


/*
 * ==================================================
 * GET USER BY ID
 * ==================================================
 */

export async function getUserById(
    userId
) {

    if (!userId) {

        throw new Error(
            "User ID is required."
        );

    }


    return apiRequest(
        `/api/users/${encodeURIComponent(userId)}`,
        {
            method: "GET",
        }
    );

}


/*
 * ==================================================
 * GET USER ROLES
 * ==================================================
 */

export async function getUserRoles(
    userId
) {

    if (!userId) {

        throw new Error(
            "User ID is required."
        );

    }


    return apiRequest(
        `/api/users/${encodeURIComponent(userId)}/roles`,
        {
            method: "GET",
        }
    );

}


/*
 * ==================================================
 * UPDATE USER
 * ==================================================
 *
 * Administrative update.
 *
 * Supported fields:
 *
 * - firstName
 * - lastName
 * - email
 * ==================================================
 */

export async function updateUser(
    userId,
    {
        firstName,
        lastName,
        email,
    } = {}
) {

    if (!userId) {

        throw new Error(
            "User ID is required."
        );

    }


    return apiRequest(
        `/api/users/${encodeURIComponent(userId)}`,
        {
            method: "PATCH",

            body: {
                firstName,
                lastName,
                email,
            },
        }
    );

}


/*
 * ==================================================
 * UPDATE USER STATUS
 * ==================================================
 */

export async function updateUserStatus(
    userId,
    status
) {

    if (!userId) {

        throw new Error(
            "User ID is required."
        );

    }


    if (
        !status ||
        !String(status).trim()
    ) {

        throw new Error(
            "User status is required."
        );

    }


    return apiRequest(
        `/api/users/${encodeURIComponent(userId)}/status`,
        {
            method: "PATCH",

            body: {
                status:
                    String(status).trim(),
            },
        }
    );

}


/*
 * ==================================================
 * UPDATE MY PROFILE
 * ==================================================
 */

export async function updateMyProfile({
    firstName,
    lastName,
} = {}) {

    return apiRequest(
        "/api/users/me",
        {
            method: "PATCH",

            body: {
                firstName,
                lastName,
            },
        }
    );

}


/*
 * ==================================================
 * UPLOAD MY AVATAR
 * ==================================================
 *
 * This intentionally uses fetch() rather than
 * apiRequest() because the request body is FormData.
 * ==================================================
 */

export async function uploadMyAvatar(
    file
) {

    if (!file) {

        throw new Error(
            "Please select an image."
        );

    }


    if (
        !(file instanceof File)
    ) {

        throw new Error(
            "Invalid image file."
        );

    }


    /*
     * Basic client-side validation.
     *
     * The server should still perform its own
     * validation.
     */

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
    ];


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        throw new Error(
            "Please select a valid image file."
        );

    }


    const MAX_FILE_SIZE =
        5 * 1024 * 1024;


    if (
        file.size > MAX_FILE_SIZE
    ) {

        throw new Error(
            "Profile picture must be 5 MB or smaller."
        );

    }


    const formData =
        new FormData();


    formData.append(
        "avatar",
        file
    );


    const csrfToken =
        await getCsrfToken();


    const API_BASE_URL =
        import.meta.env.VITE_API_URL ||
        "";


    const response =
        await fetch(
            `${API_BASE_URL}/api/users/me/avatar`,
            {
                method: "POST",

                credentials: "include",

                headers: {
                    Accept:
                        "application/json",

                    "X-CSRF-Token":
                        csrfToken,
                },

                body: formData,
            }
        );


    const data =
        await response
            .json()
            .catch(() => null);


    if (!response.ok) {

        const error =
            new Error(
                data?.error?.message ||
                data?.message ||
                "Unable to upload profile picture."
            );


        error.status =
            response.status;


        error.code =
            data?.error?.code;


        error.details =
            data?.error?.details ||
            [];


        throw error;

    }


    return data;

}


/*
 * ==================================================
 * DELETE MY AVATAR
 * ==================================================
 */

export async function deleteMyAvatar() {

    return apiRequest(
        "/api/users/me/avatar",
        {
            method: "DELETE",
        }
    );

}


/*
 * ==================================================
 * ASSIGN ROLE TO USER
 * ==================================================
 */

export async function assignRoleToUser(
    userId,
    {
        roleId,
        reason,
    } = {}
) {

    if (!userId) {

        throw new Error(
            "User ID is required."
        );

    }


    if (!roleId) {

        throw new Error(
            "Please select a role."
        );

    }


    if (
        !reason ||
        !reason.trim()
    ) {

        throw new Error(
            "Please provide a reason for assigning this role."
        );

    }


    return apiRequest(
        `/api/users/${encodeURIComponent(userId)}/roles`,
        {
            method: "POST",

            body: {
                roleId,

                reason:
                    reason.trim(),
            },
        }
    );

}


/*
 * ==================================================
 * REMOVE ROLE FROM USER
 * ==================================================
 */

export async function removeRoleFromUser(
    userId,
    roleId
) {

    if (!userId) {

        throw new Error(
            "User ID is required."
        );

    }


    if (!roleId) {

        throw new Error(
            "Role ID is required."
        );

    }


    return apiRequest(
        `/api/users/${encodeURIComponent(userId)}/roles/${encodeURIComponent(roleId)}`,
        {
            method: "DELETE",
        }
    );

}
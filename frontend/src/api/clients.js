/*
 * ==================================================
 * CLIENT API
 * ==================================================
 *
 * Centralized API functions for the Clients module.
 *
 * ==================================================
 */

import {
    apiRequest,
} from "./client.js";


/*
 * ==================================================
 * HELPERS
 * ==================================================
 */

function requireId(
    value,
    message
) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        throw new Error(
            message
        );

    }

}


/*
 * ==================================================
 * GET ALL CLIENTS
 * ==================================================
 */

export async function getClients() {

    return apiRequest(
        "/api/clients",
        {
            method: "GET",
        }
    );

}


/*
 * ==================================================
 * GET CLIENT BY ID
 * ==================================================
 */

export async function getClientById(
    clientId
) {

    requireId(
        clientId,
        "Client ID is required."
    );


    return apiRequest(
        `/api/clients/${encodeURIComponent(
            clientId
        )}`,
        {
            method: "GET",
        }
    );

}


/*
 * ==================================================
 * CREATE CLIENT
 * ==================================================
 */

export async function createClient({
    name,
    email,
    phone,
    address,
    website,
    isActive = true,
} = {}) {

    const clientName =
        typeof name === "string"
            ? name.trim()
            : "";


    if (!clientName) {

        throw new Error(
            "Client name is required."
        );

    }


    return apiRequest(
        "/api/clients",
        {
            method: "POST",

            body: {

                name:
                    clientName,

                email:
                    typeof email === "string" &&
                        email.trim()
                        ? email.trim()
                        : null,

                phone:
                    typeof phone === "string" &&
                        phone.trim()
                        ? phone.trim()
                        : null,

                address:
                    typeof address === "string" &&
                        address.trim()
                        ? address.trim()
                        : null,

                website:
                    typeof website === "string" &&
                        website.trim()
                        ? website.trim()
                        : null,

                isActive:
                    Boolean(isActive),

            },
        }
    );

}


/*
 * ==================================================
 * UPDATE CLIENT
 * ==================================================
 */

export async function updateClient(
    clientId,
    {
        name,
        email,
        phone,
        address,
        website,
    } = {}
) {

    requireId(
        clientId,
        "Client ID is required."
    );


    const clientName =
        typeof name === "string"
            ? name.trim()
            : "";


    if (!clientName) {

        throw new Error(
            "Client name is required."
        );

    }


    return apiRequest(
        `/api/clients/${encodeURIComponent(
            clientId
        )}`,
        {
            method: "PATCH",

            body: {

                name:
                    clientName,

                email:
                    typeof email === "string" &&
                        email.trim()
                        ? email.trim()
                        : null,

                phone:
                    typeof phone === "string" &&
                        phone.trim()
                        ? phone.trim()
                        : null,

                address:
                    typeof address === "string" &&
                        address.trim()
                        ? address.trim()
                        : null,

                website:
                    typeof website === "string" &&
                        website.trim()
                        ? website.trim()
                        : null,

            },
        }
    );

}


/*
 * ==================================================
 * UPDATE CLIENT STATUS
 * ==================================================
 */

export async function updateClientStatus(
    clientId,
    isActive
) {

    requireId(
        clientId,
        "Client ID is required."
    );


    if (
        typeof isActive !==
        "boolean"
    ) {

        throw new Error(
            "Client status must be a boolean."
        );

    }


    return apiRequest(
        `/api/clients/${encodeURIComponent(
            clientId
        )}/status`,
        {
            method: "PATCH",

            body: {
                isActive,
            },
        }
    );

}


/*
 * ==================================================
 * DELETE CLIENT
 * ==================================================
 */

export async function deleteClient(
    clientId
) {

    requireId(
        clientId,
        "Client ID is required."
    );


    return apiRequest(
        `/api/clients/${encodeURIComponent(
            clientId
        )}`,
        {
            method: "DELETE",
        }
    );

}
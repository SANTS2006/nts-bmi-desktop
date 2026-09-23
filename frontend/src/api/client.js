/*
 * ==================================================
 * NTS BMS API CLIENT
 * ==================================================
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
let csrfTokenCache = null;

export function clearCsrfToken() {
    csrfTokenCache = null;
}

export async function getCsrfToken() {
    if (csrfTokenCache) return csrfTokenCache;

    const response = await fetch(`${API_BASE_URL}/api/auth/csrf-token`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.success || !data?.data?.csrfToken) {
        throw new Error(data?.error?.message || data?.message || "Unable to initialize security protection.");
    }

    csrfTokenCache = data.data.csrfToken;
    return csrfTokenCache;
}

export async function apiRequest(url, { method = "GET", body, headers = {} } = {}) {
    const normalizedMethod = String(method).toUpperCase();
    const requestHeaders = {
        Accept: "application/json",
        ...headers,
    };

    let requestBody;

    if (body !== undefined && body !== null) {
        if (typeof FormData !== "undefined" && body instanceof FormData) {
            requestBody = body;
        } else if (typeof Blob !== "undefined" && body instanceof Blob) {
            requestBody = body;
        } else if (typeof body === "object") {
            requestHeaders["Content-Type"] = "application/json";
            requestBody = JSON.stringify(body);
        } else {
            requestBody = body;
        }
    }

    if (!["GET", "HEAD", "OPTIONS"].includes(normalizedMethod)) {
        requestHeaders["X-CSRF-Token"] = csrfTokenCache || await getCsrfToken();
    }

    let response;

    try {
        response = await fetch(`${API_BASE_URL}${url}`, {
            method: normalizedMethod,
            credentials: "include",
            headers: requestHeaders,
            body: requestBody,
        });
    } catch (cause) {
        const error = new Error("Unable to connect to the server. Please check your connection and try again.");
        error.cause = cause;
        throw error;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        if (response.status === 403) clearCsrfToken();

        const error = new Error(
            data?.error?.message ||
            data?.message ||
            "Something went wrong."
        );

        error.status = response.status;
        error.code = data?.error?.code;
        error.details = data?.error?.details || [];
        error.response = data;
        throw error;
    }

    return data;
}

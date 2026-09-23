import { apiRequest } from "./client";

/*
 * ==================================================
 * GET APPROVAL HISTORY
 * ==================================================
 */

export async function getApprovalHistory() {

    return apiRequest(
        "/api/approvals/history",
        {
            method: "GET",
        }
    );

}

/*
 * ==================================================
 * GET PENDING APPROVALS
 * ==================================================
 */

export async function getPendingApprovals() {

    return apiRequest(
        "/api/approvals",
        {
            method: "GET",
        }
    );

}


/*
 * ==================================================
 * APPROVE APPROVAL
 * ==================================================
 */

export async function approveApproval(
    approvalId
) {

    if (!approvalId) {
        throw new Error(
            "Approval ID is required."
        );
    }


    return apiRequest(
        `/api/approvals/${approvalId}/approve`,
        {
            method: "POST",
        }
    );

}


/*
 * ==================================================
 * REJECT APPROVAL
 * ==================================================
 */

export async function rejectApproval(
    approvalId,
    reason
) {

    if (!approvalId) {
        throw new Error(
            "Approval ID is required."
        );
    }


    if (
        !reason ||
        !reason.trim()
    ) {
        throw new Error(
            "A rejection reason is required."
        );
    }


    return apiRequest(
        `/api/approvals/${approvalId}/reject`,
        {
            method: "POST",

            body: {
                reason: reason.trim(),
            },
        }
    );

}
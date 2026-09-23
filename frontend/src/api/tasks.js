import {
    apiRequest,
} from "./client.js";


/*
 * ==================================================
 * INTERNAL
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


function buildQuery(
    params = {}
) {

    const query =
        new URLSearchParams();


    Object.entries(
        params
    ).forEach(
        ([key, value]) => {

            if (
                value !==
                undefined &&
                value !==
                null &&
                value !==
                ""
            ) {

                query.set(
                    key,
                    String(value)
                );

            }

        }
    );


    const result =
        query.toString();


    return result
        ? `?${result}`
        : "";
}


/*
 * ==================================================
 * GET TASKS
 * ==================================================
 */

export async function getTasks({

    page = 1,

    limit = 20,

    search = "",

    projectId = "",

    milestoneId = "",

    parentTaskId = "",

    assigneeId = "",

    status = "",

    priority = "",

    rootOnly = false,

    sortBy = "createdAt",

    sortOrder = "desc",

} = {}) {

    const safeLimit =
        Math.min(
            100,
            Math.max(
                1,
                Number(limit) || 20
            )
        );


    return apiRequest(

        `/api/tasks${buildQuery({

            page,

            limit:
                safeLimit,

            search:
                search?.trim(),

            projectId,

            milestoneId,

            parentTaskId,

            assigneeId,

            status,

            priority,

            rootOnly:
                rootOnly
                    ? "true"
                    : undefined,

            sortBy,

            sortOrder,

        })}`,

        {
            method: "GET",
        }

    );
}


/*
 * ==================================================
 * GET TASK
 * ==================================================
 */

export async function getTaskById(
    taskId
) {

    requireId(
        taskId,
        "Task ID is required."
    );


    return apiRequest(

        `/api/tasks/${encodeURIComponent(
            taskId
        )}`,

        {
            method: "GET",
        }

    );
}


/*
 * ==================================================
 * CREATE TASK
 * ==================================================
 */

export async function createTask(
    data = {}
) {

    if (
        !data.projectId
    ) {

        throw new Error(
            "Project is required."
        );

    }


    if (
        !data.title?.trim()
    ) {

        throw new Error(
            "Task title is required."
        );

    }


    return apiRequest(

        "/api/tasks",

        {
            method: "POST",

            body: {

                projectId:
                    data.projectId,

                milestoneId:
                    data.milestoneId ||
                    null,

                parentTaskId:
                    data.parentTaskId ||
                    null,

                title:
                    data.title.trim(),

                description:
                    data.description?.trim() ||
                    null,

                status:
                    data.status ||
                    "TODO",

                priority:
                    data.priority ||
                    "NORMAL",

                assigneeId:
                    data.assigneeId ||
                    null,

                dueDate:
                    data.dueDate ||
                    null,

                estimatedHours:
                    data.estimatedHours ===
                        "" ||
                        data.estimatedHours ===
                        null ||
                        data.estimatedHours ===
                        undefined
                        ? null
                        : Number(
                            data.estimatedHours
                        ),

            },

        }

    );
}


/*
 * ==================================================
 * UPDATE TASK
 * ==================================================
 */

export async function updateTask(
    taskId,
    data = {}
) {

    requireId(
        taskId,
        "Task ID is required."
    );


    return apiRequest(

        `/api/tasks/${encodeURIComponent(
            taskId
        )}`,

        {

            method:
                "PATCH",

            body: {

                ...(data.projectId !==
                    undefined && {
                    projectId:
                        data.projectId,
                }),

                ...(data.milestoneId !==
                    undefined && {
                    milestoneId:
                        data.milestoneId ||
                        null,
                }),

                ...(data.parentTaskId !==
                    undefined && {
                    parentTaskId:
                        data.parentTaskId ||
                        null,
                }),

                ...(data.title !==
                    undefined && {
                    title:
                        data.title.trim(),
                }),

                ...(data.description !==
                    undefined && {
                    description:
                        data.description?.trim() ||
                        null,
                }),

                ...(data.status !==
                    undefined && {
                    status:
                        data.status,
                }),

                ...(data.priority !==
                    undefined && {
                    priority:
                        data.priority,
                }),

                ...(data.assigneeId !==
                    undefined && {
                    assigneeId:
                        data.assigneeId ||
                        null,
                }),

                ...(data.dueDate !==
                    undefined && {
                    dueDate:
                        data.dueDate ||
                        null,
                }),

                ...(data.estimatedHours !==
                    undefined && {
                    estimatedHours:
                        data.estimatedHours ===
                            "" ||
                            data.estimatedHours ===
                            null
                            ? null
                            : Number(
                                data.estimatedHours
                            ),
                }),

                ...(data.actualHours !==
                    undefined && {
                    actualHours:
                        data.actualHours ===
                            "" ||
                            data.actualHours ===
                            null
                            ? null
                            : Number(
                                data.actualHours
                            ),
                }),

            },

        }

    );
}


/*
 * ==================================================
 * DELETE TASK
 * ==================================================
 */

export async function deleteTask(
    taskId
) {

    requireId(
        taskId,
        "Task ID is required."
    );


    return apiRequest(

        `/api/tasks/${encodeURIComponent(
            taskId
        )}`,

        {
            method:
                "DELETE",
        }

    );
}


/*
 * ==================================================
 * UPDATE STATUS
 * ==================================================
 */

export async function updateTaskStatus(
    taskId,
    status
) {

    requireId(
        taskId,
        "Task ID is required."
    );


    return apiRequest(

        `/api/tasks/${encodeURIComponent(
            taskId
        )}/status`,

        {

            method:
                "PATCH",

            body: {
                status,
            },

        }

    );
}


/*
 * ==================================================
 * ASSIGN TASK
 * ==================================================
 */

export async function assignTask(
    taskId,
    assigneeId
) {

    requireId(
        taskId,
        "Task ID is required."
    );


    return apiRequest(

        `/api/tasks/${encodeURIComponent(
            taskId
        )}/assignee`,

        {

            method:
                "PATCH",

            body: {

                assigneeId:
                    assigneeId ||
                    null,

            },

        }

    );
}


/*
 * ==================================================
 * GET PROJECT TASKS
 * ==================================================
 */

export async function getProjectTasks(
    projectId,
    options = {}
) {

    requireId(
        projectId,
        "Project ID is required."
    );


    return getTasks({

        ...options,

        projectId,

    });
}


/*
 * ==================================================
 * CREATE SUBTASK
 * ==================================================
 */

export async function createSubtask(
    taskId,
    data = {}
) {

    requireId(
        taskId,
        "Task ID is required."
    );


    if (
        !data.title?.trim()
    ) {

        throw new Error(
            "Subtask title is required."
        );

    }


    return apiRequest(

        `/api/tasks/${encodeURIComponent(
            taskId
        )}/subtasks`,

        {

            method:
                "POST",

            body: {

                milestoneId:
                    data.milestoneId ||
                    null,

                title:
                    data.title.trim(),

                description:
                    data.description?.trim() ||
                    null,

                status:
                    data.status ||
                    "TODO",

                priority:
                    data.priority ||
                    "NORMAL",

                assigneeId:
                    data.assigneeId ||
                    null,

                dueDate:
                    data.dueDate ||
                    null,

                estimatedHours:
                    data.estimatedHours ===
                        "" ||
                        data.estimatedHours ===
                        null ||
                        data.estimatedHours ===
                        undefined
                        ? null
                        : Number(
                            data.estimatedHours
                        ),

            },

        }

    );
}


/*
 * ==================================================
 * UPDATE SUBTASK
 * ==================================================
 */

export async function updateSubtask(
    taskId,
    subtaskId,
    data = {}
) {

    requireId(
        taskId,
        "Task ID is required."
    );


    requireId(
        subtaskId,
        "Subtask ID is required."
    );


    return apiRequest(

        `/api/tasks/${encodeURIComponent(
            taskId
        )}/subtasks/${encodeURIComponent(
            subtaskId
        )}`,

        {

            method:
                "PATCH",

            body: {

                ...(data.milestoneId !==
                    undefined && {
                    milestoneId:
                        data.milestoneId ||
                        null,
                }),

                ...(data.title !==
                    undefined && {
                    title:
                        data.title.trim(),
                }),

                ...(data.description !==
                    undefined && {
                    description:
                        data.description?.trim() ||
                        null,
                }),

                ...(data.status !==
                    undefined && {
                    status:
                        data.status,
                }),

                ...(data.priority !==
                    undefined && {
                    priority:
                        data.priority,
                }),

                ...(data.assigneeId !==
                    undefined && {
                    assigneeId:
                        data.assigneeId ||
                        null,
                }),

                ...(data.dueDate !==
                    undefined && {
                    dueDate:
                        data.dueDate ||
                        null,
                }),

                ...(data.estimatedHours !==
                    undefined && {
                    estimatedHours:
                        data.estimatedHours ===
                            "" ||
                            data.estimatedHours ===
                            null
                            ? null
                            : Number(
                                data.estimatedHours
                            ),
                }),

                ...(data.actualHours !==
                    undefined && {
                    actualHours:
                        data.actualHours ===
                            "" ||
                            data.actualHours ===
                            null
                            ? null
                            : Number(
                                data.actualHours
                            ),
                }),

            },

        }

    );
}


/*
 * ==================================================
 * DELETE SUBTASK
 * ==================================================
 */

export async function deleteSubtask(
    taskId,
    subtaskId
) {

    requireId(
        taskId,
        "Task ID is required."
    );


    requireId(
        subtaskId,
        "Subtask ID is required."
    );


    return apiRequest(

        `/api/tasks/${encodeURIComponent(
            taskId
        )}/subtasks/${encodeURIComponent(
            subtaskId
        )}`,

        {
            method:
                "DELETE",
        }

    );
}
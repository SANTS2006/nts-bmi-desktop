import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Circle,
    CircleAlert,
    Clock3,
    ListTodo,
    Pencil,
    Plus,
    Trash2,
    UserRound,
    X,
} from "lucide-react";

import {
    getTaskById,
    updateTask,
    deleteTask,
    createSubtask,
    updateSubtask,
    deleteSubtask,
} from "../api/tasks.js";

import {
    getProjectById,
} from "../api/projects.js";

import {
    apiRequest,
} from "../api/client.js";


const STATUS_OPTIONS = [
    "TODO",
    "IN_PROGRESS",
    "BLOCKED",
    "REVIEW",
    "DONE",
    "CANCELLED",
];


const PRIORITY_OPTIONS = [
    "LOW",
    "NORMAL",
    "HIGH",
    "CRITICAL",
];


const EMPTY_SUBTASK = {
    title: "",
    description: "",
    status: "TODO",
    priority: "NORMAL",
    assigneeId: "",
    dueDate: "",
    estimatedHours: "",
};


/* =========================================================
 * HELPERS
 * ========================================================= */

function getData(response) {
    return response?.data ?? response;
}


function getUsers(response) {
    const data = getData(response);

    if (Array.isArray(data?.users)) {
        return data.users;
    }

    if (Array.isArray(response?.users)) {
        return response.users;
    }

    if (Array.isArray(data)) {
        return data;
    }

    return [];
}


function getProjectMembers(response) {
    const data = getData(response);

    if (Array.isArray(data?.members)) {
        return data.members;
    }

    if (Array.isArray(response?.members)) {
        return response.members;
    }

    return [];
}


function getErrorMessage(
    error,
    fallback = "Something went wrong."
) {
    if (!error) {
        return fallback;
    }

    if (typeof error === "string") {
        return error;
    }

    if (error?.message) {
        return error.message;
    }

    if (
        Array.isArray(error?.details) &&
        error.details.length
    ) {
        return error.details
            .map(
                (item) =>
                    item?.message
            )
            .filter(Boolean)
            .join(", ");
    }

    return fallback;
}


function formatStatus(value) {
    return String(value || "")
        .replaceAll("_", " ")
        .replace(
            /\b\w/g,
            (char) => char.toUpperCase()
        );
}


function statusClass(status) {
    switch (status) {
        case "DONE":
            return "bg-emerald-500/10 text-emerald-600";

        case "IN_PROGRESS":
            return "bg-blue-500/10 text-blue-600";

        case "BLOCKED":
            return "bg-red-500/10 text-red-600";

        case "REVIEW":
            return "bg-purple-500/10 text-purple-600";

        case "CANCELLED":
            return "bg-gray-500/10 text-gray-600";

        default:
            return "bg-amber-500/10 text-amber-600";
    }
}


function priorityClass(priority) {
    switch (priority) {
        case "CRITICAL":
            return "text-red-600";

        case "HIGH":
            return "text-orange-600";

        case "LOW":
            return "text-[var(--bms-text-muted)]";

        default:
            return "text-blue-600";
    }
}


function getUserName(user) {
    if (!user) {
        return "Unassigned";
    }

    return (
        `${user.firstName || ""} ${user.lastName || ""}`
            .trim() ||
        user.email ||
        "Unknown user"
    );
}


/*
 * Extract a user's ID from a project membership.
 *
 * Supported membership shapes:
 *
 * {
 *     userId: "..."
 * }
 *
 * or:
 *
 * {
 *     user: {
 *         id: "..."
 *     }
 * }
 */
function getMemberUserId(member) {
    return (
        member?.userId ||
        member?.user?.id ||
        null
    );
}


/*
 * Return only users who belong to the selected project.
 */
function getUsersFromProjectMembers(
    users,
    members
) {
    const memberIds = new Set(
        members
            .map(getMemberUserId)
            .filter(Boolean)
    );

    return users.filter(
        (user) =>
            memberIds.has(user.id)
    );
}


/* =========================================================
 * STYLES
 * ========================================================= */

const inputClass = `
    h-10
    w-full
    rounded-lg
    border
    border-[var(--bms-border)]
    bg-[var(--bms-surface-soft)]
    px-3
    text-sm
    text-[var(--bms-text)]
    outline-none
    transition
    placeholder:text-[var(--bms-text-muted)]
    focus:border-blue-500
    focus:ring-2
    focus:ring-blue-500/10
`;


const textareaClass = `
    w-full
    resize-none
    rounded-lg
    border
    border-[var(--bms-border)]
    bg-[var(--bms-surface-soft)]
    px-3
    py-2.5
    text-sm
    text-[var(--bms-text)]
    outline-none
    transition
    placeholder:text-[var(--bms-text-muted)]
    focus:border-blue-500
    focus:ring-2
    focus:ring-blue-500/10
`;


const primaryButton = `
    inline-flex
    items-center
    justify-center
    gap-2
    rounded-lg
    bg-blue-600
    px-4
    py-2.5
    text-sm
    font-medium
    text-white
    transition
    hover:bg-blue-700
    disabled:cursor-not-allowed
    disabled:opacity-50
`;


const secondaryButton = `
    inline-flex
    items-center
    justify-center
    gap-2
    rounded-lg
    border
    border-[var(--bms-border)]
    px-4
    py-2.5
    text-sm
    font-medium
    text-[var(--bms-text-secondary)]
    transition
    hover:bg-[var(--bms-surface-soft)]
    disabled:cursor-not-allowed
    disabled:opacity-50
`;


/* =========================================================
 * MAIN
 * ========================================================= */

export default function TaskDetails() {
    const {
        taskId,
        id,
    } = useParams();

    const actualTaskId =
        taskId || id;

    const navigate =
        useNavigate();


    const [task, setTask] =
        useState(null);

    const [users, setUsers] =
        useState([]);


    /*
     * Members belonging to the project that owns
     * the current task.
     *
     * These are the only users allowed to appear
     * in the subtask Assignee dropdown.
     */
    const [projectMembers, setProjectMembers] =
        useState([]);

    const [
        projectMembersLoading,
        setProjectMembersLoading,
    ] = useState(false);


    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [editing, setEditing] =
        useState(false);

    const [form, setForm] =
        useState({});


    const [subtaskModal, setSubtaskModal] =
        useState(false);

    const [editingSubtask, setEditingSubtask] =
        useState(null);

    const [subtaskForm, setSubtaskForm] =
        useState({
            ...EMPTY_SUBTASK,
        });


    const [deleteTarget, setDeleteTarget] =
        useState(null);

    const [deleteLoading, setDeleteLoading] =
        useState(false);


    /* =====================================================
     * USERS
     * ===================================================== */

    const loadUsers = useCallback(
        async () => {
            try {
                const response =
                    await apiRequest(
                        "/api/users?page=1&limit=100",
                        {
                            method: "GET",
                        }
                    );

                setUsers(
                    getUsers(response)
                );
            } catch (err) {
                console.error(
                    "Failed to load users:",
                    err
                );
            }
        },
        []
    );


    /* =====================================================
     * PROJECT MEMBERS
     * ===================================================== */

    /*
     * Load only the members of the project to which
     * the parent task belongs.
     *
     * The parent task is the source of truth because
     * subtasks belong to this task.
     */
    const loadProjectMembers =
        useCallback(
            async (projectId) => {
                if (!projectId) {
                    setProjectMembers([]);
                    return;
                }

                try {
                    setProjectMembersLoading(
                        true
                    );

                    const response =
                        await getProjectById(
                            projectId
                        );

                    const members =
                        getProjectMembers(
                            response
                        );

                    setProjectMembers(
                        members
                    );
                } catch (err) {
                    console.error(
                        "Failed to load project members:",
                        err
                    );

                    setProjectMembers([]);
                } finally {
                    setProjectMembersLoading(
                        false
                    );
                }
            },
            []
        );


    /*
     * Only users belonging to the current task's
     * project are available for subtask assignment.
     */
    const subtaskAssigneeUsers =
        useMemo(() => {
            return getUsersFromProjectMembers(
                users,
                projectMembers
            );
        }, [
            users,
            projectMembers,
        ]);


    /* =====================================================
     * TASK
     * ===================================================== */

    const loadTask = useCallback(
        async () => {
            if (!actualTaskId) {
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response =
                    await getTaskById(
                        actualTaskId
                    );

                const data =
                    getData(response);

                setTask(data);

                setForm({
                    title:
                        data?.title ||
                        "",

                    description:
                        data?.description ||
                        "",

                    status:
                        data?.status ||
                        "TODO",

                    priority:
                        data?.priority ||
                        "NORMAL",

                    assigneeId:
                        data?.assigneeId ||
                        "",

                    dueDate:
                        data?.dueDate
                            ? String(
                                data.dueDate
                            ).slice(0, 10)
                            : "",

                    estimatedHours:
                        data?.estimatedHours ??
                        "",
                });

                /*
                 * Once the task is loaded, determine the
                 * project and load its members.
                 */
                const projectId =
                    data?.projectId ||
                    data?.project?.id ||
                    data?.project?.projectId ||
                    null;

                if (projectId) {
                    await loadProjectMembers(
                        projectId
                    );
                } else {
                    setProjectMembers([]);
                }
            } catch (err) {
                console.error(
                    "Failed to load task:",
                    err
                );

                setError(
                    getErrorMessage(
                        err,
                        "Unable to load task."
                    )
                );
            } finally {
                setLoading(false);
            }
        },
        [
            actualTaskId,
            loadProjectMembers,
        ]
    );


    useEffect(() => {
        loadTask();
        loadUsers();
    }, [
        loadTask,
        loadUsers,
    ]);


    /* =====================================================
     * UPDATE TASK
     * ===================================================== */

    async function handleUpdate(event) {
        event.preventDefault();

        if (!form.title?.trim()) {
            setError(
                "Task title is required."
            );

            return;
        }

        try {
            setSaving(true);
            setError("");

            await updateTask(
                actualTaskId,
                {
                    ...form,

                    title:
                        form.title.trim(),

                    description:
                        form.description?.trim() ||
                        null,

                    assigneeId:
                        form.assigneeId ||
                        null,

                    dueDate:
                        form.dueDate ||
                        null,

                    estimatedHours:
                        form.estimatedHours === ""
                            ? null
                            : Number(
                                form.estimatedHours
                            ),
                }
            );

            setEditing(false);

            await loadTask();
        } catch (err) {
            console.error(
                "Failed to update task:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Unable to update task."
                )
            );
        } finally {
            setSaving(false);
        }
    }


    /* =====================================================
     * DELETE TASK
     * ===================================================== */

    async function handleDeleteTask() {
        try {
            setDeleteLoading(true);

            await deleteTask(
                actualTaskId
            );

            navigate("/tasks");
        } catch (err) {
            console.error(
                "Failed to delete task:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Unable to delete task."
                )
            );

            setDeleteTarget(null);
        } finally {
            setDeleteLoading(false);
        }
    }


    /* =====================================================
     * SUBTASK
     * ===================================================== */

    async function openCreateSubtask() {
        setEditingSubtask(null);

        setSubtaskForm({
            ...EMPTY_SUBTASK,
        });

        setError("");

        /*
         * Make sure the current task's project members
         * are available before opening the modal.
         */
        const projectId =
            task?.projectId ||
            task?.project?.id ||
            task?.project?.projectId ||
            null;

        if (projectId) {
            await loadProjectMembers(
                projectId
            );
        } else {
            setProjectMembers([]);
        }

        setSubtaskModal(true);
    }


    async function openEditSubtask(
        subtask
    ) {
        setEditingSubtask(
            subtask
        );

        setSubtaskForm({
            title:
                subtask.title ||
                "",

            description:
                subtask.description ||
                "",

            status:
                subtask.status ||
                "TODO",

            priority:
                subtask.priority ||
                "NORMAL",

            assigneeId:
                subtask.assigneeId ||
                "",

            dueDate:
                subtask.dueDate
                    ? String(
                        subtask.dueDate
                    ).slice(0, 10)
                    : "",

            estimatedHours:
                subtask.estimatedHours ??
                "",
        });

        setError("");

        /*
         * Load the parent task's project members
         * when editing an existing subtask too.
         */
        const projectId =
            task?.projectId ||
            task?.project?.id ||
            task?.project?.projectId ||
            null;

        if (projectId) {
            await loadProjectMembers(
                projectId
            );
        } else {
            setProjectMembers([]);
        }

        setSubtaskModal(true);
    }


    async function handleSubtaskSubmit(
        event
    ) {
        event.preventDefault();

        if (!subtaskForm.title?.trim()) {
            setError(
                "Subtask title is required."
            );

            return;
        }


        /*
         * Frontend membership validation.
         *
         * Even though the dropdown only contains project
         * members, validate again before submitting.
         */
        if (subtaskForm.assigneeId) {
            const isProjectMember =
                subtaskAssigneeUsers.some(
                    (user) =>
                        user.id ===
                        subtaskForm.assigneeId
                );

            if (!isProjectMember) {
                setError(
                    "The selected assignee is not a member of this project."
                );

                return;
            }
        }


        try {
            setSaving(true);
            setError("");

            const payload = {
                ...subtaskForm,

                title:
                    subtaskForm.title.trim(),

                description:
                    subtaskForm.description?.trim() ||
                    null,

                assigneeId:
                    subtaskForm.assigneeId ||
                    null,

                dueDate:
                    subtaskForm.dueDate ||
                    null,

                estimatedHours:
                    subtaskForm.estimatedHours === ""
                        ? null
                        : Number(
                            subtaskForm.estimatedHours
                        ),
            };


            if (editingSubtask) {
                await updateSubtask(
                    actualTaskId,
                    editingSubtask.id,
                    payload
                );
            } else {
                await createSubtask(
                    actualTaskId,
                    payload
                );
            }


            setSubtaskModal(false);
            setEditingSubtask(null);

            setSubtaskForm({
                ...EMPTY_SUBTASK,
            });

            await loadTask();
        } catch (err) {
            console.error(
                "Failed to save subtask:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    editingSubtask
                        ? "Unable to update subtask."
                        : "Unable to create subtask."
                )
            );
        } finally {
            setSaving(false);
        }
    }


    async function handleDeleteSubtask() {
        if (!deleteTarget) {
            return;
        }

        try {
            setDeleteLoading(true);

            await deleteSubtask(
                actualTaskId,
                deleteTarget.id
            );

            setDeleteTarget(null);

            await loadTask();
        } catch (err) {
            console.error(
                "Failed to delete subtask:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Unable to delete subtask."
                )
            );
        } finally {
            setDeleteLoading(false);
        }
    }


    /* =====================================================
     * LOADING
     * ===================================================== */

    if (loading) {
        return (
            <div className="space-y-6">

                <div className="h-6 w-32 animate-pulse rounded bg-[var(--bms-surface-soft)]" />

                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

                    <div className="h-96 animate-pulse rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]" />

                    <div className="h-80 animate-pulse rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]" />

                </div>

            </div>
        );
    }


    if (!task) {
        return (
            <div className="space-y-5">

                <Link
                    to="/tasks"
                    className="inline-flex items-center gap-2 text-sm text-[var(--bms-text-secondary)] transition hover:text-blue-600"
                >
                    <ArrowLeft
                        size={17}
                    />

                    Back to Tasks
                </Link>


                <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-12 text-center">

                    <CircleAlert
                        size={34}
                        className="mx-auto mb-3 text-red-500"
                    />

                    <h2 className="font-semibold text-[var(--bms-text)]">
                        Task not found
                    </h2>

                    <p className="mt-1 text-sm text-[var(--bms-text-muted)]">
                        {error}
                    </p>

                </div>

            </div>
        );
    }


    const subtasks =
        Array.isArray(
            task.childTasks
        )
            ? task.childTasks
            : [];


    const completedSubtasks =
        subtasks.filter(
            (item) =>
                item.status ===
                "DONE"
        ).length;


    const progress =
        task.progress ??
        (
            subtasks.length > 0
                ? Math.round(
                    completedSubtasks /
                    subtasks.length *
                    100
                )
                : task.status ===
                    "DONE"
                    ? 100
                    : 0
        );


    /* =====================================================
     * RENDER
     * ===================================================== */

    return (
        <div className="space-y-6">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                    <Link
                        to="/tasks"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--bms-border)] text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)] hover:text-blue-600"
                        title="Back to Tasks"
                    >
                        <ArrowLeft
                            size={18}
                        />
                    </Link>


                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-500">
                        <ListTodo
                            size={22}
                        />
                    </div>


                    <div className="min-w-0">

                        <p className="text-xs font-medium text-blue-600">
                            {task.project?.name ||
                                "Project Task"}
                        </p>

                        <h1 className="truncate text-xl font-semibold text-[var(--bms-text)]">
                            {task.title}
                        </h1>

                    </div>

                </div>


                <div className="flex gap-2">

                    <button
                        type="button"
                        onClick={() =>
                            setEditing(true)
                        }
                        className={secondaryButton}
                    >
                        <Pencil
                            size={16}
                        />

                        Edit
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            setDeleteTarget(
                                task
                            )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                        <Trash2
                            size={16}
                        />

                        Delete
                    </button>

                </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600">

                    <CircleAlert
                        size={18}
                        className="mt-0.5 shrink-0"
                    />

                    <span>
                        {error}
                    </span>

                </div>
            )}


            {/* =================================================
                CONTENT
            ================================================= */}

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

                <div className="space-y-6">

                    {/* =================================================
                        TASK OVERVIEW
                    ================================================= */}

                    <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

                        <div className="border-b border-[var(--bms-border)] p-5">

                            <div className="flex flex-wrap items-start justify-between gap-4">

                                <div className="min-w-0">

                                    <p className="mb-2 text-xs font-medium text-blue-600">
                                        {task.project?.name ||
                                            "Project"}
                                    </p>

                                    <h2 className="text-lg font-semibold text-[var(--bms-text)]">
                                        {task.title}
                                    </h2>

                                </div>


                                <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                                        task.status
                                    )}`}
                                >
                                    {formatStatus(
                                        task.status
                                    )}
                                </span>

                            </div>


                            {task.description && (
                                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--bms-text-secondary)]">
                                    {task.description}
                                </p>
                            )}

                        </div>


                        {/* PROGRESS */}

                        <div className="p-5">

                            <div className="mb-2 flex items-center justify-between">

                                <div>

                                    <p className="text-xs font-medium text-[var(--bms-text-secondary)]">
                                        Task Progress
                                    </p>

                                    {subtasks.length > 0 && (
                                        <p className="mt-0.5 text-xs text-[var(--bms-text-muted)]">
                                            {completedSubtasks} of{" "}
                                            {subtasks.length} subtasks completed
                                        </p>
                                    )}

                                </div>

                                <span className="text-sm font-semibold text-[var(--bms-text)]">
                                    {progress}%
                                </span>

                            </div>


                            <div className="h-2 overflow-hidden rounded-full bg-[var(--bms-surface-soft)]">

                                <div
                                    className="h-full rounded-full bg-blue-600 transition-all"
                                    style={{
                                        width:
                                            `${Math.min(
                                                100,
                                                Math.max(
                                                    0,
                                                    Number(
                                                        progress
                                                    )
                                                )
                                            )}%`,
                                    }}
                                />

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        SUBTASKS
                    ================================================= */}

                    <div className="overflow-hidden rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

                        <div className="flex flex-col gap-3 border-b border-[var(--bms-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                            <div>

                                <h2 className="text-sm font-semibold text-[var(--bms-text)]">
                                    Subtasks
                                </h2>

                                <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                                    Break this task into smaller pieces of work.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    openCreateSubtask
                                }
                                className={primaryButton}
                            >
                                <Plus
                                    size={16}
                                />

                                Add Subtask
                            </button>

                        </div>


                        {subtasks.length === 0 ? (

                            <div className="p-12 text-center">

                                <Circle
                                    size={34}
                                    className="mx-auto mb-3 text-[var(--bms-text-muted)]"
                                />

                                <p className="font-medium text-[var(--bms-text)]">
                                    No subtasks yet
                                </p>

                                <p className="mt-1 text-sm text-[var(--bms-text-muted)]">
                                    Add subtasks to track detailed work.
                                </p>

                            </div>

                        ) : (

                            <div className="divide-y divide-[var(--bms-border)]">

                                {subtasks.map(
                                    (subtask) => (

                                        <div
                                            key={
                                                subtask.id
                                            }
                                            className="flex items-center gap-4 p-5 transition hover:bg-[var(--bms-surface-soft)]"
                                        >

                                            <div className="shrink-0">

                                                {subtask.status ===
                                                    "DONE" ? (

                                                    <CheckCircle2
                                                        size={21}
                                                        className="text-emerald-500"
                                                    />

                                                ) : (

                                                    <Clock3
                                                        size={21}
                                                        className="text-[var(--bms-text-muted)]"
                                                    />

                                                )}

                                            </div>


                                            <div className="min-w-0 flex-1">

                                                <p
                                                    className={`font-medium ${
                                                        subtask.status ===
                                                        "DONE"
                                                            ? "text-[var(--bms-text-muted)] line-through"
                                                            : "text-[var(--bms-text)]"
                                                    }`}
                                                >
                                                    {
                                                        subtask.title
                                                    }
                                                </p>


                                                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[var(--bms-text-muted)]">

                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-0.5 ${statusClass(
                                                            subtask.status
                                                        )}`}
                                                    >
                                                        {formatStatus(
                                                            subtask.status
                                                        )}
                                                    </span>


                                                    <span
                                                        className={
                                                            priorityClass(
                                                                subtask.priority
                                                            )
                                                        }
                                                    >
                                                        {formatStatus(
                                                            subtask.priority
                                                        )}
                                                    </span>


                                                    {subtask.assignee && (
                                                        <span className="inline-flex items-center gap-1">

                                                            <UserRound
                                                                size={12}
                                                            />

                                                            {getUserName(
                                                                subtask.assignee
                                                            )}

                                                        </span>
                                                    )}

                                                </div>

                                            </div>


                                            <div className="flex shrink-0 gap-1">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditSubtask(
                                                            subtask
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)] hover:text-blue-600"
                                                    title="Edit subtask"
                                                >
                                                    <Pencil
                                                        size={16}
                                                    />
                                                </button>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDeleteTarget(
                                                            subtask
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-red-600 transition hover:bg-red-500/10"
                                                    title="Delete subtask"
                                                >
                                                    <Trash2
                                                        size={16}
                                                    />
                                                </button>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>

                </div>


                {/* =================================================
                    SIDEBAR
                ================================================= */}

                <aside className="space-y-4">

                    <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

                        <div className="border-b border-[var(--bms-border)] px-5 py-4">

                            <h2 className="text-sm font-semibold text-[var(--bms-text)]">
                                Task Information
                            </h2>

                        </div>


                        <div className="space-y-5 p-5 text-sm">

                            <div>

                                <p className="text-xs text-[var(--bms-text-muted)]">
                                    Project
                                </p>

                                <p className="mt-1 font-medium text-[var(--bms-text)]">
                                    {task.project?.name ||
                                        "—"}
                                </p>

                            </div>


                            <div>

                                <p className="text-xs text-[var(--bms-text-muted)]">
                                    Status
                                </p>

                                <span
                                    className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                                        task.status
                                    )}`}
                                >
                                    {formatStatus(
                                        task.status
                                    )}
                                </span>

                            </div>


                            <div>

                                <p className="text-xs text-[var(--bms-text-muted)]">
                                    Priority
                                </p>

                                <p
                                    className={`mt-1 font-medium ${priorityClass(
                                        task.priority
                                    )}`}
                                >
                                    {formatStatus(
                                        task.priority
                                    )}
                                </p>

                            </div>


                            <div>

                                <p className="text-xs text-[var(--bms-text-muted)]">
                                    Assignee
                                </p>

                                <p className="mt-1 font-medium text-[var(--bms-text)]">
                                    {getUserName(
                                        task.assignee
                                    )}
                                </p>

                            </div>


                            <div>

                                <p className="text-xs text-[var(--bms-text-muted)]">
                                    Due Date
                                </p>

                                <p className="mt-1 inline-flex items-center gap-2 font-medium text-[var(--bms-text)]">

                                    <CalendarDays
                                        size={15}
                                    />

                                    {task.dueDate
                                        ? String(
                                            task.dueDate
                                        ).slice(0, 10)
                                        : "No due date"}

                                </p>

                            </div>


                            <div>

                                <p className="text-xs text-[var(--bms-text-muted)]">
                                    Estimated Hours
                                </p>

                                <p className="mt-1 font-medium text-[var(--bms-text)]">
                                    {task.estimatedHours ??
                                        "—"}
                                </p>

                            </div>


                            <div>

                                <p className="text-xs text-[var(--bms-text-muted)]">
                                    Actual Hours
                                </p>

                                <p className="mt-1 font-medium text-[var(--bms-text)]">
                                    {task.actualHours ??
                                        "—"}
                                </p>

                            </div>

                        </div>

                    </div>

                </aside>

            </div>


            {/* =================================================
                EDIT TASK MODAL
            ================================================= */}

            {editing && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

                    <form
                        onSubmit={
                            handleUpdate
                        }
                        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-2xl"
                    >

                        <div className="flex items-center justify-between border-b border-[var(--bms-border)] px-6 py-4">

                            <div>

                                <h2 className="text-lg font-semibold text-[var(--bms-text)]">
                                    Edit Task
                                </h2>

                                <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                                    Update task details and assignment.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    setEditing(
                                        false
                                    )
                                }
                                className="rounded-lg p-2 text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)]"
                            >
                                <X
                                    size={18}
                                />
                            </button>

                        </div>


                        <div className="space-y-5 p-6">

                            <div>

                                <label className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">
                                    Task Title *
                                </label>

                                <input
                                    value={
                                        form.title ||
                                        ""
                                    }
                                    onChange={(event) =>
                                        setForm(
                                            (current) => ({
                                                ...current,
                                                title:
                                                    event.target.value,
                                            })
                                        )
                                    }
                                    required
                                    className={inputClass}
                                />

                            </div>


                            <div>

                                <label className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">
                                    Description
                                </label>

                                <textarea
                                    value={
                                        form.description ||
                                        ""
                                    }
                                    onChange={(event) =>
                                        setForm(
                                            (current) => ({
                                                ...current,
                                                description:
                                                    event.target.value,
                                            })
                                        )
                                    }
                                    rows={4}
                                    className={textareaClass}
                                />

                            </div>


                            <div className="grid gap-4 sm:grid-cols-2">

                                <div>

                                    <label className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">
                                        Status
                                    </label>

                                    <select
                                        value={
                                            form.status ||
                                            "TODO"
                                        }
                                        onChange={(event) =>
                                            setForm(
                                                (current) => ({
                                                    ...current,
                                                    status:
                                                        event.target.value,
                                                })
                                            )
                                        }
                                        className={inputClass}
                                    >

                                        {STATUS_OPTIONS.map(
                                            (value) => (

                                                <option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {formatStatus(
                                                        value
                                                    )}
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                <div>

                                    <label className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">
                                        Priority
                                    </label>

                                    <select
                                        value={
                                            form.priority ||
                                            "NORMAL"
                                        }
                                        onChange={(event) =>
                                            setForm(
                                                (current) => ({
                                                    ...current,
                                                    priority:
                                                        event.target.value,
                                                })
                                            )
                                        }
                                        className={inputClass}
                                    >

                                        {PRIORITY_OPTIONS.map(
                                            (value) => (

                                                <option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {formatStatus(
                                                        value
                                                    )}
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                            </div>


                            <div>

                                <label className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">
                                    Assignee
                                </label>

                                <select
                                    value={
                                        form.assigneeId ||
                                        ""
                                    }
                                    onChange={(event) =>
                                        setForm(
                                            (current) => ({
                                                ...current,
                                                assigneeId:
                                                    event.target.value,
                                            })
                                        )
                                    }
                                    className={inputClass}
                                >

                                    <option value="">
                                        Unassigned
                                    </option>

                                    {users.map(
                                        (user) => (

                                            <option
                                                key={user.id}
                                                value={user.id}
                                            >
                                                {getUserName(
                                                    user
                                                )}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            <div className="grid gap-4 sm:grid-cols-2">

                                <div>

                                    <label className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">
                                        Due Date
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            form.dueDate ||
                                            ""
                                        }
                                        onChange={(event) =>
                                            setForm(
                                                (current) => ({
                                                    ...current,
                                                    dueDate:
                                                        event.target.value,
                                                })
                                            )
                                        }
                                        className={inputClass}
                                    />

                                </div>


                                <div>

                                    <label className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">
                                        Estimated Hours
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.25"
                                        value={
                                            form.estimatedHours ??
                                            ""
                                        }
                                        onChange={(event) =>
                                            setForm(
                                                (current) => ({
                                                    ...current,
                                                    estimatedHours:
                                                        event.target.value,
                                                })
                                            )
                                        }
                                        className={inputClass}
                                    />

                                </div>

                            </div>

                        </div>


                        <div className="flex justify-end gap-3 border-t border-[var(--bms-border)] px-6 py-4">

                            <button
                                type="button"
                                onClick={() =>
                                    setEditing(
                                        false
                                    )
                                }
                                className={secondaryButton}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                disabled={saving}
                                className={primaryButton}
                            >
                                {saving
                                    ? "Saving..."
                                    : "Update Task"}
                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* =================================================
                SUBTASK MODAL
            ================================================= */}

            {subtaskModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

                    <form
                        onSubmit={
                            handleSubtaskSubmit
                        }
                        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-2xl"
                    >

                        <div className="flex items-center justify-between border-b border-[var(--bms-border)] px-6 py-4">

                            <div>

                                <h2 className="text-lg font-semibold text-[var(--bms-text)]">
                                    {
                                        editingSubtask
                                            ? "Edit Subtask"
                                            : "Add Subtask"
                                    }
                                </h2>

                                <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                                    Configure the subtask details.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() => {
                                    setSubtaskModal(
                                        false
                                    );

                                    setEditingSubtask(
                                        null
                                    );

                                    setSubtaskForm({
                                        ...EMPTY_SUBTASK,
                                    });
                                }}
                                className="rounded-lg p-2 text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)]"
                            >
                                <X
                                    size={18}
                                />
                            </button>

                        </div>


                        <div className="space-y-5 p-6">

                            <div>

                                <label className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">
                                    Subtask Title *
                                </label>

                                <input
                                    value={
                                        subtaskForm.title
                                    }
                                    onChange={(event) =>
                                        setSubtaskForm(
                                            (current) => ({
                                                ...current,
                                                title:
                                                    event.target.value,
                                            })
                                        )
                                    }
                                    required
                                    className={inputClass}
                                    placeholder="e.g. Design login screen"
                                />

                            </div>


                            <div>

                                <label className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">
                                    Description
                                </label>

                                <textarea
                                    value={
                                        subtaskForm.description
                                    }
                                    onChange={(event) =>
                                        setSubtaskForm(
                                            (current) => ({
                                                ...current,
                                                description:
                                                    event.target.value,
                                            })
                                        )
                                    }
                                    rows={4}
                                    className={textareaClass}
                                    placeholder="Describe the subtask..."
                                />

                            </div>


                            <div className="grid gap-4 sm:grid-cols-2">

                                <div>

                                    <label className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">
                                        Status
                                    </label>

                                    <select
                                        value={
                                            subtaskForm.status
                                        }
                                        onChange={(event) =>
                                            setSubtaskForm(
                                                (current) => ({
                                                    ...current,
                                                    status:
                                                        event.target.value,
                                                })
                                            )
                                        }
                                        className={inputClass}
                                    >

                                        {STATUS_OPTIONS.map(
                                            (value) => (

                                                <option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {formatStatus(
                                                        value
                                                    )}
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                <div>

                                    <label className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">
                                        Priority
                                    </label>

                                    <select
                                        value={
                                            subtaskForm.priority
                                        }
                                        onChange={(event) =>
                                            setSubtaskForm(
                                                (current) => ({
                                                    ...current,
                                                    priority:
                                                        event.target.value,
                                                })
                                            )
                                        }
                                        className={inputClass}
                                    >

                                        {PRIORITY_OPTIONS.map(
                                            (value) => (

                                                <option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {formatStatus(
                                                        value
                                                    )}
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                            </div>


                            {/* =================================================
                                SUBTASK ASSIGNEE
                            ================================================= */}

                            <div>

                                <label className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">
                                    Assignee
                                </label>

                                <select
                                    value={
                                        subtaskForm.assigneeId
                                    }
                                    onChange={(event) =>
                                        setSubtaskForm(
                                            (current) => ({
                                                ...current,
                                                assigneeId:
                                                    event.target.value,
                                            })
                                        )
                                    }
                                    disabled={
                                        projectMembersLoading
                                    }
                                    className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`}
                                >

                                    {projectMembersLoading ? (

                                        <option value="">
                                            Loading project members...
                                        </option>

                                    ) : (

                                        <>

                                            <option value="">
                                                Unassigned
                                            </option>

                                            {subtaskAssigneeUsers.map(
                                                (user) => (

                                                    <option
                                                        key={user.id}
                                                        value={user.id}
                                                    >
                                                        {getUserName(
                                                            user
                                                        )}
                                                    </option>

                                                )
                                            )}

                                        </>

                                    )}

                                </select>


                                {projectMembersLoading ? (

                                    <p className="mt-1 text-[11px] text-[var(--bms-text-muted)]">
                                        Loading members of the project...
                                    </p>

                                ) : subtaskAssigneeUsers.length === 0 ? (

                                    <p className="mt-1 text-[11px] text-amber-600">
                                        No project members are available for assignment.
                                    </p>

                                ) : (

                                    <p className="mt-1 text-[11px] text-[var(--bms-text-muted)]">
                                        Only members of {task.project?.name || "this project"} can be assigned to this subtask.
                                    </p>

                                )}

                            </div>


                            <div className="grid gap-4 sm:grid-cols-2">

                                <div>

                                    <label className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">
                                        Due Date
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            subtaskForm.dueDate
                                        }
                                        onChange={(event) =>
                                            setSubtaskForm(
                                                (current) => ({
                                                    ...current,
                                                    dueDate:
                                                        event.target.value,
                                                })
                                            )
                                        }
                                        className={inputClass}
                                    />

                                </div>


                                <div>

                                    <label className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">
                                        Estimated Hours
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.25"
                                        value={
                                            subtaskForm.estimatedHours
                                        }
                                        onChange={(event) =>
                                            setSubtaskForm(
                                                (current) => ({
                                                    ...current,
                                                    estimatedHours:
                                                        event.target.value,
                                                })
                                            )
                                        }
                                        className={inputClass}
                                    />

                                </div>

                            </div>

                        </div>


                        <div className="flex justify-end gap-3 border-t border-[var(--bms-border)] px-6 py-4">

                            <button
                                type="button"
                                onClick={() => {
                                    setSubtaskModal(
                                        false
                                    );

                                    setEditingSubtask(
                                        null
                                    );

                                    setSubtaskForm({
                                        ...EMPTY_SUBTASK,
                                    });
                                }}
                                className={secondaryButton}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                disabled={
                                    saving ||
                                    projectMembersLoading
                                }
                                className={primaryButton}
                            >

                                {saving
                                    ? "Saving..."
                                    : editingSubtask
                                        ? "Update Subtask"
                                        : "Add Subtask"}

                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* =================================================
                DELETE CONFIRMATION
            ================================================= */}

            {deleteTarget && (

                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

                    <div className="w-full max-w-md rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-6 shadow-2xl">

                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-red-600">

                            <Trash2
                                size={20}
                            />

                        </div>


                        <h2 className="text-lg font-semibold text-[var(--bms-text)]">

                            Delete{" "}

                            {
                                deleteTarget.parentTaskId
                                    ? "subtask"
                                    : "task"
                            }?

                        </h2>


                        <p className="mt-2 text-sm text-[var(--bms-text-secondary)]">

                            Are you sure you want to delete{" "}

                            <strong className="text-[var(--bms-text)]">
                                {deleteTarget.title}
                            </strong>

                            ?

                        </p>


                        <div className="mt-6 flex justify-end gap-3">

                            <button
                                type="button"
                                disabled={
                                    deleteLoading
                                }
                                onClick={() =>
                                    setDeleteTarget(
                                        null
                                    )
                                }
                                className={secondaryButton}
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                disabled={
                                    deleteLoading
                                }
                                onClick={
                                    deleteTarget.parentTaskId
                                        ? handleDeleteSubtask
                                        : handleDeleteTask
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                            >

                                {deleteLoading
                                    ? "Deleting..."
                                    : deleteTarget.parentTaskId
                                        ? "Delete Subtask"
                                        : "Delete Task"}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}
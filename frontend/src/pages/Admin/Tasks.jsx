import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import {
    CheckCircle2,
    CircleAlert,
    Clock3,
    Eye,
    ListTodo,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    X,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
} from "../../api/tasks.js";

import {
    getProjects,
    getProjectById,
} from "../../api/projects.js";

import {
    apiRequest,
} from "../../api/client.js";


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


const EMPTY_FORM = {
    projectId: "",
    milestoneId: "",
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


function getTasksData(response) {
    const data = getData(response);

    if (Array.isArray(data?.tasks)) {
        return data.tasks;
    }

    if (Array.isArray(data)) {
        return data;
    }

    return [];
}


function getPagination(response) {
    const data = getData(response);

    return (
        data?.pagination ??
        response?.pagination ??
        {}
    );
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
            .map((item) => item?.message)
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
 * Extract project members from the project response.
 *
 * Supported response shapes:
 *
 * response.data.members
 * response.members
 *
 * Each membership can contain:
 *
 * member.userId
 * member.user.id
 *
 * This matches the membership structure already
 * used by the project details implementation.
 */
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


/* =========================================================
 * SMALL UI COMPONENTS
 * ========================================================= */

function StatCard({
    icon: Icon,
    label,
    value,
    description,
}) {
    return (
        <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-medium text-[var(--bms-text-muted)]">
                        {label}
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-[var(--bms-text)]">
                        {value}
                    </p>

                    {description && (
                        <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                            {description}
                        </p>
                    )}
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10 text-blue-500">
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
}


function ErrorBanner({
    error,
    onRetry,
    loading = false,
}) {
    return (
        <div className="flex flex-col gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
                <CircleAlert
                    size={18}
                    className="mt-0.5 shrink-0 text-red-500"
                />

                <div>
                    <p className="text-sm font-medium text-red-600">
                        Unable to load tasks
                    </p>

                    <p className="mt-1 text-xs text-red-500">
                        {error}
                    </p>
                </div>
            </div>

            <button
                type="button"
                onClick={onRetry}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/20 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-500/10 disabled:opacity-50"
            >
                <RefreshCw
                    size={14}
                    className={
                        loading
                            ? "animate-spin"
                            : ""
                    }
                />

                Retry
            </button>
        </div>
    );
}


function TasksSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-11 w-11 animate-pulse rounded-xl bg-[var(--bms-surface-soft)]" />

                <div className="space-y-2">
                    <div className="h-5 w-32 animate-pulse rounded bg-[var(--bms-surface-soft)]" />
                    <div className="h-3 w-64 animate-pulse rounded bg-[var(--bms-surface-soft)]" />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="h-24 animate-pulse rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]"
                    />
                ))}
            </div>

            <div className="h-96 animate-pulse rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]" />
        </div>
    );
}


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
    disabled:cursor-not-allowed
    disabled:opacity-60
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

export default function Tasks() {
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);

    /*
     * Members of the project currently selected
     * inside the create/edit task modal.
     */
    const [projectMembers, setProjectMembers] =
        useState([]);

    const [
        projectMembersLoading,
        setProjectMembersLoading,
    ] = useState(false);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState(null);

    const [search, setSearch] =
        useState("");

    const [status, setStatus] =
        useState("");

    const [priority, setPriority] =
        useState("");

    const [projectId, setProjectId] =
        useState("");

    const [page, setPage] =
        useState(1);

    const [pagination, setPagination] =
        useState({});

    const [modalOpen, setModalOpen] =
        useState(false);

    const [editingTask, setEditingTask] =
        useState(null);

    const [form, setForm] = useState({
        ...EMPTY_FORM,
    });

    const [formError, setFormError] =
        useState(null);

    const [deleteTarget, setDeleteTarget] =
        useState(null);

    const [deleteLoading, setDeleteLoading] =
        useState(false);


    /* =====================================================
     * LOAD USERS
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
     * LOAD PROJECTS
     * ===================================================== */

    const loadProjects = useCallback(
        async () => {
            try {
                const response =
                    await getProjects({
                        page: 1,
                        limit: 100,
                    });

                const data =
                    getData(response);

                setProjects(
                    Array.isArray(data?.projects)
                        ? data.projects
                        : Array.isArray(data)
                            ? data
                            : []
                );
            } catch (err) {
                console.error(
                    "Failed to load projects:",
                    err
                );
            }
        },
        []
    );


    /* =====================================================
     * LOAD PROJECT MEMBERS
     * ===================================================== */

    const loadProjectMembers =
        useCallback(
            async (
                selectedProjectId
            ) => {
                if (!selectedProjectId) {
                    setProjectMembers([]);
                    return;
                }

                try {
                    setProjectMembersLoading(
                        true
                    );

                    const response =
                        await getProjectById(
                            selectedProjectId
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


    /* =====================================================
     * LOAD TASKS
     * ===================================================== */

    const loadTasks = useCallback(
        async ({
            refresh = false,
        } = {}) => {
            try {
                if (refresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError(null);

                const response =
                    await getTasks({
                        page,
                        limit: 20,
                        search,
                        status,
                        priority,
                        projectId,
                        rootOnly: true,
                    });

                setTasks(
                    getTasksData(response)
                );

                setPagination(
                    getPagination(response)
                );
            } catch (err) {
                console.error(
                    "Failed to load tasks:",
                    err
                );

                setError(
                    getErrorMessage(
                        err,
                        "Unable to load tasks."
                    )
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [
            page,
            search,
            status,
            priority,
            projectId,
        ]
    );


    useEffect(() => {
        loadProjects();
        loadUsers();
    }, [
        loadProjects,
        loadUsers,
    ]);


    useEffect(() => {
        loadTasks();
    }, [
        loadTasks,
    ]);


    /* =====================================================
     * STATISTICS
     * ===================================================== */

    const statistics = useMemo(() => {
        return {
            total: tasks.length,

            completed:
                tasks.filter(
                    (task) =>
                        task.status === "DONE"
                ).length,

            inProgress:
                tasks.filter(
                    (task) =>
                        task.status ===
                        "IN_PROGRESS"
                ).length,

            blocked:
                tasks.filter(
                    (task) =>
                        task.status === "BLOCKED"
                ).length,
        };
    }, [tasks]);


    /* =====================================================
     * PROJECT MEMBERS → ASSIGNEES
     * ===================================================== */

    /*
     * Only users who are already members of the
     * selected project are allowed to appear in
     * the Assignee dropdown.
     *
     * The membership API can return:
     *
     * member.userId
     *
     * OR:
     *
     * member.user.id
     */

    const assigneeUsers = useMemo(() => {
        if (!form.projectId) {
            return [];
        }

        const memberIds = new Set(
            projectMembers
                .map(
                    (member) =>
                        member?.userId ||
                        member?.user?.id
                )
                .filter(Boolean)
        );

        return users.filter(
            (user) =>
                memberIds.has(user.id)
        );
    }, [
        users,
        projectMembers,
        form.projectId,
    ]);


    /* =====================================================
     * FORM
     * ===================================================== */

    function openCreate() {
        setEditingTask(null);

        setProjectMembers([]);

        setForm({
            ...EMPTY_FORM,
        });

        setFormError(null);
        setModalOpen(true);
    }


    function openEdit(task) {
        const selectedProjectId =
            task.projectId ||
            task.project?.id ||
            "";

        setEditingTask(task);

        setForm({
            projectId:
                selectedProjectId,

            milestoneId:
                task.milestoneId ||
                "",

            title:
                task.title ||
                "",

            description:
                task.description ||
                "",

            status:
                task.status ||
                "TODO",

            priority:
                task.priority ||
                "NORMAL",

            assigneeId:
                task.assigneeId ||
                "",

            dueDate:
                task.dueDate
                    ? String(
                        task.dueDate
                    ).slice(0, 10)
                    : "",

            estimatedHours:
                task.estimatedHours ??
                "",
        });

        setFormError(null);
        setModalOpen(true);

        /*
         * Load the members of the task's project
         * when editing an existing task.
         */
        if (selectedProjectId) {
            loadProjectMembers(
                selectedProjectId
            );
        }
    }


    function closeModal() {
        if (saving) {
            return;
        }

        setModalOpen(false);
        setEditingTask(null);
        setFormError(null);

        setProjectMembers([]);

        setForm({
            ...EMPTY_FORM,
        });
    }


    function handleChange(event) {
        const {
            name,
            value,
        } = event.target;

        /*
         * When the project changes:
         *
         * 1. Clear the old assignee.
         * 2. Clear the old project members.
         * 3. Load the new project's members.
         */
        if (name === "projectId") {
            setForm(
                (current) => ({
                    ...current,
                    projectId: value,
                    assigneeId: "",
                })
            );

            setProjectMembers([]);

            if (value) {
                loadProjectMembers(
                    value
                );
            }
        } else {
            setForm(
                (current) => ({
                    ...current,
                    [name]: value,
                })
            );
        }

        if (formError) {
            setFormError(null);
        }
    }


    async function handleSubmit(event) {
        event.preventDefault();

        if (!form.title.trim()) {
            setFormError(
                "Task title is required."
            );

            return;
        }

        if (!form.projectId) {
            setFormError(
                "Please select a project."
            );

            return;
        }

        /*
         * Extra frontend protection:
         *
         * If an assignee has been selected, make sure
         * that user is actually a member of the selected
         * project.
         */
        if (form.assigneeId) {
            const isProjectMember =
                assigneeUsers.some(
                    (user) =>
                        user.id ===
                        form.assigneeId
                );

            if (!isProjectMember) {
                setFormError(
                    "The selected assignee is not a member of this project."
                );

                return;
            }
        }

        try {
            setSaving(true);
            setFormError(null);
            setError(null);

            const payload = {
                ...form,

                title:
                    form.title.trim(),

                description:
                    form.description.trim() ||
                    null,

                projectId:
                    form.projectId,

                milestoneId:
                    form.milestoneId ||
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
            };

            if (editingTask) {
                await updateTask(
                    editingTask.id,
                    payload
                );
            } else {
                await createTask(
                    payload
                );
            }

            closeModal();

            await loadTasks({
                refresh: true,
            });
        } catch (err) {
            console.error(
                "Failed to save task:",
                err
            );

            setFormError(
                getErrorMessage(
                    err,
                    editingTask
                        ? "Unable to update task."
                        : "Unable to create task."
                )
            );
        } finally {
            setSaving(false);
        }
    }


    /* =====================================================
     * DELETE
     * ===================================================== */

    function openDelete(task) {
        if (!task) {
            return;
        }

        setDeleteTarget(task);
    }


    async function handleDelete() {
        if (!deleteTarget?.id) {
            return;
        }

        try {
            setDeleteLoading(true);
            setError(null);

            await deleteTask(
                deleteTarget.id
            );

            setDeleteTarget(null);

            await loadTasks({
                refresh: true,
            });
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
        } finally {
            setDeleteLoading(false);
        }
    }


    /* =====================================================
     * LOADING
     * ===================================================== */

    if (loading) {
        return (
            <TasksSkeleton />
        );
    }


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

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-500">
                        <ListTodo
                            size={22}
                        />
                    </div>

                    <div>
                        <h1 className="text-xl font-semibold text-[var(--bms-text)]">
                            Tasks
                        </h1>

                        <p className="mt-1 text-sm text-[var(--bms-text-secondary)]">
                            Manage project tasks, assignments and delivery progress.
                        </p>
                    </div>

                </div>


                <button
                    type="button"
                    onClick={openCreate}
                    className={primaryButton}
                >
                    <Plus size={18} />

                    Create Task
                </button>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <ErrorBanner
                    error={error}
                    loading={refreshing}
                    onRetry={() =>
                        loadTasks({
                            refresh: true,
                        })
                    }
                />
            )}


            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <StatCard
                    icon={ListTodo}
                    label="Total Tasks"
                    value={statistics.total}
                />

                <StatCard
                    icon={Clock3}
                    label="In Progress"
                    value={statistics.inProgress}
                />

                <StatCard
                    icon={CheckCircle2}
                    label="Completed"
                    value={statistics.completed}
                />

                <StatCard
                    icon={CircleAlert}
                    label="Blocked"
                    value={statistics.blocked}
                />

            </div>


            {/* =================================================
                TASK LIST
            ================================================= */}

            <div className="overflow-hidden rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

                <div className="border-b border-[var(--bms-border)] px-5 py-4">

                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                        <div>
                            <h2 className="text-sm font-semibold text-[var(--bms-text)]">
                                Project Tasks
                            </h2>

                            <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                                Manage tasks and monitor delivery progress.
                            </p>
                        </div>


                        <div className="flex flex-col gap-2 sm:flex-row">

                            <div className="relative">

                                <Search
                                    size={16}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bms-text-muted)]"
                                />

                                <input
                                    value={search}
                                    onChange={(event) => {
                                        setSearch(
                                            event.target.value
                                        );

                                        setPage(1);
                                    }}
                                    placeholder="Search tasks..."
                                    className={`${inputClass} w-full pl-9 sm:w-64`}
                                />

                            </div>


                            <select
                                value={projectId}
                                onChange={(event) => {
                                    setProjectId(
                                        event.target.value
                                    );

                                    setPage(1);
                                }}
                                className={`${inputClass} sm:w-48`}
                            >
                                <option value="">
                                    All Projects
                                </option>

                                {projects.map(
                                    (project) => (
                                        <option
                                            key={project.id}
                                            value={project.id}
                                        >
                                            {project.name}
                                        </option>
                                    )
                                )}
                            </select>


                            <select
                                value={status}
                                onChange={(event) => {
                                    setStatus(
                                        event.target.value
                                    );

                                    setPage(1);
                                }}
                                className={`${inputClass} sm:w-40`}
                            >
                                <option value="">
                                    All Statuses
                                </option>

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


                            <select
                                value={priority}
                                onChange={(event) => {
                                    setPriority(
                                        event.target.value
                                    );

                                    setPage(1);
                                }}
                                className={`${inputClass} sm:w-40`}
                            >
                                <option value="">
                                    All Priorities
                                </option>

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

                </div>


                <div className="overflow-x-auto">

                    <table className="w-full min-w-[1000px] text-sm">

                        <thead className="border-b border-[var(--bms-border)] bg-[var(--bms-surface-soft)]">

                            <tr>

                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-[var(--bms-text-secondary)]">
                                    Task
                                </th>

                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-[var(--bms-text-secondary)]">
                                    Project
                                </th>

                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-[var(--bms-text-secondary)]">
                                    Assignee
                                </th>

                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-[var(--bms-text-secondary)]">
                                    Priority
                                </th>

                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-[var(--bms-text-secondary)]">
                                    Status
                                </th>

                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-[var(--bms-text-secondary)]">
                                    Progress
                                </th>

                                <th className="px-5 py-3.5 text-right text-xs font-semibold text-[var(--bms-text-secondary)]">
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody className="divide-y divide-[var(--bms-border)]">

                            {tasks.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="7"
                                        className="px-5 py-16 text-center"
                                    >
                                        <ListTodo
                                            size={34}
                                            className="mx-auto mb-3 text-[var(--bms-text-muted)]"
                                        />

                                        <p className="font-medium text-[var(--bms-text)]">
                                            No tasks found
                                        </p>

                                        <p className="mt-1 text-sm text-[var(--bms-text-muted)]">
                                            Create your first task to get started.
                                        </p>

                                    </td>

                                </tr>

                            ) : (

                                tasks.map(
                                    (task) => (

                                        <tr
                                            key={task.id}
                                            className="transition hover:bg-[var(--bms-surface-soft)]"
                                        >

                                            <td className="px-5 py-4">

                                                <Link
                                                    to={`/tasks/${task.id}`}
                                                    className="font-medium text-[var(--bms-text)] transition hover:text-blue-600"
                                                >
                                                    {task.title}
                                                </Link>

                                                {task.totalSubtasks > 0 && (
                                                    <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                                                        {
                                                            task.completedSubtasks
                                                        }
                                                        /
                                                        {
                                                            task.totalSubtasks
                                                        }{" "}
                                                        subtasks completed
                                                    </p>
                                                )}

                                            </td>


                                            <td className="px-5 py-4 text-[var(--bms-text-secondary)]">
                                                {task.project?.name || "—"}
                                            </td>


                                            <td className="px-5 py-4">

                                                {task.assignee ? (

                                                    <div>

                                                        <p className="font-medium text-[var(--bms-text)]">
                                                            {getUserName(
                                                                task.assignee
                                                            )}
                                                        </p>

                                                        {task.assignee.email && (
                                                            <p className="mt-0.5 text-xs text-[var(--bms-text-muted)]">
                                                                {
                                                                    task.assignee.email
                                                                }
                                                            </p>
                                                        )}

                                                    </div>

                                                ) : (

                                                    <span className="text-[var(--bms-text-muted)]">
                                                        Unassigned
                                                    </span>

                                                )}

                                            </td>


                                            <td className="px-5 py-4">

                                                <span
                                                    className={`font-medium ${priorityClass(
                                                        task.priority
                                                    )}`}
                                                >
                                                    {formatStatus(
                                                        task.priority
                                                    )}
                                                </span>

                                            </td>


                                            <td className="px-5 py-4">

                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                                                        task.status
                                                    )}`}
                                                >
                                                    {formatStatus(
                                                        task.status
                                                    )}
                                                </span>

                                            </td>


                                            <td className="px-5 py-4">

                                                <div className="w-32">

                                                    <div className="mb-1 flex items-center justify-between text-xs">

                                                        <span className="text-[var(--bms-text-muted)]">
                                                            Progress
                                                        </span>

                                                        <span className="font-medium text-[var(--bms-text)]">
                                                            {
                                                                task.progress ??
                                                                0
                                                            }%
                                                        </span>

                                                    </div>


                                                    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bms-surface-soft)]">

                                                        <div
                                                            className="h-full rounded-full bg-blue-600 transition-all"
                                                            style={{
                                                                width:
                                                                    `${Math.min(
                                                                        100,
                                                                        Math.max(
                                                                            0,
                                                                            Number(
                                                                                task.progress ??
                                                                                0
                                                                            )
                                                                        )
                                                                    )}%`,
                                                            }}
                                                        />

                                                    </div>

                                                </div>

                                            </td>


                                            <td className="px-5 py-4">

                                                <div className="flex justify-end gap-1">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/tasks/${task.id}`
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)] hover:text-blue-600"
                                                        title="View task"
                                                    >
                                                        <Eye size={16} />
                                                    </button>


                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEdit(
                                                                task
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)] hover:text-blue-600"
                                                        title="Edit task"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>


                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openDelete(
                                                                task
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-red-600 transition hover:bg-red-500/10"
                                                        title="Delete task"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* =================================================
                PAGINATION
            ================================================= */}

            <div className="flex items-center justify-between">

                <p className="text-sm text-[var(--bms-text-muted)]">
                    Page{" "}
                    {pagination.page || page}{" "}
                    of{" "}
                    {pagination.totalPages || 1}
                </p>


                <div className="flex gap-2">

                    <button
                        type="button"
                        disabled={
                            page <= 1
                        }
                        onClick={() =>
                            setPage(
                                (current) =>
                                    Math.max(
                                        1,
                                        current - 1
                                    )
                            )
                        }
                        className="rounded-lg border border-[var(--bms-border)] p-2 text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)] disabled:opacity-40"
                    >
                        <ChevronLeft
                            size={17}
                        />
                    </button>


                    <button
                        type="button"
                        disabled={
                            page >=
                            (
                                pagination.totalPages ||
                                1
                            )
                        }
                        onClick={() =>
                            setPage(
                                (current) =>
                                    current + 1
                            )
                        }
                        className="rounded-lg border border-[var(--bms-border)] p-2 text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)] disabled:opacity-40"
                    >
                        <ChevronRight
                            size={17}
                        />
                    </button>

                </div>

            </div>


            {/* =================================================
                CREATE / EDIT MODAL
            ================================================= */}

            {modalOpen && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

                    <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-2xl">

                        <div className="flex items-center justify-between border-b border-[var(--bms-border)] px-6 py-4">

                            <div>

                                <h2 className="text-lg font-semibold text-[var(--bms-text)]">
                                    {
                                        editingTask
                                            ? "Edit Task"
                                            : "Create Task"
                                    }
                                </h2>

                                <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                                    Configure task details and assignment.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-lg p-2 text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)]"
                            >
                                <X size={18} />
                            </button>

                        </div>


                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5 p-6"
                        >

                            {formError && (

                                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-600">
                                    {formError}
                                </div>

                            )}


                            <div className="grid gap-5 md:grid-cols-2">

                                {/* PROJECT */}

                                <div>

                                    <label className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">
                                        Project *
                                    </label>


                                    <select
                                        name="projectId"
                                        value={form.projectId}
                                        onChange={handleChange}
                                        required
                                        className={inputClass}
                                    >

                                        <option value="">
                                            Select project
                                        </option>

                                        {projects.map(
                                            (project) => (

                                                <option
                                                    key={project.id}
                                                    value={project.id}
                                                >
                                                    {project.name}
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                {/* ASSIGNEE */}

                                <div>

                                    <label className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">
                                        Assignee
                                    </label>


                                    <select
                                        name="assigneeId"
                                        value={form.assigneeId}
                                        onChange={handleChange}
                                        disabled={
                                            !form.projectId ||
                                            projectMembersLoading
                                        }
                                        className={inputClass}
                                    >

                                        {!form.projectId ? (

                                            <option value="">
                                                Select a project first
                                            </option>

                                        ) : projectMembersLoading ? (

                                            <option value="">
                                                Loading project members...
                                            </option>

                                        ) : (

                                            <>

                                                <option value="">
                                                    Unassigned
                                                </option>

                                                {assigneeUsers.map(
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


                                    {form.projectId &&
                                        !projectMembersLoading &&
                                        assigneeUsers.length === 0 && (

                                            <p className="mt-1 text-[11px] text-amber-600">
                                                This project has no members available for assignment.
                                            </p>

                                        )}


                                    {form.projectId &&
                                        !projectMembersLoading &&
                                        assigneeUsers.length > 0 && (

                                            <p className="mt-1 text-[11px] text-[var(--bms-text-muted)]">
                                                Only members of the selected project can be assigned to this task.
                                            </p>

                                        )}


                                    {!form.projectId && (

                                        <p className="mt-1 text-[11px] text-[var(--bms-text-muted)]">
                                            Select a project to see its members.
                                        </p>

                                    )}

                                </div>

                            </div>


                            {/* TASK TITLE */}

                            <div>

                                <label className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">
                                    Task Title *
                                </label>

                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                    maxLength={255}
                                    className={inputClass}
                                    placeholder="e.g. Build authentication system"
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div>

                                <label className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className={textareaClass}
                                    placeholder="Describe the task..."
                                />

                            </div>


                            {/* STATUS / PRIORITY / DATE */}

                            <div className="grid gap-5 md:grid-cols-3">

                                <div>

                                    <label className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
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
                                        name="priority"
                                        value={form.priority}
                                        onChange={handleChange}
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


                                <div>

                                    <label className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">
                                        Due Date
                                    </label>

                                    <input
                                        type="date"
                                        name="dueDate"
                                        value={form.dueDate}
                                        onChange={handleChange}
                                        className={inputClass}
                                    />

                                </div>

                            </div>


                            {/* ESTIMATED HOURS */}

                            <div>

                                <label className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">
                                    Estimated Hours
                                </label>

                                <input
                                    type="number"
                                    name="estimatedHours"
                                    value={form.estimatedHours}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.25"
                                    className={inputClass}
                                    placeholder="e.g. 8"
                                />

                            </div>


                            {/* ACTIONS */}

                            <div className="flex justify-end gap-3 border-t border-[var(--bms-border)] pt-5">

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
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
                                        : editingTask
                                            ? "Update Task"
                                            : "Create Task"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =================================================
                DELETE MODAL
            ================================================= */}

            {deleteTarget && (

                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

                    <div className="w-full max-w-md rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-6 shadow-2xl">

                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-red-600">
                            <Trash2 size={20} />
                        </div>


                        <h2 className="text-lg font-semibold text-[var(--bms-text)]">
                            Delete task?
                        </h2>


                        <p className="mt-2 text-sm text-[var(--bms-text-secondary)]">

                            Are you sure you want to delete{" "}

                            <strong className="text-[var(--bms-text)]">
                                {deleteTarget.title}
                            </strong>

                            ?

                        </p>


                        <p className="mt-2 text-xs text-[var(--bms-text-muted)]">
                            Any subtasks will remain in the database but will no longer have this task as their parent.
                        </p>


                        <div className="mt-6 flex justify-end gap-3">

                            <button
                                type="button"
                                disabled={deleteLoading}
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
                                disabled={deleteLoading}
                                onClick={handleDelete}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                            >

                                {deleteLoading
                                    ? "Deleting..."
                                    : "Delete Task"}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}
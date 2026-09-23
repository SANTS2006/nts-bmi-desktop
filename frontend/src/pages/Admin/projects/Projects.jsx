import {
    CheckCircle2,
    CircleAlert,
    CircleX,
    Clock3,
    Eye,
    FolderKanban,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    UserRoundCheck,
    Users,
    X,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    apiRequest,
} from "../../../api/client.js";

import {
    getClients,
} from "../../../api/clients.js";

import {
    getProjectManagers,
    createProject,
    deleteProject,
    getProjects,
    updateProject,
} from "../../../api/projects.js";


/*
 * ==================================================
 * CONSTANTS
 * ==================================================
 */

const STATUS_OPTIONS = [
    ["PLANNING", "Planning"],
    ["ACTIVE", "Active"],
    ["ON_HOLD", "On Hold"],
    ["COMPLETED", "Completed"],
    ["CANCELLED", "Cancelled"],
];


const PRIORITY_OPTIONS = [
    ["LOW", "Low"],
    ["MEDIUM", "Medium"],
    ["HIGH", "High"],
    ["CRITICAL", "Critical"],
];


const EMPTY_FORM = {
    name: "",
    description: "",
    status: "PLANNING",
    priority: "MEDIUM",
    projectManagerId: "",
    departmentId: "",
    clientId: "",
    startDate: "",
    expectedEndDate: "",
};


/*
 * ==================================================
 * MAIN COMPONENT
 * ==================================================
 */

export default function Projects() {

    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);

    const [departments, setDepartments] = useState([]);

    const [clients, setClients] = useState([]);

    const [projectManagers, setProjectManagers] = useState([]);

    const [projectManagersLoading, setProjectManagersLoading] =
        useState(false);

    const [projectManagersLoaded, setProjectManagersLoaded] =
        useState(false);

    const [isLoading, setIsLoading] = useState(true);

    const [isRefreshing, setIsRefreshing] = useState(false);

    const [error, setError] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");

    const [statusFilter, setStatusFilter] = useState("ALL");

    const [priorityFilter, setPriorityFilter] = useState("ALL");

    const [formOpen, setFormOpen] = useState(false);

    const [editingProject, setEditingProject] = useState(null);

    const [form, setForm] = useState(EMPTY_FORM);

    const [formError, setFormError] = useState(null);

    const [isSaving, setIsSaving] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState(null);

    const [isDeleting, setIsDeleting] = useState(false);


    /*
     * ==================================================
     * LOAD PROJECTS
     * ==================================================
     */

    const loadProjects =
        useCallback(
            async ({
                refresh = false,
            } = {}) => {

                try {

                    if (refresh) {

                        setIsRefreshing(
                            true
                        );

                    } else {

                        setIsLoading(
                            true
                        );

                    }


                    setError(
                        null
                    );


                    const response =
                        await getProjects();


                    const data =
                        Array.isArray(
                            response?.data
                        )
                            ? response.data
                            : Array.isArray(
                                response
                            )
                                ? response
                                : [];


                    setProjects(
                        data
                    );

                } catch (err) {

                    console.error(
                        "Failed to load projects:",
                        err
                    );


                    setError(
                        getErrorMessage(
                            err,
                            "Unable to load projects."
                        )
                    );

                } finally {

                    setIsLoading(
                        false
                    );

                    setIsRefreshing(
                        false
                    );

                }

            },
            []
        );


    /*
     * ==================================================
     * LOAD DEPARTMENTS + CLIENTS
     * ==================================================
     *
     * IMPORTANT:
     *
     * There is NO project manager request here.
     *
     * The Projects page only loads:
     *
     * /api/projects
     * /api/departments
     * /api/clients
     *
     * ==================================================
     */

    const loadSupportingData =
        useCallback(
            async () => {

                const [
                    departmentResponse,
                    clientResponse,
                ] = await Promise.all([

                    apiRequest(
                        "/api/departments",
                        {
                            method: "GET",
                        }
                    ),

                    getClients(),

                ]);


                const departmentData =
                    Array.isArray(
                        departmentResponse?.data
                    )
                        ? departmentResponse.data
                        : Array.isArray(
                            departmentResponse
                        )
                            ? departmentResponse
                            : [];


                const clientData =
                    Array.isArray(
                        clientResponse?.data
                    )
                        ? clientResponse.data
                        : Array.isArray(
                            clientResponse
                        )
                            ? clientResponse
                            : [];


                setDepartments(
                    departmentData
                );


                setClients(
                    clientData
                );

            },
            []
        );


    /*
     * ==================================================
     * LOAD USERS LAZILY
     * ==================================================
     *
     * This function is NOT called when the page
     * initially loads.
     *
     * It is called only when Create/Edit opens.
     *
     * Backend limit is respected.
     *
     * ==================================================
     */

    /*
 * ==================================================
 * LOAD PROJECT MANAGERS
 * ==================================================
 *
 * Users are loaded only when the Create/Edit modal
 * opens.
 *
 * Only users assigned the PROJECT_MANAGER role
 * are returned.
 *
 * ==================================================
 */

const loadProjectManagers =
    useCallback(
        async () => {

            if (
                projectManagersLoaded ||
                projectManagersLoading
            ) {

                return;

            }


            try {

                setProjectManagersLoading(
                    true
                );


                const managers =
                    await getProjectManagers();


                setProjectManagers(
                    managers
                );


                setProjectManagersLoaded(
                    true
                );

            } catch (err) {

                console.error(
                    "Failed to load project managers:",
                    err
                );


                setProjectManagers(
                    []
                );


                setFormError(
                    getErrorMessage(
                        err,
                        "Unable to load project managers."
                    )
                );

            } finally {

                setProjectManagersLoading(
                    false
                );

            }

        },
        [
            projectManagersLoaded,
            projectManagersLoading,
        ]
    );


    /*
     * ==================================================
     * INITIAL LOAD
     * ==================================================
     */

    useEffect(
        () => {

            loadProjects();


            loadSupportingData()
                .catch(
                    (err) => {

                        console.error(
                            "Failed to load project selectors:",
                            err
                        );


                        setError(
                            getErrorMessage(
                                err,
                                "Unable to load project supporting data."
                            )
                        );

                    }
                );

        },
        [
            loadProjects,
            loadSupportingData,
        ]
    );


    /*
     * ==================================================
     * FILTER PROJECTS
     * ==================================================
     */

    const filteredProjects =
        useMemo(
            () => {

                const query =
                    searchQuery
                        .trim()
                        .toLowerCase();


                return projects.filter(
                    (project) => {

                        const manager =
                            project?.projectManager;


                        const managerName =
                            manager
                                ? `${manager.firstName || ""} ${manager.lastName || ""}`
                                    .trim()
                                    .toLowerCase()
                                : "";


                        const clientName =
                            project?.client?.name
                                ?.toLowerCase() ||
                            "";


                        const departmentName =
                            project?.department?.name
                                ?.toLowerCase() ||
                            "";


                        const projectName =
                            project?.name
                                ?.toLowerCase() ||
                            "";


                        const description =
                            project?.description
                                ?.toLowerCase() ||
                            "";


                        const matchesSearch =
                            !query ||
                            projectName.includes(
                                query
                            ) ||
                            description.includes(
                                query
                            ) ||
                            managerName.includes(
                                query
                            ) ||
                            clientName.includes(
                                query
                            ) ||
                            departmentName.includes(
                                query
                            );


                        const matchesStatus =
                            statusFilter === "ALL" ||
                            project?.status ===
                                statusFilter;


                        const matchesPriority =
                            priorityFilter === "ALL" ||
                            project?.priority ===
                                priorityFilter;


                        return (
                            matchesSearch &&
                            matchesStatus &&
                            matchesPriority
                        );

                    }
                );

            },
            [
                projects,
                searchQuery,
                statusFilter,
                priorityFilter,
            ]
        );


    /*
     * ==================================================
     * STATISTICS
     * ==================================================
     */

    const activeProjects =
        projects.filter(
            (project) =>
                project?.status ===
                "ACTIVE"
        ).length;


    const completedProjects =
        projects.filter(
            (project) =>
                project?.status ===
                "COMPLETED"
        ).length;


    const projectsWithIssues =
        projects.filter(
            (project) =>
                Number(
                    project?._count?.issues
                ) > 0
        ).length;


    /*
     * ==================================================
     * CREATE
     * ==================================================
     */

    function openCreate() {

        setEditingProject(
            null
        );


        setForm({
            ...EMPTY_FORM,
        });


        setFormError(
            null
        );


        setFormOpen(
            true
        );


        /*
         * Lazy load project managers only now.
         */

        loadProjectManagers();

    }


    /*
     * ==================================================
     * EDIT
     * ==================================================
     */

    function openEdit(
        project
    ) {

        if (!project) {
            return;
        }


        setEditingProject(
            project
        );


        setForm({

            name:
                project.name ||
                "",

            description:
                project.description ||
                "",

            status:
                project.status ||
                "PLANNING",

            priority:
                project.priority ||
                "MEDIUM",

            projectManagerId:
                project.projectManagerId ||
                project.projectManager?.id ||
                "",

            departmentId:
                project.departmentId ||
                project.department?.id ||
                "",

            clientId:
                project.clientId ||
                project.client?.id ||
                "",

            startDate:
                toDateInput(
                    project.startDate
                ),

            expectedEndDate:
                toDateInput(
                    project.expectedEndDate
                ),

        });


        setFormError(
            null
        );


        setFormOpen(
            true
        );


        /*
         * Lazy load project managers only now.
         */

        loadProjectManagers();

    }


    /*
     * ==================================================
     * CLOSE FORM
     * ==================================================
     */

    function closeForm() {

        if (isSaving) {
            return;
        }


        setFormOpen(
            false
        );


        setEditingProject(
            null
        );


        setFormError(
            null
        );


        setForm({
            ...EMPTY_FORM,
        });

    }


    /*
     * ==================================================
     * FORM CHANGE
     * ==================================================
     */

    function handleChange(
        event
    ) {

        const {
            name,
            value,
        } = event.target;


        setForm(
            (current) => ({
                ...current,
                [name]: value,
            })
        );


        if (formError) {

            setFormError(
                null
            );

        }

    }


    /*
     * ==================================================
     * SUBMIT CREATE / UPDATE
     * ==================================================
     */

    async function handleSubmit(event) {
    event.preventDefault();

    const projectName = form.name.trim();

    if (!projectName) {
        setFormError(
            "Project name is required."
        );

        return;
    }

    if (
        form.startDate &&
        form.expectedEndDate &&
        form.expectedEndDate <
            form.startDate
    ) {
        setFormError(
            "Expected end date cannot be earlier than the start date."
        );

        return;
    }

    try {
        setIsSaving(true);
        setFormError(null);

        const payload = {
            name: projectName,

            description:
                form.description.trim() || null,

            status: form.status,

            priority: form.priority,

            projectManagerId:
                form.projectManagerId || null,

            departmentId:
                form.departmentId || null,

            clientId:
                form.clientId || null,

            startDate:
                form.startDate || null,

            expectedEndDate:
                form.expectedEndDate || null,
        };

        if (editingProject) {
            await updateProject(
                editingProject.id,
                payload
            );
        } else {
            await createProject(payload);
        }

        setFormOpen(false);
        setEditingProject(null);
        setForm({
            ...EMPTY_FORM,
        });

        await loadProjects({
            refresh: true,
        });
    } catch (err) {
        console.error(
            "Failed to save project:",
            err
        );

        setFormError(
            getErrorMessage(
                err,
                editingProject
                    ? "Unable to update project."
                    : "Unable to create project."
            )
        );
    } finally {
        setIsSaving(false);
    }
}


    /*
     * ==================================================
     * OPEN DELETE CONFIRMATION
     * ==================================================
     */

    function openDelete(
        project
    ) {

        if (!project) {
            return;
        }


        setDeleteTarget({

            id:
                project.id,

            name:
                project.name ||
                "this project",

        });

    }


    /*
     * ==================================================
     * DELETE PROJECT
     * ==================================================
     */

    async function handleDelete() {

        if (!deleteTarget?.id) {
            return;
        }


        try {

            setIsDeleting(
                true
            );


            setError(
                null
            );


            await deleteProject(
                deleteTarget.id
            );


            setDeleteTarget(
                null
            );


            await loadProjects({
                refresh: true,
            });


        } catch (err) {

            console.error(
                "Failed to delete project:",
                err
            );


            setError(
                getErrorMessage(
                    err,
                    "Unable to delete project."
                )
            );


        } finally {

            setIsDeleting(
                false
            );

        }

    }


    /*
     * ==================================================
     * LOADING
     * ==================================================
     */

    if (isLoading) {

        return (
            <ProjectsSkeleton />
        );

    }


    /*
     * ==================================================
     * RENDER
     * ==================================================
     */

    return (

        <div className="space-y-6">

            {/* ==========================================
                HEADER
            =========================================== */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-500">

                        <FolderKanban
                            size={22}
                        />

                    </div>


                    <div>

                        <h1 className="text-xl font-semibold text-[var(--bms-text)]">
                            Projects
                        </h1>


                        <p className="mt-1 text-sm text-[var(--bms-text-secondary)]">
                            Manage company projects, teams, requirements and delivery.
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    onClick={
                        openCreate
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                >

                    <Plus
                        size={18}
                    />

                    Create Project

                </button>

            </div>


            {/* ==========================================
                ERROR
            =========================================== */}

            {error && (

                <ErrorBanner
                    error={error}
                    onRetry={() =>
                        loadProjects({
                            refresh: true,
                        })
                    }
                    loading={
                        isRefreshing
                    }
                />

            )}


            {/* ==========================================
                STATISTICS
            =========================================== */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <StatCard
                    icon={FolderKanban}
                    label="Total Projects"
                    value={
                        projects.length
                    }
                />


                <StatCard
                    icon={Clock3}
                    label="Active Projects"
                    value={
                        activeProjects
                    }
                />


                <StatCard
                    icon={CheckCircle2}
                    label="Completed"
                    value={
                        completedProjects
                    }
                />


                <StatCard
                    icon={CircleAlert}
                    label="Projects With Issues"
                    value={
                        projectsWithIssues
                    }
                />

            </div>


            {/* ==========================================
                PROJECT LIST
            =========================================== */}

            <div className="overflow-hidden rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

                {/* HEADER */}

                <div className="border-b border-[var(--bms-border)] px-5 py-4">

                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                        <div>

                            <h2 className="text-sm font-semibold text-[var(--bms-text)]">
                                Company Projects
                            </h2>


                            <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                                Manage projects and monitor their progress.
                            </p>

                        </div>


                        <div className="flex flex-col gap-2 sm:flex-row">

                            {/* SEARCH */}

                            <div className="relative">

                                <Search
                                    size={16}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bms-text-muted)]"
                                />


                                <input
                                    type="search"
                                    value={
                                        searchQuery
                                    }
                                    onChange={
                                        (event) =>
                                            setSearchQuery(
                                                event.target.value
                                            )
                                    }
                                    placeholder="Search projects..."
                                    className="h-10 w-full rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] pl-9 pr-3 text-sm text-[var(--bms-text)] outline-none focus:border-blue-500 sm:w-64"
                                />

                            </div>


                            {/* STATUS */}

                            <select
                                value={
                                    statusFilter
                                }
                                onChange={
                                    (event) =>
                                        setStatusFilter(
                                            event.target.value
                                        )
                                }
                                className="h-10 rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-3 text-sm text-[var(--bms-text)] outline-none focus:border-blue-500"
                            >

                                <option value="ALL">
                                    All Statuses
                                </option>


                                {STATUS_OPTIONS.map(
                                    ([
                                        value,
                                        label,
                                    ]) => (

                                        <option
                                            key={value}
                                            value={value}
                                        >
                                            {label}
                                        </option>

                                    )
                                )}

                            </select>


                            {/* PRIORITY */}

                            <select
                                value={
                                    priorityFilter
                                }
                                onChange={
                                    (event) =>
                                        setPriorityFilter(
                                            event.target.value
                                        )
                                }
                                className="h-10 rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-3 text-sm text-[var(--bms-text)] outline-none focus:border-blue-500"
                            >

                                <option value="ALL">
                                    All Priorities
                                </option>


                                {PRIORITY_OPTIONS.map(
                                    ([
                                        value,
                                        label,
                                    ]) => (

                                        <option
                                            key={value}
                                            value={value}
                                        >
                                            {label}
                                        </option>

                                    )
                                )}

                            </select>


                            {/* REFRESH */}

                            <button
                                type="button"
                                onClick={() =>
                                    loadProjects({
                                        refresh: true,
                                    })
                                }
                                disabled={
                                    isRefreshing
                                }
                                title="Refresh projects"
                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] text-[var(--bms-text-secondary)] hover:text-[var(--bms-text)] disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                <RefreshCw
                                    size={17}
                                    className={
                                        isRefreshing
                                            ? "animate-spin"
                                            : ""
                                    }
                                />

                            </button>

                        </div>

                    </div>

                </div>


                {/* CONTENT */}

                {filteredProjects.length === 0 ? (

                    <EmptyState
                        icon={
                            FolderKanban
                        }
                        title={
                            projects.length ===
                            0
                                ? "No projects found"
                                : "No matching projects"
                        }
                        description={
                            projects.length ===
                            0
                                ? "There are currently no projects configured in the system."
                                : "Try changing your search or filters."
                        }
                    />

                ) : (

                    <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">

                        {filteredProjects.map(
                            (
                                project
                            ) => {

                                const manager =
                                    project?.projectManager;


                                const memberCount =
                                    Number(
                                        project?._count?.members
                                    ) || 0;


                                const issueCount =
                                    Number(
                                        project?._count?.issues
                                    ) || 0;


                                return (

                                    <div
                                        key={
                                            project.id
                                        }
                                        className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5 transition hover:-translate-y-0.5 hover:border-blue-500/20 hover:shadow-md"
                                    >

                                        {/* CARD HEADER */}

                                        <div className="flex items-start justify-between gap-4">

                                            <div className="flex min-w-0 items-start gap-3">

                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-500">

                                                    <FolderKanban
                                                        size={19}
                                                    />

                                                </div>


                                                <div className="min-w-0">

                                                    <h3 className="truncate text-sm font-semibold text-[var(--bms-text)]">
                                                        {
                                                            project.name
                                                        }
                                                    </h3>


                                                    <p className="mt-0.5 truncate text-xs text-[var(--bms-text-muted)]">

                                                        {
                                                            project.client?.name ||
                                                            "No client assigned"
                                                        }

                                                    </p>

                                                </div>

                                            </div>


                                            <ProjectStatusBadge
                                                status={
                                                    project.status
                                                }
                                            />

                                        </div>


                                        {/* DESCRIPTION */}

                                        <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--bms-text-secondary)]">

                                            {
                                                project.description ||
                                                "No description provided."
                                            }

                                        </p>


                                        {/* CLIENT */}

                                        <div className="mt-4 rounded-lg bg-[var(--bms-surface-soft)] px-3 py-2">

                                            <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--bms-text-muted)]">
                                                Client
                                            </p>


                                            <p className="mt-1 truncate text-xs font-medium text-[var(--bms-text-secondary)]">

                                                {
                                                    project.client?.name ||
                                                    "No client assigned"
                                                }

                                            </p>

                                        </div>


                                        {/* INFORMATION */}

                                        <div className="mt-5 space-y-3 border-t border-[var(--bms-border)] pt-4">

                                            <ProjectInfo
                                                icon={
                                                    UserRoundCheck
                                                }
                                                label="Project Manager"
                                                value={
                                                    manager
                                                        ? getUserName(
                                                            manager
                                                        )
                                                        : "Not assigned"
                                                }
                                            />


                                            <ProjectInfo
                                                icon={
                                                    Users
                                                }
                                                label="Members"
                                                value={
                                                    memberCount
                                                }
                                            />


                                            <ProjectInfo
                                                icon={
                                                    CircleAlert
                                                }
                                                label="Issues"
                                                value={
                                                    issueCount
                                                }
                                            />


                                            <ProjectInfo
                                                icon={
                                                    Clock3
                                                }
                                                label="Priority"
                                                value={
                                                    formatStatus(
                                                        project.priority
                                                    )
                                                }
                                            />

                                        </div>


                                        {/* ACTIONS */}

                                        <div className="mt-5 flex items-center gap-2">

                                            {/* VIEW */}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        `/projects/${project.id}`
                                                    )
                                                }
                                                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700"
                                            >

                                                <Eye
                                                    size={15}
                                                />

                                                View Project

                                            </button>


                                            {/* EDIT */}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openEdit(
                                                        project
                                                    )
                                                }
                                                title="Edit project"
                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--bms-border)] text-[var(--bms-text-muted)] hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)]"
                                            >

                                                <Pencil
                                                    size={15}
                                                />

                                            </button>


                                            {/* DELETE */}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openDelete(
                                                        project
                                                    )
                                                }
                                                title="Delete project"
                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10"
                                            >

                                                <Trash2
                                                    size={15}
                                                />

                                            </button>

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}


                {/* FOOTER */}

                {filteredProjects.length >
                    0 && (

                    <div className="flex flex-col gap-2 border-t border-[var(--bms-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                        <p className="text-xs text-[var(--bms-text-muted)]">

                            Showing{" "}

                            <span className="font-medium text-[var(--bms-text-secondary)]">
                                {
                                    filteredProjects.length
                                }
                            </span>{" "}

                            of{" "}

                            <span className="font-medium text-[var(--bms-text-secondary)]">
                                {
                                    projects.length
                                }
                            </span>{" "}

                            projects

                        </p>


                        <p className="text-xs text-[var(--bms-text-muted)]">

                            {
                                activeProjects
                            }{" "}
                            active ·{" "}

                            {
                                completedProjects
                            }{" "}
                            completed

                        </p>

                    </div>

                )}

            </div>


            {/* ==========================================
                CREATE / EDIT MODAL
            =========================================== */}

            {formOpen && (

                <ProjectFormModal

                    editingProject={
                        editingProject
                    }

                    form={
                        form
                    }

                    projectManagers={
                        projectManagers
                    }

                    projectManagersLoading={
                        projectManagersLoading
                    }

                    departments={
                        departments
                    }

                    clients={
                        clients
                    }

                    error={
                        formError
                    }

                    saving={
                        isSaving
                    }

                    onChange={
                        handleChange
                    }

                    onClose={
                        closeForm
                    }

                    onSubmit={
                        handleSubmit
                    }

                />

            )}


            {/* ==========================================
                DELETE CONFIRMATION MODAL
            =========================================== */}

            {deleteTarget && (

                <ConfirmDeleteModal

                    name={
                        deleteTarget.name
                    }

                    loading={
                        isDeleting
                    }

                    onCancel={() =>
                        setDeleteTarget(
                            null
                        )
                    }

                    onConfirm={
                        handleDelete
                    }

                />

            )}

        </div>

    );

}


/*
 * ==================================================
 * PROJECT FORM MODAL
 * ==================================================
 */

function ProjectFormModal({

    editingProject,

    form,

    projectManagers,

    projectManagersLoading,

    departments,

    clients,

    error,

    saving,

    onChange,

    onClose,

    onSubmit,

}) {

    return (

        <Modal
            title={
                editingProject
                    ? "Edit Project"
                    : "Create Project"
            }
            description={
                editingProject
                    ? "Update the project information below."
                    : "Create a new company project."
            }
            onClose={
                onClose
            }
            disabled={
                saving
            }
        >

            <form
                onSubmit={
                    onSubmit
                }
                className="space-y-5"
            >

                {/* ERROR */}

                {error && (

                    <FormError
                        message={
                            error
                        }
                    />

                )}


                {/* FIELDS */}

                <div className="grid gap-4 sm:grid-cols-2">

                    {/* NAME */}

                    <Field
                        label="Project Name"
                        required
                        className="sm:col-span-2"
                    >

                        <input
                            name="name"
                            value={
                                form.name
                            }
                            onChange={
                                onChange
                            }
                            maxLength={
                                150
                            }
                            required
                            autoFocus
                            className={
                                inputClass
                            }
                            placeholder="Enter project name"
                        />

                    </Field>


                    {/* DESCRIPTION */}

                    <Field
                        label="Description"
                        className="sm:col-span-2"
                    >

                        <textarea
                            name="description"
                            value={
                                form.description
                            }
                            onChange={
                                onChange
                            }
                            maxLength={
                                2000
                            }
                            rows={
                                4
                            }
                            className={`${inputClass} resize-none`}
                            placeholder="Describe the project..."
                        />

                    </Field>


                    {/* STATUS */}

                    <Field
                        label="Status"
                    >

                        <select
                            name="status"
                            value={
                                form.status
                            }
                            onChange={
                                onChange
                            }
                            className={
                                inputClass
                            }
                        >

                            {STATUS_OPTIONS.map(
                                ([
                                    value,
                                    label,
                                ]) => (

                                    <option
                                        key={
                                            value
                                        }
                                        value={
                                            value
                                        }
                                    >
                                        {
                                            label
                                        }
                                    </option>

                                )
                            )}

                        </select>

                    </Field>


                    {/* PRIORITY */}

                    <Field
                        label="Priority"
                    >

                        <select
                            name="priority"
                            value={
                                form.priority
                            }
                            onChange={
                                onChange
                            }
                            className={
                                inputClass
                            }
                        >

                            {PRIORITY_OPTIONS.map(
                                ([
                                    value,
                                    label,
                                ]) => (

                                    <option
                                        key={
                                            value
                                        }
                                        value={
                                            value
                                        }
                                    >
                                        {
                                            label
                                        }
                                    </option>

                                )
                            )}

                        </select>

                    </Field>


                    {/* PROJECT MANAGER */}

                    {/* PROJECT MANAGER */}

                    <Field
                        label="Project Manager"
                    >

                        <select
                            name="projectManagerId"
                            value={
                                form.projectManagerId
                            }
                            onChange={
                                onChange
                            }
                            disabled={
                                projectManagersLoading
                            }
                            className={
                                inputClass
                            }
                        >

                            <option value="">
                                Select Project Manager
                            </option>


                            {projectManagers.map(
                                (user) => (

                                    <option
                                        key={
                                            user.id
                                        }
                                        value={
                                            user.id
                                        }
                                    >

                                        {
                                            getUserName(
                                                user
                                            )
                                        }

                                        {user.email
                                            ? ` — ${user.email}`
                                            : ""}

                                    </option>

                                )
                            )}

                        </select>


                        {projectManagersLoading && (

                            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[var(--bms-text-muted)]">

                                <RefreshCw
                                    size={11}
                                    className="animate-spin"
                                />

                                Loading project managers...

                            </p>

                        )}


                        {!projectManagersLoading &&
                            projectManagers.length === 0 && (

                            <p className="mt-1.5 text-[11px] text-amber-500">

                                No project managers with the Project Manager role are currently available.

                            </p>

                        )}

                    </Field>


                    {/* DEPARTMENT */}

                    <Field
                        label="Department"
                    >

                        <select
                            name="departmentId"
                            value={
                                form.departmentId
                            }
                            onChange={
                                onChange
                            }
                            className={
                                inputClass
                            }
                        >

                            <option value="">
                                No department
                            </option>


                            {departments
                                .filter(
                                    (
                                        department
                                    ) =>
                                        department?.isActive !==
                                        false
                                )
                                .map(
                                    (
                                        department
                                    ) => (

                                        <option
                                            key={
                                                department.id
                                            }
                                            value={
                                                department.id
                                            }
                                        >
                                            {
                                                department.name
                                            }
                                        </option>

                                    )
                                )}

                        </select>

                    </Field>


                    {/* CLIENT */}

                    <Field
                        label="Client"
                        className="sm:col-span-2"
                    >

                        <select
                            name="clientId"
                            value={
                                form.clientId
                            }
                            onChange={
                                onChange
                            }
                            className={
                                inputClass
                            }
                        >

                            <option value="">
                                No client
                            </option>


                            {clients
                                .filter(
                                    (
                                        client
                                    ) =>
                                        client?.isActive !==
                                        false
                                )
                                .map(
                                    (
                                        client
                                    ) => (

                                        <option
                                            key={
                                                client.id
                                            }
                                            value={
                                                client.id
                                            }
                                        >
                                            {
                                                client.name
                                            }
                                        </option>

                                    )
                                )}

                        </select>


                        {clients.length ===
                            0 && (

                            <p className="mt-1.5 text-[11px] text-[var(--bms-text-muted)]">
                                No active clients have been added yet.
                            </p>

                        )}

                    </Field>


                    {/* START DATE */}

                    <Field
                        label="Start Date"
                    >

                        <input
                            type="date"
                            name="startDate"
                            value={
                                form.startDate
                            }
                            onChange={
                                onChange
                            }
                            className={
                                inputClass
                            }
                        />

                    </Field>


                    {/* EXPECTED END DATE */}

                    <Field
                        label="Expected End Date"
                    >

                        <input
                            type="date"
                            name="expectedEndDate"
                            value={
                                form.expectedEndDate
                            }
                            onChange={
                                onChange
                            }
                            className={
                                inputClass
                            }
                        />

                    </Field>

                </div>


                {/* ACTIONS */}

                <div className="flex items-center justify-end gap-2 border-t border-[var(--bms-border)] pt-5">

                    <button
                        type="button"
                        onClick={
                            onClose
                        }
                        disabled={
                            saving
                        }
                        className={
                            secondaryButton
                        }
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        disabled={
                            saving
                        }
                        className={
                            primaryButton
                        }
                    >

                        {saving && (

                            <RefreshCw
                                size={15}
                                className="animate-spin"
                            />

                        )}


                        {
                            saving
                                ? "Saving..."
                                : editingProject
                                    ? "Save Changes"
                                    : "Create Project"
                        }

                    </button>

                </div>

            </form>

        </Modal>

    );

}


/*
 * ==================================================
 * MODAL
 * ==================================================
 */

function Modal({

    title,

    description,

    children,

    onClose,

    disabled,

}) {

    return (

        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
        >

            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-2xl">

                {/* HEADER */}

                <div className="flex items-start justify-between gap-4 border-b border-[var(--bms-border)] px-5 py-4">

                    <div>

                        <h2
                            id="project-modal-title"
                            className="text-sm font-semibold text-[var(--bms-text)]"
                        >
                            {
                                title
                            }
                        </h2>


                        {description && (

                            <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                                {
                                    description
                                }
                            </p>

                        )}

                    </div>


                    <button
                        type="button"
                        onClick={
                            onClose
                        }
                        disabled={
                            disabled
                        }
                        aria-label="Close modal"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--bms-text-muted)] hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)] disabled:cursor-not-allowed disabled:opacity-50"
                    >

                        <X
                            size={16}
                        />

                    </button>

                </div>


                {/* CONTENT */}

                <div className="p-5">

                    {
                        children
                    }

                </div>

            </div>

        </div>

    );

}


/*
 * ==================================================
 * CONFIRM DELETE MODAL
 * ==================================================
 */

function ConfirmDeleteModal({

    name,

    loading,

    onCancel,

    onConfirm,

}) {

    return (

        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-project-title"
        >

            <div className="w-full max-w-md rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-6 shadow-2xl">

                {/* ICON + TITLE */}

                <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">

                        <Trash2
                            size={18}
                        />

                    </div>


                    <div>

                        <h2
                            id="delete-project-title"
                            className="text-sm font-semibold text-[var(--bms-text)]"
                        >
                            Delete Project
                        </h2>


                        <p className="mt-1 text-xs leading-5 text-[var(--bms-text-secondary)]">

                            This action permanently deletes the project and may also remove associated records if allowed by the server.

                        </p>

                    </div>

                </div>


                {/* PROJECT */}

                <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4">

                    <p className="text-sm font-semibold text-[var(--bms-text)]">
                        {
                            name
                        }
                    </p>


                    <p className="mt-1 text-xs leading-5 text-[var(--bms-text-muted)]">

                        Make sure you really want to remove this project before continuing.

                    </p>

                </div>


                {/* ACTIONS */}

                <div className="mt-6 flex justify-end gap-2">

                    <button
                        type="button"
                        onClick={
                            onCancel
                        }
                        disabled={
                            loading
                        }
                        className={
                            secondaryButton
                        }
                    >
                        Cancel
                    </button>


                    <button
                        type="button"
                        onClick={
                            onConfirm
                        }
                        disabled={
                            loading
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                        {loading && (

                            <RefreshCw
                                size={14}
                                className="animate-spin"
                            />

                        )}


                        {
                            loading
                                ? "Deleting..."
                                : "Delete Project"
                        }

                    </button>

                </div>

            </div>

        </div>

    );

}


/*
 * ==================================================
 * FIELD
 * ==================================================
 */

function Field({

    label,

    required = false,

    className = "",

    children,

}) {

    return (

        <label
            className={`block ${className}`}
        >

            <span className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">

                {
                    label
                }


                {required && (

                    <span className="ml-1 text-red-500">
                        *
                    </span>

                )}

            </span>


            {
                children
            }

        </label>

    );

}


/*
 * ==================================================
 * STAT CARD
 * ==================================================
 */

function StatCard({

    icon: Icon,

    label,

    value,

}) {

    return (

        <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5">

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-xs font-medium text-[var(--bms-text-muted)]">
                        {
                            label
                        }
                    </p>


                    <p className="mt-2 text-2xl font-semibold text-[var(--bms-text)]">
                        {
                            value
                        }
                    </p>

                </div>


                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10 text-blue-500">

                    <Icon
                        size={20}
                    />

                </div>

            </div>

        </div>

    );

}


/*
 * ==================================================
 * PROJECT INFO
 * ==================================================
 */

function ProjectInfo({

    icon: Icon,

    label,

    value,

}) {

    return (

        <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-2">

                <Icon
                    size={15}
                    className="text-[var(--bms-text-muted)]"
                />


                <span className="text-xs text-[var(--bms-text-muted)]">
                    {
                        label
                    }
                </span>

            </div>


            <span className="max-w-[180px] truncate text-right text-xs font-medium text-[var(--bms-text-secondary)]">
                {
                    value
                }
            </span>

        </div>

    );

}


/*
 * ==================================================
 * STATUS BADGE
 * ==================================================
 */

function ProjectStatusBadge({
    status,
}) {

    const config = {

        PLANNING: [
            "Planning",
            Clock3,
            "bg-slate-500/10 text-slate-500",
        ],

        ACTIVE: [
            "Active",
            CheckCircle2,
            "bg-blue-500/10 text-blue-500",
        ],

        ON_HOLD: [
            "On Hold",
            Clock3,
            "bg-amber-500/10 text-amber-500",
        ],

        COMPLETED: [
            "Completed",
            CheckCircle2,
            "bg-emerald-500/10 text-emerald-500",
        ],

        CANCELLED: [
            "Cancelled",
            CircleX,
            "bg-red-500/10 text-red-500",
        ],

    };


    const [
        label,
        Icon,
        className,
    ] =
        config[status] || [
            formatStatus(
                status
            ),
            Clock3,
            "bg-gray-500/10 text-gray-500",
        ];


    return (

        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>

            <Icon
                size={12}
            />

            {
                label
            }

        </span>

    );

}


/*
 * ==================================================
 * EMPTY STATE
 * ==================================================
 */

function EmptyState({

    icon: Icon,

    title,

    description,

}) {

    return (

        <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">

            <Icon
                size={36}
                className="text-[var(--bms-text-muted)]"
            />


            <h3 className="mt-3 text-sm font-semibold text-[var(--bms-text)]">
                {
                    title
                }
            </h3>


            <p className="mt-1 max-w-sm text-xs text-[var(--bms-text-secondary)]">
                {
                    description
                }
            </p>

        </div>

    );

}


/*
 * ==================================================
 * ERROR BANNER
 * ==================================================
 */

function ErrorBanner({

    error,

    onRetry,

    loading,

}) {

    return (

        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">

            <span>
                {
                    error
                }
            </span>


            <button
                type="button"
                onClick={
                    onRetry
                }
                disabled={
                    loading
                }
                className="rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-500/10 disabled:opacity-50"
            >

                {
                    loading
                        ? "Retrying..."
                        : "Try again"
                }

            </button>

        </div>

    );

}


/*
 * ==================================================
 * FORM ERROR
 * ==================================================
 */

function FormError({
    message,
}) {

    return (

        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs leading-5 text-red-500">

            {
                message
            }

        </div>

    );

}


/*
 * ==================================================
 * SKELETON
 * ==================================================
 */

function ProjectsSkeleton() {

    return (

        <div className="space-y-6">

            <div className="flex items-center justify-between">

                <div className="h-12 w-56 animate-pulse rounded-xl bg-[var(--bms-surface-soft)]" />

                <div className="h-10 w-36 animate-pulse rounded-lg bg-[var(--bms-surface-soft)]" />

            </div>


            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {[1, 2, 3, 4].map(
                    (item) => (

                        <div
                            key={
                                item
                            }
                            className="h-28 animate-pulse rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]"
                        />

                    )
                )}

            </div>


            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                {[1, 2, 3, 4, 5, 6].map(
                    (item) => (

                        <div
                            key={
                                item
                            }
                            className="h-72 animate-pulse rounded-xl bg-[var(--bms-surface-soft)]"
                        />

                    )
                )}

            </div>

        </div>

    );

}


/*
 * ==================================================
 * DATE FORMATTER
 * ==================================================
 */

function toDateInput(
    value
) {

    if (!value) {
        return "";
    }


    try {

        const date =
            new Date(
                value
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "";

        }


        return date
            .toISOString()
            .slice(
                0,
                10
            );

    } catch {

        return "";

    }

}


/*
 * ==================================================
 * USER NAME
 * ==================================================
 */

function getUserName(
    user
) {

    if (!user) {
        return "Unknown User";
    }


    const fullName =
        `${user.firstName || ""} ${user.lastName || ""}`
            .trim();


    return (
        fullName ||
        user.name ||
        user.email ||
        "Unknown User"
    );

}


/*
 * ==================================================
 * STATUS FORMATTER
 * ==================================================
 */

function formatStatus(
    value
) {

    if (!value) {
        return "Unknown";
    }


    return String(
        value
    )
        .toLowerCase()
        .replace(
            /_/g,
            " "
        )
        .replace(
            /\b\w/g,
            (letter) =>
                letter.toUpperCase()
        );

}


/*
 * ==================================================
 * ERROR MESSAGE
 * ==================================================
 */

function getErrorMessage(
    error,
    fallback
) {

    if (
        typeof error ===
        "string"
    ) {

        return error;

    }


    if (
        error?.message
    ) {

        return error.message;

    }


    if (
        Array.isArray(
            error?.details
        ) &&
        error.details.length
    ) {

        return error.details
            .map(
                (detail) =>
                    detail?.message
            )
            .filter(Boolean)
            .join(", ");

    }


    return fallback;

}


/*
 * ==================================================
 * STYLES
 * ==================================================
 */

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


const primaryButton = `
    inline-flex
    items-center
    justify-center
    gap-2
    rounded-lg
    bg-blue-600
    px-4
    py-2.5
    text-xs
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
    rounded-lg
    border
    border-[var(--bms-border)]
    px-4
    py-2.5
    text-xs
    font-medium
    text-[var(--bms-text-secondary)]
    transition
    hover:bg-[var(--bms-surface-soft)]
    disabled:cursor-not-allowed
    disabled:opacity-50
`;
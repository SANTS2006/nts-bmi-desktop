import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    CircleAlert,
    Clock3,
    FileText,
    Flag,
    Upload,
    FolderKanban,
    Pencil,
    Plus,
    RefreshCw,
    Trash2,
    UserMinus,
    UserPlus,
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
    useParams,
} from "react-router-dom";

import {
    addProjectMembers,
    assignProjectManager,
    createProjectIssue,
    createProjectMilestone,
    createProjectRequirement,
    deleteProject,
    deleteProjectDocument,
    deleteProjectIssue,
    deleteProjectMilestone,
    deleteProjectRequirement,
    getProjectById,
    getProjectManagers,
    getProjectUsers,
    removeProjectManager,
    removeProjectMember,
    updateProject,
    updateProjectIssue,
    uploadProjectDocument,
    updateProjectDocument,
    updateProjectMilestone,
    updateProjectRequirement,
} from "../../../api/projects.js";


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

const REQUIREMENT_STATUS = [
    ["DRAFT", "Draft"],
    ["APPROVED", "Approved"],
    ["IN_PROGRESS", "In Progress"],
    ["COMPLETED", "Completed"],
    ["REJECTED", "Rejected"],
];

const MILESTONE_STATUS = [
    ["PENDING", "Pending"],
    ["IN_PROGRESS", "In Progress"],
    ["COMPLETED", "Completed"],
    ["OVERDUE", "Overdue"],
    ["CANCELLED", "Cancelled"],
];

const ISSUE_STATUS = [
    ["OPEN", "Open"],
    ["IN_PROGRESS", "In Progress"],
    ["RESOLVED", "Resolved"],
    ["CLOSED", "Closed"],
];


export default function ProjectDetails() {

    const navigate =
        useNavigate();

    const {
        id: projectId,
    } = useParams();


    const [project, setProject] =
        useState(null);

    const [users, setUsers] =
        useState([]);

    const [projectManagers, setProjectManagers] =
        useState([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [isRefreshing, setIsRefreshing] =
        useState(false);

    const [error, setError] =
        useState(null);

    const [activeTab, setActiveTab] =
        useState("overview");

    const [modal, setModal] =
        useState(null);

    const [isSaving, setIsSaving] =
        useState(false);

    const [deleteTarget, setDeleteTarget] =
        useState(null);

    const [isDeleting, setIsDeleting] =
        useState(false);


    /*
     * ==================================================
     * LOAD PROJECT
     * ==================================================
     */

    const loadProject =
        useCallback(
            async ({
                refresh = false,
            } = {}) => {

                try {

                    if (refresh) {
                        setIsRefreshing(true);
                    } else {
                        setIsLoading(true);
                    }

                    setError(null);

                    const response =
                        await getProjectById(
                            projectId
                        );

                    setProject(
                        response?.data ||
                        response?.project ||
                        response
                    );

                } catch (err) {

                    console.error(
                        "Failed to load project:",
                        err
                    );

                    setProject(null);

                    setError(
                        err?.message ||
                        "Unable to load project."
                    );

                } finally {

                    setIsLoading(false);
                    setIsRefreshing(false);

                }

            },
            [
                projectId,
            ]
        );


    const loadUsers =
        useCallback(
            async () => {

                try {

                    const [allUsers, managers] =
                        await Promise.all([
                            getProjectUsers({
                                activeOnly: true,
                            }),
                            getProjectManagers({
                                activeOnly: true,
                            }),
                        ]);

                    setUsers(allUsers);
                    setProjectManagers(managers);

                } catch (err) {

                    console.error(
                        "Failed to load project users:",
                        err
                    );

                    setUsers([]);
                    setProjectManagers([]);

                    setError(
                        err?.message ||
                        "Unable to load project users."
                    );

                }

            },
            []
        );

    useEffect(
        () => {

            if (!projectId) {
                setError(
                    "Project ID is missing."
                );
                setIsLoading(false);
                return;
            }

            loadProject();

            loadUsers();

        },
        [
            projectId,
            loadProject,
            loadUsers,
        ]
    );


    /*
     * ==================================================
     * PROJECT MANAGERS
     * ==================================================
     *
     * Keep the complete users collection available for
     * project members, but expose only users assigned
     * the Project Manager role to the manager selector.
     *
     * Supported role shapes:
     * - user.role = "PROJECT_MANAGER"
     * - user.role.name = "PROJECT_MANAGER"
     * - user.roles = ["PROJECT_MANAGER"]
     * - user.roles = [{ name: "PROJECT_MANAGER" }]
     *
     * ==================================================
     */

    /*
     * ==================================================
     * NORMALIZED DATA
     * ==================================================
     */

    const manager =
        project?.projectManager ||
        null;

    const members =
        Array.isArray(project?.members)
            ? project.members
            : [];

    const requirements =
        Array.isArray(project?.requirements)
            ? project.requirements
            : [];

    const milestones =
        Array.isArray(project?.milestones)
            ? project.milestones
            : [];

    const documents =
        Array.isArray(project?.documents)
            ? project.documents
            : [];

    const issues =
        Array.isArray(project?.issues)
            ? project.issues
            : [];


    const activeMemberIds =
        useMemo(
            () =>
                members.map(
                    (member) =>
                        member.userId ||
                        member.user?.id
                ),
            [
                members,
            ]
        );


    /*
     * ==================================================
     * DELETE
     * ==================================================
     */

    async function handleDelete() {

        if (!deleteTarget) {
            return;
        }

        try {

            setIsDeleting(true);

            switch (
                deleteTarget.type
            ) {

                case "PROJECT":

                    await deleteProject(
                        projectId
                    );

                    navigate(
                        "/projects"
                    );

                    return;


                case "MANAGER":

                    await removeProjectManager(
                        projectId
                    );

                    break;


                case "MEMBER":

                    await removeProjectMember(
                        projectId,
                        deleteTarget.id
                    );

                    break;


                case "REQUIREMENT":

                    await deleteProjectRequirement(
                        projectId,
                        deleteTarget.id
                    );

                    break;


                case "MILESTONE":

                    await deleteProjectMilestone(
                        projectId,
                        deleteTarget.id
                    );

                    break;


                case "ISSUE":

                    await deleteProjectIssue(
                        projectId,
                        deleteTarget.id
                    );

                    break;


                case "DOCUMENT":

                    await deleteProjectDocument(
                        projectId,
                        deleteTarget.id
                    );

                    break;


                default:
                    throw new Error(
                        "Unsupported deletion action."
                    );

            }

            setDeleteTarget(null);

            await loadProject({
                refresh: true,
            });

        } catch (err) {

            console.error(
                "Delete operation failed:",
                err
            );

            setError(
                err?.message ||
                "Unable to complete the requested action."
            );

        } finally {

            setIsDeleting(false);

        }

    }


    /*
     * ==================================================
     * SAVE MODAL
     * ==================================================
     */

    async function handleModalSubmit(
        payload
    ) {

        try {

            setIsSaving(true);

            setError(null);

            switch (
                modal.type
            ) {

                case "EDIT_PROJECT":

                    await updateProject(
                        projectId,
                        payload
                    );

                    break;


                case "ASSIGN_MANAGER":

                    await assignProjectManager(
                        projectId,
                        payload.userId
                    );

                    break;


                case "ADD_MEMBERS":

                    await addProjectMembers(
                        projectId,
                        payload.users.map(
                            (user) => ({
                                userId:
                                    user.id,
                                role:
                                    "MEMBER",
                            })
                        )
                    );

                    break;


                case "CREATE_REQUIREMENT":

                    await createProjectRequirement(
                        projectId,
                        payload
                    );

                    break;


                case "EDIT_REQUIREMENT":

                    await updateProjectRequirement(
                        projectId,
                        payload.id,
                        payload.data
                    );

                    break;


                case "CREATE_MILESTONE":

                    await createProjectMilestone(
                        projectId,
                        payload
                    );

                    break;


                case "EDIT_MILESTONE":

                    await updateProjectMilestone(
                        projectId,
                        payload.id,
                        payload.data
                    );

                    break;


                case "CREATE_ISSUE":

                    await createProjectIssue(
                        projectId,
                        payload
                    );

                    break;


                case "EDIT_ISSUE":

                    await updateProjectIssue(
                        projectId,
                        payload.id,
                        payload.data
                    );

                    break;


                case "UPLOAD_DOCUMENT":

                    await uploadProjectDocument(
                        projectId,
                        payload
                    );

                    break;


                case "EDIT_DOCUMENT":

                    await updateProjectDocument(
                        projectId,
                        payload.id,
                        payload.data
                    );

                    break;


                default:
                    break;

            }

            setModal(null);

            await loadProject({
                refresh: true,
            });

        } catch (err) {

            console.error(
                "Project operation failed:",
                err
            );

            throw err;

        } finally {

            setIsSaving(false);

        }

    }


    if (isLoading) {
        return (
            <ProjectDetailsSkeleton />
        );
    }


    if (!project) {

        return (

            <div className="space-y-6">

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/projects"
                        )
                    }
                    className="inline-flex items-center gap-2 text-sm font-medium text-[var(--bms-text-secondary)] hover:text-[var(--bms-text)]"
                >

                    <ArrowLeft
                        size={17}
                    />

                    Back to Projects

                </button>


                <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 text-center">

                    <CircleAlert
                        size={38}
                        className="text-red-500"
                    />

                    <h2 className="mt-4 text-sm font-semibold text-[var(--bms-text)]">
                        Unable to load project
                    </h2>

                    <p className="mt-1 text-xs text-red-500">
                        {error || "Project not found."}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            loadProject({
                                refresh: true,
                            })
                        }
                        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white"
                    >
                        Try Again
                    </button>

                </div>

            </div>

        );

    }


    return (

        <div className="space-y-6">

            <button
                type="button"
                onClick={() =>
                    navigate(
                        "/projects"
                    )
                }
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--bms-text-secondary)] hover:text-[var(--bms-text)]"
            >

                <ArrowLeft
                    size={17}
                />

                Back to Projects

            </button>


            {error && (

                <div className="flex items-center justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            loadProject({
                                refresh: true,
                            })
                        }
                        className="rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-500/10"
                    >
                        Retry
                    </button>

                </div>

            )}


            {/* HEADER */}

            <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5">

                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                    <div className="flex min-w-0 items-start gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-500">

                            <FolderKanban
                                size={23}
                            />

                        </div>

                        <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                                <h1 className="text-xl font-semibold text-[var(--bms-text)]">
                                    {project.name}
                                </h1>

                                <ProjectStatusBadge
                                    status={project.status}
                                />

                                <PriorityBadge
                                    priority={project.priority}
                                />

                            </div>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--bms-text-secondary)]">
                                {project.description ||
                                    "No project description provided."
                                }
                            </p>

                            <div className="mt-4 flex flex-wrap gap-4 text-xs text-[var(--bms-text-muted)]">

                                <span>
                                    {members.length} members
                                </span>

                                <span>
                                    {requirements.length} requirements
                                </span>

                                <span>
                                    {milestones.length} milestones
                                </span>

                                <span>
                                    {issues.length} issues
                                </span>

                                <span>
                                    {documents.length} documents
                                </span>

                            </div>

                        </div>

                    </div>


                    <div className="flex items-center gap-2">

                        <button
                            type="button"
                            onClick={() =>
                                loadProject({
                                    refresh: true,
                                })
                            }
                            disabled={isRefreshing}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--bms-border)] text-[var(--bms-text-muted)] hover:bg-[var(--bms-surface-soft)] disabled:opacity-50"
                        >

                            <RefreshCw
                                size={16}
                                className={
                                    isRefreshing
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                setModal({
                                    type:
                                        "EDIT_PROJECT",
                                })
                            }
                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--bms-border)] px-3 text-xs font-medium text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface-soft)]"
                        >

                            <Pencil
                                size={14}
                            />

                            Edit

                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                setDeleteTarget({
                                    type:
                                        "PROJECT",
                                    name:
                                        project.name,
                                })
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10"
                        >

                            <Trash2
                                size={15}
                            />

                        </button>

                    </div>

                </div>

            </div>


            {/* TABS */}

            <div className="overflow-x-auto rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

                <div className="flex min-w-max">

                    {[
                        ["overview", "Overview", FolderKanban],
                        ["members", "Members", Users],
                        ["requirements", "Requirements", FileText],
                        ["milestones", "Milestones", Flag],
                        ["issues", "Issues", CircleAlert],
                        ["documents", "Documents", FileText],
                    ].map(
                        ([id, label, Icon]) => (

                            <button
                                key={id}
                                type="button"
                                onClick={() =>
                                    setActiveTab(id)
                                }
                                className={`
                                    inline-flex
                                    items-center
                                    gap-2
                                    border-b-2
                                    px-4
                                    py-3
                                    text-xs
                                    font-medium
                                    ${
                                        activeTab === id
                                            ? "border-blue-600 text-blue-500"
                                            : "border-transparent text-[var(--bms-text-muted)] hover:text-[var(--bms-text)]"
                                    }
                                `}
                            >

                                <Icon
                                    size={15}
                                />

                                {label}

                            </button>

                        )
                    )}

                </div>

            </div>


            {/* OVERVIEW */}

            {activeTab === "overview" && (

                <div className="grid gap-5 xl:grid-cols-3">

                    <ContentPanel
                        title="Project Overview"
                        description="Current project information."
                        icon={FolderKanban}
                        className="xl:col-span-2"
                    >

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                            <InfoCard
                                label="Status"
                                value={formatStatus(project.status)}
                            />

                            <InfoCard
                                label="Priority"
                                value={formatStatus(project.priority)}
                            />

                            <InfoCard
                                label="Department"
                                value={
                                    project.department?.name ||
                                    "Not assigned"
                                }
                            />

                            <InfoCard
                                label="Client"
                                value={
                                    project.client?.name ||
                                    "Not assigned"
                                }
                            />

                            <InfoCard
                                label="Start Date"
                                value={
                                    formatDate(
                                        project.startDate
                                    )
                                }
                            />

                            <InfoCard
                                label="Expected End"
                                value={
                                    formatDate(
                                        project.expectedEndDate
                                    )
                                }
                            />

                        </div>

                    </ContentPanel>


                    <ContentPanel
                        title="Project Manager"
                        description="Person responsible for project delivery."
                        icon={UserRoundCheck}
                    >

                        {manager ? (

                            <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-4">

                                <UserDisplay
                                    user={manager}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setDeleteTarget({
                                            type:
                                                "MANAGER",
                                            name:
                                                getUserName(
                                                    manager
                                                ),
                                        })
                                    }
                                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/20 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10"
                                >

                                    <UserMinus
                                        size={14}
                                    />

                                    Remove Manager

                                </button>

                            </div>

                        ) : (

                            <button
                                type="button"
                                onClick={() =>
                                    setModal({
                                        type:
                                            "ASSIGN_MANAGER",
                                    })
                                }
                                className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-[var(--bms-border)] p-6 text-center hover:bg-[var(--bms-surface-soft)]"
                            >

                                <UserRoundCheck
                                    size={25}
                                    className="text-[var(--bms-text-muted)]"
                                />

                                <span className="mt-3 text-xs font-medium text-[var(--bms-text)]">
                                    Assign Project Manager
                                </span>

                            </button>

                        )}

                    </ContentPanel>


                    <ContentPanel
                        title="Description"
                        description="Detailed project information."
                        icon={FileText}
                        className="xl:col-span-3"
                    >

                        <p className="text-sm leading-7 text-[var(--bms-text-secondary)]">
                            {project.description ||
                                "No project description has been provided."
                            }
                        </p>

                    </ContentPanel>

                </div>

            )}


            {/* MEMBERS */}

            {activeTab === "members" && (

                <ContentPanel
                    title="Project Members"
                    description="People currently assigned to this project."
                    icon={Users}
                    action={
                        <button
                            type="button"
                            onClick={() =>
                                setModal({
                                    type:
                                        "ADD_MEMBERS",
                                })
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                        >

                            <UserPlus
                                size={14}
                            />

                            Add Members

                        </button>
                    }
                >

                    {members.length === 0 ? (

                        <EmptyState
                            icon={Users}
                            title="No project members"
                            description="Add people who will work on this project."
                        />

                    ) : (

                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">

                            {members.map(
                                (member) => {

                                    const user =
                                        member.user ||
                                        member;

                                    const userId =
                                        member.userId ||
                                        user.id;

                                    return (

                                        <div
                                            key={member.id || userId}
                                            className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-4"
                                        >

                                            <div className="flex items-center justify-between gap-3">

                                                <UserDisplay
                                                    user={user}
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDeleteTarget({
                                                            type:
                                                                "MEMBER",
                                                            id:
                                                                userId,
                                                            name:
                                                                getUserName(
                                                                    user
                                                                ),
                                                        })
                                                    }
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--bms-text-muted)] hover:bg-red-500/10 hover:text-red-500"
                                                >

                                                    <Trash2
                                                        size={15}
                                                    />

                                                </button>

                                            </div>

                                            <div className="mt-3 text-xs text-[var(--bms-text-muted)]">

                                                Role:{" "}

                                                <span className="font-medium text-[var(--bms-text-secondary)]">
                                                    {formatStatus(member.role)}
                                                </span>

                                            </div>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    )}

                </ContentPanel>

            )}


            {/* REQUIREMENTS */}

            {activeTab === "requirements" && (

                <ContentPanel
                    title="Requirements"
                    description="Project requirements and deliverables."
                    icon={FileText}
                    action={
                        <button
                            type="button"
                            onClick={() =>
                                setModal({
                                    type:
                                        "CREATE_REQUIREMENT",
                                })
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                        >

                            <Plus
                                size={14}
                            />

                            Add Requirement

                        </button>
                    }
                >

                    {requirements.length === 0 ? (

                        <EmptyState
                            icon={FileText}
                            title="No requirements"
                            description="Create the requirements needed to deliver the project."
                        />

                    ) : (

                        <div className="space-y-3">

                            {requirements.map(
                                (item) => (

                                    <RecordRow
                                        key={item.id}
                                        title={item.title}
                                        description={item.description}
                                        status={item.status}
                                        priority={item.priority}
                                        onEdit={() =>
                                            setModal({
                                                type:
                                                    "EDIT_REQUIREMENT",
                                                item,
                                            })
                                        }
                                        onDelete={() =>
                                            setDeleteTarget({
                                                type:
                                                    "REQUIREMENT",
                                                id:
                                                    item.id,
                                                name:
                                                    item.title,
                                            })
                                        }
                                    />

                                )
                            )}

                        </div>

                    )}

                </ContentPanel>

            )}


            {/* MILESTONES */}

            {activeTab === "milestones" && (

                <ContentPanel
                    title="Milestones"
                    description="Project milestones and delivery checkpoints."
                    icon={Flag}
                    action={
                        <button
                            type="button"
                            onClick={() =>
                                setModal({
                                    type:
                                        "CREATE_MILESTONE",
                                })
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                        >

                            <Plus
                                size={14}
                            />

                            Add Milestone

                        </button>
                    }
                >

                    {milestones.length === 0 ? (

                        <EmptyState
                            icon={Flag}
                            title="No milestones"
                            description="Create milestones to track project delivery."
                        />

                    ) : (

                        <div className="space-y-3">

                            {milestones.map(
                                (item) => (

                                    <RecordRow
                                        key={item.id}
                                        title={item.name}
                                        description={item.description}
                                        status={item.status}
                                        extra={
                                            item.dueDate
                                                ? `Due ${formatDate(item.dueDate)}`
                                                : null
                                        }
                                        onEdit={() =>
                                            setModal({
                                                type:
                                                    "EDIT_MILESTONE",
                                                item,
                                            })
                                        }
                                        onDelete={() =>
                                            setDeleteTarget({
                                                type:
                                                    "MILESTONE",
                                                id:
                                                    item.id,
                                                name:
                                                    item.name,
                                            })
                                        }
                                    />

                                )
                            )}

                        </div>

                    )}

                </ContentPanel>

            )}


            {/* ISSUES */}

            {activeTab === "issues" && (

                <ContentPanel
                    title="Issues"
                    description="Track project risks, blockers and issues."
                    icon={CircleAlert}
                    action={
                        <button
                            type="button"
                            onClick={() =>
                                setModal({
                                    type:
                                        "CREATE_ISSUE",
                                })
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                        >

                            <Plus
                                size={14}
                            />

                            Report Issue

                        </button>
                    }
                >

                    {issues.length === 0 ? (

                        <EmptyState
                            icon={CircleAlert}
                            title="No issues"
                            description="There are currently no issues reported for this project."
                        />

                    ) : (

                        <div className="space-y-3">

                            {issues.map(
                                (item) => (

                                    <RecordRow
                                        key={item.id}
                                        title={item.title}
                                        description={item.description}
                                        status={item.status}
                                        priority={item.priority}
                                        extra={
                                            item.assignedTo
                                                ? `Assigned to ${getUserName(item.assignedTo)}`
                                                : "Unassigned"
                                        }
                                        onEdit={() =>
                                            setModal({
                                                type:
                                                    "EDIT_ISSUE",
                                                item,
                                            })
                                        }
                                        onDelete={() =>
                                            setDeleteTarget({
                                                type:
                                                    "ISSUE",
                                                id:
                                                    item.id,
                                                name:
                                                    item.title,
                                            })
                                        }
                                    />

                                )
                            )}

                        </div>

                    )}

                </ContentPanel>

            )}


            {/* DOCUMENTS */}

            {activeTab === "documents" && (

                <ContentPanel
                    title="Documents"
                    description="Project files and documentation."
                    icon={FileText}
                    action={
                        <button
                            type="button"
                            onClick={() =>
                                setModal({
                                    type: "UPLOAD_DOCUMENT",
                                })
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                        >
                            <Upload size={14} />
                            Upload Document
                        </button>
                    }
                >

                    {documents.length === 0 ? (

                        <EmptyState
                            icon={FileText}
                            title="No documents"
                            description="Upload contracts, requirements, designs, reports and other project files."
                        />

                    ) : (

                        <div className="space-y-3">

                            {documents.map((document) => (

                                <div
                                    key={document.id}
                                    className="flex flex-col gap-4 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-4 sm:flex-row sm:items-center sm:justify-between"
                                >

                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-500">
                                            <FileText size={16} />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-[var(--bms-text)]">
                                                {document.name || document.fileName || "Untitled Document"}
                                            </p>

                                            <p className="mt-1 truncate text-xs text-[var(--bms-text-muted)]">
                                                {formatStatus(document.type)}
                                                {document.fileName ? ` · ${document.fileName}` : ""}
                                                {document.fileSize ? ` · ${formatFileSize(document.fileSize)}` : ""}
                                            </p>

                                            {document.description && (
                                                <p className="mt-1 line-clamp-2 text-xs text-[var(--bms-text-secondary)]">
                                                    {document.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2">
                                        {document.fileUrl && (
                                            <a
                                                href={document.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="rounded-lg border border-[var(--bms-border)] px-3 py-2 text-xs font-medium text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface)]"
                                            >
                                                Open
                                            </a>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setModal({
                                                    type: "EDIT_DOCUMENT",
                                                    item: document,
                                                })
                                            }
                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface)]"
                                            title="Edit document"
                                        >
                                            <Pencil size={15} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDeleteTarget({
                                                    type: "DOCUMENT",
                                                    id: document.id,
                                                    name: document.name || document.fileName || "Document",
                                                })
                                            }
                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10"
                                            title="Delete document"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </ContentPanel>

            )}


            {/* MODALS */}

            {modal?.type === "EDIT_PROJECT" && (

                <ProjectEditModal
                    project={project}
                    onClose={() =>
                        setModal(null)
                    }
                    onSubmit={
                        handleModalSubmit
                    }
                    saving={isSaving}
                />

            )}


            {modal?.type === "ASSIGN_MANAGER" && (

                <ManagerModal
                    users={projectManagers}
                    currentManagerId={
                        project.projectManagerId
                    }
                    onClose={() =>
                        setModal(null)
                    }
                    onSubmit={
                        handleModalSubmit
                    }
                    saving={isSaving}
                />

            )}


            {modal?.type === "ADD_MEMBERS" && (

                <AddMembersModal
                    users={users}
                    existingIds={
                        activeMemberIds
                    }
                    onClose={() =>
                        setModal(null)
                    }
                    onSubmit={
                        handleModalSubmit
                    }
                    saving={isSaving}
                />

            )}


            {(modal?.type === "CREATE_REQUIREMENT" ||
                modal?.type === "EDIT_REQUIREMENT") && (

                <RequirementModal
                    item={
                        modal.item
                    }
                    onClose={() =>
                        setModal(null)
                    }
                    onSubmit={
                        handleModalSubmit
                    }
                    saving={isSaving}
                />

            )}


            {(modal?.type === "CREATE_MILESTONE" ||
                modal?.type === "EDIT_MILESTONE") && (

                <MilestoneModal
                    item={
                        modal.item
                    }
                    onClose={() =>
                        setModal(null)
                    }
                    onSubmit={
                        handleModalSubmit
                    }
                    saving={isSaving}
                />

            )}


            {(modal?.type === "CREATE_ISSUE" ||
                modal?.type === "EDIT_ISSUE") && (

                <IssueModal
                    item={
                        modal.item
                    }
                    members={
                        members
                    }
                    onClose={() =>
                        setModal(null)
                    }
                    onSubmit={
                        handleModalSubmit
                    }
                    saving={isSaving}
                />

            )}


            {(modal?.type === "UPLOAD_DOCUMENT" ||
                modal?.type === "EDIT_DOCUMENT") && (

                <DocumentModal
                    item={modal.item}
                    onClose={() =>
                        setModal(null)
                    }
                    onSubmit={
                        handleModalSubmit
                    }
                    saving={isSaving}
                />

            )}


            {deleteTarget && (

                <ConfirmDeleteModal
                    target={
                        deleteTarget
                    }
                    loading={
                        isDeleting
                    }
                    onCancel={() =>
                        setDeleteTarget(null)
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
 * PROJECT EDIT MODAL
 * ==================================================
 */

function ProjectEditModal({
    project,
    onClose,
    onSubmit,
    saving,
}) {

    const [form, setForm] =
        useState({
            name:
                project.name || "",
            description:
                project.description || "",
            status:
                project.status || "PLANNING",
            priority:
                project.priority || "MEDIUM",
            projectManagerId:
                project.projectManagerId || null,
            departmentId:
                project.departmentId || null,
            clientId:
                project.clientId || null,
            startDate:
                dateInput(
                    project.startDate
                ),
            expectedEndDate:
                dateInput(
                    project.expectedEndDate
                ),
            actualEndDate:
                dateInput(
                    project.actualEndDate
                ),
        });

    const [error, setError] =
        useState(null);


    async function submit(
        event
    ) {

        event.preventDefault();

        try {

            await onSubmit(
                {
                    ...form,
                    description:
                        form.description.trim() ||
                        null,
                    startDate:
                        form.startDate ||
                        null,
                    expectedEndDate:
                        form.expectedEndDate ||
                        null,
                    actualEndDate:
                        form.actualEndDate ||
                        null,
                }
            );

        } catch (err) {

            setError(
                err?.message ||
                "Unable to update project."
            );

        }

    }


    return (

        <Modal
            title="Edit Project"
            onClose={onClose}
            disabled={saving}
        >

            <form
                onSubmit={submit}
                className="space-y-4"
            >

                {error && (
                    <FormError
                        message={error}
                    />
                )}

                <Field
                    label="Project Name"
                    required
                >
                    <input
                        value={form.name}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                name:
                                    event.target.value,
                            })
                        }
                        className={inputClass}
                        required
                    />
                </Field>


                <Field label="Description">

                    <textarea
                        rows={4}
                        value={form.description}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                description:
                                    event.target.value,
                            })
                        }
                        className={`${inputClass} h-auto resize-none py-2.5`}
                    />

                </Field>


                <div className="grid gap-4 sm:grid-cols-2">

                    <SelectField
                        label="Status"
                        value={form.status}
                        options={STATUS_OPTIONS}
                        onChange={(value) =>
                            setForm({
                                ...form,
                                status: value,
                            })
                        }
                    />

                    <SelectField
                        label="Priority"
                        value={form.priority}
                        options={PRIORITY_OPTIONS}
                        onChange={(value) =>
                            setForm({
                                ...form,
                                priority: value,
                            })
                        }
                    />

                    <DateField
                        label="Start Date"
                        value={form.startDate}
                        onChange={(value) =>
                            setForm({
                                ...form,
                                startDate: value,
                            })
                        }
                    />

                    <DateField
                        label="Expected End Date"
                        value={form.expectedEndDate}
                        onChange={(value) =>
                            setForm({
                                ...form,
                                expectedEndDate: value,
                            })
                        }
                    />

                    <DateField
                        label="Actual End Date"
                        value={form.actualEndDate}
                        onChange={(value) =>
                            setForm({
                                ...form,
                                actualEndDate: value,
                            })
                        }
                    />

                </div>


                <ModalActions
                    saving={saving}
                    onClose={onClose}
                    submitLabel="Save Changes"
                />

            </form>

        </Modal>

    );

}


/*
 * ==================================================
 * MANAGER MODAL
 * ==================================================
 */

function ManagerModal({
    users,
    currentManagerId,
    onClose,
    onSubmit,
    saving,
}) {

    const [userId, setUserId] =
        useState(
            currentManagerId || ""
        );

    const [error, setError] =
        useState(null);


    async function submit(
        event
    ) {

        event.preventDefault();

        if (!userId) {

            setError(
                "Please select a project manager."
            );

            return;

        }

        try {

            await onSubmit({
                userId,
            });

        } catch (err) {

            setError(
                err?.message ||
                "Unable to assign manager."
            );

        }

    }


    return (

        <Modal
            title="Assign Project Manager"
            onClose={onClose}
            disabled={saving}
        >

            <form
                onSubmit={submit}
                className="space-y-5"
            >

                {error && (
                    <FormError
                        message={error}
                    />
                )}

                <Field label="Project Manager" required>

                    <select
                        value={userId}
                        onChange={(event) =>
                            setUserId(
                                event.target.value
                            )
                        }
                        className={inputClass}
                    >

                        <option value="">
                            Select a user
                        </option>

                        {users.map(
                            (user) => (
                                    <option
                                        key={user.id}
                                        value={user.id}
                                    >
                                        {getUserName(user)}
                                    </option>
                                )
                            )}

                    </select>

                </Field>


                <ModalActions
                    saving={saving}
                    onClose={onClose}
                    submitLabel="Assign Manager"
                />

            </form>

        </Modal>

    );

}


/*
 * ==================================================
 * MULTI MEMBER MODAL
 * ==================================================
 */

function AddMembersModal({
    users,
    existingIds,
    onClose,
    onSubmit,
    saving,
}) {

    const [selectedIds, setSelectedIds] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [error, setError] =
        useState(null);


    const availableUsers =
        useMemo(
            () => {

                const query =
                    search
                        .trim()
                        .toLowerCase();

                return users
                    .filter(
                        (user) =>
                            user.status ===
                            "ACTIVE"
                    )
                    .filter(
                        (user) =>
                            !existingIds.includes(
                                user.id
                            )
                    )
                    .filter(
                        (user) => {

                            const name =
                                getUserName(
                                    user
                                ).toLowerCase();

                            return (
                                !query ||
                                name.includes(
                                    query
                                ) ||
                                user.email
                                    ?.toLowerCase()
                                    .includes(
                                        query
                                    )
                            );

                        }
                    );

            },
            [
                users,
                existingIds,
                search,
            ]
        );


    function toggle(
        userId
    ) {

        setSelectedIds(
            (current) =>
                current.includes(
                    userId
                )
                    ? current.filter(
                        (id) =>
                            id !== userId
                    )
                    : [
                        ...current,
                        userId,
                    ]
        );

    }


    async function submit(
        event
    ) {

        event.preventDefault();

        if (
            selectedIds.length === 0
        ) {

            setError(
                "Select at least one member."
            );

            return;

        }

        try {

            await onSubmit({
                users:
                    users.filter(
                        (user) =>
                            selectedIds.includes(
                                user.id
                            )
                    ),
            });

        } catch (err) {

            setError(
                err?.message ||
                "Unable to add members."
            );

        }

    }


    return (

        <Modal
            title="Add Project Members"
            onClose={onClose}
            disabled={saving}
        >

            <form
                onSubmit={submit}
                className="space-y-4"
            >

                {error && (
                    <FormError
                        message={error}
                    />
                )}


                <input
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target.value
                        )
                    }
                    placeholder="Search people..."
                    className={inputClass}
                />


                <div className="max-h-80 space-y-2 overflow-y-auto rounded-xl border border-[var(--bms-border)] p-2">

                    {availableUsers.length === 0 ? (

                        <div className="p-6 text-center text-xs text-[var(--bms-text-muted)]">
                            No available users found.
                        </div>

                    ) : (

                        availableUsers.map(
                            (user) => {

                                const selected =
                                    selectedIds.includes(
                                        user.id
                                    );

                                return (

                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() =>
                                            toggle(
                                                user.id
                                            )
                                        }
                                        className={`
                                            flex
                                            w-full
                                            items-center
                                            gap-3
                                            rounded-lg
                                            border
                                            p-3
                                            text-left
                                            transition
                                            ${
                                                selected
                                                    ? "border-blue-500 bg-blue-500/10"
                                                    : "border-transparent hover:bg-[var(--bms-surface-soft)]"
                                            }
                                        `}
                                    >

                                        <div className={`flex h-5 w-5 items-center justify-center rounded border ${selected ? "border-blue-600 bg-blue-600 text-white" : "border-[var(--bms-border)]"}`}>

                                            {selected && (
                                                <CheckCircle2
                                                    size={14}
                                                />
                                            )}

                                        </div>


                                        <UserDisplay
                                            user={user}
                                        />

                                    </button>

                                );

                            }
                        )

                    )}

                </div>


                <p className="text-xs text-[var(--bms-text-muted)]">
                    {selectedIds.length} member{selectedIds.length === 1 ? "" : "s"} selected
                </p>


                <ModalActions
                    saving={saving}
                    onClose={onClose}
                    submitLabel={
                        selectedIds.length
                            ? `Add ${selectedIds.length} Member${selectedIds.length === 1 ? "" : "s"}`
                            : "Add Members"
                    }
                />

            </form>

        </Modal>

    );

}


/*
 * ==================================================
 * REQUIREMENT MODAL
 * ==================================================
 */

function RequirementModal({
    item,
    onClose,
    onSubmit,
    saving,
}) {

    const editing =
        Boolean(item);

    const [form, setForm] =
        useState({
            title:
                item?.title || "",
            description:
                item?.description || "",
            status:
                item?.status || "DRAFT",
            priority:
                item?.priority || "MEDIUM",
        });

    const [error, setError] =
        useState(null);


    async function submit(
        event
    ) {

        event.preventDefault();

        try {

            if (!form.title.trim()) {
                throw new Error(
                    "Requirement title is required."
                );
            }

            await onSubmit(
                editing
                    ? {
                        id:
                            item.id,
                        data: {
                            ...form,
                            description:
                                form.description.trim() ||
                                null,
                        },
                    }
                    : {
                        ...form,
                        description:
                            form.description.trim() ||
                            null,
                    }
            );

        } catch (err) {

            setError(
                err?.message ||
                "Unable to save requirement."
            );

        }

    }


    return (

        <Modal
            title={
                editing
                    ? "Edit Requirement"
                    : "Add Requirement"
            }
            onClose={onClose}
            disabled={saving}
        >

            <form
                onSubmit={submit}
                className="space-y-4"
            >

                {error && (
                    <FormError
                        message={error}
                    />
                )}

                <Field
                    label="Title"
                    required
                >

                    <input
                        value={form.title}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                title:
                                    event.target.value,
                            })
                        }
                        className={inputClass}
                        maxLength={200}
                        required
                    />

                </Field>


                <Field label="Description">

                    <textarea
                        value={form.description}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                description:
                                    event.target.value,
                            })
                        }
                        rows={4}
                        maxLength={3000}
                        className={`${inputClass} h-auto resize-none py-2.5`}
                    />

                </Field>


                <div className="grid gap-4 sm:grid-cols-2">

                    <SelectField
                        label="Status"
                        value={form.status}
                        options={REQUIREMENT_STATUS}
                        onChange={(value) =>
                            setForm({
                                ...form,
                                status:
                                    value,
                            })
                        }
                    />

                    <SelectField
                        label="Priority"
                        value={form.priority}
                        options={PRIORITY_OPTIONS}
                        onChange={(value) =>
                            setForm({
                                ...form,
                                priority:
                                    value,
                            })
                        }
                    />

                </div>


                <ModalActions
                    saving={saving}
                    onClose={onClose}
                    submitLabel={
                        editing
                            ? "Save Changes"
                            : "Create Requirement"
                    }
                />

            </form>

        </Modal>

    );

}


/*
 * ==================================================
 * MILESTONE MODAL
 * ==================================================
 */

function MilestoneModal({
    item,
    onClose,
    onSubmit,
    saving,
}) {

    const editing =
        Boolean(item);

    const [form, setForm] =
        useState({
            name:
                item?.name || "",
            description:
                item?.description || "",
            status:
                item?.status || "PENDING",
            dueDate:
                dateInput(
                    item?.dueDate
                ),
        });

    const [error, setError] =
        useState(null);


    async function submit(
        event
    ) {

        event.preventDefault();

        try {

            if (!form.name.trim()) {
                throw new Error(
                    "Milestone name is required."
                );
            }

            const data = {
                ...form,
                description:
                    form.description.trim() ||
                    null,
                dueDate:
                    form.dueDate ||
                    null,
            };

            await onSubmit(
                editing
                    ? {
                        id:
                            item.id,
                        data,
                    }
                    : data
            );

        } catch (err) {

            setError(
                err?.message ||
                "Unable to save milestone."
            );

        }

    }


    return (

        <Modal
            title={
                editing
                    ? "Edit Milestone"
                    : "Add Milestone"
            }
            onClose={onClose}
            disabled={saving}
        >

            <form
                onSubmit={submit}
                className="space-y-4"
            >

                {error && (
                    <FormError
                        message={error}
                    />
                )}

                <Field
                    label="Name"
                    required
                >

                    <input
                        value={form.name}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                name:
                                    event.target.value,
                            })
                        }
                        className={inputClass}
                        maxLength={200}
                        required
                    />

                </Field>


                <Field label="Description">

                    <textarea
                        value={form.description}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                description:
                                    event.target.value,
                            })
                        }
                        rows={4}
                        maxLength={3000}
                        className={`${inputClass} h-auto resize-none py-2.5`}
                    />

                </Field>


                <div className="grid gap-4 sm:grid-cols-2">

                    <SelectField
                        label="Status"
                        value={form.status}
                        options={MILESTONE_STATUS}
                        onChange={(value) =>
                            setForm({
                                ...form,
                                status:
                                    value,
                            })
                        }
                    />

                    <DateField
                        label="Due Date"
                        value={form.dueDate}
                        onChange={(value) =>
                            setForm({
                                ...form,
                                dueDate:
                                    value,
                            })
                        }
                    />

                </div>


                <ModalActions
                    saving={saving}
                    onClose={onClose}
                    submitLabel={
                        editing
                            ? "Save Changes"
                            : "Create Milestone"
                    }
                />

            </form>

        </Modal>

    );

}


/*
 * ==================================================
 * ISSUE MODAL
 * ==================================================
 */

function IssueModal({
    item,
    members,
    onClose,
    onSubmit,
    saving,
}) {

    const editing =
        Boolean(item);

    const [form, setForm] =
        useState({
            title:
                item?.title || "",
            description:
                item?.description || "",
            status:
                item?.status || "OPEN",
            priority:
                item?.priority || "MEDIUM",
            assignedToId:
                item?.assignedToId || "",
        });

    const [error, setError] =
        useState(null);


    async function submit(
        event
    ) {

        event.preventDefault();

        try {

            if (!form.title.trim()) {
                throw new Error(
                    "Issue title is required."
                );
            }

            const data = {
                ...form,
                description:
                    form.description.trim() ||
                    null,
                assignedToId:
                    form.assignedToId ||
                    null,
            };

            await onSubmit(
                editing
                    ? {
                        id:
                            item.id,
                        data,
                    }
                    : data
            );

        } catch (err) {

            setError(
                err?.message ||
                "Unable to save issue."
            );

        }

    }


    return (

        <Modal
            title={
                editing
                    ? "Edit Issue"
                    : "Report Issue"
            }
            onClose={onClose}
            disabled={saving}
        >

            <form
                onSubmit={submit}
                className="space-y-4"
            >

                {error && (
                    <FormError
                        message={error}
                    />
                )}

                <Field
                    label="Title"
                    required
                >

                    <input
                        value={form.title}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                title:
                                    event.target.value,
                            })
                        }
                        className={inputClass}
                        maxLength={200}
                        required
                    />

                </Field>


                <Field label="Description">

                    <textarea
                        value={form.description}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                description:
                                    event.target.value,
                            })
                        }
                        rows={5}
                        maxLength={5000}
                        className={`${inputClass} h-auto resize-none py-2.5`}
                    />

                </Field>


                <div className="grid gap-4 sm:grid-cols-2">

                    <SelectField
                        label="Status"
                        value={form.status}
                        options={ISSUE_STATUS}
                        onChange={(value) =>
                            setForm({
                                ...form,
                                status:
                                    value,
                            })
                        }
                    />

                    <SelectField
                        label="Priority"
                        value={form.priority}
                        options={PRIORITY_OPTIONS}
                        onChange={(value) =>
                            setForm({
                                ...form,
                                priority:
                                    value,
                            })
                        }
                    />

                </div>


                <Field label="Assign To">

                    <select
                        value={form.assignedToId}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                assignedToId:
                                    event.target.value,
                            })
                        }
                        className={inputClass}
                    >

                        <option value="">
                            Unassigned
                        </option>

                        {members.map(
                            (member) => {

                                const user =
                                    member.user ||
                                    member;

                                const id =
                                    member.userId ||
                                    user.id;

                                return (
                                    <option
                                        key={id}
                                        value={id}
                                    >
                                        {getUserName(user)}
                                    </option>
                                );

                            }
                        )}

                    </select>

                </Field>


                <ModalActions
                    saving={saving}
                    onClose={onClose}
                    submitLabel={
                        editing
                            ? "Save Changes"
                            : "Report Issue"
                    }
                />

            </form>

        </Modal>

    );

}


/*
 * ==================================================
 * CONTENT PANEL
 * ==================================================
 */

function ContentPanel({
    title,
    description,
    icon: Icon,
    action,
    children,
    className = "",
}) {

    return (

        <div className={`overflow-hidden rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] ${className}`}>

            <div className="flex flex-col gap-4 border-b border-[var(--bms-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10 text-blue-500">

                        <Icon
                            size={17}
                        />

                    </div>

                    <div>

                        <h2 className="text-sm font-semibold text-[var(--bms-text)]">
                            {title}
                        </h2>

                        <p className="mt-0.5 text-xs text-[var(--bms-text-muted)]">
                            {description}
                        </p>

                    </div>

                </div>

                {action}

            </div>

            <div className="p-5">
                {children}
            </div>

        </div>

    );

}


/*
 * ==================================================
 * RECORD ROW
 * ==================================================
 */

function RecordRow({
    title,
    description,
    status,
    priority,
    extra,
    onEdit,
    onDelete,
}) {

    return (

        <div className="flex flex-col gap-4 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="min-w-0">

                <p className="truncate text-sm font-medium text-[var(--bms-text)]">
                    {title}
                </p>

                {description && (
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--bms-text-muted)]">
                        {description}
                    </p>
                )}

                {extra && (
                    <p className="mt-2 text-xs text-[var(--bms-text-muted)]">
                        {extra}
                    </p>
                )}

            </div>


            <div className="flex shrink-0 items-center gap-2">

                {status && (
                    <StatusBadge
                        value={status}
                    />
                )}

                {priority && (
                    <PriorityBadge
                        priority={priority}
                    />
                )}

                <button
                    type="button"
                    onClick={onEdit}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--bms-text-muted)] hover:bg-[var(--bms-surface)] hover:text-[var(--bms-text)]"
                >

                    <Pencil
                        size={14}
                    />

                </button>

                <button
                    type="button"
                    onClick={onDelete}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10"
                >

                    <Trash2
                        size={14}
                    />

                </button>

            </div>

        </div>

    );

}


/*
 * ==================================================
 * DOCUMENT MODAL
 * ==================================================
 */

function DocumentModal({
    item,
    onClose,
    onSubmit,
    saving,
}) {

    const editing = Boolean(item);

    const [file, setFile] =
        useState(null);

    const [form, setForm] =
        useState({
            name: item?.name || item?.fileName || "",
            description: item?.description || "",
            type: item?.type || "OTHER",
        });

    const [error, setError] =
        useState(null);

    function handleFileChange(event) {
        const selected = event.target.files?.[0] || null;

        if (!selected) {
            setFile(null);
            return;
        }

        if (selected.size > 25 * 1024 * 1024) {
            setError("Document must be 25 MB or smaller.");
            event.target.value = "";
            setFile(null);
            return;
        }

        setError(null);
        setFile(selected);

        if (!form.name.trim()) {
            setForm((current) => ({
                ...current,
                name: selected.name,
            }));
        }
    }

    async function submit(event) {
        event.preventDefault();

        try {
            if (!editing && !file) {
                throw new Error("Please select a document.");
            }

            if (!form.name.trim()) {
                throw new Error("Document name is required.");
            }

            await onSubmit(
                editing
                    ? {
                        id: item.id,
                        data: {
                            file,
                            ...form,
                        },
                    }
                    : {
                        file,
                        ...form,
                    }
            );
        } catch (err) {
            setError(err?.message || "Unable to save document.");
        }
    }

    return (
        <Modal
            title={editing ? "Edit Document" : "Upload Document"}
            onClose={onClose}
            disabled={saving}
        >
            <form onSubmit={submit} className="space-y-4">
                {error && <FormError message={error} />}

                <Field label="Document" required={!editing}>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="block w-full cursor-pointer rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface)] px-3 py-2 text-xs text-[var(--bms-text-secondary)] file:mr-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-blue-700"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.webp"
                    />
                    <p className="mt-1.5 text-[11px] text-[var(--bms-text-muted)]">
                        Maximum 25 MB. Supported: PDF, Word, Excel, PowerPoint, text and common image files.
                    </p>
                    {file && (
                        <p className="mt-1 text-[11px] text-blue-500">
                            Selected: {file.name} · {formatFileSize(file.size)}
                        </p>
                    )}
                </Field>

                <Field label="Name" required>
                    <input
                        value={form.name}
                        onChange={(event) =>
                            setForm({ ...form, name: event.target.value })
                        }
                        className={inputClass}
                        maxLength={200}
                        required
                    />
                </Field>

                <SelectField
                    label="Type"
                    value={form.type}
                    options={[
                        ["REQUIREMENT", "Requirement"],
                        ["SPECIFICATION", "Specification"],
                        ["DESIGN", "Design"],
                        ["CONTRACT", "Contract"],
                        ["REPORT", "Report"],
                        ["OTHER", "Other"],
                    ]}
                    onChange={(value) =>
                        setForm({ ...form, type: value })
                    }
                />

                <Field label="Description">
                    <textarea
                        value={form.description}
                        onChange={(event) =>
                            setForm({ ...form, description: event.target.value })
                        }
                        rows={4}
                        maxLength={3000}
                        className={`${inputClass} h-auto resize-none py-2.5`}
                    />
                </Field>

                <ModalActions
                    saving={saving}
                    onClose={onClose}
                    submitLabel={editing ? "Save Changes" : "Upload Document"}
                />
            </form>
        </Modal>
    );
}


/*
 * ==================================================
 * CONFIRM DELETE MODAL
 * ==================================================
 */

function ConfirmDeleteModal({
    target,
    loading,
    onCancel,
    onConfirm,
}) {

    const isProject =
        target.type === "PROJECT";

    return (

        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

            <div className="w-full max-w-md rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-6 shadow-2xl">

                <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">

                        <Trash2
                            size={18}
                        />

                    </div>

                    <div>

                        <h2 className="text-sm font-semibold text-[var(--bms-text)]">
                            {isProject
                                ? "Delete Project"
                                : "Confirm Removal"
                            }
                        </h2>

                        <p className="mt-1 text-xs leading-5 text-[var(--bms-text-secondary)]">

                            {isProject
                                ? "The project will be permanently deleted if it meets the server's deletion rules."
                                : "This action will remove the selected record from the project."
                            }

                        </p>

                    </div>

                </div>


                <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4">

                    <p className="text-sm font-medium text-[var(--bms-text)]">
                        {target.name}
                    </p>

                </div>


                <div className="mt-6 flex justify-end gap-2">

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className={secondaryButton}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >

                        {loading && (
                            <RefreshCw
                                size={14}
                                className="animate-spin"
                            />
                        )}

                        {loading
                            ? "Removing..."
                            : isProject
                                ? "Delete"
                                : "Remove"
                        }

                    </button>

                </div>

            </div>

        </div>

    );

}


/*
 * ==================================================
 * USER DISPLAY
 * ==================================================
 */

function UserDisplay({
    user,
}) {

    return (

        <div className="flex min-w-0 items-center gap-3">

            <Avatar
                user={user}
            />

            <div className="min-w-0">

                <p className="truncate text-sm font-semibold text-[var(--bms-text)]">
                    {getUserName(user)}
                </p>

                <p className="truncate text-xs text-[var(--bms-text-muted)]">
                    {user?.email || "No email"}
                </p>

            </div>

        </div>

    );

}


function Avatar({
    user,
}) {

    const name =
        getUserName(user);

    const initials =
        name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(
                (part) =>
                    part.charAt(0)
            )
            .join("")
            .toUpperCase();

    if (user?.avatarUrl) {

        return (
            <img
                src={user.avatarUrl}
                alt=""
                className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
        );

    }

    return (

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-xs font-semibold text-blue-500">

            {initials || "U"}

        </div>

    );

}


/*
 * ==================================================
 * INFO CARD
 * ==================================================
 */

function InfoCard({
    label,
    value,
}) {

    return (

        <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-4">

            <p className="text-xs text-[var(--bms-text-muted)]">
                {label}
            </p>

            <p className="mt-2 text-sm font-semibold text-[var(--bms-text)]">
                {value}
            </p>

        </div>

    );

}


/*
 * ==================================================
 * BADGES
 * ==================================================
 */

function StatusBadge({
    value,
}) {

    return (

        <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-500">
            {formatStatus(value)}
        </span>

    );

}


function PriorityBadge({
    priority,
}) {

    const classes = {
        LOW:
            "bg-slate-500/10 text-slate-500",
        MEDIUM:
            "bg-blue-500/10 text-blue-500",
        HIGH:
            "bg-amber-500/10 text-amber-500",
        CRITICAL:
            "bg-red-500/10 text-red-500",
    };

    return (

        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${classes[priority] || "bg-gray-500/10 text-gray-500"}`}>
            {formatStatus(priority)}
        </span>

    );

}


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
            CircleAlert,
            "bg-red-500/10 text-red-500",
        ],
    };

    const [
        label,
        Icon,
        className,
    ] =
        config[status] || [
            formatStatus(status),
            Clock3,
            "bg-gray-500/10 text-gray-500",
        ];

    return (

        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>

            <Icon
                size={12}
            />

            {label}

        </span>

    );

}


/*
 * ==================================================
 * MODAL
 * ==================================================
 */

function Modal({
    title,
    children,
    onClose,
    disabled,
}) {

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-2xl">

                <div className="flex items-center justify-between border-b border-[var(--bms-border)] px-5 py-4">

                    <h2 className="text-sm font-semibold text-[var(--bms-text)]">
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={disabled}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--bms-text-muted)] hover:bg-[var(--bms-surface-soft)]"
                    >

                        <X
                            size={16}
                        />

                    </button>

                </div>

                <div className="p-5">
                    {children}
                </div>

            </div>

        </div>

    );

}


function ModalActions({
    saving,
    onClose,
    submitLabel,
}) {

    return (

        <div className="flex justify-end gap-2 border-t border-[var(--bms-border)] pt-5">

            <button
                type="button"
                onClick={onClose}
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

                {saving && (
                    <RefreshCw
                        size={14}
                        className="animate-spin"
                    />
                )}

                {saving
                    ? "Saving..."
                    : submitLabel
                }

            </button>

        </div>

    );

}


function Field({
    label,
    required,
    children,
}) {

    return (

        <label className="block">

            <span className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">

                {label}

                {required && (
                    <span className="ml-1 text-red-500">
                        *
                    </span>
                )}

            </span>

            {children}

        </label>

    );

}


function SelectField({
    label,
    value,
    options,
    onChange,
}) {

    return (

        <Field label={label}>

            <select
                value={value || ""}
                onChange={(event) =>
                    onChange(
                        event.target.value
                    )
                }
                className={inputClass}
            >

                {options.map(
                    ([optionValue, label]) => (
                        <option
                            key={optionValue}
                            value={optionValue}
                        >
                            {label}
                        </option>
                    )
                )}

            </select>

        </Field>

    );

}


function DateField({
    label,
    value,
    onChange,
}) {

    return (

        <Field label={label}>

            <input
                type="date"
                value={value || ""}
                onChange={(event) =>
                    onChange(
                        event.target.value
                    )
                }
                className={inputClass}
            />

        </Field>

    );

}


function FormError({
    message,
}) {

    return (

        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-500">
            {message}
        </div>

    );

}


function EmptyState({
    icon: Icon,
    title,
    description,
}) {

    return (

        <div className="flex min-h-52 flex-col items-center justify-center text-center">

            <Icon
                size={34}
                className="text-[var(--bms-text-muted)]"
            />

            <h3 className="mt-3 text-sm font-semibold text-[var(--bms-text)]">
                {title}
            </h3>

            <p className="mt-1 max-w-sm text-xs leading-5 text-[var(--bms-text-secondary)]">
                {description}
            </p>

        </div>

    );

}


function ProjectDetailsSkeleton() {

    return (

        <div className="space-y-6">

            <div className="h-5 w-32 animate-pulse rounded bg-[var(--bms-surface-soft)]" />

            <div className="h-48 animate-pulse rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]" />

            <div className="h-12 animate-pulse rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]" />

            <div className="grid gap-5 xl:grid-cols-3">

                <div className="h-72 animate-pulse rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] xl:col-span-2" />

                <div className="h-72 animate-pulse rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]" />

            </div>

        </div>

    );

}


/*
 * ==================================================
 * HELPERS
 * ==================================================
 */

function getUserName(
    user
) {

    if (!user) {
        return "Unknown User";
    }

    const name =
        `${user.firstName || ""} ${user.lastName || ""}`
            .trim();

    return (
        name ||
        user.name ||
        user.email ||
        "Unknown User"
    );

}


function formatStatus(
    value
) {

    if (!value) {
        return "Unknown";
    }

    return String(value)
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


function formatFileSize(
    bytes
) {

    const size = Number(bytes);

    if (!Number.isFinite(size) || size <= 0) {
        return "Unknown size";
    }

    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(
        Math.floor(Math.log(size) / Math.log(1024)),
        units.length - 1
    );

    return `${(size / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;

}


function formatDate(
    value
) {

    if (!value) {
        return "Not set";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Invalid date";
    }

    return new Intl.DateTimeFormat(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    ).format(date);

}


function dateInput(
    value
) {

    if (!value) {
        return "";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    return date
        .toISOString()
        .slice(0, 10);

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
    disabled:opacity-50
`;
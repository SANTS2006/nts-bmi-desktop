import {
    ArrowLeft,
    BriefcaseBusiness,
    CalendarDays,
    CheckCircle2,
    Mail,
    RefreshCw,
    ShieldCheck,
    Trash2,
    UserMinus,
    UserPlus,
    UsersRound,
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
    getTeamById,
    addTeamMember,
    removeTeamMember,
    assignTeamLead,
    removeTeamLead,
} from "../../api/teams.js";

import {
    getEmployees,
} from "../../api/employee.js";

import {
    Button,
    Empty,
    ErrorBox,
    Modal,
    PageHeader,
    arrayData,
    dateOf,
    getError,
    nameOf,
    selectClass,
} from "../../components/employeeManagement/ManagementUI.jsx";


/**
 * ============================================================
 * HELPERS
 * ============================================================
 */

function unwrap(response) {
    return response?.data ?? response;
}


function list(response, keys = []) {
    return arrayData(response, keys);
}


function getEmployeeUser(employee) {
    return employee?.user || employee;
}


function getEmployeeName(employee) {
    return nameOf(
        employee,
        "Unknown employee"
    );
}


function getEmployeeInitials(
    employee
) {
    const user =
        getEmployeeUser(employee);

    const first =
        user?.firstName?.charAt(0) ||
        "";

    const last =
        user?.lastName?.charAt(0) ||
        "";

    return (
        `${first}${last}`.toUpperCase() ||
        "E"
    );
}


function getEmployeeEmail(
    employee
) {
    const user =
        getEmployeeUser(employee);

    return (
        user?.email ||
        employee?.email ||
        "No email available"
    );
}


function getEmployeeJobTitle(
    employee
) {
    return (
        employee?.jobTitle ||
        employee?.position ||
        employee?.job?.title ||
        "Job title not specified"
    );
}


function getEmployeeStatus(
    employee
) {
    return (
        employee?.employmentStatus ||
        getEmployeeUser(employee)?.status ||
        "UNKNOWN"
    );
}


function labelize(value = "") {
    return String(value)
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            (letter) =>
                letter.toUpperCase()
        );
}


/**
 * ============================================================
 * CONFIRMATION MODAL
 * ============================================================
 */

function ConfirmationModal({
    title,
    description,
    confirmText,
    loading,
    danger = true,
    onCancel,
    onConfirm,
}) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-2xl">

                <div className="border-b border-[var(--bms-border)] p-5">

                    <div className="flex items-start gap-3">

                        <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                danger
                                    ? "bg-red-500/10 text-red-500"
                                    : "bg-blue-500/10 text-blue-500"
                            }`}
                        >
                            {danger ? (
                                <Trash2 size={19} />
                            ) : (
                                <ShieldCheck size={19} />
                            )}
                        </div>

                        <div>

                            <h3 className="font-semibold text-[var(--bms-text)]">
                                {title}
                            </h3>

                            <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                                Please confirm this action.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="p-5">

                    <p className="text-sm leading-6 text-[var(--bms-text-secondary)]">
                        {description}
                    </p>

                </div>


                <div className="flex justify-end gap-2 border-t border-[var(--bms-border)] p-4">

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={
                            onCancel
                        }
                        disabled={
                            loading
                        }
                    >
                        Cancel
                    </Button>


                    <button
                        type="button"
                        onClick={
                            onConfirm
                        }
                        disabled={
                            loading
                        }
                        className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            danger
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-blue-500 hover:bg-blue-600"
                        }`}
                    >
                        {danger ? (
                            <Trash2 size={15} />
                        ) : (
                            <CheckCircle2 size={15} />
                        )}

                        {loading
                            ? "Processing..."
                            : confirmText}
                    </button>

                </div>

            </div>

        </div>
    );
}


/**
 * ============================================================
 * MEMBER CARD
 * ============================================================
 */

function TeamMemberCard({
    member,
    isTeamLead,
    disabled,
    onRemove,
}) {
    const employee =
        member?.employee || member;

    const employeeName =
        getEmployeeName(
            employee
        );

    return (
        <article className="group overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] transition duration-200 hover:border-blue-500/30 hover:shadow-md">

            <div className="h-1 bg-blue-500" />

            <div className="p-5">

                {/* Header */}
                <div className="flex items-start gap-3">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-500/10 text-sm font-bold text-blue-500">
                        {getEmployeeInitials(
                            employee
                        )}
                    </div>


                    <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                            <h3 className="truncate font-semibold text-[var(--bms-text)]">
                                {employeeName}
                            </h3>

                            {isTeamLead && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-[9px] font-semibold text-blue-500">
                                    <ShieldCheck size={11} />
                                    Team Lead
                                </span>
                            )}

                        </div>


                        <p className="mt-1 text-[10px] text-[var(--bms-text-muted)]">
                            {employee?.employeeNumber ||
                                "No employee number"}
                        </p>

                    </div>

                </div>


                {/* Information */}
                <div className="mt-4 space-y-2">

                    <div className="flex items-center gap-3 rounded-xl bg-[var(--bms-surface-soft)] p-3">

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                            <BriefcaseBusiness size={14} />
                        </div>

                        <div className="min-w-0">

                            <p className="text-[9px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                                Job title
                            </p>

                            <p className="truncate text-xs font-medium text-[var(--bms-text)]">
                                {getEmployeeJobTitle(
                                    employee
                                )}
                            </p>

                        </div>

                    </div>


                    <div className="flex items-center gap-3 rounded-xl bg-[var(--bms-surface-soft)] p-3">

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                            <Mail size={14} />
                        </div>

                        <div className="min-w-0">

                            <p className="text-[9px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                                Email
                            </p>

                            <p className="truncate text-xs font-medium text-[var(--bms-text)]">
                                {getEmployeeEmail(
                                    employee
                                )}
                            </p>

                        </div>

                    </div>


                    <div className="grid grid-cols-2 gap-2">

                        <div className="rounded-xl bg-[var(--bms-surface-soft)] p-3">

                            <p className="text-[9px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                                Team role
                            </p>

                            <span
                                className={`mt-1 inline-flex rounded-full px-2 py-1 text-[9px] font-semibold ${
                                    member?.role ===
                                    "LEAD"
                                        ? "bg-blue-500/10 text-blue-500"
                                        : "bg-slate-500/10 text-[var(--bms-text-secondary)]"
                                }`}
                            >
                                {labelize(
                                    member?.role ||
                                        "MEMBER"
                                )}
                            </span>

                        </div>


                        <div className="rounded-xl bg-[var(--bms-surface-soft)] p-3">

                            <div className="flex items-center gap-1.5">

                                <CalendarDays
                                    size={11}
                                    className="text-blue-500"
                                />

                                <p className="text-[9px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                                    Joined
                                </p>

                            </div>

                            <p className="mt-1 truncate text-[10px] font-medium text-[var(--bms-text)]">
                                {dateOf(
                                    member?.joinedAt
                                )}
                            </p>

                        </div>

                    </div>


                    <div className="flex items-center justify-between rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-3 py-2">

                        <span className="text-[10px] text-[var(--bms-text-muted)]">
                            Employee status
                        </span>

                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-500">

                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                            {labelize(
                                getEmployeeStatus(
                                    employee
                                )
                            )}

                        </span>

                    </div>

                </div>


                {/* Actions */}
                <div className="mt-4 flex justify-end border-t border-[var(--bms-border)] pt-4">

                    <button
                        type="button"
                        onClick={() =>
                            onRemove(
                                member
                            )
                        }
                        disabled={
                            disabled ||
                            isTeamLead
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                        title={
                            isTeamLead
                                ? "Assign another team lead before removing this employee."
                                : "Remove employee"
                        }
                    >
                        <UserMinus size={14} />
                        Remove employee
                    </button>

                </div>

            </div>

        </article>
    );
}


/**
 * ============================================================
 * TEAM DETAILS
 * ============================================================
 */

export default function TeamDetails() {

    const navigate =
        useNavigate();

    const { id } =
        useParams();


    /**
     * ========================================================
     * STATE
     * ========================================================
     */

    const [team, setTeam] =
        useState(null);

    const [employees, setEmployees] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [actionLoading, setActionLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    /**
     * ========================================================
     * ADD MEMBER
     * ========================================================
     */

    const [memberId, setMemberId] =
        useState("");

    const [memberRole, setMemberRole] =
        useState("MEMBER");


    /**
     * ========================================================
     * LEAD
     * ========================================================
     */

    const [leadId, setLeadId] =
        useState("");


    /**
     * ========================================================
     * CONFIRMATION
     * ========================================================
     */

    const [confirmation, setConfirmation] =
        useState(null);


    /**
     * ========================================================
     * LOAD TEAM
     * ========================================================
     */

    const loadTeam =
        useCallback(
            async ({
                refresh = false,
            } = {}) => {

                if (!id) {
                    setError(
                        "Team ID is missing."
                    );

                    setLoading(false);

                    return;
                }

                try {

                    if (refresh) {
                        setRefreshing(true);
                    } else {
                        setLoading(true);
                    }

                    setError("");

                    const [
                        teamResponse,
                        employeesResponse,
                    ] = await Promise.all([
                        getTeamById(id),

                        getEmployees({
                            page: 1,
                            limit: 100,
                            status: "ACTIVE",
                        }),
                    ]);


                    const teamData =
                        unwrap(
                            teamResponse
                        );

                    setTeam(
                        teamData
                    );

                    setLeadId(
                        teamData?.teamLeadId ||
                            ""
                    );


                    setEmployees(
                        list(
                            employeesResponse,
                            ["employees"]
                        )
                    );

                } catch (err) {

                    console.error(
                        "Failed to load team:",
                        err
                    );

                    setError(
                        getError(
                            err,
                            "Unable to load team details."
                        )
                    );

                } finally {

                    setLoading(false);
                    setRefreshing(false);

                }

            },
            [id]
        );


    useEffect(() => {
        loadTeam();
    }, [loadTeam]);


    /**
     * ========================================================
     * MEMBERS
     * ========================================================
     */

    const members =
        useMemo(
            () =>
                Array.isArray(
                    team?.members
                )
                    ? team.members
                    : [],
            [team]
        );


    const availableEmployees =
        useMemo(() => {

            const memberIds =
                new Set(
                    members.map(
                        (
                            member
                        ) =>
                            member.employeeId
                    )
                );

            return employees.filter(
                (
                    employee
                ) =>
                    !memberIds.has(
                        employee.id
                    )
            );

        }, [
            employees,
            members,
        ]);


    /**
     * ========================================================
     * STATISTICS
     * ========================================================
     */

    const statistics =
        useMemo(() => {

            const leads =
                members.filter(
                    (
                        member
                    ) =>
                        member.role ===
                        "LEAD"
                ).length;

            const active =
                members.filter(
                    (
                        member
                    ) =>
                        getEmployeeStatus(
                            member?.employee ||
                                member
                        ) ===
                        "ACTIVE"
                ).length;

            return {
                members:
                    members.length,

                leads,

                active,

                available:
                    availableEmployees.length,
            };

        }, [
            members,
            availableEmployees,
        ]);


    /**
     * ========================================================
     * ADD MEMBER
     * ========================================================
     */

    async function handleAddMember() {

        if (!memberId) {

            setError(
                "Please select an employee."
            );

            return;
        }

        try {

            setActionLoading(true);
            setError("");

            await addTeamMember({
                teamId: id,
                employeeId:
                    memberId,
                role:
                    memberRole,
            });

            setMemberId("");
            setMemberRole("MEMBER");

            await loadTeam({
                refresh: true,
            });

        } catch (err) {

            console.error(
                "Failed to add team member:",
                err
            );

            setError(
                getError(
                    err,
                    "Unable to add team member."
                )
            );

        } finally {

            setActionLoading(
                false
            );

        }
    }


    /**
     * ========================================================
     * REQUEST REMOVE MEMBER
     * ========================================================
     */

    function requestRemoveMember(
        member
    ) {

        const employee =
            member?.employee ||
            member;

        const employeeName =
            getEmployeeName(
                employee
            );

        setConfirmation({
            type:
                "member",

            employeeId:
                member?.employeeId ||
                employee?.id,

            name:
                employeeName,
        });
    }


    /**
     * ========================================================
     * REQUEST REMOVE LEAD
     * ========================================================
     */

    function requestRemoveLead() {

        if (!team?.teamLeadId) {
            return;
        }

        const lead =
            team?.teamLead;

        setConfirmation({
            type:
                "lead",

            name:
                getEmployeeName(
                    lead
                ),
        });
    }


    /**
     * ========================================================
     * CONFIRM ACTION
     * ========================================================
     */

    async function confirmAction() {

        if (
            !confirmation ||
            actionLoading
        ) {
            return;
        }

        try {

            setActionLoading(true);
            setError("");


            if (
                confirmation.type ===
                "member"
            ) {

                await removeTeamMember({
                    teamId:
                        id,

                    employeeId:
                        confirmation.employeeId,
                });

            }


            if (
                confirmation.type ===
                "lead"
            ) {

                await removeTeamLead(
                    id
                );

            }


            setConfirmation(
                null
            );

            await loadTeam({
                refresh: true,
            });

        } catch (err) {

            console.error(
                "Failed to complete team action:",
                err
            );

            setError(
                getError(
                    err,
                    "Unable to complete the requested action."
                )
            );

            setConfirmation(
                null
            );

        } finally {

            setActionLoading(
                false
            );

        }
    }


    /**
     * ========================================================
     * ASSIGN LEAD
     * ========================================================
     */

    async function handleAssignLead() {

        if (!leadId) {

            setError(
                "Please select a team member."
            );

            return;
        }

        try {

            setActionLoading(true);
            setError("");

            await assignTeamLead({
                teamId:
                    id,

                employeeId:
                    leadId,
            });

            await loadTeam({
                refresh: true,
            });

        } catch (err) {

            console.error(
                "Failed to assign team lead:",
                err
            );

            setError(
                getError(
                    err,
                    "Unable to assign team lead."
                )
            );

        } finally {

            setActionLoading(
                false
            );

        }
    }


    /**
     * ========================================================
     * LOADING
     * ========================================================
     */

    if (
        loading &&
        !team
    ) {

        return (
            <div className="p-4 sm:p-6">

                <Empty
                    text="Loading team details..."
                />

            </div>
        );
    }


    /**
     * ========================================================
     * ERROR / NOT FOUND
     * ========================================================
     */

    if (
        !team &&
        error
    ) {

        return (
            <div className="p-4 sm:p-6">

                <Button
                    variant="secondary"
                    onClick={() =>
                        navigate(
                            "/teams"
                        )
                    }
                >
                    <ArrowLeft
                        size={15}
                    />
                    Back to teams
                </Button>

                <div className="mt-4">
                    <ErrorBox
                        message={
                            error
                        }
                    />
                </div>

            </div>
        );
    }


    return (
        <div className="p-4 sm:p-6">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="mb-5">

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/teams"
                        )
                    }
                    className="mb-4 inline-flex items-center gap-2 text-xs font-medium text-[var(--bms-text-muted)] transition hover:text-blue-500"
                >
                    <ArrowLeft size={15} />
                    Back to teams
                </button>


                <PageHeader
                    icon={UsersRound}
                    title={
                        team?.name ||
                        "Team details"
                    }
                    description={
                        team?.description ||
                        "View and manage team information and employee membership."
                    }
                    onRefresh={() =>
                        loadTeam({
                            refresh: true,
                        })
                    }
                    refreshing={
                        refreshing
                    }
                />

            </div>


            {error && (
                <div className="mb-5">
                    <ErrorBox
                        message={
                            error
                        }
                    />
                </div>
            )}


            {/* ==================================================
                TEAM HERO
            ================================================== */}

            <section className="overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

                <div className="h-1 bg-blue-500" />

                <div className="p-5 sm:p-6">

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex min-w-0 items-center gap-4">

                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                                <UsersRound size={27} />
                            </div>

                            <div className="min-w-0">

                                <div className="flex flex-wrap items-center gap-2">

                                    <h1 className="truncate text-xl font-bold text-[var(--bms-text)]">
                                        {team?.name}
                                    </h1>

                                    <span
                                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                            team?.isActive
                                                ? "bg-emerald-500/10 text-emerald-500"
                                                : "bg-slate-500/10 text-slate-500"
                                        }`}
                                    >
                                        {team?.isActive
                                            ? "Active"
                                            : "Inactive"}
                                    </span>

                                </div>

                                <p className="mt-1 text-sm text-[var(--bms-text-muted)]">
                                    {team?.department?.name ||
                                        "No department assigned"}
                                </p>

                            </div>

                        </div>


                        <div className="grid grid-cols-3 gap-2">

                            <div className="rounded-xl bg-[var(--bms-surface-soft)] px-4 py-3 text-center">

                                <p className="text-xl font-bold text-[var(--bms-text)]">
                                    {
                                        statistics.members
                                    }
                                </p>

                                <p className="text-[9px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                                    Members
                                </p>

                            </div>


                            <div className="rounded-xl bg-[var(--bms-surface-soft)] px-4 py-3 text-center">

                                <p className="text-xl font-bold text-blue-500">
                                    {
                                        statistics.leads
                                    }
                                </p>

                                <p className="text-[9px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                                    Leads
                                </p>

                            </div>


                            <div className="rounded-xl bg-[var(--bms-surface-soft)] px-4 py-3 text-center">

                                <p className="text-xl font-bold text-emerald-500">
                                    {
                                        statistics.active
                                    }
                                </p>

                                <p className="text-[9px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                                    Active
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* ==================================================
                TEAM INFORMATION
            ================================================== */}

            <section className="mt-5 grid gap-4 lg:grid-cols-3">

                <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">

                    <p className="text-[9px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                        Department
                    </p>

                    <p className="mt-2 font-semibold text-[var(--bms-text)]">
                        {team?.department?.name ||
                            "Unassigned"}
                    </p>

                </div>


                <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">

                    <p className="text-[9px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                        Team lead
                    </p>

                    <p className="mt-2 font-semibold text-[var(--bms-text)]">
                        {nameOf(
                            team?.teamLead,
                            "No team lead assigned"
                        )}
                    </p>

                </div>


                <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">

                    <p className="text-[9px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                        Available employees
                    </p>

                    <p className="mt-2 font-semibold text-[var(--bms-text)]">
                        {
                            statistics.available
                        }
                    </p>

                </div>

            </section>


            {/* ==================================================
                MANAGEMENT
            ================================================== */}

            <div className="mt-5 grid gap-5 lg:grid-cols-2">

                {/* ADD MEMBER */}
                <section className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5">

                    <div className="flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                            <UserPlus size={17} />
                        </div>

                        <div>

                            <h2 className="font-semibold text-[var(--bms-text)]">
                                Add employee
                            </h2>

                            <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                                Add an active employee to this team.
                            </p>

                        </div>

                    </div>


                    <div className="mt-4 space-y-3">

                        <select
                            className={
                                selectClass
                            }
                            value={
                                memberId
                            }
                            onChange={(
                                event
                            ) =>
                                setMemberId(
                                    event.target.value
                                )
                            }
                            disabled={
                                actionLoading
                            }
                        >

                            <option value="">
                                Select employee
                            </option>

                            {availableEmployees.map(
                                (
                                    employee
                                ) => (
                                    <option
                                        key={
                                            employee.id
                                        }
                                        value={
                                            employee.id
                                        }
                                    >
                                        {
                                            getEmployeeName(
                                                employee
                                            )
                                        }

                                        {employee.employeeNumber
                                            ? ` · ${employee.employeeNumber}`
                                            : ""}
                                    </option>
                                )
                            )}

                        </select>


                        <div className="flex gap-2">

                            <select
                                className={
                                    selectClass
                                }
                                value={
                                    memberRole
                                }
                                onChange={(
                                    event
                                ) =>
                                    setMemberRole(
                                        event.target.value
                                    )
                                }
                                disabled={
                                    actionLoading
                                }
                            >

                                <option value="MEMBER">
                                    Member
                                </option>

                                <option value="LEAD">
                                    Lead
                                </option>

                            </select>


                            <Button
                                onClick={
                                    handleAddMember
                                }
                                disabled={
                                    actionLoading ||
                                    !memberId
                                }
                            >
                                <UserPlus
                                    size={15}
                                />
                                Add
                            </Button>

                        </div>

                    </div>

                </section>


                {/* TEAM LEAD */}
                <section className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5">

                    <div className="flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                            <ShieldCheck size={17} />
                        </div>

                        <div>

                            <h2 className="font-semibold text-[var(--bms-text)]">
                                Manage team lead
                            </h2>

                            <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                                Select a current team member as the team lead.
                            </p>

                        </div>

                    </div>


                    <div className="mt-4 space-y-3">

                        <select
                            className={
                                selectClass
                            }
                            value={
                                leadId
                            }
                            onChange={(
                                event
                            ) =>
                                setLeadId(
                                    event.target.value
                                )
                            }
                            disabled={
                                actionLoading
                            }
                        >

                            <option value="">
                                Select team member
                            </option>

                            {members.map(
                                (
                                    member
                                ) => (
                                    <option
                                        key={
                                            member.employeeId
                                        }
                                        value={
                                            member.employeeId
                                        }
                                    >
                                        {
                                            getEmployeeName(
                                                member.employee
                                            )
                                        }
                                    </option>
                                )
                            )}

                        </select>


                        <div className="flex gap-2">

                            <Button
                                onClick={
                                    handleAssignLead
                                }
                                disabled={
                                    actionLoading ||
                                    !leadId
                                }
                            >
                                <ShieldCheck
                                    size={15}
                                />
                                Assign lead
                            </Button>


                            <Button
                                variant="secondary"
                                onClick={
                                    requestRemoveLead
                                }
                                disabled={
                                    actionLoading ||
                                    !team?.teamLeadId
                                }
                            >
                                <X size={15} />
                                Remove lead
                            </Button>

                        </div>

                    </div>

                </section>

            </div>


            {/* ==================================================
                MEMBERS
            ================================================== */}

            <section className="mt-5">

                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

                    <div>

                        <div className="flex items-center gap-2">

                            <h2 className="font-semibold text-[var(--bms-text)]">
                                Team members
                            </h2>

                            <span className="rounded-full bg-blue-500/10 px-2 py-1 text-[9px] font-semibold text-blue-500">
                                {
                                    members.length
                                }
                            </span>

                        </div>

                        <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                            Employees currently assigned to this team.
                        </p>

                    </div>

                </div>


                {members.length === 0 ? (

                    <div className="rounded-2xl border border-dashed border-[var(--bms-border)] bg-[var(--bms-surface)] p-12 text-center">

                        <UsersRound
                            size={32}
                            className="mx-auto text-[var(--bms-text-muted)]"
                        />

                        <h3 className="mt-3 font-semibold text-[var(--bms-text)]">
                            No team members
                        </h3>

                        <p className="mt-1 text-sm text-[var(--bms-text-muted)]">
                            Use the Add employee section above to add the first member.
                        </p>

                    </div>

                ) : (

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                        {members.map(
                            (
                                member
                            ) => (

                                <TeamMemberCard
                                    key={
                                        member.id ||
                                        member.employeeId
                                    }
                                    member={
                                        member
                                    }
                                    isTeamLead={
                                        team?.teamLeadId ===
                                        member.employeeId
                                    }
                                    disabled={
                                        actionLoading
                                    }
                                    onRemove={
                                        requestRemoveMember
                                    }
                                />

                            )
                        )}

                    </div>

                )}

            </section>


            {/* ==================================================
                CONFIRMATION MODAL
            ================================================== */}

            {confirmation && (
                <ConfirmationModal
                    title={
                        confirmation.type ===
                        "lead"
                            ? "Remove team lead?"
                            : "Remove employee?"
                    }
                    description={
                        confirmation.type ===
                        "lead"
                            ? `Are you sure you want to remove ${confirmation.name} as the team lead? The employee will remain a member of the team.`
                            : `Are you sure you want to remove ${confirmation.name} from this team? This will remove their team membership.`
                    }
                    confirmText={
                        confirmation.type ===
                        "lead"
                            ? "Remove lead"
                            : "Remove employee"
                    }
                    loading={
                        actionLoading
                    }
                    onCancel={() => {
                        if (
                            !actionLoading
                        ) {
                            setConfirmation(
                                null
                            );
                        }
                    }}
                    onConfirm={
                        confirmAction
                    }
                />
            )}

        </div>
    );
}
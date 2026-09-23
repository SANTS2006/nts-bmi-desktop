import {
    Building2,
    Pencil,
    Plus,
    ShieldCheck,
    Trash2,
    UsersRound,
    Eye,
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
    getTeams,
    createTeam,
    updateTeam,
    deleteTeam,
} from "../api/teams.js";

import {
    getEmployees,
} from "../api/employee.js";

import {
    getDepartments,
} from "../api/departments.js";

import {
    arrayData,
    getError,
    nameOf,
    Button,
    Empty,
    ErrorBox,
    Field,
    inputClass,
    Modal,
    PageHeader,
    selectClass,
    textareaClass,
} from "../components/employeeManagement/ManagementUI.jsx";


/**
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

const EMPTY_FORM = {
    name: "",
    description: "",
    departmentId: "",
    teamLeadId: "",
    isActive: true,
};


/**
 * ============================================================
 * HELPERS
 * ============================================================
 */

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


/**
 * ============================================================
 * CONFIRMATION MODAL
 * ============================================================
 */

function ConfirmDeleteModal({
    teamName,
    loading,
    onCancel,
    onConfirm,
}) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-2xl">

                {/* Header */}
                <div className="border-b border-[var(--bms-border)] p-5">

                    <div className="flex items-start gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                            <Trash2 size={19} />
                        </div>

                        <div className="min-w-0">

                            <h3 className="font-semibold text-[var(--bms-text)]">
                                Delete team
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-[var(--bms-text-muted)]">
                                This action cannot be undone.
                            </p>

                        </div>

                    </div>

                </div>


                {/* Body */}
                <div className="p-5">

                    <p className="text-sm leading-6 text-[var(--bms-text-secondary)]">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-[var(--bms-text)]">
                            "{teamName}"
                        </span>
                        ?
                    </p>

                    <p className="mt-3 rounded-lg border border-red-500/10 bg-red-500/5 p-3 text-xs leading-5 text-red-500">
                        Teams with existing members cannot be deleted.
                        The backend will reject the operation if members
                        are still assigned to this team.
                    </p>

                </div>


                {/* Footer */}
                <div className="flex justify-end gap-2 border-t border-[var(--bms-border)] p-4">

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </Button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Trash2 size={15} />

                        {loading
                            ? "Deleting..."
                            : "Delete team"}
                    </button>

                </div>

            </div>

        </div>
    );
}


/**
 * ============================================================
 * TEAM CARD
 * ============================================================
 */

function TeamCard({
    team,
    onView,
    onEdit,
    onDelete,
}) {
    const memberCount =
        Number(
            team?._count?.members
        ) || 0;

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] transition duration-200 hover:-translate-y-0.5 hover:border-blue-500/30 hover:shadow-lg">

            {/* Accent */}
            <div className="h-1 bg-blue-500" />

            <div className="flex flex-1 flex-col p-5">

                {/* Header */}
                <div className="flex items-start justify-between gap-3">

                    <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                            <UsersRound size={21} />
                        </div>

                        <div className="min-w-0">

                            <h3 className="truncate font-semibold text-[var(--bms-text)]">
                                {team.name}
                            </h3>

                            <p className="mt-1 text-[10px] text-[var(--bms-text-muted)]">
                                Team
                            </p>

                        </div>

                    </div>


                    <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            team.isActive
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-slate-500/10 text-slate-500"
                        }`}
                    >
                        {team.isActive
                            ? "Active"
                            : "Inactive"}
                    </span>

                </div>


                {/* Description */}
                <p className="mt-4 min-h-[44px] text-sm leading-6 text-[var(--bms-text-secondary)]">
                    {team.description ||
                        "No description available for this team."}
                </p>


                {/* Stats */}
                <div className="mt-5 grid grid-cols-2 gap-2">

                    <div className="rounded-xl bg-[var(--bms-surface-soft)] p-3">

                        <p className="text-[9px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                            Department
                        </p>

                        <p className="mt-1 truncate text-xs font-semibold text-[var(--bms-text)]">
                            {team.department?.name ||
                                "Unassigned"}
                        </p>

                    </div>


                    <div className="rounded-xl bg-[var(--bms-surface-soft)] p-3">

                        <p className="text-[9px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                            Members
                        </p>

                        <p className="mt-1 text-xs font-semibold text-[var(--bms-text)]">
                            {memberCount}
                        </p>

                    </div>

                </div>


                {/* Team lead */}
                <div className="mt-2 rounded-xl bg-[var(--bms-surface-soft)] p-3">

                    <div className="flex items-center justify-between gap-3">

                        <div className="min-w-0">

                            <p className="text-[9px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                                Team lead
                            </p>

                            <p className="mt-1 truncate text-xs font-semibold text-[var(--bms-text)]">
                                {nameOf(
                                    team.teamLead,
                                    "No team lead assigned"
                                )}
                            </p>

                        </div>

                        <ShieldCheck
                            size={16}
                            className="shrink-0 text-blue-500"
                        />

                    </div>

                </div>


                {/* Actions */}
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--bms-border)] pt-4">

                    <Button
                        onClick={onView}
                    >
                        <Eye size={15} />
                        View details
                    </Button>


                    <div className="flex items-center gap-1">

                        <button
                            type="button"
                            onClick={onEdit}
                            className="rounded-lg p-2 text-[var(--bms-text-muted)] transition hover:bg-[var(--bms-surface-soft)] hover:text-blue-500"
                            aria-label={`Edit ${team.name}`}
                        >
                            <Pencil size={16} />
                        </button>


                        <button
                            type="button"
                            onClick={onDelete}
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-500/10"
                            aria-label={`Delete ${team.name}`}
                        >
                            <Trash2 size={16} />
                        </button>

                    </div>

                </div>

            </div>

        </article>
    );
}


/**
 * ============================================================
 * TEAMS PAGE
 * ============================================================
 */

export default function Teams() {

    const navigate =
        useNavigate();


    /**
     * ========================================================
     * STATE
     * ========================================================
     */

    const [teams, setTeams] =
        useState([]);

    const [employees, setEmployees] =
        useState([]);

    const [departments, setDepartments] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");


    /**
     * ========================================================
     * CREATE / EDIT
     * ========================================================
     */

    const [teamModalOpen, setTeamModalOpen] =
        useState(false);

    const [editingTeam, setEditingTeam] =
        useState(null);

    const [form, setForm] =
        useState(EMPTY_FORM);

    const [saving, setSaving] =
        useState(false);


    /**
     * ========================================================
     * DELETE CONFIRMATION
     * ========================================================
     */

    const [deleteConfirmation, setDeleteConfirmation] =
        useState(null);

    const [deleting, setDeleting] =
        useState(false);


    /**
     * ========================================================
     * LOAD DATA
     * ========================================================
     */

    const load = useCallback(
        async ({
            refresh = false,
        } = {}) => {

            try {

                if (refresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const [
                    teamsResponse,
                    departmentsResponse,
                    employeesResponse,
                ] = await Promise.all([
                    getTeams(),

                    getDepartments(),

                    getEmployees({
                        page: 1,
                        limit: 100,
                        status: "ACTIVE",
                    }),
                ]);


                setTeams(
                    list(
                        teamsResponse,
                        ["teams"]
                    )
                );


                setDepartments(
                    list(
                        departmentsResponse,
                        ["departments"]
                    )
                );


                setEmployees(
                    list(
                        employeesResponse,
                        ["employees"]
                    )
                );

            } catch (err) {

                console.error(
                    "Failed to load teams:",
                    err
                );

                setError(
                    getError(
                        err,
                        "Unable to load teams."
                    )
                );

            } finally {

                setLoading(false);
                setRefreshing(false);

            }

        },
        []
    );


    useEffect(() => {
        load();
    }, [load]);


    /**
     * ========================================================
     * STATISTICS
     * ========================================================
     */

    const statistics =
        useMemo(() => {

            const active =
                teams.filter(
                    (team) =>
                        team.isActive
                ).length;

            const inactive =
                teams.length -
                active;

            const members =
                teams.reduce(
                    (
                        total,
                        team
                    ) =>
                        total +
                        (
                            Number(
                                team?._count?.members
                            ) || 0
                        ),
                    0
                );

            const withLeads =
                teams.filter(
                    (team) =>
                        Boolean(
                            team.teamLeadId ||
                            team.teamLead
                        )
                ).length;

            return {
                total:
                    teams.length,
                active,
                inactive,
                members,
                withLeads,
            };

        }, [teams]);


    /**
     * ========================================================
     * TEAM FORM
     * ========================================================
     */

    function openCreateModal() {

        setEditingTeam(null);

        setForm({
            ...EMPTY_FORM,
        });

        setError("");

        setTeamModalOpen(true);
    }


    function openEditModal(team) {

        setEditingTeam(team);

        setForm({
            name:
                team.name || "",

            description:
                team.description || "",

            departmentId:
                team.departmentId || "",

            teamLeadId:
                team.teamLeadId || "",

            isActive:
                team.isActive !== false,
        });

        setError("");

        setTeamModalOpen(true);
    }


    function closeTeamModal() {

        if (saving) {
            return;
        }

        setTeamModalOpen(false);

        setEditingTeam(null);

        setForm({
            ...EMPTY_FORM,
        });
    }


    async function handleSave(
        event
    ) {

        event.preventDefault();

        try {

            setSaving(true);
            setError("");

            const payload = {
                name:
                    form.name.trim(),

                description:
                    form.description.trim() ||
                    null,

                departmentId:
                    form.departmentId ||
                    null,

                teamLeadId:
                    form.teamLeadId ||
                    null,

                isActive:
                    Boolean(
                        form.isActive
                    ),
            };


            if (editingTeam) {

                await updateTeam(
                    editingTeam.id,
                    payload
                );

            } else {

                await createTeam(
                    payload
                );

            }


            closeTeamModal();

            await load({
                refresh: true,
            });

        } catch (err) {

            console.error(
                "Failed to save team:",
                err
            );

            setError(
                getError(
                    err,
                    "Unable to save team."
                )
            );

        } finally {

            setSaving(false);

        }

    }


    /**
     * ========================================================
     * DELETE TEAM
     * ========================================================
     */

    function requestDelete(
        team
    ) {

        setError("");

        setDeleteConfirmation({
            id:
                team.id,

            name:
                team.name,
        });
    }


    async function confirmDelete() {

        if (
            !deleteConfirmation ||
            deleting
        ) {
            return;
        }

        try {

            setDeleting(true);
            setError("");

            await deleteTeam(
                deleteConfirmation.id
            );

            setDeleteConfirmation(
                null
            );

            await load({
                refresh: true,
            });

        } catch (err) {

            console.error(
                "Failed to delete team:",
                err
            );

            setError(
                getError(
                    err,
                    "Unable to delete team."
                )
            );

            setDeleteConfirmation(
                null
            );

        } finally {

            setDeleting(false);

        }
    }


    /**
     * ========================================================
     * RENDER
     * ========================================================
     */

    return (
        <div className="p-4 sm:p-6">

            <PageHeader
                icon={UsersRound}
                title="Teams"
                description="Create teams, review team performance, and manage your organization's employee groups."
                onRefresh={() =>
                    load({
                        refresh: true,
                    })
                }
                refreshing={
                    refreshing
                }
                action={
                    <Button
                        onClick={
                            openCreateModal
                        }
                    >
                        <Plus size={16} />
                        Create team
                    </Button>
                }
            />


            {error && (
                <div className="mt-4">
                    <ErrorBox
                        message={
                            error
                        }
                    />
                </div>
            )}


            {/* ==================================================
                TEAM STATISTICS
            ================================================== */}

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-[10px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                                Total teams
                            </p>

                            <p className="mt-2 text-2xl font-bold text-[var(--bms-text)]">
                                {statistics.total}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                            <UsersRound size={18} />
                        </div>

                    </div>

                </div>


                <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-[10px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                                Active teams
                            </p>

                            <p className="mt-2 text-2xl font-bold text-emerald-500">
                                {statistics.active}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                            <UsersRound size={18} />
                        </div>

                    </div>

                </div>


                <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-[10px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                                Team members
                            </p>

                            <p className="mt-2 text-2xl font-bold text-[var(--bms-text)]">
                                {statistics.members}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                            <UsersRound size={18} />
                        </div>

                    </div>

                </div>


                <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-[10px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                                Teams with leads
                            </p>

                            <p className="mt-2 text-2xl font-bold text-[var(--bms-text)]">
                                {statistics.withLeads}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                            <ShieldCheck size={18} />
                        </div>

                    </div>

                </div>

            </div>


            {/* ==================================================
                TEAM CARDS
            ================================================== */}

            <div className="mt-5">

                {loading ? (

                    <Empty text="Loading teams..." />

                ) : teams.length === 0 ? (

                    <div className="rounded-xl border border-dashed border-[var(--bms-border)] bg-[var(--bms-surface)] p-10 text-center">

                        <UsersRound
                            size={30}
                            className="mx-auto text-[var(--bms-text-muted)]"
                        />

                        <h3 className="mt-3 font-semibold text-[var(--bms-text)]">
                            No teams found
                        </h3>

                        <p className="mt-1 text-sm text-[var(--bms-text-muted)]">
                            Create your first team to start organizing employees.
                        </p>

                    </div>

                ) : (

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                        {teams.map(
                            (team) => (
                                <TeamCard
                                    key={
                                        team.id
                                    }
                                    team={
                                        team
                                    }
                                    onView={() =>
                                        navigate(
                                            `/teams/${team.id}`
                                        )
                                    }
                                    onEdit={() =>
                                        openEditModal(
                                            team
                                        )
                                    }
                                    onDelete={() =>
                                        requestDelete(
                                            team
                                        )
                                    }
                                />
                            )
                        )}

                    </div>

                )}

            </div>


            {/* ==================================================
                CREATE / EDIT TEAM MODAL
            ================================================== */}

            <Modal
                open={
                    teamModalOpen
                }
                onClose={
                    closeTeamModal
                }
                title={
                    editingTeam
                        ? "Edit team"
                        : "Create team"
                }
            >

                <form
                    onSubmit={
                        handleSave
                    }
                    className="space-y-4 p-5"
                >

                    <Field
                        label="Team name"
                        required
                    >
                        <input
                            className={
                                inputClass
                            }
                            required
                            value={
                                form.name
                            }
                            onChange={(
                                event
                            ) =>
                                setForm(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        name:
                                            event.target.value,
                                    })
                                )
                            }
                            placeholder="e.g. Software Development"
                        />
                    </Field>


                    <Field label="Description">

                        <textarea
                            className={
                                textareaClass
                            }
                            value={
                                form.description
                            }
                            onChange={(
                                event
                            ) =>
                                setForm(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        description:
                                            event.target.value,
                                    })
                                )
                            }
                            placeholder="Describe the purpose of this team..."
                        />

                    </Field>


                    <Field label="Department">

                        <select
                            className={
                                selectClass
                            }
                            value={
                                form.departmentId
                            }
                            onChange={(
                                event
                            ) =>
                                setForm(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        departmentId:
                                            event.target.value,
                                    })
                                )
                            }
                        >

                            <option value="">
                                No department
                            </option>

                            {departments.map(
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


                    <Field label="Team lead">

                        <select
                            className={
                                selectClass
                            }
                            value={
                                form.teamLeadId
                            }
                            onChange={(
                                event
                            ) =>
                                setForm(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        teamLeadId:
                                            event.target.value,
                                    })
                                )
                            }
                        >

                            <option value="">
                                No lead
                            </option>

                            {employees.map(
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

                    </Field>


                    {editingTeam && (
                        <Field label="Status">

                            <select
                                className={
                                    selectClass
                                }
                                value={String(
                                    form.isActive
                                )}
                                onChange={(
                                    event
                                ) =>
                                    setForm(
                                        (
                                            current
                                        ) => ({
                                            ...current,
                                            isActive:
                                                event.target.value ===
                                                "true",
                                        })
                                    )
                                }
                            >

                                <option value="true">
                                    Active
                                </option>

                                <option value="false">
                                    Inactive
                                </option>

                            </select>

                        </Field>
                    )}


                    <div className="flex justify-end gap-2 border-t border-[var(--bms-border)] pt-4">

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={
                                closeTeamModal
                            }
                            disabled={
                                saving
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={
                                saving
                            }
                        >
                            {saving
                                ? "Saving..."
                                : editingTeam
                                ? "Save changes"
                                : "Create team"}
                        </Button>

                    </div>

                </form>

            </Modal>


            {/* ==================================================
                DELETE CONFIRMATION
            ================================================== */}

            {deleteConfirmation && (
                <ConfirmDeleteModal
                    teamName={
                        deleteConfirmation.name
                    }
                    loading={
                        deleting
                    }
                    onCancel={() => {
                        if (!deleting) {
                            setDeleteConfirmation(
                                null
                            );
                        }
                    }}
                    onConfirm={
                        confirmDelete
                    }
                />
            )}

        </div>
    );
}
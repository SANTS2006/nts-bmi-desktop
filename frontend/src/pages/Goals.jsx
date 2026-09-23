import {
    AlertTriangle,
    CalendarDays,
    CheckCircle2,
    CircleDashed,
    Clock3,
    Pencil,
    Plus,
    Target,
    Trash2,
    UserRound,
    X,
    XCircle,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getEmployeeGoals,
    createEmployeeGoal,
    updateEmployeeGoal,
    deleteEmployeeGoal,
} from "../api/goals.js";

import {
    getEmployees,
} from "../api/employee.js";

import {
    arrayData,
    getError,
    nameOf,
    dateOf,
    Button,
    Empty,
    ErrorBox,
    Field,
    inputClass,
    Modal,
    PageHeader,
    SearchBox,
    selectClass,
    textareaClass,
} from "../components/employeeManagement/ManagementUI.jsx";


/*
 * =========================================================
 * GOAL STATUSES
 * =========================================================
 */

const STATUSES = [
    "NOT_STARTED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "OVERDUE",
];


/*
 * =========================================================
 * STATUS METADATA
 * =========================================================
 */

const STATUS_META = {
    NOT_STARTED: {
        label: "Not started",
        className:
            "bg-slate-500/10 text-slate-500 border-slate-500/20",
        icon: CircleDashed,
    },

    IN_PROGRESS: {
        label: "In progress",
        className:
            "bg-blue-500/10 text-blue-500 border-blue-500/20",
        icon: Clock3,
    },

    COMPLETED: {
        label: "Completed",
        className:
            "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        icon: CheckCircle2,
    },

    CANCELLED: {
        label: "Cancelled",
        className:
            "bg-red-500/10 text-red-500 border-red-500/20",
        icon: XCircle,
    },

    OVERDUE: {
        label: "Overdue",
        className:
            "bg-amber-500/10 text-amber-500 border-amber-500/20",
        icon: AlertTriangle,
    },
};


/*
 * =========================================================
 * EMPTY FORM
 * =========================================================
 */

const EMPTY_FORM = {
    employeeId: "",
    title: "",
    description: "",
    status: "NOT_STARTED",
    targetDate: "",
    completedAt: "",
};


/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function dateInputValue(value) {

    return value
        ? String(value).slice(0, 10)
        : "";
}


function normalizeText(value) {

    return typeof value === "string"
        ? value.trim()
        : "";
}


function getStatusMeta(status) {

    return (
        STATUS_META[status] ||
        STATUS_META.NOT_STARTED
    );
}


function formatStatus(status) {

    return (
        getStatusMeta(status).label
    );
}


function getEmployeeInitials(
    employee
) {

    if (!employee) {
        return "EM";
    }


    const firstName =
        employee?.user?.firstName ||
        employee?.firstName ||
        "";


    const lastName =
        employee?.user?.lastName ||
        employee?.lastName ||
        "";


    const first =
        firstName
            .trim()
            .charAt(0);


    const last =
        lastName
            .trim()
            .charAt(0);


    const initials =
        `${first}${last}`.toUpperCase();


    if (initials) {
        return initials;
    }


    const fallback =
        nameOf(
            employee,
            ""
        )
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(
                (part) =>
                    part.charAt(0)
            )
            .join("")
            .toUpperCase();


    return fallback || "EM";
}


function getEmployeeJobTitle(
    employee
) {

    return (
        employee?.jobTitle ||
        employee?.user?.jobTitle ||
        employee?.position ||
        "Employee"
    );
}


/*
 * =========================================================
 * STATUS BADGE
 * =========================================================
 */

function StatusBadge({
    status,
}) {

    const meta =
        getStatusMeta(
            status
        );


    const Icon =
        meta.icon;


    return (

        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${meta.className}`}
        >

            <Icon
                size={12}
            />

            {
                meta.label
            }

        </span>
    );
}


/*
 * =========================================================
 * EMPLOYEE AVATAR
 * =========================================================
 */

function EmployeeAvatar({
    employee,
}) {

    return (

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-sm font-bold text-blue-500 ring-4 ring-blue-500/5">

            {
                getEmployeeInitials(
                    employee
                )
            }

        </div>
    );
}


/*
 * =========================================================
 * GOAL CARD
 * =========================================================
 */

function GoalCard({
    goal,
    employee,
    onEdit,
    onDelete,
}) {

    const status =
        getStatusMeta(
            goal.status
        );


    const isCompleted =
        goal.status ===
        "COMPLETED";


    const isOverdue =
        goal.status ===
        "OVERDUE";


    return (

        <article
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] transition-all duration-200 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-xl"
        >

            {/* =================================================
                CARD HEADER
            ================================================= */}

            <div className="border-b border-[var(--bms-border)] p-5">

                <div className="flex items-start justify-between gap-3">

                    {/* Employee */}

                    <div className="flex min-w-0 items-center gap-3">

                        <EmployeeAvatar
                            employee={
                                employee
                            }
                        />

                        <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-[var(--bms-text)]">

                                {
                                    nameOf(
                                        employee,
                                        "Unknown employee"
                                    )
                                }

                            </p>


                            <p className="mt-0.5 truncate text-xs text-[var(--bms-text-muted)]">

                                {
                                    getEmployeeJobTitle(
                                        employee
                                    )
                                }

                            </p>

                        </div>

                    </div>


                    {/* Goal icon */}

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">

                        <Target
                            size={17}
                        />

                    </div>

                </div>

            </div>


            {/* =================================================
                CARD BODY
            ================================================= */}

            <div className="flex flex-1 flex-col p-5">

                {/* Status */}

                <div className="mb-3">

                    <StatusBadge
                        status={
                            goal.status
                        }
                    />

                </div>


                {/* Title */}

                <h3 className="line-clamp-2 text-base font-semibold leading-6 text-[var(--bms-text)]">

                    {
                        goal.title ||
                        "Untitled goal"
                    }

                </h3>


                {/* Description */}

                {goal.description ? (

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--bms-text-secondary)]">

                        {
                            goal.description
                        }

                    </p>

                ) : (

                    <p className="mt-2 text-sm italic text-[var(--bms-text-muted)]">

                        No description provided.

                    </p>
                )}


                {/* =================================================
                    DATE INFORMATION
                ================================================= */}

                <div className="mt-auto space-y-2.5 pt-5">

                    {/* Target date */}

                    <div className="flex items-center justify-between rounded-xl bg-[var(--bms-surface-soft)] px-3 py-2.5">

                        <div className="flex items-center gap-2">

                            <CalendarDays
                                size={15}
                                className="text-[var(--bms-text-muted)]"
                            />

                            <span className="text-xs text-[var(--bms-text-muted)]">
                                Target date
                            </span>

                        </div>


                        <span
                            className={`text-xs font-semibold ${
                                isOverdue
                                    ? "text-amber-500"
                                    : "text-[var(--bms-text)]"
                            }`}
                        >

                            {
                                dateOf(
                                    goal.targetDate
                                )
                            }

                        </span>

                    </div>


                    {/* Completed date */}

                    {goal.completedAt && (

                        <div className="flex items-center justify-between rounded-xl bg-emerald-500/5 px-3 py-2.5">

                            <div className="flex items-center gap-2">

                                <CheckCircle2
                                    size={15}
                                    className="text-emerald-500"
                                />

                                <span className="text-xs text-[var(--bms-text-muted)]">
                                    Completed
                                </span>

                            </div>


                            <span className="text-xs font-semibold text-emerald-500">

                                {
                                    dateOf(
                                        goal.completedAt
                                    )
                                }

                            </span>

                        </div>
                    )}

                </div>

            </div>


            {/* =================================================
                CARD FOOTER
            ================================================= */}

            <div className="flex items-center justify-between border-t border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-4 py-3">

                <div className="flex items-center gap-1.5 text-xs text-[var(--bms-text-muted)]">

                    <UserRound
                        size={13}
                    />

                    Employee goal

                </div>


                <div className="flex items-center gap-1">

                    {/* Edit */}

                    <button
                        type="button"
                        onClick={() =>
                            onEdit(
                                goal
                            )
                        }
                        aria-label={`Edit ${goal.title}`}
                        title="Edit goal"
                        className="rounded-lg p-2 text-[var(--bms-text-muted)] transition-colors hover:bg-[var(--bms-surface)] hover:text-[var(--bms-text)]"
                    >

                        <Pencil
                            size={16}
                        />

                    </button>


                    {/* Delete */}

                    <button
                        type="button"
                        onClick={() =>
                            onDelete(
                                goal
                            )
                        }
                        aria-label={`Delete ${goal.title}`}
                        title="Delete goal"
                        className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-500/10"
                    >

                        <Trash2
                            size={16}
                        />

                    </button>

                </div>

            </div>

        </article>
    );
}


/*
 * =========================================================
 * GOALS PAGE
 * =========================================================
 */

export default function Goals() {

    /*
     * -------------------------------------------------------
     * DATA
     * -------------------------------------------------------
     */

    const [
        items,
        setItems,
    ] = useState([]);


    const [
        employees,
        setEmployees,
    ] = useState([]);


    /*
     * -------------------------------------------------------
     * FILTERS
     * -------------------------------------------------------
     */

    const [
        employeeId,
        setEmployeeId,
    ] = useState("");


    const [
        status,
        setStatus,
    ] = useState("");


    const [
        search,
        setSearch,
    ] = useState("");


    /*
     * -------------------------------------------------------
     * LOADING
     * -------------------------------------------------------
     */

    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        refreshing,
        setRefreshing,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState("");


    /*
     * -------------------------------------------------------
     * CREATE / EDIT MODAL
     * -------------------------------------------------------
     */

    const [
        modal,
        setModal,
    ] = useState(false);


    const [
        edit,
        setEdit,
    ] = useState(null);


    const [
        form,
        setForm,
    ] = useState({
        ...EMPTY_FORM,
    });


    const [
        saving,
        setSaving,
    ] = useState(false);


    /*
     * -------------------------------------------------------
     * DELETE CONFIRMATION
     * -------------------------------------------------------
     */

    const [
        deleteTarget,
        setDeleteTarget,
    ] = useState(null);


    const [
        deleting,
        setDeleting,
    ] = useState(false);


    /*
     * =======================================================
     * LOAD DATA
     * =======================================================
     */

    const load =
        useCallback(
            async (
                refresh = false
            ) => {

                try {

                    if (refresh) {

                        setRefreshing(
                            true
                        );

                    } else {

                        setLoading(
                            true
                        );
                    }


                    setError("");


                    const [
                        goalsResult,
                        employeesResult,
                    ] = await Promise.all([

                        getEmployeeGoals({
                            employeeId,
                            status,
                        }),

                        getEmployees({
                            page: 1,
                            limit: 100,
                        }),

                    ]);


                    setItems(
                        arrayData(
                            goalsResult
                        )
                    );


                    setEmployees(
                        arrayData(
                            employeesResult,
                            [
                                "employees",
                            ]
                        )
                    );

                } catch (err) {

                    console.error(
                        "Failed to load goals:",
                        err
                    );


                    setError(
                        getError(
                            err,
                            "Unable to load goals."
                        )
                    );

                } finally {

                    setLoading(
                        false
                    );

                    setRefreshing(
                        false
                    );
                }

            },
            [
                employeeId,
                status,
            ]
        );


    /*
     * =======================================================
     * INITIAL / FILTER LOAD
     * =======================================================
     */

    useEffect(
        () => {

            load();

        },
        [
            load,
        ]
    );


    /*
     * =======================================================
     * FILTER / SEARCH
     * =======================================================
     */

    const filtered =
        useMemo(
            () => {

                const query =
                    search
                        .trim()
                        .toLowerCase();


                if (!query) {

                    return items;
                }


                return items.filter(
                    (
                        goal
                    ) => {

                        const employeeName =
                            nameOf(
                                goal.employee
                            )
                                .toLowerCase();


                        const title =
                            normalizeText(
                                goal.title
                            )
                                .toLowerCase();


                        const description =
                            normalizeText(
                                goal.description
                            )
                                .toLowerCase();


                        return (
                            employeeName.includes(
                                query
                            ) ||
                            title.includes(
                                query
                            ) ||
                            description.includes(
                                query
                            )
                        );
                    }
                );

            },
            [
                items,
                search,
            ]
        );


    /*
     * =======================================================
     * FORM FIELD
     * =======================================================
     */

    function updateFormField(
        field,
        value
    ) {

        setForm(
            (
                current
            ) => ({

                ...current,

                [field]:
                    value,

            })
        );
    }


    /*
     * =======================================================
     * OPEN CREATE / EDIT
     * =======================================================
     */

    function open(
        goal = null
    ) {

        setEdit(
            goal
        );


        if (goal) {

            setForm({

                employeeId:
                    goal.employeeId ||
                    "",

                title:
                    goal.title ||
                    "",

                description:
                    goal.description ||
                    "",

                status:
                    goal.status ||
                    "NOT_STARTED",

                targetDate:
                    dateInputValue(
                        goal.targetDate
                    ),

                completedAt:
                    dateInputValue(
                        goal.completedAt
                    ),
            });

        } else {

            setForm({
                ...EMPTY_FORM,
            });
        }


        setError("");

        setModal(
            true
        );
    }


    /*
     * =======================================================
     * CLOSE CREATE / EDIT MODAL
     * =======================================================
     */

    function closeModal() {

        if (saving) {
            return;
        }


        setModal(
            false
        );


        setEdit(
            null
        );


        setForm({
            ...EMPTY_FORM,
        });
    }


    /*
     * =======================================================
     * VALIDATE FORM
     * =======================================================
     */

    function validateForm() {

        if (!form.employeeId) {

            return (
                "Please select an employee."
            );
        }


        if (
            !normalizeText(
                form.title
            )
        ) {

            return (
                "Goal title is required."
            );
        }


        if (
            normalizeText(
                form.title
            ).length > 200
        ) {

            return (
                "Goal title must not exceed 200 characters."
            );
        }


        if (
            normalizeText(
                form.description
            ).length > 5000
        ) {

            return (
                "Goal description must not exceed 5000 characters."
            );
        }


        if (
            !STATUSES.includes(
                form.status
            )
        ) {

            return (
                "Please select a valid goal status."
            );
        }


        if (
            form.targetDate &&
            form.completedAt &&
            form.completedAt <
                form.targetDate
        ) {

            return (
                "Completed date cannot be earlier than the target date."
            );
        }


        return "";
    }


    /*
     * =======================================================
     * SAVE
     * =======================================================
     */

    async function save(
        event
    ) {

        event.preventDefault();


        const validationError =
            validateForm();


        if (
            validationError
        ) {

            setError(
                validationError
            );

            return;
        }


        try {

            setSaving(
                true
            );

            setError("");


            /*
             * CREATE
             */

            if (!edit) {

                const createPayload = {

                    employeeId:
                        form.employeeId,

                    title:
                        normalizeText(
                            form.title
                        ),

                    description:
                        normalizeText(
                            form.description
                        ) || null,

                    status:
                        form.status,

                    targetDate:
                        form.targetDate ||
                        null,

                    completedAt:
                        form.completedAt ||
                        null,
                };


                await createEmployeeGoal(
                    createPayload
                );

            }


            /*
             * UPDATE
             */

            else {

                const updatePayload = {

                    title:
                        normalizeText(
                            form.title
                        ),

                    description:
                        normalizeText(
                            form.description
                        ) || null,

                    status:
                        form.status,

                    targetDate:
                        form.targetDate ||
                        null,

                    completedAt:
                        form.completedAt ||
                        null,
                };


                await updateEmployeeGoal(
                    edit.id,
                    updatePayload
                );
            }


            closeModal();


            await load(
                true
            );

        } catch (err) {

            console.error(
                "Failed to save goal:",
                err
            );


            setError(
                getError(
                    err,
                    "Unable to save goal."
                )
            );

        } finally {

            setSaving(
                false
            );
        }
    }


    /*
     * =======================================================
     * REQUEST DELETE
     * =======================================================
     *
     * Opens our custom confirmation dialog.
     *
     * No window.confirm().
     */

    function requestDelete(
        goal
    ) {

        setError("");

        setDeleteTarget(
            goal
        );
    }


    /*
     * =======================================================
     * CANCEL DELETE
     * =======================================================
     */

    function cancelDelete() {

        if (deleting) {
            return;
        }


        setDeleteTarget(
            null
        );
    }


    /*
     * =======================================================
     * CONFIRM DELETE
     * =======================================================
     */

    async function confirmDelete() {

        if (
            !deleteTarget?.id
        ) {

            return;
        }


        try {

            setDeleting(
                true
            );

            setError("");


            await deleteEmployeeGoal(
                deleteTarget.id
            );


            setDeleteTarget(
                null
            );


            await load(
                true
            );

        } catch (err) {

            console.error(
                "Failed to delete goal:",
                err
            );


            setError(
                getError(
                    err,
                    "Unable to delete goal."
                )
            );

        } finally {

            setDeleting(
                false
            );
        }
    }


    /*
     * =======================================================
     * CLEAR FILTERS
     * =======================================================
     */

    function clearFilters() {

        setEmployeeId("");

        setStatus("");

        setSearch("");
    }


    const hasFilters =
        Boolean(
            employeeId ||
            status ||
            search
        );


    /*
     * =======================================================
     * SUMMARY COUNTS
     * =======================================================
     */

    const summary =
        useMemo(
            () => {

                return {

                    total:
                        filtered.length,

                    completed:
                        filtered.filter(
                            (goal) =>
                                goal.status ===
                                "COMPLETED"
                        ).length,

                    inProgress:
                        filtered.filter(
                            (goal) =>
                                goal.status ===
                                "IN_PROGRESS"
                        ).length,

                    overdue:
                        filtered.filter(
                            (goal) =>
                                goal.status ===
                                "OVERDUE"
                        ).length,
                };

            },
            [
                filtered,
            ]
        );


    /*
     * =======================================================
     * RENDER
     * =======================================================
     */

    return (

        <div className="p-4 sm:p-6">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <PageHeader
                icon={
                    Target
                }
                title="Goals"
                description="Track employee goals, target dates and completion."
                onRefresh={() =>
                    load(true)
                }
                refreshing={
                    refreshing
                }
                action={

                    <Button
                        onClick={() =>
                            open()
                        }
                    >

                        <Plus
                            size={16}
                        />

                        New goal

                    </Button>
                }
            />


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="mt-4">

                    <ErrorBox
                        message={
                            error
                        }
                    />

                </div>
            )}


            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            {!loading && (

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

                    {/* Total */}

                    <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-xs font-medium text-[var(--bms-text-muted)]">
                                    Total goals
                                </p>

                                <p className="mt-1 text-2xl font-bold text-[var(--bms-text)]">

                                    {
                                        summary.total
                                    }

                                </p>

                            </div>


                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">

                                <Target
                                    size={19}
                                />

                            </div>

                        </div>

                    </div>


                    {/* In progress */}

                    <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-xs font-medium text-[var(--bms-text-muted)]">
                                    In progress
                                </p>

                                <p className="mt-1 text-2xl font-bold text-[var(--bms-text)]">

                                    {
                                        summary.inProgress
                                    }

                                </p>

                            </div>


                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">

                                <Clock3
                                    size={19}
                                />

                            </div>

                        </div>

                    </div>


                    {/* Completed */}

                    <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-xs font-medium text-[var(--bms-text-muted)]">
                                    Completed
                                </p>

                                <p className="mt-1 text-2xl font-bold text-[var(--bms-text)]">

                                    {
                                        summary.completed
                                    }

                                </p>

                            </div>


                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">

                                <CheckCircle2
                                    size={19}
                                />

                            </div>

                        </div>

                    </div>


                    {/* Overdue */}

                    <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-xs font-medium text-[var(--bms-text-muted)]">
                                    Overdue
                                </p>

                                <p className="mt-1 text-2xl font-bold text-[var(--bms-text)]">

                                    {
                                        summary.overdue
                                    }

                                </p>

                            </div>


                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">

                                <AlertTriangle
                                    size={19}
                                />

                            </div>

                        </div>

                    </div>

                </div>
            )}


            {/* =================================================
                FILTER BAR
            ================================================= */}

            <div className="mt-5 rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

                <div className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_240px_200px_auto]">

                    <SearchBox
                        value={
                            search
                        }
                        onChange={
                            setSearch
                        }
                        placeholder="Search goals, descriptions or employees..."
                    />


                    <select
                        className={
                            selectClass
                        }
                        value={
                            employeeId
                        }
                        onChange={(
                            event
                        ) =>
                            setEmployeeId(
                                event.target.value
                            )
                        }
                    >

                        <option value="">
                            All employees
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
                                        nameOf(
                                            employee
                                        )
                                    }

                                </option>
                            )
                        )}

                    </select>


                    <select
                        className={
                            selectClass
                        }
                        value={
                            status
                        }
                        onChange={(
                            event
                        ) =>
                            setStatus(
                                event.target.value
                            )
                        }
                    >

                        <option value="">
                            All statuses
                        </option>

                        {STATUSES.map(
                            (
                                goalStatus
                            ) => (

                                <option
                                    key={
                                        goalStatus
                                    }
                                    value={
                                        goalStatus
                                    }
                                >

                                    {
                                        formatStatus(
                                            goalStatus
                                        )
                                    }

                                </option>
                            )
                        )}

                    </select>


                    {hasFilters && (

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={
                                clearFilters
                            }
                        >
                            Clear
                        </Button>
                    )}

                </div>

            </div>


            {/* =================================================
                RESULT INFORMATION
            ================================================= */}

            {!loading &&
                filtered.length > 0 && (

                <div className="mt-5 flex flex-wrap items-center justify-between gap-2">

                    <div>

                        <h2 className="text-sm font-semibold text-[var(--bms-text)]">
                            Employee goals
                        </h2>

                        <p className="mt-1 text-xs text-[var(--bms-text-muted)]">

                            Showing{" "}

                            <span className="font-medium text-[var(--bms-text-secondary)]">

                                {
                                    filtered.length
                                }

                            </span>

                            {" "}

                            {filtered.length === 1
                                ? "goal"
                                : "goals"}

                        </p>

                    </div>

                </div>
            )}


            {/* =================================================
                GOAL CARDS
            ================================================= */}

            <div className="mt-4">

                {loading ? (

                    <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

                        <Empty
                            text="Loading goals..."
                        />

                    </div>

                ) : filtered.length === 0 ? (

                    <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

                        <Empty
                            text={
                                hasFilters
                                    ? "No goals match your filters."
                                    : "No employee goals found."
                            }
                        />

                    </div>

                ) : (

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                        {filtered.map(
                            (
                                goal
                            ) => {

                                /*
                                 * Some API responses already
                                 * include goal.employee.
                                 *
                                 * If not, resolve it from
                                 * the employees collection.
                                 */

                                const employee =
                                    goal.employee ||
                                    employees.find(
                                        (
                                            item
                                        ) =>
                                            item.id ===
                                            goal.employeeId
                                    );


                                return (

                                    <GoalCard
                                        key={
                                            goal.id
                                        }
                                        goal={
                                            goal
                                        }
                                        employee={
                                            employee
                                        }
                                        onEdit={
                                            open
                                        }
                                        onDelete={
                                            requestDelete
                                        }
                                    />
                                );
                            }
                        )}

                    </div>
                )}

            </div>


            {/* =================================================
                CREATE / EDIT MODAL
            ================================================= */}

            <Modal
                open={
                    modal
                }
                onClose={
                    closeModal
                }
                title={
                    edit
                        ? "Edit goal"
                        : "New goal"
                }
            >

                <form
                    onSubmit={
                        save
                    }
                    className="space-y-4 p-5"
                >

                    {/* Employee */}

                    <Field
                        label="Employee"
                        required
                    >

                        <select
                            disabled={
                                Boolean(
                                    edit
                                )
                            }
                            className={
                                selectClass
                            }
                            required
                            value={
                                form.employeeId
                            }
                            onChange={(
                                event
                            ) =>
                                updateFormField(
                                    "employeeId",
                                    event.target.value
                                )
                            }
                        >

                            <option value="">
                                Select employee
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
                                            nameOf(
                                                employee
                                            )
                                        }

                                    </option>
                                )
                            )}

                        </select>


                        {edit && (

                            <p className="mt-1.5 text-xs text-[var(--bms-text-muted)]">

                                The employee assigned to a goal
                                cannot be changed while editing.

                            </p>
                        )}

                    </Field>


                    {/* Goal title */}

                    <Field
                        label="Goal title"
                        required
                    >

                        <input
                            type="text"
                            className={
                                inputClass
                            }
                            required
                            maxLength={
                                200
                            }
                            value={
                                form.title
                            }
                            onChange={(
                                event
                            ) =>
                                updateFormField(
                                    "title",
                                    event.target.value
                                )
                            }
                            placeholder="Enter the goal title"
                        />

                    </Field>


                    {/* Description */}

                    <Field
                        label="Description"
                    >

                        <textarea
                            className={
                                textareaClass
                            }
                            maxLength={
                                5000
                            }
                            value={
                                form.description
                            }
                            onChange={(
                                event
                            ) =>
                                updateFormField(
                                    "description",
                                    event.target.value
                                )
                            }
                            placeholder="Describe what the employee should achieve..."
                            rows={
                                5
                            }
                        />

                    </Field>


                    {/* Status / Dates */}

                    <div className="grid gap-4 sm:grid-cols-3">

                        <Field
                            label="Status"
                            required
                        >

                            <select
                                className={
                                    selectClass
                                }
                                required
                                value={
                                    form.status
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateFormField(
                                        "status",
                                        event.target.value
                                    )
                                }
                            >

                                {STATUSES.map(
                                    (
                                        goalStatus
                                    ) => (

                                        <option
                                            key={
                                                goalStatus
                                            }
                                            value={
                                                goalStatus
                                            }
                                        >

                                            {
                                                formatStatus(
                                                    goalStatus
                                                )
                                            }

                                        </option>
                                    )
                                )}

                            </select>

                        </Field>


                        <Field
                            label="Target date"
                        >

                            <input
                                type="date"
                                className={
                                    inputClass
                                }
                                value={
                                    form.targetDate
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateFormField(
                                        "targetDate",
                                        event.target.value
                                    )
                                }
                            />

                        </Field>


                        <Field
                            label="Completed date"
                        >

                            <input
                                type="date"
                                className={
                                    inputClass
                                }
                                value={
                                    form.completedAt
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateFormField(
                                        "completedAt",
                                        event.target.value
                                    )
                                }
                            />

                        </Field>

                    </div>


                    {/* Actions */}

                    <div className="flex justify-end gap-2 pt-2">

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={
                                closeModal
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
                                ? edit
                                    ? "Saving..."
                                    : "Creating..."
                                : edit
                                    ? "Save changes"
                                    : "Create goal"}

                        </Button>

                    </div>

                </form>

            </Modal>


            {/* =================================================
                DELETE CONFIRMATION DIALOG
            ================================================= */}

            {deleteTarget && (

                <Modal
                    open={
                        true
                    }
                    onClose={
                        cancelDelete
                    }
                    title="Delete goal"
                >

                    <div className="p-5">

                        {/* Warning */}

                        <div className="flex items-start gap-4">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">

                                <AlertTriangle
                                    size={22}
                                />

                            </div>


                            <div className="min-w-0">

                                <h3 className="text-sm font-semibold text-[var(--bms-text)]">

                                    Delete this goal?

                                </h3>


                                <p className="mt-2 text-sm leading-6 text-[var(--bms-text-secondary)]">

                                    This will permanently delete the
                                    goal and cannot be undone.

                                </p>

                            </div>

                        </div>


                        {/* Goal preview */}

                        <div className="mt-5 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-4">

                            <div className="flex items-start gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">

                                    <Target
                                        size={18}
                                    />

                                </div>


                                <div className="min-w-0">

                                    <p className="break-words text-sm font-semibold text-[var(--bms-text)]">

                                        {
                                            deleteTarget.title ||
                                            "Untitled goal"
                                        }

                                    </p>


                                    <div className="mt-1 flex flex-wrap items-center gap-2">

                                        <span className="text-xs text-[var(--bms-text-muted)]">

                                            {
                                                nameOf(
                                                    deleteTarget.employee ||
                                                    employees.find(
                                                        (
                                                            employee
                                                        ) =>
                                                            employee.id ===
                                                            deleteTarget.employeeId
                                                    ),
                                                    "Unknown employee"
                                                )
                                            }

                                        </span>


                                        <span className="text-[var(--bms-text-muted)]">
                                            ·
                                        </span>


                                        <StatusBadge
                                            status={
                                                deleteTarget.status
                                            }
                                        />

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* Buttons */}

                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">

                            <button
                                type="button"
                                onClick={
                                    cancelDelete
                                }
                                disabled={
                                    deleting
                                }
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--bms-border)] px-4 text-sm font-medium text-[var(--bms-text-secondary)] transition-colors hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)] disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                <X
                                    size={15}
                                />

                                Cancel

                            </button>


                            <button
                                type="button"
                                onClick={
                                    confirmDelete
                                }
                                disabled={
                                    deleting
                                }
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                <Trash2
                                    size={15}
                                />

                                {deleting
                                    ? "Deleting..."
                                    : "Delete goal"}

                            </button>

                        </div>

                    </div>

                </Modal>
            )}

        </div>
    );
}
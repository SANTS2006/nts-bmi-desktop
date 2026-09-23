import {
    CalendarDays,
    CheckCircle2,
    Eye,
    Pencil,
    Plus,
    Star,
    Trash2,
    UserRound,
    AlertTriangle,
    ShieldAlert,
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
    getPerformanceRecords,
    createPerformanceRecord,
    updatePerformanceRecord,
    deletePerformanceRecord,
} from "../api/performance.js";

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


/* =========================================================
   RATINGS
   ========================================================= */

const RATINGS = [
    "EXCEPTIONAL",
    "EXCEEDS_EXPECTATIONS",
    "MEETS_EXPECTATIONS",
    "NEEDS_IMPROVEMENT",
    "UNSATISFACTORY",
];


/* =========================================================
   RATING META
   ========================================================= */

const RATING_META = {

    EXCEPTIONAL: {
        label: "Exceptional",
        className:
            "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
        icon: Star,
    },

    EXCEEDS_EXPECTATIONS: {
        label: "Exceeds Expectations",
        className:
            "border-blue-500/20 bg-blue-500/10 text-blue-500",
        icon: CheckCircle2,
    },

    MEETS_EXPECTATIONS: {
        label: "Meets Expectations",
        className:
            "border-cyan-500/20 bg-cyan-500/10 text-cyan-500",
        icon: CheckCircle2,
    },

    NEEDS_IMPROVEMENT: {
        label: "Needs Improvement",
        className:
            "border-amber-500/20 bg-amber-500/10 text-amber-500",
        icon: AlertTriangle,
    },

    UNSATISFACTORY: {
        label: "Unsatisfactory",
        className:
            "border-red-500/20 bg-red-500/10 text-red-500",
        icon: ShieldAlert,
    },

};


/* =========================================================
   EMPTY FORM
   ========================================================= */

const EMPTY_FORM = {

    employeeId: "",

    reviewerId: "",

    reviewDate:
        new Date()
            .toISOString()
            .slice(0, 10),

    rating:
        "MEETS_EXPECTATIONS",

    summary: "",

    strengths: "",

    areasForImprovement: "",

    recommendations: "",

};


/* =========================================================
   HELPERS
   ========================================================= */

function ratingLabel(value) {

    if (!value) {
        return "";
    }

    return (
        RATING_META[value]?.label ||
        String(value)
            .toLowerCase()
            .replaceAll("_", " ")
            .replace(
                /\b\w/g,
                (character) =>
                    character.toUpperCase()
            )
    );

}


function ratingMeta(value) {

    return (
        RATING_META[value] ||
        RATING_META.MEETS_EXPECTATIONS
    );

}


function unwrap(value) {

    return value?.data ?? value;

}


function normalizeText(value) {

    return typeof value === "string"
        ? value.trim()
        : "";

}


function getInitials(person) {

    if (!person) {
        return "EM";
    }

    const firstName =
        person?.user?.firstName ||
        person?.firstName ||
        "";

    const lastName =
        person?.user?.lastName ||
        person?.lastName ||
        "";

    const initials =
        `${firstName.charAt(0)}${lastName.charAt(0)}`
            .toUpperCase();

    if (initials) {
        return initials;
    }

    return (
        nameOf(person, "")
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(
                (part) =>
                    part.charAt(0)
            )
            .join("")
            .toUpperCase() ||
        "EM"
    );

}


function getJobTitle(employee) {

    return (
        employee?.jobTitle ||
        employee?.user?.jobTitle ||
        employee?.position ||
        "Employee"
    );

}


/* =========================================================
   RATING BADGE
   ========================================================= */

function RatingBadge({
    rating,
}) {

    const meta =
        ratingMeta(rating);

    const Icon =
        meta.icon;

    return (

        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${meta.className}`}
        >

            <Icon size={12} />

            {meta.label}

        </span>

    );

}


/* =========================================================
   EMPLOYEE AVATAR
   ========================================================= */

function EmployeeAvatar({
    employee,
}) {

    return (

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-sm font-bold text-blue-500 ring-4 ring-blue-500/5">

            {getInitials(
                employee
            )}

        </div>

    );

}


/* =========================================================
   PERFORMANCE CARD
   ========================================================= */

function PerformanceCard({
    record,
    employee,
    reviewer,
    onView,
    onEdit,
    onDelete,
}) {

    return (

        <article
            className="group overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/30 hover:shadow-lg"
        >

            {/* -------------------------------------------------
               HEADER
            ------------------------------------------------- */}

            <div className="p-4">

                <div className="flex items-start justify-between gap-3">

                    <div className="flex min-w-0 items-center gap-3">

                        <EmployeeAvatar
                            employee={
                                employee
                            }
                        />

                        <div className="min-w-0">

                            <h3 className="truncate text-sm font-semibold text-[var(--bms-text)]">

                                {nameOf(
                                    employee,
                                    "Unknown employee"
                                )}

                            </h3>

                            <p className="mt-0.5 truncate text-xs text-[var(--bms-text-muted)]">

                                {getJobTitle(
                                    employee
                                )}

                            </p>

                        </div>

                    </div>


                    <div className="flex shrink-0 items-center justify-center rounded-lg bg-blue-500/10 p-2 text-blue-500">

                        <Star
                            size={16}
                        />

                    </div>

                </div>


                {/* Rating */}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">

                    <RatingBadge
                        rating={
                            record.rating
                        }
                    />

                    <span className="text-[10px] text-[var(--bms-text-muted)]">
                        {dateOf(
                            record.reviewDate
                        )}
                    </span>

                </div>


                {/* Short information */}

                <div className="mt-3 grid grid-cols-2 gap-2">

                    <div className="rounded-lg bg-[var(--bms-surface-soft)] px-3 py-2">

                        <p className="text-[9px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                            Reviewer
                        </p>

                        <p className="mt-0.5 truncate text-xs font-medium text-[var(--bms-text)]">

                            {nameOf(
                                reviewer,
                                "Unknown reviewer"
                            )}

                        </p>

                    </div>


                    <div className="rounded-lg bg-[var(--bms-surface-soft)] px-3 py-2">

                        <p className="text-[9px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                            Review date
                        </p>

                        <p className="mt-0.5 truncate text-xs font-medium text-[var(--bms-text)]">

                            {dateOf(
                                record.reviewDate
                            )}

                        </p>

                    </div>

                </div>


                {/* Short summary */}

                {record.summary && (

                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-[var(--bms-text-secondary)]">

                        {record.summary}

                    </p>

                )}

            </div>


            {/* -------------------------------------------------
               ACTIONS
            ------------------------------------------------- */}

            <div className="flex items-center justify-between border-t border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-3 py-2.5">

                <button
                    type="button"
                    onClick={() =>
                        onView(
                            record
                        )
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-500 transition-colors hover:bg-blue-500/10"
                >

                    <Eye
                        size={14}
                    />

                    View details

                </button>


                <div className="flex items-center gap-1">

                    <button
                        type="button"
                        onClick={() =>
                            onEdit(
                                record
                            )
                        }
                        aria-label="Edit performance review"
                        title="Edit"
                        className="rounded-lg p-2 text-[var(--bms-text-muted)] transition-colors hover:bg-[var(--bms-surface)] hover:text-[var(--bms-text)]"
                    >

                        <Pencil
                            size={15}
                        />

                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            onDelete(
                                record
                            )
                        }
                        aria-label="Delete performance review"
                        title="Delete"
                        className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-500/10"
                    >

                        <Trash2
                            size={15}
                        />

                    </button>

                </div>

            </div>

        </article>

    );

}


/* =========================================================
   PERFORMANCE PAGE
   ========================================================= */

export default function Performance() {

    const navigate =
        useNavigate();


    /* -------------------------------------------------------
       DATA
    ------------------------------------------------------- */

    const [
        items,
        setItems,
    ] = useState([]);

    const [
        employees,
        setEmployees,
    ] = useState([]);


    /* -------------------------------------------------------
       FILTERS
    ------------------------------------------------------- */

    const [
        employeeId,
        setEmployeeId,
    ] = useState("");

    const [
        rating,
        setRating,
    ] = useState("");

    const [
        search,
        setSearch,
    ] = useState("");


    /* -------------------------------------------------------
       LOADING
    ------------------------------------------------------- */

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


    /* -------------------------------------------------------
       CREATE / EDIT
    ------------------------------------------------------- */

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


    /* -------------------------------------------------------
       DELETE DIALOG
    ------------------------------------------------------- */

    const [
        deleteTarget,
        setDeleteTarget,
    ] = useState(null);

    const [
        deleting,
        setDeleting,
    ] = useState(false);


    /* =======================================================
       LOAD
    ======================================================= */

    const load =
        useCallback(
            async (
                refresh = false
            ) => {

                try {

                    if (refresh) {
                        setRefreshing(true);
                    } else {
                        setLoading(true);
                    }

                    setError("");


                    const [
                        performanceResponse,
                        employeesResponse,
                    ] = await Promise.all([

                        getPerformanceRecords({
                            employeeId:
                                employeeId || "",
                            rating:
                                rating || "",
                        }),

                        getEmployees({
                            page: 1,
                            limit: 100,
                        }),

                    ]);


                    const performanceData =
                        unwrap(
                            performanceResponse
                        );


                    if (
                        Array.isArray(
                            performanceData
                        )
                    ) {

                        setItems(
                            performanceData
                        );

                    } else {

                        setItems(
                            arrayData(
                                performanceResponse,
                                [
                                    "records",
                                    "performance",
                                    "performanceRecords",
                                ]
                            )
                        );

                    }


                    setEmployees(
                        arrayData(
                            employeesResponse,
                            [
                                "employees",
                            ]
                        )
                    );

                } catch (err) {

                    console.error(
                        "Failed to load performance records:",
                        err
                    );

                    setError(
                        getError(
                            err,
                            "Unable to load performance records."
                        )
                    );

                } finally {

                    setLoading(false);

                    setRefreshing(false);

                }

            },
            [
                employeeId,
                rating,
            ]
        );


    /* =======================================================
       FILTER LOAD
    ======================================================= */

    useEffect(
        () => {

            load();

        },
        [
            load,
        ]
    );


    /* =======================================================
       SEARCH
    ======================================================= */

    const filtered =
        useMemo(
            () => {

                const query =
                    search
                        .toLowerCase()
                        .trim();


                if (!query) {
                    return items;
                }


                return items.filter(
                    (
                        record
                    ) => {

                        const employeeName =
                            nameOf(
                                record.employee
                            )
                                .toLowerCase();


                        const reviewerName =
                            nameOf(
                                record.reviewer
                            )
                                .toLowerCase();


                        const summary =
                            normalizeText(
                                record.summary
                            )
                                .toLowerCase();


                        return (
                            employeeName.includes(
                                query
                            ) ||
                            reviewerName.includes(
                                query
                            ) ||
                            summary.includes(
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


    /* =======================================================
       STATISTICS
    ======================================================= */

    const statistics =
        useMemo(
            () => ({

                total:
                    filtered.length,

                exceptional:
                    filtered.filter(
                        (item) =>
                            item.rating ===
                            "EXCEPTIONAL"
                    ).length,

                meets:
                    filtered.filter(
                        (item) =>
                            item.rating ===
                            "MEETS_EXPECTATIONS"
                    ).length,

                improvement:
                    filtered.filter(
                        (item) =>
                            item.rating ===
                            "NEEDS_IMPROVEMENT"
                    ).length,

            }),
            [
                filtered,
            ]
        );


    /* =======================================================
       OPEN MODAL
    ======================================================= */

    function open(
        item = null
    ) {

        setError("");

        setEdit(
            item
        );


        if (item) {

            setForm({

                employeeId:
                    item.employeeId ||
                    item.employee?.id ||
                    "",

                reviewerId:
                    item.reviewerId ||
                    item.reviewer?.id ||
                    "",

                reviewDate:
                    item.reviewDate
                        ? item.reviewDate.slice(
                            0,
                            10
                        )
                        : "",

                rating:
                    item.rating ||
                    "MEETS_EXPECTATIONS",

                summary:
                    item.summary ||
                    "",

                strengths:
                    item.strengths ||
                    "",

                areasForImprovement:
                    item.areasForImprovement ||
                    "",

                recommendations:
                    item.recommendations ||
                    "",

            });

        } else {

            setForm({
                ...EMPTY_FORM,
            });

        }


        setModal(
            true
        );

    }


    /* =======================================================
       CLOSE MODAL
    ======================================================= */

    function closeModal() {

        if (saving) {
            return;
        }

        setModal(false);

        setEdit(null);

        setForm({
            ...EMPTY_FORM,
        });

    }


    /* =======================================================
       UPDATE FIELD
    ======================================================= */

    function updateField(
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


    /* =======================================================
       SAVE
    ======================================================= */

    async function save(
        event
    ) {

        event.preventDefault();


        try {

            setSaving(true);

            setError("");


            if (!edit) {

                if (!form.employeeId) {

                    setError(
                        "Please select an employee."
                    );

                    return;
                }


                if (!form.reviewerId) {

                    setError(
                        "Please select a reviewer."
                    );

                    return;
                }

            }


            if (
                !RATINGS.includes(
                    form.rating
                )
            ) {

                setError(
                    "Please select a valid performance rating."
                );

                return;
            }


            const payload = {

                reviewDate:
                    form.reviewDate ||
                    null,

                rating:
                    form.rating,

                summary:
                    normalizeText(
                        form.summary
                    ) || null,

                strengths:
                    normalizeText(
                        form.strengths
                    ) || null,

                areasForImprovement:
                    normalizeText(
                        form.areasForImprovement
                    ) || null,

                recommendations:
                    normalizeText(
                        form.recommendations
                    ) || null,

            };


            if (!edit) {

                await createPerformanceRecord({

                    employeeId:
                        form.employeeId,

                    reviewerId:
                        form.reviewerId,

                    ...payload,

                });

            } else {

                await updatePerformanceRecord(
                    edit.id,
                    payload
                );

            }


            closeModal();

            await load(true);

        } catch (err) {

            console.error(
                "Failed to save performance record:",
                err
            );

            setError(
                getError(
                    err,
                    "Unable to save performance record."
                )
            );

        } finally {

            setSaving(false);

        }

    }


    /* =======================================================
       VIEW DETAILS
    ======================================================= */

    function viewDetails(
        record
    ) {

        navigate(
            `/performance/${record.id}`,
            {
                state: {
                    record,
                },
            }
        );

    }


    /* =======================================================
       DELETE REQUEST
    ======================================================= */

    function requestDelete(
        record
    ) {

        setError("");

        setDeleteTarget(
            record
        );

    }


    /* =======================================================
       CANCEL DELETE
    ======================================================= */

    function cancelDelete() {

        if (deleting) {
            return;
        }

        setDeleteTarget(
            null
        );

    }


    /* =======================================================
       CONFIRM DELETE
    ======================================================= */

    async function confirmDelete() {

        if (
            !deleteTarget?.id
        ) {
            return;
        }


        try {

            setDeleting(true);

            setError("");


            await deletePerformanceRecord(
                deleteTarget.id
            );


            setDeleteTarget(
                null
            );


            await load(true);

        } catch (err) {

            console.error(
                "Failed to delete performance record:",
                err
            );

            setError(
                getError(
                    err,
                    "Unable to delete performance record."
                )
            );

        } finally {

            setDeleting(false);

        }

    }


    /* =======================================================
       CLEAR FILTERS
    ======================================================= */

    function clearFilters() {

        setEmployeeId("");

        setRating("");

        setSearch("");

    }


    const hasFilters =
        Boolean(
            employeeId ||
            rating ||
            search
        );


    /* =======================================================
       RENDER
    ======================================================= */

    return (

        <div className="p-4 sm:p-6">

            {/* =================================================
                HEADER
            ================================================= */}

            <PageHeader
                icon={
                    Star
                }
                title="Performance"
                description="Create and manage employee performance reviews."
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

                        New review

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
                STATISTICS
            ================================================= */}

            {!loading && (

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

                    {/* Total */}

                    <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-xs text-[var(--bms-text-muted)]">
                                    Total reviews
                                </p>

                                <p className="mt-1 text-2xl font-bold text-[var(--bms-text)]">
                                    {
                                        statistics.total
                                    }
                                </p>

                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">

                                <Star
                                    size={18}
                                />

                            </div>

                        </div>

                    </div>


                    {/* Exceptional */}

                    <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-xs text-[var(--bms-text-muted)]">
                                    Exceptional
                                </p>

                                <p className="mt-1 text-2xl font-bold text-[var(--bms-text)]">
                                    {
                                        statistics.exceptional
                                    }
                                </p>

                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">

                                <Star
                                    size={18}
                                />

                            </div>

                        </div>

                    </div>


                    {/* Meets */}

                    <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-xs text-[var(--bms-text-muted)]">
                                    Meets expectations
                                </p>

                                <p className="mt-1 text-2xl font-bold text-[var(--bms-text)]">
                                    {
                                        statistics.meets
                                    }
                                </p>

                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">

                                <CheckCircle2
                                    size={18}
                                />

                            </div>

                        </div>

                    </div>


                    {/* Improvement */}

                    <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-xs text-[var(--bms-text-muted)]">
                                    Needs improvement
                                </p>

                                <p className="mt-1 text-2xl font-bold text-[var(--bms-text)]">
                                    {
                                        statistics.improvement
                                    }
                                </p>

                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">

                                <AlertTriangle
                                    size={18}
                                />

                            </div>

                        </div>

                    </div>

                </div>

            )}


            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="mt-5 rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

                <div className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_240px_230px_auto]">

                    <SearchBox
                        value={
                            search
                        }
                        onChange={
                            setSearch
                        }
                        placeholder="Search employees or reviews..."
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
                            rating
                        }
                        onChange={(
                            event
                        ) =>
                            setRating(
                                event.target.value
                            )
                        }
                    >

                        <option value="">
                            All ratings
                        </option>

                        {RATINGS.map(
                            (
                                value
                            ) => (

                                <option
                                    key={
                                        value
                                    }
                                    value={
                                        value
                                    }
                                >

                                    {
                                        ratingLabel(
                                            value
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
                RESULTS
            ================================================= */}

            <div className="mt-5">

                {loading ? (

                    <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

                        <Empty
                            text="Loading performance records..."
                        />

                    </div>

                ) : filtered.length === 0 ? (

                    <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

                        <Empty
                            text={
                                hasFilters
                                    ? "No performance reviews match your filters."
                                    : "No performance records found."
                            }
                        />

                    </div>

                ) : (

                    <>

                        <div className="mb-3 flex items-center justify-between">

                            <div>

                                <h2 className="text-sm font-semibold text-[var(--bms-text)]">
                                    Employee performance
                                </h2>

                                <p className="mt-1 text-xs text-[var(--bms-text-muted)]">

                                    {filtered.length}{" "}

                                    {filtered.length === 1
                                        ? "review"
                                        : "reviews"}

                                </p>

                            </div>

                        </div>


                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                            {filtered.map(
                                (
                                    record
                                ) => {

                                    const employee =
                                        record.employee ||
                                        employees.find(
                                            (
                                                item
                                            ) =>
                                                item.id ===
                                                record.employeeId
                                        );


                                    const reviewer =
                                        record.reviewer ||
                                        employees.find(
                                            (
                                                item
                                            ) =>
                                                item.id ===
                                                record.reviewerId
                                        );


                                    return (

                                        <PerformanceCard
                                            key={
                                                record.id
                                            }
                                            record={
                                                record
                                            }
                                            employee={
                                                employee
                                            }
                                            reviewer={
                                                reviewer
                                            }
                                            onView={
                                                viewDetails
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

                    </>

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
                        ? "Edit performance review"
                        : "New performance review"
                }
                width="max-w-3xl"
            >

                <form
                    onSubmit={
                        save
                    }
                    className="space-y-4 p-5"
                >

                    {!edit && (

                        <div className="grid gap-4 sm:grid-cols-2">

                            <Field
                                label="Employee"
                                required
                            >

                                <select
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
                                        updateField(
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

                            </Field>


                            <Field
                                label="Reviewer"
                                required
                            >

                                <select
                                    className={
                                        selectClass
                                    }
                                    required
                                    value={
                                        form.reviewerId
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        updateField(
                                            "reviewerId",
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Select reviewer
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

                            </Field>

                        </div>

                    )}


                    <div className="grid gap-4 sm:grid-cols-2">

                        <Field
                            label="Review date"
                        >

                            <input
                                type="date"
                                className={
                                    inputClass
                                }
                                value={
                                    form.reviewDate
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "reviewDate",
                                        event.target.value
                                    )
                                }
                            />

                        </Field>


                        <Field
                            label="Rating"
                            required
                        >

                            <select
                                className={
                                    selectClass
                                }
                                required
                                value={
                                    form.rating
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "rating",
                                        event.target.value
                                    )
                                }
                            >

                                {RATINGS.map(
                                    (
                                        value
                                    ) => (

                                        <option
                                            key={
                                                value
                                            }
                                            value={
                                                value
                                            }
                                        >

                                            {
                                                ratingLabel(
                                                    value
                                                )
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </Field>

                    </div>


                    <Field
                        label="Summary"
                    >

                        <textarea
                            className={
                                textareaClass
                            }
                            rows={4}
                            value={
                                form.summary
                            }
                            onChange={(
                                event
                            ) =>
                                updateField(
                                    "summary",
                                    event.target.value
                                )
                            }
                            placeholder="Provide an overall summary..."
                        />

                    </Field>


                    <div className="grid gap-4 sm:grid-cols-2">

                        <Field
                            label="Strengths"
                        >

                            <textarea
                                className={
                                    textareaClass
                                }
                                rows={4}
                                value={
                                    form.strengths
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "strengths",
                                        event.target.value
                                    )
                                }
                                placeholder="What did the employee do particularly well?"
                            />

                        </Field>


                        <Field
                            label="Areas for improvement"
                        >

                            <textarea
                                className={
                                    textareaClass
                                }
                                rows={4}
                                value={
                                    form.areasForImprovement
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "areasForImprovement",
                                        event.target.value
                                    )
                                }
                                placeholder="What should the employee improve?"
                            />

                        </Field>

                    </div>


                    <Field
                        label="Recommendations"
                    >

                        <textarea
                            className={
                                textareaClass
                            }
                            rows={4}
                            value={
                                form.recommendations
                            }
                            onChange={(
                                event
                            ) =>
                                updateField(
                                    "recommendations",
                                    event.target.value
                                )
                            }
                            placeholder="Add recommendations or next steps..."
                        />

                    </Field>


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
                                ? "Saving..."
                                : edit
                                    ? "Save changes"
                                    : "Create review"}

                        </Button>

                    </div>

                </form>

            </Modal>


            {/* =================================================
                DELETE CONFIRMATION
            ================================================= */}

            {deleteTarget && (

                <Modal
                    open={true}
                    onClose={
                        cancelDelete
                    }
                    title="Delete performance review"
                    width="max-w-md"
                >

                    <div className="p-5">

                        <div className="flex items-start gap-4">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">

                                <AlertTriangle
                                    size={22}
                                />

                            </div>


                            <div>

                                <h3 className="text-sm font-semibold text-[var(--bms-text)]">
                                    Delete this performance review?
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-[var(--bms-text-secondary)]">

                                    This performance review will be
                                    permanently deleted. This action
                                    cannot be undone.

                                </p>

                            </div>

                        </div>


                        <div className="mt-5 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-4">

                            <div className="flex items-center gap-3">

                                <EmployeeAvatar
                                    employee={
                                        deleteTarget.employee ||
                                        employees.find(
                                            (
                                                employee
                                            ) =>
                                                employee.id ===
                                                deleteTarget.employeeId
                                        )
                                    }
                                />

                                <div className="min-w-0">

                                    <p className="truncate text-sm font-semibold text-[var(--bms-text)]">

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

                                    </p>

                                    <div className="mt-1">

                                        <RatingBadge
                                            rating={
                                                deleteTarget.rating
                                            }
                                        />

                                    </div>

                                </div>

                            </div>

                        </div>


                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">

                            <button
                                type="button"
                                onClick={
                                    cancelDelete
                                }
                                disabled={
                                    deleting
                                }
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--bms-border)] px-4 text-sm font-medium text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface-soft)] disabled:opacity-50"
                            >
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
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >

                                <Trash2
                                    size={15}
                                />

                                {deleting
                                    ? "Deleting..."
                                    : "Delete review"}

                            </button>

                        </div>

                    </div>

                </Modal>

            )}

        </div>

    );

}
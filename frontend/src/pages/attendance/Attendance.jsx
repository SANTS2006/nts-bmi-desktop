import {
    CalendarCheck,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Edit3,
    Plus,
    Search,
    Trash2,
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
    createAttendance,
    deleteAttendance,
    getAttendance,
    getAttendanceStats,
    updateAttendance,
    clockIn,
    clockOut,
} from "../../api/attendanceLeave.js";

import {
    getEmployees,
} from "../../api/employee.js";

import {
    getError,
    nameOf,
    Button,
    ErrorBox,
    Field,
    inputClass,
    Modal,
    PageHeader,
    selectClass,
    textareaClass,
} from "../../components/employeeManagement/ManagementUI.jsx";


/* ============================================================
   CONSTANTS
   ============================================================ */

const getToday = () =>
    new Date().toISOString().slice(0, 10);

const EMPTY_FORM = {
    employeeId: "",
    attendanceDate: getToday(),
    status: "PRESENT",
    clockIn: "",
    clockOut: "",
    notes: "",
};

const STATUSES = [
    "PRESENT",
    "LATE",
    "ABSENT",
    "HALF_DAY",
    "ON_LEAVE",
    "WEEKEND",
    "HOLIDAY",
];


/* ============================================================
   API RESPONSE HELPERS
   ============================================================ */

/**
 * Safely unwrap API responses.
 *
 * Supports responses such as:
 *
 * {
 *   success: true,
 *   data: [...]
 * }
 *
 * {
 *   success: true,
 *   data: {
 *      data: [...]
 *   }
 * }
 */
function unwrapResponse(response) {
    let value =
        response?.data ??
        response ??
        null;

    let safety = 0;

    while (
        value &&
        !Array.isArray(value) &&
        typeof value === "object" &&
        value.data !== undefined &&
        safety < 10
    ) {
        value = value.data;
        safety += 1;
    }

    return value;
}


/**
 * Extract arrays from different API response shapes.
 */
function extractArray(
    response,
    possibleKeys = []
) {
    const value = unwrapResponse(response);

    if (Array.isArray(value)) {
        return value;
    }

    if (
        value &&
        typeof value === "object"
    ) {
        for (const key of possibleKeys) {
            if (
                Array.isArray(value[key])
            ) {
                return value[key];
            }
        }

        if (Array.isArray(value.data)) {
            return value.data;
        }
    }

    return [];
}


/**
 * Extract attendance records.
 */
function extractAttendanceRecords(response) {
    const value = unwrapResponse(response);

    if (Array.isArray(value)) {
        return value;
    }

    if (
        value &&
        typeof value === "object"
    ) {
        if (Array.isArray(value.data)) {
            return value.data;
        }

        if (Array.isArray(value.attendance)) {
            return value.attendance;
        }

        if (Array.isArray(value.records)) {
            return value.records;
        }

        if (Array.isArray(value.items)) {
            return value.items;
        }
    }

    return [];
}


/* ============================================================
   EMPLOYEE HELPERS
   ============================================================ */

function employeeName(employee) {
    if (!employee) {
        return "Unknown employee";
    }

    return nameOf(
        employee,
        "Unknown employee"
    );
}

function employeeNumber(employee) {
    return (
        employee?.employeeNumber ||
        employee?.employeeNo ||
        "No employee number"
    );
}


/* ============================================================
   DATE / TIME HELPERS
   ============================================================ */

function formatDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }

    return date.toLocaleDateString(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}


function formatTime(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }

    return date.toLocaleTimeString(
        undefined,
        {
            hour: "2-digit",
            minute: "2-digit",
        }
    );
}


/**
 * Convert a date/time value to:
 *
 * YYYY-MM-DDTHH:mm
 */
function toDateTimeLocal(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    const pad = (number) =>
        String(number).padStart(2, "0");

    return (
        `${date.getFullYear()}-` +
        `${pad(date.getMonth() + 1)}-` +
        `${pad(date.getDate())}T` +
        `${pad(date.getHours())}:` +
        `${pad(date.getMinutes())}`
    );
}


/* ============================================================
   STATUS BADGE
   ============================================================ */

function StatusBadge({
    status,
}) {
    const styles = {
        PRESENT:
            "bg-emerald-500/10 text-emerald-500",

        LATE:
            "bg-amber-500/10 text-amber-500",

        ABSENT:
            "bg-red-500/10 text-red-500",

        HALF_DAY:
            "bg-blue-500/10 text-blue-500",

        ON_LEAVE:
            "bg-violet-500/10 text-violet-500",

        WEEKEND:
            "bg-slate-500/10 text-slate-500",

        HOLIDAY:
            "bg-pink-500/10 text-pink-500",
    };

    const label =
        String(
            status || "UNKNOWN"
        ).replaceAll("_", " ");

    return (
        <span
            className={
                `inline-flex shrink-0 rounded-full ` +
                `px-2.5 py-1 text-[10px] ` +
                `font-semibold uppercase tracking-wide ` +
                `${
                    styles[status] ||
                    "bg-slate-500/10 text-slate-500"
                }`
            }
        >
            {label}
        </span>
    );
}


/* ============================================================
   STAT CARD
   ============================================================ */

function StatCard({
    icon: Icon,
    label,
    value,
    tone = "blue",
}) {
    const tones = {
        blue:
            "bg-blue-500/10 text-blue-500",

        emerald:
            "bg-emerald-500/10 text-emerald-500",

        amber:
            "bg-amber-500/10 text-amber-500",

        red:
            "bg-red-500/10 text-red-500",
    };

    return (
        <div
            className={
                "rounded-xl border " +
                "border-[var(--bms-border)] " +
                "bg-[var(--bms-surface)] p-4 " +
                "transition duration-200 " +
                "hover:-translate-y-0.5 " +
                "hover:shadow-lg"
            }
        >
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p
                        className={
                            "text-[10px] uppercase " +
                            "tracking-wide " +
                            "text-[var(--bms-text-muted)]"
                        }
                    >
                        {label}
                    </p>

                    <p
                        className={
                            "mt-2 text-2xl font-bold " +
                            "text-[var(--bms-text)]"
                        }
                    >
                        {value}
                    </p>
                </div>

                <div
                    className={
                        `flex h-10 w-10 shrink-0 ` +
                        `items-center justify-center ` +
                        `rounded-xl ${tones[tone]}`
                    }
                >
                    <Icon size={18} />
                </div>
            </div>
        </div>
    );
}


/* ============================================================
   DELETE CONFIRMATION MODAL
   ============================================================ */

function ConfirmDelete({
    loading,
    onCancel,
    onConfirm,
}) {
    return (
        <div
            className={
                "fixed inset-0 z-[100] flex " +
                "items-center justify-center " +
                "bg-black/50 p-4 backdrop-blur-sm"
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-attendance-title"
        >
            <div
                className={
                    "w-full max-w-md overflow-hidden " +
                    "rounded-2xl border " +
                    "border-[var(--bms-border)] " +
                    "bg-[var(--bms-surface)] " +
                    "shadow-2xl"
                }
            >
                {/* Header */}
                <div
                    className={
                        "border-b border-[var(--bms-border)] p-5"
                    }
                >
                    <div className="flex items-start gap-3">
                        <div
                            className={
                                "flex h-11 w-11 shrink-0 " +
                                "items-center justify-center " +
                                "rounded-xl bg-red-500/10 " +
                                "text-red-500"
                            }
                        >
                            <Trash2 size={19} />
                        </div>

                        <div className="min-w-0">
                            <h3
                                id="delete-attendance-title"
                                className={
                                    "font-semibold " +
                                    "text-[var(--bms-text)]"
                                }
                            >
                                Delete attendance record
                            </h3>

                            <p
                                className={
                                    "mt-1 text-xs " +
                                    "text-[var(--bms-text-muted)]"
                                }
                            >
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-5">
                    <p
                        className={
                            "text-sm leading-6 " +
                            "text-[var(--bms-text-secondary)]"
                        }
                    >
                        Are you sure you want to permanently
                        delete this attendance record?
                    </p>

                    <p
                        className={
                            "mt-3 rounded-lg border " +
                            "border-red-500/10 " +
                            "bg-red-500/5 p-3 text-xs " +
                            "leading-5 text-red-500"
                        }
                    >
                        The deletion is recorded in the
                        backend audit log.
                    </p>
                </div>

                {/* Footer */}
                <div
                    className={
                        "flex flex-col-reverse gap-2 " +
                        "border-t border-[var(--bms-border)] " +
                        "p-4 sm:flex-row sm:justify-end"
                    }
                >
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onCancel}
                        disabled={loading}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={
                            "inline-flex items-center " +
                            "justify-center gap-2 rounded-lg " +
                            "bg-red-500 px-4 py-2 " +
                            "text-sm font-semibold text-white " +
                            "transition hover:bg-red-600 " +
                            "disabled:cursor-not-allowed " +
                            "disabled:opacity-60"
                        }
                    >
                        <Trash2 size={15} />

                        {loading
                            ? "Deleting..."
                            : "Delete record"}
                    </button>
                </div>
            </div>
        </div>
    );
}


/* ============================================================
   ATTENDANCE PAGE
   ============================================================ */

export default function Attendance() {
    /* ----------------------------------------------------------
       DATA
       ---------------------------------------------------------- */

    const [
        records,
        setRecords,
    ] = useState([]);

    const [
        stats,
        setStats,
    ] = useState({});

    const [
        employees,
        setEmployees,
    ] = useState([]);


    /* ----------------------------------------------------------
       PAGE STATE
       ---------------------------------------------------------- */

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


    /* ----------------------------------------------------------
       SEARCH
       ---------------------------------------------------------- */

    const [
        search,
        setSearch,
    ] = useState("");

    /* ----------------------------------------------------------
       SERVER-SIDE PAGINATION
       ---------------------------------------------------------- */
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
    });


    /* ----------------------------------------------------------
       FORM
       ---------------------------------------------------------- */

    const [
        modalOpen,
        setModalOpen,
    ] = useState(false);

    const [
        editingRecord,
        setEditingRecord,
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


    /* ----------------------------------------------------------
       CLOCKING
       ---------------------------------------------------------- */

    const [
        clockingId,
        setClockingId,
    ] = useState(null);


    /* ----------------------------------------------------------
       DELETE
       ---------------------------------------------------------- */

    const [
        deleteId,
        setDeleteId,
    ] = useState(null);

    const [
        deleting,
        setDeleting,
    ] = useState(false);


    /* ==========================================================
       LOAD DATA
       ========================================================== */

    const load = useCallback(
        async ({
            refresh = false,
            page = 1,
        } = {}) => {
            try {
                if (refresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                /*
                 * Attendance is loaded independently so that
                 * statistics or employee-loading problems do
                 * not prevent records from being displayed.
                 */

                let attendanceResponse;

                try {
                    attendanceResponse =
                        await getAttendance({
                            page,
                            limit: 20,
                        });

                    const attendanceRecords =
                        extractAttendanceRecords(
                            attendanceResponse
                        );

                    setRecords(
                        attendanceRecords
                    );

                    const paged = attendanceResponse?.data;

                    if (
                        paged &&
                        typeof paged === "object" &&
                        !Array.isArray(paged)
                    ) {
                        setPagination({
                            page: Number(paged.page) || page,
                            limit: Number(paged.limit) || 20,
                            total:
                                Number(paged.total) ||
                                attendanceRecords.length,
                            pages:
                                Number(
                                    paged.pages ??
                                    paged.totalPages
                                ) || 1,
                        });
                    } else {
                        setPagination((current) => ({
                            ...current,
                            page,
                            total: attendanceRecords.length,
                            pages: 1,
                        }));
                    }
                } catch (attendanceError) {
                    console.error(
                        "Failed to load attendance records:",
                        attendanceError
                    );

                    throw attendanceError;
                }


                /* ------------------------------------------------
                   STATISTICS
                   ------------------------------------------------ */

                try {
                    const statsResponse =
                        await getAttendanceStats();

                    const statsData =
                        unwrapResponse(
                            statsResponse
                        );

                    setStats(
                        statsData &&
                        typeof statsData === "object" &&
                        !Array.isArray(statsData)
                            ? statsData
                            : {}
                    );
                } catch (statsError) {
                    console.warn(
                        "Unable to load attendance statistics:",
                        statsError
                    );

                    setStats({});
                }


                /* ------------------------------------------------
                   EMPLOYEES
                   ------------------------------------------------ */

                try {
                    const employeesResponse =
                        await getEmployees({
                            page: 1,
                            limit: 100,
                            status: "ACTIVE",
                        });

                    const employeeList =
                        extractArray(
                            employeesResponse,
                            [
                                "employees",
                                "data",
                                "items",
                            ]
                        );

                    setEmployees(
                        employeeList
                    );
                } catch (employeeError) {
                    console.warn(
                        "Unable to load employees:",
                        employeeError
                    );

                    setEmployees([]);
                }
            } catch (err) {
                console.error(
                    "Failed to load attendance:",
                    err
                );

                setError(
                    getError(
                        err,
                        "Unable to load attendance."
                    )
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        []
    );


    /* ==========================================================
       INITIAL LOAD
       ========================================================== */

    useEffect(() => {
        load();
    }, [load]);


    /* ==========================================================
       SEARCH
       ========================================================== */

    const visibleRecords =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            if (!query) {
                return records;
            }

            return records.filter(
                (record) => {
                    const name =
                        employeeName(
                            record?.employee
                        ).toLowerCase();

                    const number =
                        String(
                            record?.employee
                                ?.employeeNumber ||
                            record?.employeeNumber ||
                            ""
                        ).toLowerCase();

                    const status =
                        String(
                            record?.status ||
                            ""
                        ).toLowerCase();

                    const date =
                        formatDate(
                            record?.attendanceDate
                        ).toLowerCase();

                    return (
                        name.includes(query) ||
                        number.includes(query) ||
                        status.includes(query) ||
                        date.includes(query)
                    );
                }
            );
        }, [
            records,
            search,
        ]);


    /* ==========================================================
       STATISTICS
       ========================================================== */

    const statistics =
        useMemo(() => {
            const total =
                Number(stats?.total);

            const present =
                Number(stats?.present);

            const late =
                Number(stats?.late);

            const absent =
                Number(stats?.absent);

            return {
                total:
                    Number.isFinite(total)
                        ? total
                        : records.length,

                present:
                    Number.isFinite(present)
                        ? present
                        : records.filter(
                            (record) =>
                                record?.status ===
                                "PRESENT"
                        ).length,

                late:
                    Number.isFinite(late)
                        ? late
                        : records.filter(
                            (record) =>
                                record?.status ===
                                "LATE"
                        ).length,

                absent:
                    Number.isFinite(absent)
                        ? absent
                        : records.filter(
                            (record) =>
                                record?.status ===
                                "ABSENT"
                        ).length,
            };
        }, [
            records,
            stats,
        ]);


    /* ==========================================================
       CREATE MODAL
       ========================================================== */

    function openCreateModal() {
        setEditingRecord(null);

        setForm({
            ...EMPTY_FORM,
            attendanceDate: getToday(),
        });

        setError("");
        setModalOpen(true);
    }


    /* ==========================================================
       EDIT MODAL
       ========================================================== */

    function openEditModal(record) {
        setEditingRecord(record);

        setForm({
            employeeId:
                record?.employeeId ||
                "",

            attendanceDate:
                record?.attendanceDate
                    ? new Date(
                        record.attendanceDate
                    )
                        .toISOString()
                        .slice(0, 10)
                    : getToday(),

            status:
                record?.status ||
                "PRESENT",

            clockIn:
                toDateTimeLocal(
                    record?.clockIn
                ),

            clockOut:
                toDateTimeLocal(
                    record?.clockOut
                ),

            notes:
                record?.notes ||
                "",
        });

        setError("");
        setModalOpen(true);
    }


    /* ==========================================================
       CLOSE MODAL
       ========================================================== */

    function closeModal() {
        if (saving) {
            return;
        }

        setModalOpen(false);
        setEditingRecord(null);

        setForm({
            ...EMPTY_FORM,
            attendanceDate: getToday(),
        });
    }


    /* ==========================================================
       SAVE ATTENDANCE
       ========================================================== */

    async function handleSave(event) {
        event.preventDefault();

        if (!form.employeeId) {
            setError(
                "Please select an employee."
            );
            return;
        }

        if (!form.attendanceDate) {
            setError(
                "Please select an attendance date."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");

            const payload = {
                employeeId:
                    form.employeeId,

                attendanceDate:
                    form.attendanceDate,

                status:
                    form.status,

                clockIn:
                    form.clockIn ||
                    undefined,

                clockOut:
                    form.clockOut ||
                    undefined,

                notes:
                    form.notes.trim() ||
                    null,
            };

            if (editingRecord?.id) {
                await updateAttendance(
                    editingRecord.id,
                    payload
                );
            } else {
                await createAttendance(
                    payload
                );
            }

            setModalOpen(false);
            setEditingRecord(null);

            setForm({
                ...EMPTY_FORM,
                attendanceDate: getToday(),
            });

            await load({
                refresh: true,
                page: pagination.page,
            });
        } catch (err) {
            console.error(
                "Failed to save attendance:",
                err
            );

            setError(
                getError(
                    err,
                    "Unable to save attendance."
                )
            );
        } finally {
            setSaving(false);
        }
    }


    /* ==========================================================
       DELETE
       ========================================================== */

    async function handleDelete() {
        if (
            !deleteId ||
            deleting
        ) {
            return;
        }

        try {
            setDeleting(true);
            setError("");

            await deleteAttendance(
                deleteId
            );

            setDeleteId(null);

            await load({
                refresh: true,
                page: pagination.page,
            });
        } catch (err) {
            console.error(
                "Failed to delete attendance:",
                err
            );

            setError(
                getError(
                    err,
                    "Unable to delete attendance."
                )
            );
        } finally {
            setDeleting(false);
        }
    }


    /* ==========================================================
       CLOCK IN / CLOCK OUT
       ========================================================== */

    async function handleClock(
        type,
        employeeId
    ) {
        if (
            !employeeId ||
            clockingId
        ) {
            return;
        }

        try {
            setClockingId(employeeId);
            setError("");

            if (type === "in") {
                await clockIn({
                    employeeId,
                });
            } else {
                await clockOut({
                    employeeId,
                });
            }

            await load({
                refresh: true,
                page: pagination.page,
            });
        } catch (err) {
            console.error(
                "Failed to record attendance time:",
                err
            );

            setError(
                getError(
                    err,
                    "Unable to record attendance time."
                )
            );
        } finally {
            setClockingId(null);
        }
    }


    /* ==========================================================
       FORM UPDATE HELPER
       ========================================================== */

    function updateForm(field, value) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }


    /* ==========================================================
       PAGINATION
       ========================================================== */

    const goToPage = useCallback(
        (page) => {
            if (
                page < 1 ||
                page > pagination.pages ||
                page === pagination.page
            ) {
                return;
            }

            load({ page });

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        },
        [load, pagination.page, pagination.pages]
    );

    const pageNumbers = useMemo(() => {
        const totalPages = pagination.pages;
        const currentPage = pagination.page;

        if (totalPages <= 5) {
            return Array.from(
                { length: totalPages },
                (_, index) => index + 1
            );
        }

        const pages = [1];

        if (currentPage > 3) {
            pages.push("...");
        }

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(
            totalPages - 1,
            currentPage + 1
        );

        for (
            let page = start;
            page <= end;
            page += 1
        ) {
            pages.push(page);
        }

        if (currentPage < totalPages - 2) {
            pages.push("...");
        }

        pages.push(totalPages);

        return pages;
    }, [pagination]);


    /* ==========================================================
       RENDER
       ========================================================== */

    return (
        <div className="p-4 sm:p-6">

            {/* ==================================================
                PAGE HEADER
            ================================================== */}

            <PageHeader
                icon={CalendarCheck}
                title="Attendance"
                description={
                    "Track daily attendance, clock-ins, " +
                    "clock-outs and attendance history."
                }
                onRefresh={() =>
                    load({
                        refresh: true,
                        page: pagination.page,
                    })
                }
                refreshing={refreshing}
                action={
                    <Button
                        onClick={
                            openCreateModal
                        }
                    >
                        <Plus size={16} />
                        Record attendance
                    </Button>
                }
            />


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
                <div className="mt-4">
                    <ErrorBox
                        message={error}
                    />
                </div>
            )}


            {/* ==================================================
                STATISTICS
            ================================================== */}

            <div
                className={
                    "mt-5 grid gap-3 " +
                    "sm:grid-cols-2 " +
                    "lg:grid-cols-4"
                }
            >
                <StatCard
                    icon={UsersRound}
                    label="Total records"
                    value={
                        statistics.total
                    }
                    tone="blue"
                />

                <StatCard
                    icon={CalendarCheck}
                    label="Present"
                    value={
                        statistics.present
                    }
                    tone="emerald"
                />

                <StatCard
                    icon={Clock3}
                    label="Late"
                    value={
                        statistics.late
                    }
                    tone="amber"
                />

                <StatCard
                    icon={X}
                    label="Absent"
                    value={
                        statistics.absent
                    }
                    tone="red"
                />
            </div>


            {/* ==================================================
                ATTENDANCE RECORDS
            ================================================== */}

            <section
                className={
                    "mt-5 rounded-2xl border " +
                    "border-[var(--bms-border)] " +
                    "bg-[var(--bms-surface)] p-4"
                }
            >

                {/* Section Header */}
                <div
                    className={
                        "flex flex-col gap-3 " +
                        "sm:flex-row sm:items-center " +
                        "sm:justify-between"
                    }
                >
                    <div>
                        <h2
                            className={
                                "font-semibold " +
                                "text-[var(--bms-text)]"
                            }
                        >
                            Attendance records
                        </h2>

                        <p
                            className={
                                "mt-1 text-xs " +
                                "text-[var(--bms-text-muted)]"
                            }
                        >
                            {visibleRecords.length}{" "}
                            record
                            {visibleRecords.length ===
                            1
                                ? ""
                                : "s"}
                        </p>
                    </div>


                    {/* Search */}
                    <div
                        className={
                            "relative w-full sm:max-w-xs"
                        }
                    >
                        <Search
                            size={15}
                            className={
                                "absolute left-3 " +
                                "top-1/2 -translate-y-1/2 " +
                                "text-[var(--bms-text-muted)]"
                            }
                        />

                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder={
                                "Search employee, number, status..."
                            }
                            className={
                                `${inputClass} pl-9`
                            }
                            aria-label="Search attendance records"
                        />
                    </div>
                </div>


                {/* =================================================
                    TABLE
                ================================================= */}

                <div className="mt-4">

                    {loading ? (

                        /* Loading Skeleton */
                        <div
                            className={
                                "overflow-x-auto rounded-xl " +
                                "border border-[var(--bms-border)]"
                            }
                        >
                            <table
                                className={
                                    "min-w-[980px] w-full text-left"
                                }
                            >
                                <thead
                                    className={
                                        "bg-[var(--bms-surface-soft)]"
                                    }
                                >
                                    <tr>
                                        {[
                                            "Employee",
                                            "Employee No.",
                                            "Date",
                                            "Status",
                                            "Clock in",
                                            "Clock out",
                                            "Notes",
                                            "Actions",
                                        ].map(
                                            (heading) => (
                                                <th
                                                    key={
                                                        heading
                                                    }
                                                    className={
                                                        "whitespace-nowrap px-4 py-3 " +
                                                        "text-[10px] font-semibold " +
                                                        "uppercase tracking-wide " +
                                                        "text-[var(--bms-text-muted)]"
                                                    }
                                                >
                                                    {heading}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>

                                <tbody>
                                    {[1, 2, 3].map(
                                        (item) => (
                                            <tr
                                                key={
                                                    item
                                                }
                                                className={
                                                    "border-t " +
                                                    "border-[var(--bms-border)]"
                                                }
                                            >
                                                {Array.from(
                                                    {
                                                        length: 8,
                                                    }
                                                ).map(
                                                    (
                                                        _,
                                                        cell
                                                    ) => (
                                                        <td
                                                            key={
                                                                cell
                                                            }
                                                            className="px-4 py-4"
                                                        >
                                                            <div
                                                                className={
                                                                    "h-4 animate-pulse " +
                                                                    "rounded " +
                                                                    "bg-[var(--bms-surface-soft)]"
                                                                }
                                                            />
                                                        </td>
                                                    )
                                                )}
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                    ) : visibleRecords.length === 0 ? (

                        /* Empty State */
                        <div
                            className={
                                "rounded-xl border border-dashed " +
                                "border-[var(--bms-border)] " +
                                "bg-[var(--bms-surface)] " +
                                "p-10 text-center"
                            }
                        >
                            <CalendarCheck
                                size={30}
                                className={
                                    "mx-auto " +
                                    "text-[var(--bms-text-muted)]"
                                }
                            />

                            <h3
                                className={
                                    "mt-3 font-semibold " +
                                    "text-[var(--bms-text)]"
                                }
                            >
                                No attendance records
                            </h3>

                            <p
                                className={
                                    "mx-auto mt-1 max-w-md " +
                                    "text-sm " +
                                    "text-[var(--bms-text-muted)]"
                                }
                            >
                                {search
                                    ? "No records match your search."
                                    : "Attendance records will appear here once they are recorded."}
                            </p>

                            {!search && (
                                <div className="mt-4">
                                    <Button
                                        onClick={
                                            openCreateModal
                                        }
                                    >
                                        <Plus
                                            size={15}
                                        />
                                        Record attendance
                                    </Button>
                                </div>
                            )}
                        </div>

                    ) : (

                        /* Actual Table */
                        <div
                            className={
                                "overflow-hidden rounded-2xl border " +
                                "border-[var(--bms-border)] bg-[var(--bms-surface)]"
                            }
                        >
                            <div className="overflow-x-auto">
                            <table
                                className={
                                    "min-w-[1050px] w-full text-left"
                                }
                            >
                                <thead className="bg-[var(--bms-surface-soft)]/50">
                                    <tr>
                                        {[
                                            "Employee",
                                            "Employee No.",
                                            "Date",
                                            "Status",
                                            "Clock in",
                                            "Clock out",
                                            "Notes",
                                            "Actions",
                                        ].map(
                                            (heading) => (
                                                <th
                                                    key={
                                                        heading
                                                    }
                                                    className={
                                                        "whitespace-nowrap px-4 py-3 " +
                                                        "text-[10px] font-semibold " +
                                                        "uppercase tracking-wide " +
                                                        "text-[var(--bms-text-muted)]"
                                                    }
                                                >
                                                    {heading}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[var(--bms-border)]">
                                    {visibleRecords.map(
                                        (record) => {
                                            const employee =
                                                record?.employee;

                                            const isClocking =
                                                clockingId ===
                                                record?.employeeId;

                                            return (
                                                <tr
                                                    key={
                                                        record?.id
                                                    }
                                                    className={
                                                        "border-t " +
                                                        "border-[var(--bms-border)] " +
                                                        "transition-colors " +
                                                        "hover:bg-[var(--bms-surface-soft)]/60"
                                                    }
                                                >

                                                    {/* Employee */}
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={
                                                                    "flex h-9 w-9 shrink-0 " +
                                                                    "items-center justify-center " +
                                                                    "rounded-lg bg-blue-500/10 " +
                                                                    "text-blue-500"
                                                                }
                                                            >
                                                                <CalendarCheck
                                                                    size={16}
                                                                />
                                                            </div>

                                                            <div className="min-w-0">
                                                                <span
                                                                    className={
                                                                        "block whitespace-nowrap " +
                                                                        "text-sm font-semibold " +
                                                                        "text-[var(--bms-text)]"
                                                                    }
                                                                >
                                                                    {
                                                                        employeeName(
                                                                            employee
                                                                        )
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>


                                                    {/* Employee Number */}
                                                    <td
                                                        className={
                                                            "whitespace-nowrap px-4 py-3 " +
                                                            "text-xs " +
                                                            "text-[var(--bms-text-secondary)]"
                                                        }
                                                    >
                                                        {
                                                            employeeNumber(
                                                                employee
                                                            )
                                                        }
                                                    </td>


                                                    {/* Date */}
                                                    <td
                                                        className={
                                                            "whitespace-nowrap px-4 py-3 " +
                                                            "text-xs font-medium " +
                                                            "text-[var(--bms-text)]"
                                                        }
                                                    >
                                                        {formatDate(
                                                            record?.attendanceDate
                                                        )}
                                                    </td>


                                                    {/* Status */}
                                                    <td className="px-4 py-3">
                                                        <StatusBadge
                                                            status={
                                                                record?.status
                                                            }
                                                        />
                                                    </td>


                                                    {/* Clock In */}
                                                    <td
                                                        className={
                                                            "whitespace-nowrap px-4 py-3 " +
                                                            "text-xs " +
                                                            "text-[var(--bms-text-secondary)]"
                                                        }
                                                    >
                                                        {formatTime(
                                                            record?.clockIn
                                                        )}
                                                    </td>


                                                    {/* Clock Out */}
                                                    <td
                                                        className={
                                                            "whitespace-nowrap px-4 py-3 " +
                                                            "text-xs " +
                                                            "text-[var(--bms-text-secondary)]"
                                                        }
                                                    >
                                                        {formatTime(
                                                            record?.clockOut
                                                        )}
                                                    </td>


                                                    {/* Notes */}
                                                    <td
                                                        className={
                                                            "max-w-[220px] px-4 py-3 " +
                                                            "text-xs " +
                                                            "text-[var(--bms-text-secondary)]"
                                                        }
                                                    >
                                                        <span
                                                            className="block truncate"
                                                            title={
                                                                record?.notes ||
                                                                ""
                                                            }
                                                        >
                                                            {
                                                                record?.notes ||
                                                                "—"
                                                            }
                                                        </span>
                                                    </td>


                                                    {/* Actions */}
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1.5">

                                                            {/* Clock In */}
                                                            {!record?.clockIn && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleClock(
                                                                            "in",
                                                                            record?.employeeId
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isClocking
                                                                    }
                                                                    className={
                                                                        "inline-flex items-center " +
                                                                        "gap-1.5 rounded-lg " +
                                                                        "bg-emerald-500/10 px-2.5 " +
                                                                        "py-1.5 text-[11px] " +
                                                                        "font-semibold text-emerald-500 " +
                                                                        "transition hover:bg-emerald-500/20 " +
                                                                        "disabled:cursor-not-allowed " +
                                                                        "disabled:opacity-50"
                                                                    }
                                                                >
                                                                    <Clock3
                                                                        size={
                                                                            13
                                                                        }
                                                                    />

                                                                    {isClocking
                                                                        ? "..."
                                                                        : "In"}
                                                                </button>
                                                            )}


                                                            {/* Clock Out */}
                                                            {record?.clockIn &&
                                                                !record?.clockOut && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleClock(
                                                                                "out",
                                                                                record?.employeeId
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            isClocking
                                                                        }
                                                                        className={
                                                                            "inline-flex items-center " +
                                                                            "gap-1.5 rounded-lg " +
                                                                            "bg-amber-500/10 px-2.5 " +
                                                                            "py-1.5 text-[11px] " +
                                                                            "font-semibold text-amber-500 " +
                                                                            "transition hover:bg-amber-500/20 " +
                                                                            "disabled:cursor-not-allowed " +
                                                                            "disabled:opacity-50"
                                                                        }
                                                                    >
                                                                        <Clock3
                                                                            size={
                                                                                13
                                                                            }
                                                                        />

                                                                        {isClocking
                                                                            ? "..."
                                                                            : "Out"}
                                                                    </button>
                                                                )}


                                                            {/* Edit */}
                                                            <Button
                                                                type="button"
                                                                variant="secondary"
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        record
                                                                    )
                                                                }
                                                            >
                                                                <Edit3
                                                                    size={
                                                                        13
                                                                    }
                                                                />
                                                                <span className="hidden sm:inline">
                                                                    Edit
                                                                </span>
                                                            </Button>


                                                            {/* Delete */}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setDeleteId(
                                                                        record?.id
                                                                    )
                                                                }
                                                                className={
                                                                    "rounded-lg p-2 " +
                                                                    "text-red-500 transition " +
                                                                    "hover:bg-red-500/10"
                                                                }
                                                                aria-label={
                                                                    "Delete attendance record"
                                                                }
                                                                title={
                                                                    "Delete attendance record"
                                                                }
                                                            >
                                                                <Trash2
                                                                    size={
                                                                        15
                                                                    }
                                                                />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                            </div>

                            {pagination.pages > 1 && (
                                <div className="flex flex-col gap-3 border-t border-[var(--bms-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-xs text-[var(--bms-text-muted)]">
                                        Showing{" "}
                                        {(pagination.page - 1) * pagination.limit + 1}
                                        {"–"}
                                        {Math.min(
                                            pagination.page * pagination.limit,
                                            pagination.total
                                        )}{" "}
                                        of {pagination.total} attendance records
                                    </p>

                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => goToPage(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--bms-border)] text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)] disabled:cursor-not-allowed disabled:opacity-40"
                                            aria-label="Previous page"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>

                                        {pageNumbers.map((pageNumber, index) =>
                                            pageNumber === "..." ? (
                                                <span
                                                    key={`attendance-ellipsis-${index}`}
                                                    className="flex h-9 w-9 items-center justify-center text-xs text-[var(--bms-text-muted)]"
                                                >
                                                    ...
                                                </span>
                                            ) : (
                                                <button
                                                    key={pageNumber}
                                                    type="button"
                                                    onClick={() => goToPage(pageNumber)}
                                                    className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-medium transition ${
                                                        pagination.page === pageNumber
                                                            ? "bg-blue-500 text-white"
                                                            : "border border-[var(--bms-border)] text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface-soft)]"
                                                    }`}
                                                >
                                                    {pageNumber}
                                                </button>
                                            )
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => goToPage(pagination.page + 1)}
                                            disabled={pagination.page === pagination.pages}
                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--bms-border)] text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)] disabled:cursor-not-allowed disabled:opacity-40"
                                            aria-label="Next page"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>


            {/* ==================================================
                CREATE / EDIT MODAL
            ================================================== */}

            <Modal
                open={modalOpen}
                onClose={closeModal}
                title={
                    editingRecord
                        ? "Edit attendance"
                        : "Record attendance"
                }
            >
                <form
                    onSubmit={handleSave}
                    className="space-y-4 p-5"
                >

                    {/* Employee */}
                    <Field
                        label="Employee"
                        required
                    >
                        <select
                            required
                            className={selectClass}
                            value={
                                form.employeeId
                            }
                            onChange={(event) =>
                                updateForm(
                                    "employeeId",
                                    event.target.value
                                )
                            }
                        >
                            <option value="">
                                Select employee
                            </option>

                            {employees.map(
                                (employee) => (
                                    <option
                                        key={
                                            employee.id
                                        }
                                        value={
                                            employee.id
                                        }
                                    >
                                        {
                                            employeeName(
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


                    {/* Date + Status */}
                    <div
                        className={
                            "grid gap-4 " +
                            "sm:grid-cols-2"
                        }
                    >
                        <Field
                            label="Attendance date"
                            required
                        >
                            <input
                                required
                                type="date"
                                className={inputClass}
                                value={
                                    form.attendanceDate
                                }
                                onChange={(event) =>
                                    updateForm(
                                        "attendanceDate",
                                        event.target.value
                                    )
                                }
                            />
                        </Field>

                        <Field label="Status">
                            <select
                                className={selectClass}
                                value={
                                    form.status
                                }
                                onChange={(event) =>
                                    updateForm(
                                        "status",
                                        event.target.value
                                    )
                                }
                            >
                                {STATUSES.map(
                                    (status) => (
                                        <option
                                            key={
                                                status
                                            }
                                            value={
                                                status
                                            }
                                        >
                                            {status.replaceAll(
                                                "_",
                                                " "
                                            )}
                                        </option>
                                    )
                                )}
                            </select>
                        </Field>
                    </div>


                    {/* Clock In + Clock Out */}
                    <div
                        className={
                            "grid gap-4 " +
                            "sm:grid-cols-2"
                        }
                    >
                        <Field label="Clock in">
                            <input
                                type="datetime-local"
                                className={inputClass}
                                value={
                                    form.clockIn
                                }
                                onChange={(event) =>
                                    updateForm(
                                        "clockIn",
                                        event.target.value
                                    )
                                }
                            />
                        </Field>

                        <Field label="Clock out">
                            <input
                                type="datetime-local"
                                className={inputClass}
                                value={
                                    form.clockOut
                                }
                                onChange={(event) =>
                                    updateForm(
                                        "clockOut",
                                        event.target.value
                                    )
                                }
                            />
                        </Field>
                    </div>


                    {/* Notes */}
                    <Field label="Notes">
                        <textarea
                            rows="4"
                            className={textareaClass}
                            value={
                                form.notes
                            }
                            onChange={(event) =>
                                updateForm(
                                    "notes",
                                    event.target.value
                                )
                            }
                            placeholder={
                                "Add optional attendance notes..."
                            }
                        />
                    </Field>


                    {/* Modal Error */}
                    {error && (
                        <ErrorBox
                            message={error}
                        />
                    )}


                    {/* Footer */}
                    <div
                        className={
                            "flex flex-col-reverse gap-2 " +
                            "border-t border-[var(--bms-border)] " +
                            "pt-4 sm:flex-row sm:justify-end"
                        }
                    >
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={closeModal}
                            disabled={saving}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={saving}
                            className="w-full sm:w-auto"
                        >
                            {saving
                                ? "Saving..."
                                : editingRecord
                                ? "Save changes"
                                : "Record attendance"}
                        </Button>
                    </div>
                </form>
            </Modal>


            {/* ==================================================
                DELETE CONFIRMATION
            ================================================== */}

            {deleteId && (
                <ConfirmDelete
                    loading={deleting}
                    onCancel={() => {
                        if (!deleting) {
                            setDeleteId(null);
                        }
                    }}
                    onConfirm={
                        handleDelete
                    }
                />
            )}
        </div>
    );
}
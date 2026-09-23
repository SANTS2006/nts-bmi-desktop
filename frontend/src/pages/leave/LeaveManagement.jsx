import {
    Check,
    ClipboardList,
    ChevronLeft,
    ChevronRight,
    Plus,
    Search,
    Edit3,
    Trash2,
    Umbrella,
    UsersRound,
    X,
    CalendarDays,
    Clock3,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
    cancelLeaveRequest,
    createLeaveRequest,
    createLeaveType,
    updateLeaveType,
    deleteLeaveType,
    getLeaveBalances,
    getLeaveRequests,
    getLeaveStats,
    getLeaveTypes,
    reviewLeaveRequest,
} from "../../api/attendanceLeave.js";

import { getEmployees } from "../../api/employee.js";

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
} from "../../components/employeeManagement/ManagementUI.jsx";


/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_REQUEST = {
    employeeId: "",
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    dayType: "FULL_DAY",
    reason: "",
};

const EMPTY_TYPE = {
    name: "",
    description: "",
    annualAllowance: 20,
    requiresApproval: true,
    isActive: true,
};

const STATUS_STYLES = {
    PENDING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    APPROVED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
    CANCELLED: "bg-slate-500/10 text-slate-500 border-slate-500/20",
};


/* =========================================================
   HELPERS
========================================================= */

const list = (response, keys = []) => {
    return arrayData(response, keys);
};

/*
 * Leave requests are returned by the backend as a paginated
 * resource: { success: true, data: { data: [...], total, page, ... } }.
 * The generic arrayData helper does not unwrap this pagination layer,
 * so normalize leave requests explicitly before putting them in state.
 */
const leaveRequestData = (response) => {
    if (Array.isArray(response)) {
        return response;
    }

    const data = response?.data;

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    if (Array.isArray(data?.requests)) {
        return data.requests;
    }

    if (Array.isArray(data?.leaveRequests)) {
        return data.leaveRequests;
    }

    if (Array.isArray(response?.requests)) {
        return response.requests;
    }

    if (Array.isArray(response?.leaveRequests)) {
        return response.leaveRequests;
    }

    return [];
};

const employeeName = (employee) => {
    return nameOf(employee, "Unknown employee");
};

const formatDate = (value) => {
    if (!value) return "—";

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
        return "—";
    }

    return d.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatDayType = (value) => {
    return String(value || "FULL_DAY")
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getDays = (request) => {
    const days = Number(request?.days);

    if (Number.isFinite(days) && days > 0) {
        return days;
    }

    if (!request?.startDate || !request?.endDate) {
        return 0;
    }

    const start = new Date(request.startDate);
    const end = new Date(request.endDate);

    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
    ) {
        return 0;
    }

    const difference =
        Math.floor(
            (end.setHours(0, 0, 0, 0) -
                start.setHours(0, 0, 0, 0)) /
                86400000
        ) + 1;

    return difference > 0 ? difference : 0;
};


/* =========================================================
   STATUS BADGE
========================================================= */

function Badge({ status }) {
    const normalized = String(status || "UNKNOWN").toUpperCase();

    return (
        <span
            className={`
                inline-flex
                items-center
                rounded-full
                border
                px-2.5
                py-1
                text-[10px]
                font-semibold
                whitespace-nowrap
                ${STATUS_STYLES[normalized] ||
                "border-slate-500/20 bg-slate-500/10 text-slate-500"}
            `}
        >
            {normalized}
        </span>
    );
}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
    icon: Icon,
    label,
    value,
    tone,
}) {
    const tones = {
        blue: "bg-blue-500/10 text-blue-500",
        emerald: "bg-emerald-500/10 text-emerald-500",
        amber: "bg-amber-500/10 text-amber-500",
        red: "bg-red-500/10 text-red-500",
    };

    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 15,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                duration: 0.3,
            }}
            className="
                rounded-xl
                border
                border-[var(--bms-border)]
                bg-[var(--bms-surface)]
                p-4
                transition
                duration-200
                hover:-translate-y-0.5
                hover:shadow-lg
            "
        >
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-[10px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                        {label}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-[var(--bms-text)]">
                        {value}
                    </p>
                </div>

                <div
                    className={`
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        ${tones[tone]}
                    `}
                >
                    <Icon size={18} />
                </div>
            </div>
        </motion.div>
    );
}


/* =========================================================
   CONFIRMATION MODAL
========================================================= */

function ConfirmAction({
    title,
    message,
    label,
    loading,
    onCancel,
    onConfirm,
}) {
    return (
        <div
            className="
                fixed
                inset-0
                z-[100]
                flex
                items-center
                justify-center
                bg-black/50
                p-4
                backdrop-blur-sm
            "
        >
            <motion.div
                initial={{
                    opacity: 0,
                    scale: 0.96,
                    y: 10,
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                }}
                className="
                    w-full
                    max-w-md
                    overflow-hidden
                    rounded-2xl
                    border
                    border-[var(--bms-border)]
                    bg-[var(--bms-surface)]
                    shadow-2xl
                "
            >
                <div
                    className="
                        border-b
                        border-[var(--bms-border)]
                        p-5
                    "
                >
                    <div className="flex items-start gap-3">
                        <div
                            className="
                                flex
                                h-11
                                w-11
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-red-500/10
                                text-red-500
                            "
                        >
                            <Trash2 size={19} />
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
                        {message}
                    </p>
                </div>

                <div
                    className="
                        flex
                        justify-end
                        gap-2
                        border-t
                        border-[var(--bms-border)]
                        p-4
                    "
                >
                    <Button
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
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-lg
                            bg-red-500
                            px-4
                            py-2
                            text-sm
                            font-semibold
                            text-white
                            transition
                            hover:bg-red-600
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    >
                        <Trash2 size={15} />

                        {loading
                            ? "Processing..."
                            : label}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}


/* =========================================================
   LEAVE REQUEST TABLE
========================================================= */

function LeaveRequestsTable({
    requests,
    loading,
    saving,
    onReview,
    onCancel,
    pagination,
    goToPage,
    pageNumbers,
}) {
    if (loading) {
        return (
            <div className="overflow-hidden rounded-xl border border-[var(--bms-border)]">
                <div className="hidden overflow-x-auto md:block">
                    <table className="min-w-[1050px] w-full">
                        <thead>
                            <tr className="border-b border-[var(--bms-border)] bg-[var(--bms-surface-soft)]">
                                {[
                                    "Employee",
                                    "Leave type",
                                    "Start",
                                    "End",
                                    "Days",
                                    "Day type",
                                    "Status",
                                    "Actions",
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className="
                                            px-4
                                            py-3
                                            text-left
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-wider
                                            text-[var(--bms-text-muted)]
                                        "
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {[1, 2, 3, 4, 5].map((item) => (
                                <tr
                                    key={item}
                                    className="animate-pulse border-b border-[var(--bms-border)]"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(
                                        (cell) => (
                                            <td
                                                key={cell}
                                                className="px-4 py-5"
                                            >
                                                <div className="h-4 rounded bg-[var(--bms-surface-soft)]" />
                                            </td>
                                        )
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="space-y-3 p-4 md:hidden">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="
                                h-32
                                animate-pulse
                                rounded-xl
                                bg-[var(--bms-surface-soft)]
                            "
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (!requests.length) {
        return (
            <div className="py-10">
                <Empty text="No leave requests found." />
            </div>
        );
    }

    return (
        <>
            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">
                <div className="overflow-x-auto">
                <table className="min-w-[1100px] w-full border-collapse text-left">
                    <thead>
                        <tr
                            className="
                                border-b
                                border-[var(--bms-border)]
                                bg-[var(--bms-surface-soft)]
                            "
                        >
                            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                                Employee
                            </th>

                            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                                Leave type
                            </th>

                            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                                Start
                            </th>

                            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                                End
                            </th>

                            <th className="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                                Days
                            </th>

                            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                                Day type
                            </th>

                            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                                Status
                            </th>

                            <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-[var(--bms-border)]">
                        <AnimatePresence>
                            {requests.map((request, index) => (
                                <motion.tr
                                    key={request.id}
                                    initial={{
                                        opacity: 0,
                                        y: 8,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        y: -8,
                                    }}
                                    transition={{
                                        duration: 0.2,
                                        delay: index * 0.02,
                                    }}
                                    className="transition-colors hover:bg-[var(--bms-surface-soft)]/50"
                                >
                                    {/* Employee */}

                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="
                                                    flex
                                                    h-9
                                                    w-9
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-lg
                                                    bg-blue-500/10
                                                    text-blue-500
                                                "
                                            >
                                                <UsersRound size={15} />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-[var(--bms-text)]">
                                                    {employeeName(
                                                        request.employee
                                                    )}
                                                </p>

                                                {request.employee
                                                    ?.employeeNumber && (
                                                    <p className="mt-0.5 text-[10px] text-[var(--bms-text-muted)]">
                                                        {
                                                            request.employee
                                                                .employeeNumber
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>


                                    {/* Leave type */}

                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <Umbrella
                                                size={14}
                                                className="shrink-0 text-blue-500"
                                            />

                                            <span className="text-sm font-medium text-[var(--bms-text)]">
                                                {request.leaveType?.name ||
                                                    "Leave request"}
                                            </span>
                                        </div>
                                    </td>


                                    {/* Start */}

                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                            <CalendarDays
                                                size={14}
                                                className="text-[var(--bms-text-muted)]"
                                            />

                                            <span className="text-sm text-[var(--bms-text-secondary)]">
                                                {formatDate(
                                                    request.startDate
                                                )}
                                            </span>
                                        </div>
                                    </td>


                                    {/* End */}

                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                            <CalendarDays
                                                size={14}
                                                className="text-[var(--bms-text-muted)]"
                                            />

                                            <span className="text-sm text-[var(--bms-text-secondary)]">
                                                {formatDate(
                                                    request.endDate
                                                )}
                                            </span>
                                        </div>
                                    </td>


                                    {/* Days */}

                                    <td className="px-4 py-4 text-center">
                                        <span
                                            className="
                                                inline-flex
                                                min-w-8
                                                items-center
                                                justify-center
                                                rounded-lg
                                                bg-blue-500/10
                                                px-2
                                                py-1
                                                text-sm
                                                font-bold
                                                text-blue-500
                                            "
                                        >
                                            {getDays(request)}
                                        </span>
                                    </td>


                                    {/* Day type */}

                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <Clock3
                                                size={14}
                                                className="text-[var(--bms-text-muted)]"
                                            />

                                            <span className="text-xs font-medium text-[var(--bms-text-secondary)]">
                                                {formatDayType(
                                                    request.dayType
                                                )}
                                            </span>
                                        </div>
                                    </td>


                                    {/* Status */}

                                    <td className="px-5 py-4">
                                        <Badge
                                            status={request.status}
                                        />
                                    </td>


                                    {/* Actions */}

                                    <td className="px-5 py-4">
                                        <div className="flex justify-end gap-2">
                                            {request.status ===
                                                "PENDING" && (
                                                <>
                                                    <button
                                                        type="button"
                                                        disabled={saving}
                                                        onClick={() =>
                                                            onReview(
                                                                request.id,
                                                                "APPROVED"
                                                            )
                                                        }
                                                        title="Approve request"
                                                        className="
                                                            inline-flex
                                                            h-8
                                                            items-center
                                                            gap-1.5
                                                            rounded-lg
                                                            bg-emerald-500/10
                                                            px-3
                                                            text-xs
                                                            font-semibold
                                                            text-emerald-500
                                                            transition
                                                            hover:bg-emerald-500/20
                                                            disabled:cursor-not-allowed
                                                            disabled:opacity-50
                                                        "
                                                    >
                                                        <Check size={14} />
                                                        Approve
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={saving}
                                                        onClick={() =>
                                                            onReview(
                                                                request.id,
                                                                "REJECTED"
                                                            )
                                                        }
                                                        title="Reject request"
                                                        className="
                                                            inline-flex
                                                            h-8
                                                            items-center
                                                            gap-1.5
                                                            rounded-lg
                                                            bg-red-500/10
                                                            px-3
                                                            text-xs
                                                            font-semibold
                                                            text-red-500
                                                            transition
                                                            hover:bg-red-500/20
                                                            disabled:cursor-not-allowed
                                                            disabled:opacity-50
                                                        "
                                                    >
                                                        <X size={14} />
                                                        Reject
                                                    </button>
                                                </>
                                            )}

                                            {[
                                                "PENDING",
                                                "APPROVED",
                                            ].includes(
                                                request.status
                                            ) && (
                                                <button
                                                    type="button"
                                                    disabled={saving}
                                                    onClick={() =>
                                                        onCancel(request)
                                                    }
                                                    title="Cancel request"
                                                    className="
                                                        inline-flex
                                                        h-8
                                                        items-center
                                                        justify-center
                                                        rounded-lg
                                                        border
                                                        border-red-500/20
                                                        px-2.5
                                                        text-red-500
                                                        transition
                                                        hover:bg-red-500/10
                                                        disabled:cursor-not-allowed
                                                        disabled:opacity-50
                                                    "
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
                </div>

                {pagination.pages > 1 && (
                    <div className="flex flex-col gap-3 border-t border-[var(--bms-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-[var(--bms-text-muted)]">
                            Showing {(pagination.page - 1) * pagination.limit + 1}
                            {"–"}
                            {Math.min(
                                pagination.page * pagination.limit,
                                pagination.total
                            )}
                            {" "}of {pagination.total} leave requests
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
                                        key={`leave-ellipsis-${index}`}
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


            {/* =================================================
                MOBILE TABLE-LIKE LIST
            ================================================= */}

            <div className="space-y-3 md:hidden">
                <AnimatePresence>
                    {requests.map((request, index) => (
                        <motion.div
                            key={request.id}
                            initial={{
                                opacity: 0,
                                y: 10,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                y: -10,
                            }}
                            transition={{
                                duration: 0.2,
                                delay: index * 0.03,
                            }}
                            className="
                                rounded-xl
                                border
                                border-[var(--bms-border)]
                                bg-[var(--bms-surface)]
                                p-4
                                transition
                                hover:shadow-lg
                            "
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div
                                        className="
                                            flex
                                            h-10
                                            w-10
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            bg-blue-500/10
                                            text-blue-500
                                        "
                                    >
                                        <UsersRound size={16} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-[var(--bms-text)]">
                                            {employeeName(
                                                request.employee
                                            )}
                                        </p>

                                        <p className="mt-1 truncate text-xs text-[var(--bms-text-muted)]">
                                            {request.leaveType?.name ||
                                                "Leave request"}
                                        </p>
                                    </div>
                                </div>

                                <Badge status={request.status} />
                            </div>


                            <div className="mt-4 grid grid-cols-2 gap-2">
                                <div className="rounded-lg bg-[var(--bms-surface-soft)] p-3">
                                    <p className="text-[9px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                                        Start
                                    </p>

                                    <p className="mt-1 text-xs font-semibold text-[var(--bms-text)]">
                                        {formatDate(
                                            request.startDate
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-[var(--bms-surface-soft)] p-3">
                                    <p className="text-[9px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                                        End
                                    </p>

                                    <p className="mt-1 text-xs font-semibold text-[var(--bms-text)]">
                                        {formatDate(
                                            request.endDate
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-[var(--bms-surface-soft)] p-3">
                                    <p className="text-[9px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                                        Days
                                    </p>

                                    <p className="mt-1 text-xs font-semibold text-[var(--bms-text)]">
                                        {getDays(request)}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-[var(--bms-surface-soft)] p-3">
                                    <p className="text-[9px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                                        Day type
                                    </p>

                                    <p className="mt-1 text-xs font-semibold text-[var(--bms-text)]">
                                        {formatDayType(
                                            request.dayType
                                        )}
                                    </p>
                                </div>
                            </div>


                            {request.reason && (
                                <div className="mt-3 rounded-lg bg-[var(--bms-surface-soft)] p-3">
                                    <p className="text-[9px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                                        Reason
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-[var(--bms-text-secondary)]">
                                        {request.reason}
                                    </p>
                                </div>
                            )}


                            {request.status === "PENDING" && (
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={() =>
                                            onReview(
                                                request.id,
                                                "APPROVED"
                                            )
                                        }
                                        className="
                                            rounded-lg
                                            bg-emerald-500/10
                                            px-3
                                            py-2
                                            text-xs
                                            font-semibold
                                            text-emerald-500
                                            transition
                                            hover:bg-emerald-500/20
                                            disabled:opacity-50
                                        "
                                    >
                                        <Check
                                            className="mr-1 inline"
                                            size={14}
                                        />

                                        Approve
                                    </button>

                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={() =>
                                            onReview(
                                                request.id,
                                                "REJECTED"
                                            )
                                        }
                                        className="
                                            rounded-lg
                                            bg-red-500/10
                                            px-3
                                            py-2
                                            text-xs
                                            font-semibold
                                            text-red-500
                                            transition
                                            hover:bg-red-500/20
                                            disabled:opacity-50
                                        "
                                    >
                                        <X
                                            className="mr-1 inline"
                                            size={14}
                                        />

                                        Reject
                                    </button>
                                </div>
                            )}


                            {[
                                "PENDING",
                                "APPROVED",
                            ].includes(request.status) && (
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={() =>
                                        onCancel(request)
                                    }
                                    className="
                                        mt-2
                                        w-full
                                        rounded-lg
                                        border
                                        border-red-500/20
                                        px-3
                                        py-2
                                        text-xs
                                        font-semibold
                                        text-red-500
                                        transition
                                        hover:bg-red-500/10
                                        disabled:opacity-50
                                    "
                                >
                                    <Trash2
                                        className="mr-1 inline"
                                        size={14}
                                    />

                                    Cancel request
                                </button>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </>
    );
}


/* =========================================================
   LEAVE TYPE CARD
========================================================= */

function TypeCard({
    type,
    onEdit,
    onDelete,
    disabled = false,
}) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="
                group flex h-full flex-col overflow-hidden rounded-2xl
                border border-[var(--bms-border)] bg-[var(--bms-surface)]
                transition duration-200 hover:-translate-y-0.5
                hover:border-blue-500/30 hover:shadow-lg
            "
        >
            <div className="h-1 bg-blue-500" />

            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                            <Umbrella size={19} />
                        </div>

                        <div className="min-w-0">
                            <h3 className="truncate font-semibold text-[var(--bms-text)]">
                                {type.name}
                            </h3>
                            <p className="text-[10px] text-[var(--bms-text-muted)]">
                                Leave type
                            </p>
                        </div>
                    </div>

                    <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            type.isActive
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-slate-500/10 text-slate-500"
                        }`}
                    >
                        {type.isActive ? "Active" : "Inactive"}
                    </span>
                </div>

                <p className="mt-4 min-h-[44px] text-sm leading-6 text-[var(--bms-text-secondary)]">
                    {type.description ||
                        "No description available for this leave type."}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-[var(--bms-surface-soft)] p-3">
                        <p className="text-[9px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                            Annual allowance
                        </p>
                        <p className="mt-1 text-lg font-bold text-[var(--bms-text)]">
                            {Number(type.annualAllowance) || 0}
                        </p>
                    </div>

                    <div className="rounded-xl bg-[var(--bms-surface-soft)] p-3">
                        <p className="text-[9px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                            Approval
                        </p>
                        <p className="mt-1 text-xs font-semibold text-[var(--bms-text)]">
                            {type.requiresApproval ? "Required" : "Automatic"}
                        </p>
                    </div>
                </div>

                <div className="mt-auto flex items-center justify-end gap-1 border-t border-[var(--bms-border)] pt-4">
                    <button
                        type="button"
                        onClick={onEdit}
                        disabled={disabled}
                        className="rounded-lg p-2 text-blue-500 transition hover:bg-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Edit ${type.name}`}
                        title={`Edit ${type.name}`}
                    >
                        <Edit3 size={16} />
                    </button>

                    <button
                        type="button"
                        onClick={onDelete}
                        disabled={disabled}
                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Delete ${type.name}`}
                        title={`Delete ${type.name}`}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </motion.article>
    );
}


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function LeaveManagement() {
    const [requests, setRequests] = useState([]);
    const [types, setTypes] = useState([]);
    const [balances, setBalances] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [stats, setStats] = useState({});

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [tab, setTab] = useState("requests");
    const [search, setSearch] = useState("");

    /* ---------------------------------------------------------
       SERVER-SIDE PAGINATION FOR LEAVE REQUESTS
    --------------------------------------------------------- */
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
    });

    const [selectedEmployeeId, setSelectedEmployeeId] =
        useState("");

    const [requestOpen, setRequestOpen] =
        useState(false);

    const [typeOpen, setTypeOpen] =
        useState(false);

    const [requestForm, setRequestForm] =
        useState(EMPTY_REQUEST);

    const [typeForm, setTypeForm] =
        useState(EMPTY_TYPE);

    const [confirmation, setConfirmation] =
        useState(null);

    const [confirming, setConfirming] =
        useState(false);


    /* =====================================================
       LOAD DATA
    ===================================================== */

    const load = useCallback(
        async ({ refresh = false, page = 1 } = {}) => {
            try {
                if (refresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const [
                    requestsResponse,
                    typesResponse,
                    statsResponse,
                    employeesResponse,
                ] = await Promise.all([
                    getLeaveRequests({ page, limit: 20 }),
                    getLeaveTypes(),
                    getLeaveStats(),
                    getEmployees({
                        page: 1,
                        limit: 100,
                        status: "ACTIVE",
                    }),
                ]);

                const employeeList = list(
                    employeesResponse,
                    ["employees"]
                );
                const requestList = leaveRequestData(requestsResponse);
                const leaveTypeList = list(typesResponse, [
                    "leaveTypes",
                    "types",
                ]);

                setRequests(Array.isArray(requestList) ? requestList : []);

                const paged = requestsResponse?.data;

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
                            requestList.length,
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
                        total: requestList.length,
                        pages: 1,
                    }));
                }
                setTypes(Array.isArray(leaveTypeList) ? leaveTypeList : []);
                setStats(
                    statsResponse?.data?.data ??
                        statsResponse?.data ??
                        statsResponse ??
                        {}
                );
                setEmployees(Array.isArray(employeeList) ? employeeList : []);

                // Do not update selectedEmployeeId from inside a callback
                // that depends on it. That was causing the render/effect
                // loop that made the page continuously refresh.
                setSelectedEmployeeId((currentId) => {
                    if (currentId && employeeList.some((employee) => employee.id === currentId)) {
                        return currentId;
                    }
                    return employeeList[0]?.id || "";
                });
            } catch (err) {
                console.error("Failed to load leave management:", err);
                setError(
                    getError(
                        err,
                        "Unable to load leave management."
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

    // Balance loading is intentionally isolated from the main page load.
    // Changing an employee therefore never reloads the whole page.
    useEffect(() => {
        let cancelled = false;

        async function loadSelectedBalance() {
            if (!selectedEmployeeId) {
                setBalances([]);
                return;
            }

            try {
                const response = await getLeaveBalances({
                    employeeId: selectedEmployeeId,
                });

                if (!cancelled) {
                    setBalances(list(response, ["balances"]));
                }
            } catch (err) {
                if (!cancelled) {
                    setBalances([]);
                    setError(
                        getError(
                            err,
                            "Unable to load leave balances."
                        )
                    );
                }
            }
        }

        loadSelectedBalance();

        return () => {
            cancelled = true;
        };
    }, [selectedEmployeeId]);

    /* =====================================================
       FILTER REQUESTS
    ===================================================== */

    const visible = useMemo(() => {
        const q = search
            .trim()
            .toLowerCase();

        if (!q) {
            return requests;
        }

        return requests.filter((request) => {
            const employee =
                employeeName(
                    request.employee
                ).toLowerCase();

            const leaveType =
                (
                    request.leaveType?.name ||
                    ""
                ).toLowerCase();

            const status =
                String(
                    request.status || ""
                ).toLowerCase();

            const reason =
                String(
                    request.reason || ""
                ).toLowerCase();

            return (
                employee.includes(q) ||
                leaveType.includes(q) ||
                status.includes(q) ||
                reason.includes(q)
            );
        });
    }, [requests, search]);


    /* =====================================================
       STATISTICS
    ===================================================== */

    const statistics = useMemo(
        () => ({
            pending:
                Number(
                    stats.pending?.count
                ) ||
                Number(stats.pending) ||
                requests.filter(
                    (request) =>
                        request.status ===
                        "PENDING"
                ).length,

            approved:
                Number(
                    stats.approved?.count
                ) ||
                Number(stats.approved) ||
                requests.filter(
                    (request) =>
                        request.status ===
                        "APPROVED"
                ).length,

            rejected:
                Number(
                    stats.rejected?.count
                ) ||
                Number(stats.rejected) ||
                requests.filter(
                    (request) =>
                        request.status ===
                        "REJECTED"
                ).length,

            days:
                Number(
                    stats.approved?.days
                ) ||
                requests
                    .filter(
                        (request) =>
                            request.status ===
                            "APPROVED"
                    )
                    .reduce(
                        (total, request) =>
                            total +
                            getDays(request),
                        0
                    ),
        }),
        [requests, stats]
    );


    /* =====================================================
       EMPLOYEE BALANCES
    ===================================================== */

    function changeEmployee(e) {
        setError("");
        setSelectedEmployeeId(e.target.value);
    }


    /* =====================================================
       CREATE LEAVE REQUEST
    ===================================================== */

    async function submitRequest(e) {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            await createLeaveRequest({
                ...requestForm,
                reason:
                    requestForm.reason.trim() ||
                    null,
            });

            setRequestOpen(false);

            setRequestForm({
                ...EMPTY_REQUEST,
            });

            await load({
                refresh: true,
                page: pagination.page,
            });
        } catch (err) {
            console.error(
                "Unable to submit leave request:",
                err
            );

            setError(
                getError(
                    err,
                    "Unable to submit leave request."
                )
            );
        } finally {
            setSaving(false);
        }
    }


    /* =====================================================
       CREATE LEAVE TYPE
    ===================================================== */

    async function submitType(e) {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            const payload = {
                name: typeForm.name.trim(),
                description: typeForm.description.trim() || null,
                annualAllowance: Number(typeForm.annualAllowance),
                requiresApproval: Boolean(typeForm.requiresApproval),
                isActive: Boolean(typeForm.isActive),
            };

            if (!payload.name) {
                throw new Error("Leave type name is required.");
            }

            if (!Number.isFinite(payload.annualAllowance) || payload.annualAllowance < 0) {
                throw new Error("Annual allowance must be a valid number greater than or equal to 0.");
            }

            if (typeForm.id) {
                await updateLeaveType(typeForm.id, payload);
            } else {
                await createLeaveType(payload);
            }

            setTypeOpen(false);
            setTypeForm({ ...EMPTY_TYPE });
            await load({ refresh: true, page: pagination.page });
        } catch (err) {
            console.error("Unable to save leave type:", err);
            setError(
                getError(
                    err,
                    typeForm.id
                        ? "Unable to update leave type."
                        : "Unable to create leave type."
                )
            );
        } finally {
            setSaving(false);
        }
    }

    function openCreateType() {
        setError("");
        setTypeForm({ ...EMPTY_TYPE });
        setTypeOpen(true);
    }

    function openEditType(type) {
        setError("");
        setTypeForm({
            id: type.id,
            name: type.name || "",
            description: type.description || "",
            annualAllowance: type.annualAllowance ?? 0,
            requiresApproval: Boolean(type.requiresApproval),
            isActive: type.isActive !== false,
        });
        setTypeOpen(true);
    }


    /* =====================================================
       REVIEW REQUEST
    ===================================================== */

    async function review(
        id,
        status
    ) {
        try {
            setSaving(true);
            setError("");

            await reviewLeaveRequest(
                id,
                { status }
            );

            await load({
                refresh: true,
                page: pagination.page,
            });
        } catch (err) {
            setError(
                getError(
                    err,
                    "Unable to review leave request."
                )
            );
        } finally {
            setSaving(false);
        }
    }


    /* =====================================================
       CONFIRMATION
    ===================================================== */

    function askCancel(request) {
        setConfirmation({
            kind: "request",
            id: request.id,
            name: employeeName(
                request.employee
            ),
        });
    }


    function askDelete(type) {
        setConfirmation({
            kind: "type",
            id: type.id,
            name: type.name,
        });
    }


    async function confirmAction() {
        if (
            !confirmation ||
            confirming
        ) {
            return;
        }

        try {
            setConfirming(true);
            setError("");

            if (
                confirmation.kind ===
                "request"
            ) {
                await cancelLeaveRequest(
                    confirmation.id
                );
            } else {
                await deleteLeaveType(
                    confirmation.id
                );
            }

            setConfirmation(null);

            await load({
                refresh: true,
                page: pagination.page,
            });
        } catch (err) {
            setError(
                getError(
                    err,
                    "Unable to complete the leave action."
                )
            );

            setConfirmation(null);
        } finally {
            setConfirming(false);
        }
    }


    /* =====================================================
       PAGINATION
    ===================================================== */

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


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="p-4 sm:p-6">
            <div className="mx-auto max-w-[1600px]">

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <PageHeader
                    icon={Umbrella}
                    title="Leave Management"
                    description="Manage leave requests, approvals, leave types and employee balances."
                    onRefresh={() =>
                        load({
                            refresh: true,
                            page: pagination.page,
                        })
                    }
                    refreshing={refreshing}
                    action={
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="secondary"
                                onClick={openCreateType}
                            >
                                <Umbrella size={16} />

                                Leave type
                            </Button>

                            <Button
                                onClick={() => {
                                    setRequestForm({
                                        ...EMPTY_REQUEST,
                                        employeeId:
                                            selectedEmployeeId ||
                                            employees[0]
                                                ?.id ||
                                            "",
                                    });

                                    setRequestOpen(
                                        true
                                    );
                                }}
                            >
                                <Plus size={16} />

                                Request leave
                            </Button>
                        </div>
                    }
                />


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div className="mt-4">
                        <ErrorBox
                            message={error}
                        />
                    </div>
                )}


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={UsersRound}
                        label="Pending"
                        value={
                            statistics.pending
                        }
                        tone="amber"
                    />

                    <StatCard
                        icon={Check}
                        label="Approved"
                        value={
                            statistics.approved
                        }
                        tone="emerald"
                    />

                    <StatCard
                        icon={X}
                        label="Rejected"
                        value={
                            statistics.rejected
                        }
                        tone="red"
                    />

                    <StatCard
                        icon={ClipboardList}
                        label="Days approved"
                        value={
                            statistics.days
                        }
                        tone="blue"
                    />
                </div>


                {/* =================================================
                    TABS
                ================================================= */}

                <div className="mt-5 flex gap-2 overflow-x-auto border-b border-[var(--bms-border)]">
                    {[
                        [
                            "requests",
                            "Requests",
                        ],
                        [
                            "types",
                            "Leave Types",
                        ],
                        [
                            "balances",
                            "Balances",
                        ],
                    ].map(
                        ([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() =>
                                    setTab(value)
                                }
                                className={`
                                    shrink-0
                                    border-b-2
                                    px-4
                                    py-3
                                    text-sm
                                    font-semibold
                                    transition
                                    ${
                                        tab ===
                                        value
                                            ? "border-blue-500 text-[var(--bms-text)]"
                                            : "border-transparent text-[var(--bms-text-muted)] hover:text-[var(--bms-text)]"
                                    }
                                `}
                            >
                                {label}
                            </button>
                        )
                    )}
                </div>


                {/* =================================================
                    REQUESTS TAB
                ================================================= */}

                {tab === "requests" && (
                    <section className="mt-5 overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

                        {/* Header */}

                        <div className="flex flex-col gap-3 border-b border-[var(--bms-border)] p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="font-semibold text-[var(--bms-text)]">
                                    Leave requests
                                </h2>

                                <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                                    {visible.length} request
                                    {visible.length ===
                                    1
                                        ? ""
                                        : "s"}
                                </p>
                            </div>


                            {/* Search */}

                            <div className="relative w-full sm:max-w-xs">
                                <Search
                                    size={15}
                                    className="
                                        absolute
                                        left-3
                                        top-1/2
                                        -translate-y-1/2
                                        text-[var(--bms-text-muted)]
                                    "
                                />

                                <input
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target
                                                .value
                                        )
                                    }
                                    placeholder="Search employee, leave type..."
                                    className={`${inputClass} pl-9`}
                                />
                            </div>
                        </div>


                        {/* Table */}

                        <LeaveRequestsTable
                            requests={visible}
                            loading={loading}
                            saving={saving}
                            onReview={review}
                            onCancel={askCancel}
                            pagination={pagination}
                            goToPage={goToPage}
                            pageNumbers={pageNumbers}
                        />
                    </section>
                )}


                {/* =================================================
                    LEAVE TYPES TAB
                ================================================= */}

                {tab === "types" && (
                    <section className="mt-5">
                        {loading ? (
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {[1, 2, 3].map(
                                    (item) => (
                                        <div
                                            key={
                                                item
                                            }
                                            className="
                                                h-56
                                                animate-pulse
                                                rounded-2xl
                                                bg-[var(--bms-surface-soft)]
                                            "
                                        />
                                    )
                                )}
                            </div>
                        ) : types.length === 0 ? (
                            <Empty text="No leave types found." />
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {types.map(
                                    (type) => (
                                        <TypeCard
                                            key={
                                                type.id
                                            }
                                            type={
                                                type
                                            }
                                            onEdit={() =>
                                                openEditType(type)
                                            }
                                            onDelete={() =>
                                                askDelete(type)
                                            }
                                            disabled={saving}
                                        />
                                    )
                                )}
                            </div>
                        )}
                    </section>
                )}


                {/* =================================================
                    BALANCES TAB
                ================================================= */}

                {tab === "balances" && (
                    <section className="mt-5">
                        <div className="mb-4 max-w-md">
                            <Field label="Employee">
                                <select
                                    className={
                                        selectClass
                                    }
                                    value={
                                        selectedEmployeeId
                                    }
                                    onChange={
                                        changeEmployee
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
                        </div>


                        {balances.length ===
                        0 ? (
                            <Empty text="No balances initialized for the selected employee." />
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {balances.map(
                                    (balance) => (
                                        <motion.div
                                            key={
                                                balance.id
                                            }
                                            initial={{
                                                opacity: 0,
                                                y: 10,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            className="
                                                rounded-2xl
                                                border
                                                border-[var(--bms-border)]
                                                bg-[var(--bms-surface)]
                                                p-5
                                                transition
                                                hover:-translate-y-0.5
                                                hover:shadow-lg
                                            "
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="
                                                        flex
                                                        h-11
                                                        w-11
                                                        items-center
                                                        justify-center
                                                        rounded-xl
                                                        bg-blue-500/10
                                                        text-blue-500
                                                    "
                                                >
                                                    <Umbrella
                                                        size={
                                                            19
                                                        }
                                                    />
                                                </div>

                                                <h3 className="font-semibold text-[var(--bms-text)]">
                                                    {balance
                                                        .leaveType
                                                        ?.name ||
                                                        "Leave balance"}
                                                </h3>
                                            </div>

                                            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                                                {[
                                                    [
                                                        "Entitled",
                                                        balance.entitled,
                                                    ],
                                                    [
                                                        "Used",
                                                        balance.used,
                                                    ],
                                                    [
                                                        "Remaining",
                                                        balance.remaining,
                                                    ],
                                                ].map(
                                                    ([
                                                        label,
                                                        value,
                                                    ]) => (
                                                        <div
                                                            key={
                                                                label
                                                            }
                                                            className="
                                                                rounded-xl
                                                                bg-[var(--bms-surface-soft)]
                                                                p-3
                                                            "
                                                        >
                                                            <p className="text-lg font-bold text-[var(--bms-text)]">
                                                                {Number(
                                                                    value
                                                                ) ||
                                                                    0}
                                                            </p>

                                                            <p className="text-[9px] uppercase tracking-wide text-[var(--bms-text-muted)]">
                                                                {
                                                                    label
                                                                }
                                                            </p>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </motion.div>
                                    )
                                )}
                            </div>
                        )}
                    </section>
                )}


                {/* =================================================
                    REQUEST LEAVE MODAL
                ================================================= */}

                <Modal
                    open={requestOpen}
                    onClose={() =>
                        !saving &&
                        setRequestOpen(false)
                    }
                    title="Request leave"
                >
                    <form
                        onSubmit={
                            submitRequest
                        }
                        className="space-y-4 p-5"
                    >
                        <Field
                            label="Employee"
                            required
                        >
                            <select
                                required
                                className={
                                    selectClass
                                }
                                value={
                                    requestForm.employeeId
                                }
                                onChange={(e) =>
                                    setRequestForm(
                                        (
                                            current
                                        ) => ({
                                            ...current,
                                            employeeId:
                                                e
                                                    .target
                                                    .value,
                                        })
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
                                        </option>
                                    )
                                )}
                            </select>
                        </Field>


                        <Field
                            label="Leave type"
                            required
                        >
                            <select
                                required
                                className={
                                    selectClass
                                }
                                value={
                                    requestForm.leaveTypeId
                                }
                                onChange={(e) =>
                                    setRequestForm(
                                        (
                                            current
                                        ) => ({
                                            ...current,
                                            leaveTypeId:
                                                e
                                                    .target
                                                    .value,
                                        })
                                    )
                                }
                            >
                                <option value="">
                                    Select leave type
                                </option>

                                {types
                                    .filter(
                                        (
                                            type
                                        ) =>
                                            type.isActive
                                    )
                                    .map(
                                        (
                                            type
                                        ) => (
                                            <option
                                                key={
                                                    type.id
                                                }
                                                value={
                                                    type.id
                                                }
                                            >
                                                {
                                                    type.name
                                                }
                                            </option>
                                        )
                                    )}
                            </select>
                        </Field>


                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field
                                label="Start date"
                                required
                            >
                                <input
                                    required
                                    type="date"
                                    className={
                                        inputClass
                                    }
                                    value={
                                        requestForm.startDate
                                    }
                                    onChange={(e) =>
                                        setRequestForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                startDate:
                                                    e
                                                        .target
                                                        .value,
                                            })
                                        )
                                    }
                                />
                            </Field>

                            <Field
                                label="End date"
                                required
                            >
                                <input
                                    required
                                    type="date"
                                    className={
                                        inputClass
                                    }
                                    value={
                                        requestForm.endDate
                                    }
                                    onChange={(e) =>
                                        setRequestForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                endDate:
                                                    e
                                                        .target
                                                        .value,
                                            })
                                        )
                                    }
                                />
                            </Field>
                        </div>


                        <Field label="Day type">
                            <select
                                className={
                                    selectClass
                                }
                                value={
                                    requestForm.dayType
                                }
                                onChange={(e) =>
                                    setRequestForm(
                                        (
                                            current
                                        ) => ({
                                            ...current,
                                            dayType:
                                                e
                                                    .target
                                                    .value,
                                        })
                                    )
                                }
                            >
                                <option value="FULL_DAY">
                                    Full day
                                </option>

                                <option value="HALF_DAY">
                                    Half day
                                </option>
                            </select>
                        </Field>


                        <Field label="Reason">
                            <textarea
                                rows="4"
                                className={
                                    textareaClass
                                }
                                value={
                                    requestForm.reason
                                }
                                onChange={(e) =>
                                    setRequestForm(
                                        (
                                            current
                                        ) => ({
                                            ...current,
                                            reason:
                                                e
                                                    .target
                                                    .value,
                                        })
                                    )
                                }
                                placeholder="Explain the reason for the leave request..."
                            />
                        </Field>


                        <div
                            className="
                                flex
                                justify-end
                                gap-2
                                border-t
                                border-[var(--bms-border)]
                                pt-4
                            "
                        >
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() =>
                                    setRequestOpen(
                                        false
                                    )
                                }
                                disabled={saving}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={saving}
                            >
                                {saving
                                    ? "Submitting..."
                                    : "Submit request"}
                            </Button>
                        </div>
                    </form>
                </Modal>


                {/* =================================================
                    CREATE LEAVE TYPE MODAL
                ================================================= */}

                <Modal
                    open={typeOpen}
                    onClose={() =>
                        !saving &&
                        setTypeOpen(false)
                    }
                    title={typeForm.id ? "Edit leave type" : "Create leave type"}
                >
                    <form
                        onSubmit={
                            submitType
                        }
                        className="space-y-4 p-5"
                    >
                        <Field
                            label="Leave type name"
                            required
                        >
                            <input
                                required
                                className={
                                    inputClass
                                }
                                value={
                                    typeForm.name
                                }
                                onChange={(e) =>
                                    setTypeForm(
                                        (
                                            current
                                        ) => ({
                                            ...current,
                                            name: e
                                                .target
                                                .value,
                                        })
                                    )
                                }
                                placeholder="e.g. Annual Leave"
                            />
                        </Field>


                        <Field
                            label="Annual allowance"
                            required
                        >
                            <input
                                required
                                type="number"
                                min="0"
                                step="0.5"
                                className={
                                    inputClass
                                }
                                value={
                                    typeForm.annualAllowance
                                }
                                onChange={(e) =>
                                    setTypeForm(
                                        (
                                            current
                                        ) => ({
                                            ...current,
                                            annualAllowance:
                                                e
                                                    .target
                                                    .value,
                                        })
                                    )
                                }
                            />
                        </Field>


                        <Field label="Description">
                            <textarea
                                rows="3"
                                className={
                                    textareaClass
                                }
                                value={
                                    typeForm.description
                                }
                                onChange={(e) =>
                                    setTypeForm(
                                        (
                                            current
                                        ) => ({
                                            ...current,
                                            description:
                                                e
                                                    .target
                                                    .value,
                                        })
                                    )
                                }
                            />
                        </Field>


                        <label className="flex items-center gap-2 text-sm font-semibold text-[var(--bms-text)]">
                            <input
                                type="checkbox"
                                checked={
                                    typeForm.requiresApproval
                                }
                                onChange={(e) =>
                                    setTypeForm(
                                        (
                                            current
                                        ) => ({
                                            ...current,
                                            requiresApproval:
                                                e
                                                    .target
                                                    .checked,
                                        })
                                    )
                                }
                            />

                            Requires approval
                        </label>

                        <label className="flex items-center gap-2 text-sm font-semibold text-[var(--bms-text)]">
                            <input
                                type="checkbox"
                                checked={typeForm.isActive}
                                onChange={(e) =>
                                    setTypeForm((current) => ({
                                        ...current,
                                        isActive: e.target.checked,
                                    }))
                                }
                            />

                            Active leave type
                        </label>


                        <div
                            className="
                                flex
                                justify-end
                                gap-2
                                border-t
                                border-[var(--bms-border)]
                                pt-4
                            "
                        >
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() =>
                                    setTypeOpen(
                                        false
                                    )
                                }
                                disabled={saving}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={saving}
                            >
                                {saving
                                    ? typeForm.id
                                        ? "Saving..."
                                        : "Creating..."
                                    : typeForm.id
                                      ? "Save changes"
                                      : "Create leave type"}
                            </Button>
                        </div>
                    </form>
                </Modal>


                {/* =================================================
                    CONFIRMATION
                ================================================= */}

                {confirmation && (
                    <ConfirmAction
                        title={
                            confirmation.kind ===
                            "type"
                                ? "Delete leave type"
                                : "Cancel leave request"
                        }
                        message={
                            confirmation.kind ===
                            "type"
                                ? `Are you sure you want to permanently delete "${confirmation.name}"?`
                                : `Are you sure you want to cancel the leave request for "${confirmation.name}"?`
                        }
                        label={
                            confirmation.kind ===
                            "type"
                                ? "Delete type"
                                : "Cancel request"
                        }
                        loading={
                            confirming
                        }
                        onCancel={() =>
                            !confirming &&
                            setConfirmation(
                                null
                            )
                        }
                        onConfirm={
                            confirmAction
                        }
                    />
                )}
            </div>
        </div>
    );
}
import {
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Eye,
    Filter,
    Mail,
    MapPin,
    Phone,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    UserRound,
    Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
    createEmployee,
    deleteEmployee,
    getEmployees,
} from "../../../api/employee.js";
import { getAllUsers } from "../../../api/users.js";

const EMPLOYMENT_STATUS = [
    ["ALL", "All statuses"],
    ["ACTIVE", "Active"],
    ["ON_LEAVE", "On leave"],
    ["SUSPENDED", "Suspended"],
    ["TERMINATED", "Terminated"],
    ["RESIGNED", "Resigned"],
];

const EMPLOYMENT_TYPES = [
    ["ALL", "All types"],
    ["FULL_TIME", "Full time"],
    ["PART_TIME", "Part time"],
    ["CONTRACT", "Contract"],
    ["INTERN", "Intern"],
    ["TEMPORARY", "Temporary"],
];

const STATUS_META = {
    ACTIVE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-emerald-500",
    ON_LEAVE: "bg-amber-500/10 text-amber-500 border-amber-500/20 text-amber-500",
    SUSPENDED: "bg-red-500/10 text-red-500 border-red-500/20 text-red-500",
    TERMINATED: "bg-slate-500/10 text-slate-500 border-slate-500/20 text-slate-500",
    RESIGNED: "bg-purple-500/10 text-purple-500 border-purple-500/20 text-purple-500",
};

const TYPE_LABELS = Object.fromEntries(
    EMPLOYMENT_TYPES.filter(([value]) => value !== "ALL")
);

const EMPTY_FORM = {
    userId: "",
    employeeNumber: "",
    jobTitle: "",
    employmentType: "FULL_TIME",
    employmentStatus: "ACTIVE",
    hireDate: "",
    terminationDate: "",
    workLocation: "",
    phone: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    bio: "",
    managerId: "",
};

function unwrap(value) {
    return value?.data ?? value;
}

function normalizeEmployees(value) {
    const data = unwrap(value);
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.employees)) return data.employees;
    return [];
}

function normalizePagination(value) {
    const data = unwrap(value);
    const p = data?.pagination || {};
    return {
        page: Number(p.page) || 1,
        limit: Number(p.limit) || 20,
        total: Number(p.total) || 0,
        totalPages: Number(p.totalPages) || 1,
    };
}

function getUser(employee) {
    return employee?.user || employee;
}

function getName(employee) {
    const user = getUser(employee);
    return `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Unnamed employee";
}

function getInitials(employee) {
    const user = getUser(employee);
    return `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() || "U";
}

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function statusMeta(status) {
    return STATUS_META[status] || "bg-slate-500/10 text-slate-500 border-slate-500/20 text-slate-500";
}

function labelize(value) {
    return String(value || "—")
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function StatCard({ icon: Icon, label, value, tone = "blue" }) {
    const tones = {
        blue: "bg-blue-500/10 text-blue-500",
        emerald: "bg-emerald-500/10 text-emerald-500",
        amber: "bg-amber-500/10 text-amber-500",
        red: "bg-red-500/10 text-red-500",
    };

    return (
        <div className="min-w-0 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4 sm:p-5">
            <div className="flex min-w-0 items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-xs text-[var(--bms-text-secondary)] sm:text-sm">
                        {label}
                    </p>
                    <p className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--bms-text)] sm:text-3xl">
                        {value}
                    </p>
                </div>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
                    <Icon size={19} />
                </div>
            </div>
        </div>
    );
}

export default function Employees() {
    const [employees, setEmployees] = useState([]);
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);

    const loadEmployees = useCallback(
        async ({ page = 1, refresh = false } = {}) => {
            try {
                if (refresh) setIsRefreshing(true);
                else setIsLoading(true);

                setError("");

                const result = await getEmployees({
                    page,
                    limit: pagination.limit,
                    search: searchQuery.trim(),
                    status: statusFilter,
                    employmentType: typeFilter,
                });

                setEmployees(normalizeEmployees(result));
                setPagination(normalizePagination(result));
            } catch (err) {
                console.error("Failed to load employees:", err);
                setError(err?.message || "Unable to load employees.");
                setEmployees([]);
            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        },
        [pagination.limit, searchQuery, statusFilter, typeFilter]
    );

    const loadUsers = useCallback(async () => {
        try {
            const result = await getAllUsers({ limit: 100 });
            const data = unwrap(result);
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load users:", err);
        }
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            loadEmployees({ page: 1 });
        }, 250);

        return () => window.clearTimeout(timer);
    }, [loadEmployees]);

    const activeEmployees = useMemo(
        () => employees.filter((employee) => employee?.employmentStatus === "ACTIVE").length,
        [employees]
    );

    const leaveEmployees = useMemo(
        () => employees.filter((employee) => employee?.employmentStatus === "ON_LEAVE").length,
        [employees]
    );

    const inactiveEmployees = useMemo(
        () =>
            employees.filter((employee) =>
                ["SUSPENDED", "TERMINATED", "RESIGNED"].includes(employee?.employmentStatus)
            ).length,
        [employees]
    );

    const employeeUserIds = useMemo(
        () => new Set(employees.map((employee) => employee?.userId).filter(Boolean)),
        [employees]
    );

    const availableUsers = useMemo(
        () =>
            users.filter(
                (user) =>
                    user?.status === "ACTIVE" &&
                    !employeeUserIds.has(user?.id)
            ),
        [users, employeeUserIds]
    );

    function openCreate() {
        setForm(EMPTY_FORM);
        setFormError("");
        setError("");
        setShowCreate(true);
        loadUsers();
    }

    function closeCreate() {
        if (isSaving) return;
        setShowCreate(false);
        setForm(EMPTY_FORM);
        setFormError("");
    }

    function updateField(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
        if (formError) setFormError("");
    }

    function validateCreate() {
        if (!form.userId) return "Please select an active user.";
        if (!form.employeeNumber.trim()) return "Employee number is required.";
        if (form.employeeNumber.trim().length < 2) {
            return "Employee number must be at least 2 characters.";
        }
        if (form.terminationDate && !form.hireDate) {
            return "A hire date is required when a termination date is provided.";
        }
        if (form.hireDate && form.terminationDate && form.terminationDate < form.hireDate) {
            return "Termination date cannot be earlier than the hire date.";
        }
        return "";
    }

    async function handleCreate(event) {
        event.preventDefault();

        const validationError = validateCreate();
        if (validationError) {
            setFormError(validationError);
            return;
        }

        try {
            setIsSaving(true);
            setFormError("");

            await createEmployee({
                userId: form.userId,
                employeeNumber: form.employeeNumber.trim(),
                jobTitle: form.jobTitle.trim() || null,
                employmentType: form.employmentType,
                employmentStatus: form.employmentStatus,
                hireDate: form.hireDate ? new Date(`${form.hireDate}T00:00:00`).toISOString() : null,
                terminationDate: form.terminationDate
                    ? new Date(`${form.terminationDate}T00:00:00`).toISOString()
                    : null,
                workLocation: form.workLocation.trim() || null,
                phone: form.phone.trim() || null,
                address: form.address.trim() || null,
                emergencyContactName: form.emergencyContactName.trim() || null,
                emergencyContactPhone: form.emergencyContactPhone.trim() || null,
                emergencyContactRelationship: form.emergencyContactRelationship.trim() || null,
                bio: form.bio.trim() || null,
                managerId: form.managerId || null,
            });

            closeCreate();
            await loadEmployees({ page: 1, refresh: true });
        } catch (err) {
            setFormError(err?.message || "Unable to create employee.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return;

        try {
            setIsSaving(true);
            setError("");

            await deleteEmployee(deleteTarget.id);

            setDeleteTarget(null);

            const nextPage =
                employees.length === 1 && pagination.page > 1
                    ? pagination.page - 1
                    : pagination.page;

            await loadEmployees({ page: nextPage, refresh: true });
        } catch (err) {
            setError(err?.message || "Unable to delete employee.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="min-w-0 space-y-5 sm:space-y-6">
            <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                            <Users size={21} />
                        </div>
                        <div className="min-w-0">
                            <h1 className="truncate text-xl font-semibold text-[var(--bms-text)] sm:text-2xl">
                                Employees
                            </h1>
                            <p className="mt-1 text-sm text-[var(--bms-text-secondary)]">
                                Manage employee profiles, employment status and reporting relationships.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <button
                        type="button"
                        onClick={() => loadEmployees({ page: pagination.page, refresh: true })}
                        disabled={isRefreshing}
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface)] px-3 text-sm font-medium text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)] disabled:opacity-50 sm:w-auto"
                    >
                        <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                        <span>Refresh</span>
                    </button>

                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 sm:w-auto"
                    >
                        <Plus size={17} />
                        Add Employee
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
                    {error}
                </div>
            )}

            <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={Users} label="Total Employees" value={pagination.total} />
                <StatCard icon={UserRound} label="Active on page" value={activeEmployees} tone="emerald" />
                <StatCard icon={CalendarDays} label="On leave on page" value={leaveEmployees} tone="amber" />
                <StatCard icon={BriefcaseBusiness} label="Other statuses on page" value={inactiveEmployees} tone="red" />
            </div>

            <section className="min-w-0 overflow-hidden rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">
                <div className="border-b border-[var(--bms-border)] p-4 sm:p-5">
                    <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                        <div className="min-w-0">
                            <h2 className="text-sm font-semibold text-[var(--bms-text)]">
                                Employee Directory
                            </h2>
                            <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                                Search and filter employee records from the employee service.
                            </p>
                        </div>

                        <div className="grid min-w-0 gap-2 sm:grid-cols-2 xl:flex">
                            <div className="relative min-w-0">
                                <Search
                                    size={16}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bms-text-muted)]"
                                />
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Search name, email, job title..."
                                    className="h-10 w-full min-w-0 rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] pl-9 pr-3 text-sm text-[var(--bms-text)] outline-none focus:border-blue-500 xl:w-72"
                                />
                            </div>

                            <div className="relative min-w-0">
                                <Filter
                                    size={15}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bms-text-muted)]"
                                />
                                <select
                                    value={statusFilter}
                                    onChange={(event) => setStatusFilter(event.target.value)}
                                    className="h-10 w-full min-w-0 appearance-none rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] pl-9 pr-8 text-sm text-[var(--bms-text)] outline-none focus:border-blue-500 xl:w-44"
                                >
                                    {EMPLOYMENT_STATUS.map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <select
                                value={typeFilter}
                                onChange={(event) => setTypeFilter(event.target.value)}
                                className="h-10 w-full min-w-0 rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-3 text-sm text-[var(--bms-text)] outline-none focus:border-blue-500 xl:w-40"
                            >
                                {EMPLOYMENT_TYPES.map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid min-w-0 gap-3 p-3 sm:grid-cols-2 sm:gap-4 sm:p-5 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-64 min-w-0 animate-pulse rounded-xl bg-[var(--bms-surface-soft)]"
                            />
                        ))}
                    </div>
                ) : employees.length === 0 ? (
                    <div className="px-5 py-16 text-center">
                        <Users size={32} className="mx-auto text-[var(--bms-text-muted)]" />
                        <h3 className="mt-4 text-sm font-semibold text-[var(--bms-text)]">
                            No employees found
                        </h3>
                        <p className="mx-auto mt-1 max-w-sm text-sm text-[var(--bms-text-secondary)]">
                            Try changing your search or filters, or add an employee from an active user.
                        </p>
                    </div>
                ) : (
                    <div className="grid min-w-0 gap-3 p-3 sm:grid-cols-2 sm:gap-4 sm:p-5 xl:grid-cols-3">
                        {employees.map((employee) => {
                            const user = getUser(employee);
                            const status = employee?.employmentStatus || "UNKNOWN";
                            const count = employee?._count || {};

                            return (
                                <article
                                    key={employee.id}
                                    className="min-w-0 max-w-full overflow-hidden rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-4 transition hover:-translate-y-0.5 hover:border-blue-500/20 hover:shadow-md sm:p-5"
                                >
                                    <div className="flex min-w-0 items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-500/10 text-sm font-bold text-blue-500">
                                                {user?.avatarUrl ? (
                                                    <img
                                                        src={user.avatarUrl}
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    getInitials(employee)
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="truncate text-sm font-semibold text-[var(--bms-text)]">
                                                    {getName(employee)}
                                                </h3>
                                                <p className="mt-0.5 truncate text-xs text-[var(--bms-text-muted)]">
                                                    {employee?.employeeNumber || "No employee number"}
                                                </p>
                                            </div>
                                        </div>

                                        <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold ${statusMeta(status)}`}>
                                            {labelize(status)}
                                        </span>
                                    </div>

                                    <div className="mt-4 space-y-2.5">
                                        <InfoRow icon={BriefcaseBusiness} label="Position" value={employee?.jobTitle || "Not specified"} />
                                        <InfoRow icon={Mail} label="Email" value={user?.email || "No email"} />
                                        <InfoRow icon={MapPin} label="Location" value={employee?.workLocation || "Not specified"} />
                                        <InfoRow icon={CalendarDays} label="Hired" value={formatDate(employee?.hireDate)} />
                                    </div>

                                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--bms-border)] pt-4">
                                        <MiniMetric label="Teams" value={count.teamMemberships || 0} />
                                        <MiniMetric label="Skills" value={count.skills || 0} />
                                        <MiniMetric label="Goals" value={count.goals || 0} />
                                    </div>

                                    <div className="mt-4 flex min-w-0 gap-2">
                                        <Link
                                            to={`/employees/${employee.id}`}
                                            className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface)] px-3 py-2 text-xs font-medium text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)]"
                                        >
                                            <Eye size={15} />
                                            View details
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => setDeleteTarget(employee)}
                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10"
                                            aria-label={`Delete ${getName(employee)}`}
                                            title="Delete employee profile"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {!isLoading && pagination.totalPages > 1 && (
                    <div className="flex min-w-0 flex-col gap-3 border-t border-[var(--bms-border)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <p className="text-xs text-[var(--bms-text-muted)]">
                            Page {pagination.page} of {pagination.totalPages} · {pagination.total} employees
                        </p>

                        <div className="flex w-full gap-2 sm:w-auto">
                            <button
                                type="button"
                                onClick={() => loadEmployees({ page: pagination.page - 1 })}
                                disabled={pagination.page <= 1}
                                className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-lg border border-[var(--bms-border)] px-3 text-xs text-[var(--bms-text-secondary)] disabled:opacity-40 sm:flex-none"
                            >
                                <ChevronLeft size={15} />
                                Previous
                            </button>
                            <button
                                type="button"
                                onClick={() => loadEmployees({ page: pagination.page + 1 })}
                                disabled={pagination.page >= pagination.totalPages}
                                className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-lg border border-[var(--bms-border)] px-3 text-xs text-[var(--bms-text-secondary)] disabled:opacity-40 sm:flex-none"
                            >
                                Next
                                <ChevronRight size={15} />
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {showCreate && (
                <Modal title="Add Employee" onClose={closeCreate}>
                    <form onSubmit={handleCreate} className="space-y-5">
                        {formError && <ModalError message={formError} />}

                        <SectionTitle title="Employee assignment" subtitle="An employee profile must belong to an active user." />

                        <Field label="Active user">
                            <select
                                value={form.userId}
                                onChange={(event) => updateField("userId", event.target.value)}
                                className={INPUT_CLASS}
                                required
                            >
                                <option value="">Select active user</option>
                                {availableUsers.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.firstName} {user.lastName} — {user.email}
                                    </option>
                                ))}
                            </select>
                            {availableUsers.length === 0 && (
                                <p className="mt-1.5 text-xs text-amber-500">
                                    No eligible active users are currently available.
                                </p>
                            )}
                        </Field>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Employee number">
                                <input
                                    value={form.employeeNumber}
                                    onChange={(event) => updateField("employeeNumber", event.target.value)}
                                    className={INPUT_CLASS}
                                    maxLength={50}
                                    required
                                />
                            </Field>

                            <Field label="Job title">
                                <input
                                    value={form.jobTitle}
                                    onChange={(event) => updateField("jobTitle", event.target.value)}
                                    className={INPUT_CLASS}
                                    maxLength={150}
                                />
                            </Field>

                            <Field label="Employment type">
                                <select
                                    value={form.employmentType}
                                    onChange={(event) => updateField("employmentType", event.target.value)}
                                    className={INPUT_CLASS}
                                >
                                    {EMPLOYMENT_TYPES.filter(([value]) => value !== "ALL").map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Employment status">
                                <select
                                    value={form.employmentStatus}
                                    onChange={(event) => updateField("employmentStatus", event.target.value)}
                                    className={INPUT_CLASS}
                                >
                                    {EMPLOYMENT_STATUS.filter(([value]) => value !== "ALL").map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Hire date">
                                <input
                                    type="date"
                                    value={form.hireDate}
                                    onChange={(event) => updateField("hireDate", event.target.value)}
                                    className={INPUT_CLASS}
                                />
                            </Field>

                            <Field label="Termination date">
                                <input
                                    type="date"
                                    value={form.terminationDate}
                                    onChange={(event) => updateField("terminationDate", event.target.value)}
                                    className={INPUT_CLASS}
                                />
                            </Field>

                            <Field label="Work location">
                                <input
                                    value={form.workLocation}
                                    onChange={(event) => updateField("workLocation", event.target.value)}
                                    className={INPUT_CLASS}
                                    maxLength={150}
                                />
                            </Field>

                            <Field label="Manager">
                                <select
                                    value={form.managerId}
                                    onChange={(event) => updateField("managerId", event.target.value)}
                                    className={INPUT_CLASS}
                                >
                                    <option value="">No manager</option>
                                    {employees
                                        .filter((employee) => employee.employmentStatus === "ACTIVE")
                                        .map((employee) => (
                                            <option key={employee.id} value={employee.id}>
                                                {getName(employee)} — {employee.employeeNumber}
                                            </option>
                                        ))}
                                </select>
                                <p className="mt-1.5 text-[11px] text-[var(--bms-text-muted)]">
                                    Only active employees can be managers.
                                </p>
                            </Field>
                        </div>

                        <SectionTitle title="Contact information" />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Phone">
                                <input
                                    value={form.phone}
                                    onChange={(event) => updateField("phone", event.target.value)}
                                    className={INPUT_CLASS}
                                    maxLength={50}
                                />
                            </Field>
                            <Field label="Address">
                                <input
                                    value={form.address}
                                    onChange={(event) => updateField("address", event.target.value)}
                                    className={INPUT_CLASS}
                                    maxLength={500}
                                />
                            </Field>
                        </div>

                        <SectionTitle title="Emergency contact" />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Name">
                                <input
                                    value={form.emergencyContactName}
                                    onChange={(event) => updateField("emergencyContactName", event.target.value)}
                                    className={INPUT_CLASS}
                                    maxLength={150}
                                />
                            </Field>
                            <Field label="Phone">
                                <input
                                    value={form.emergencyContactPhone}
                                    onChange={(event) => updateField("emergencyContactPhone", event.target.value)}
                                    className={INPUT_CLASS}
                                    maxLength={50}
                                />
                            </Field>
                            <Field label="Relationship">
                                <input
                                    value={form.emergencyContactRelationship}
                                    onChange={(event) => updateField("emergencyContactRelationship", event.target.value)}
                                    className={INPUT_CLASS}
                                    maxLength={100}
                                />
                            </Field>
                        </div>

                        <Field label="Bio">
                            <textarea
                                value={form.bio}
                                onChange={(event) => updateField("bio", event.target.value)}
                                className={`${INPUT_CLASS} h-28 resize-y py-3`}
                                maxLength={2000}
                            />
                        </Field>

                        <ModalActions
                            loading={isSaving}
                            onClose={closeCreate}
                            label="Create Employee"
                            disabled={!form.userId}
                        />
                    </form>
                </Modal>
            )}

            {deleteTarget && (
                <Modal title="Delete Employee Profile" onClose={() => !isSaving && setDeleteTarget(null)}>
                    <div className="space-y-4">
                        <ModalError
                            message={`This will delete the employee profile for ${getName(deleteTarget)}. The linked user account is not deleted by the backend.`}
                            tone="warning"
                        />
                        <ModalActions
                            loading={isSaving}
                            onClose={() => setDeleteTarget(null)}
                            label="Delete Profile"
                            danger
                            onSubmit={handleDelete}
                        />
                    </div>
                </Modal>
            )}
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex min-w-0 items-center gap-2">
            <Icon size={14} className="shrink-0 text-[var(--bms-text-muted)]" />
            <span className="shrink-0 text-[11px] text-[var(--bms-text-muted)]">{label}</span>
            <span className="min-w-0 truncate text-xs font-medium text-[var(--bms-text-secondary)]">{value}</span>
        </div>
    );
}

function MiniMetric({ label, value }) {
    return (
        <div className="min-w-0 text-center">
            <p className="text-sm font-semibold text-[var(--bms-text)]">{value}</p>
            <p className="truncate text-[10px] text-[var(--bms-text-muted)]">{label}</p>
        </div>
    );
}

function SectionTitle({ title, subtitle }) {
    return (
        <div>
            <h3 className="text-xs font-semibold text-[var(--bms-text)]">{title}</h3>
            {subtitle && <p className="mt-1 text-[11px] text-[var(--bms-text-muted)]">{subtitle}</p>}
        </div>
    );
}

function Field({ label, children }) {
    return (
        <label className="block min-w-0">
            <span className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">{label}</span>
            {children}
        </label>
    );
}

function Modal({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-2xl">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--bms-border)] px-4 py-3 sm:px-5 sm:py-4">
                    <h2 className="min-w-0 truncate text-sm font-semibold text-[var(--bms-text)]">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--bms-text-muted)] hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)]"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>
                <div className="max-h-[calc(92vh-60px)] overflow-y-auto p-4 sm:p-5">{children}</div>
            </div>
        </div>
    );
}

function ModalError({ message, tone = "error" }) {
    return (
        <div
            className={`rounded-lg border p-3 text-xs ${
                tone === "warning"
                    ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
                    : "border-red-500/20 bg-red-500/10 text-red-500"
            }`}
        >
            {message}
        </div>
    );
}

const INPUT_CLASS =
    "h-11 w-full min-w-0 rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-3 text-sm text-[var(--bms-text)] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

function ModalActions({
    loading,
    onClose,
    label,
    disabled = false,
    danger = false,
    onSubmit,
}) {
    return (
        <div className="flex flex-col-reverse gap-2 border-t border-[var(--bms-border)] pt-4 sm:flex-row sm:justify-end">
            <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="h-10 rounded-lg border border-[var(--bms-border)] px-4 text-sm text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface-soft)] disabled:opacity-50"
            >
                Cancel
            </button>
            <button
                type={onSubmit ? "button" : "submit"}
                onClick={onSubmit}
                disabled={loading || disabled}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-white disabled:opacity-50 ${
                    danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
                {loading && <RefreshCw size={15} className="animate-spin" />}
                {label}
            </button>
        </div>
    );
}

import {
    ArrowLeft,
    Award,
    BriefcaseBusiness,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    FileText,
    FolderOpen,
    Goal,
    Mail,
    MapPin,
    Phone,
    RefreshCw,
    ShieldCheck,
    Star,
    Target,
    UserRound,
    Users,
    X,
    Pencil,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getEmployee,
    getEmployees,
    updateEmployee,
} from "../../../api/employee.js";

const EMPLOYMENT_TYPES = [
    ["FULL_TIME", "Full time"],
    ["PART_TIME", "Part time"],
    ["CONTRACT", "Contract"],
    ["INTERN", "Intern"],
    ["TEMPORARY", "Temporary"],
];

const EMPLOYMENT_STATUS = [
    ["ACTIVE", "Active"],
    ["ON_LEAVE", "On leave"],
    ["SUSPENDED", "Suspended"],
    ["TERMINATED", "Terminated"],
    ["RESIGNED", "Resigned"],
];

const SKILL_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];

const STATUS_META = {
    ACTIVE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    ON_LEAVE: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    SUSPENDED: "bg-red-500/10 text-red-500 border-red-500/20",
    TERMINATED: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    RESIGNED: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const INPUT_CLASS =
    "h-11 w-full min-w-0 rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-3 text-sm text-[var(--bms-text)] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

function unwrap(value) {
    return value?.data ?? value;
}

function arrayFrom(value, keys = []) {
    const data = unwrap(value);
    if (Array.isArray(data)) return data;

    for (const key of keys) {
        if (Array.isArray(data?.[key])) return data[key];
    }

    return [];
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

function formatDate(value, includeTime = false) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return includeTime
        ? date.toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
          })
        : date.toLocaleDateString(undefined, {
              day: "2-digit",
              month: "short",
              year: "numeric",
          });
}

function labelize(value) {
    return String(value || "—")
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusClass(status) {
    return STATUS_META[status] || "bg-slate-500/10 text-slate-500 border-slate-500/20";
}

function dateInputValue(value) {
    return value ? String(value).slice(0, 10) : "";
}

function toIsoDate(value) {
    return value ? new Date(`${value}T00:00:00`).toISOString() : null;
}

function getSkillName(item) {
    return item?.skill?.name || item?.name || "Unnamed skill";
}

function getSkillDescription(item) {
    return item?.skill?.description || item?.description || "";
}

function getTeamName(item) {
    return item?.team?.name || item?.name || "Unnamed team";
}

function getTeamDescription(item) {
    return item?.team?.description || item?.description || "";
}

function getTeamMemberRole(item) {
    return item?.role || item?.teamMemberRole || "MEMBER";
}

function getReviewerName(item) {
    const reviewer = item?.reviewer;
    if (!reviewer) return "Unknown reviewer";

    const user = reviewer?.user || reviewer;
    return `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Unknown reviewer";
}

function getDocumentType(item) {
    return item?.type || "OTHER";
}

function getPerformanceRatingClass(rating) {
    switch (rating) {
        case "EXCEPTIONAL":
            return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
        case "EXCEEDS_EXPECTATIONS":
            return "bg-blue-500/10 text-blue-500 border-blue-500/20";
        case "MEETS_EXPECTATIONS":
            return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
        case "NEEDS_IMPROVEMENT":
            return "bg-amber-500/10 text-amber-500 border-amber-500/20";
        case "UNSATISFACTORY":
            return "bg-red-500/10 text-red-500 border-red-500/20";
        default:
            return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
}

function getGoalStatusClass(status) {
    switch (status) {
        case "COMPLETED":
            return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
        case "IN_PROGRESS":
            return "bg-blue-500/10 text-blue-500 border-blue-500/20";
        case "OVERDUE":
            return "bg-red-500/10 text-red-500 border-red-500/20";
        case "CANCELLED":
            return "bg-slate-500/10 text-slate-500 border-slate-500/20";
        default:
            return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    }
}

export default function EmployeeDetails() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [employee, setEmployee] = useState(null);
    const [managers, setManagers] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");
    const [editing, setEditing] = useState(false);

    const [form, setForm] = useState({
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
    });

    const loadEmployee = useCallback(
        async ({ refresh = false } = {}) => {
            if (!id) {
                setError("Employee ID is missing.");
                setIsLoading(false);
                return;
            }

            try {
                if (refresh) setIsRefreshing(true);
                else setIsLoading(true);

                setError("");

                const result = await getEmployee(id);
                const data = unwrap(result);

                setEmployee(data);
                setForm({
                    employeeNumber: data?.employeeNumber || "",
                    jobTitle: data?.jobTitle || "",
                    employmentType: data?.employmentType || "FULL_TIME",
                    employmentStatus: data?.employmentStatus || "ACTIVE",
                    hireDate: dateInputValue(data?.hireDate),
                    terminationDate: dateInputValue(data?.terminationDate),
                    workLocation: data?.workLocation || "",
                    phone: data?.phone || "",
                    address: data?.address || "",
                    emergencyContactName: data?.emergencyContactName || "",
                    emergencyContactPhone: data?.emergencyContactPhone || "",
                    emergencyContactRelationship:
                        data?.emergencyContactRelationship || "",
                    bio: data?.bio || "",
                    managerId: data?.managerId || "",
                });
            } catch (err) {
                console.error("Failed to load employee:", err);
                setError(err?.message || "Unable to load employee.");
            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        },
        [id]
    );

    const loadManagers = useCallback(async () => {
        try {
            const result = await getEmployees({
                page: 1,
                limit: 100,
                status: "ACTIVE",
            });

            const list = arrayFrom(result, ["employees"]);
            setManagers(list.filter((manager) => manager?.id !== id));
        } catch (err) {
            console.error("Failed to load managers:", err);
            setManagers([]);
        }
    }, [id]);

    useEffect(() => {
        loadEmployee();
        loadManagers();
    }, [loadEmployee, loadManagers]);

    const user = useMemo(() => getUser(employee), [employee]);

    /*
     * The Employee CRUD select currently returns _count values.
     * If your employee-detail service is extended to include the
     * relationship arrays, this page automatically renders them.
     */
    const skills = arrayFrom(employee, ["skills"]);
    const teamMemberships = arrayFrom(employee, [
        "teamMemberships",
        "teams",
    ]);
    const documents = arrayFrom(employee, ["documents"]);
    const performanceRecords = arrayFrom(employee, [
        "performanceRecords",
        "performance",
    ]);
    const goals = arrayFrom(employee, ["goals"]);

    const counts = {
        skills:
            Number(employee?._count?.skills) ||
            skills.length,
        teams:
            Number(employee?._count?.teamMemberships) ||
            teamMemberships.length,
        teamMembers:
            teamMemberships.length,
        documents:
            Number(employee?._count?.documents) ||
            documents.length,
        performance:
            Number(employee?._count?.performanceRecords) ||
            performanceRecords.length,
        goals:
            Number(employee?._count?.goals) ||
            goals.length,
    };

    const directReports = arrayFrom(employee, ["directReports"]);
    const manager = employee?.manager;

    function updateField(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
        if (formError) setFormError("");
    }

    function validateForm() {
        if (!form.employeeNumber.trim()) {
            return "Employee number is required.";
        }

        if (form.employeeNumber.trim().length < 2) {
            return "Employee number must be at least 2 characters.";
        }

        if (
            form.hireDate &&
            form.terminationDate &&
            form.terminationDate < form.hireDate
        ) {
            return "Termination date cannot be earlier than the hire date.";
        }

        if (
            form.employmentStatus === "TERMINATED" &&
            !form.terminationDate
        ) {
            return "A termination date is required for a terminated employee.";
        }

        if (
            form.employmentStatus !== "TERMINATED" &&
            form.terminationDate
        ) {
            return "Remove the termination date unless the employee is terminated.";
        }

        if (form.managerId === id) {
            return "An employee cannot be their own manager.";
        }

        return "";
    }

    async function handleSave(event) {
        event.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setFormError(validationError);
            return;
        }

        try {
            setIsSaving(true);
            setFormError("");
            setError("");

            await updateEmployee(id, {
                employeeNumber: form.employeeNumber.trim(),
                jobTitle: form.jobTitle.trim() || null,
                employmentType: form.employmentType,
                employmentStatus: form.employmentStatus,
                hireDate: toIsoDate(form.hireDate),
                terminationDate: toIsoDate(form.terminationDate),
                workLocation: form.workLocation.trim() || null,
                phone: form.phone.trim() || null,
                address: form.address.trim() || null,
                emergencyContactName:
                    form.emergencyContactName.trim() || null,
                emergencyContactPhone:
                    form.emergencyContactPhone.trim() || null,
                emergencyContactRelationship:
                    form.emergencyContactRelationship.trim() || null,
                bio: form.bio.trim() || null,
                managerId: form.managerId || null,
            });

            setEditing(false);
            await loadEmployee({ refresh: true });
        } catch (err) {
            setFormError(err?.message || "Unable to update employee.");
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return <EmployeeDetailsSkeleton />;
    }

    if (error && !employee) {
        return (
            <div className="space-y-5">
                <button
                    type="button"
                    onClick={() => navigate("/employees")}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface)] px-3 py-2 text-sm text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface-soft)]"
                >
                    <ArrowLeft size={16} />
                    Employees
                </button>

                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
                    {error}
                </div>
            </div>
        );
    }

    if (!employee) return null;

    return (
        <div className="min-w-0 space-y-5 sm:space-y-6">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                    type="button"
                    onClick={() => navigate("/employees")}
                    className="inline-flex w-fit items-center gap-2 rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface)] px-3 py-2 text-sm text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)]"
                >
                    <ArrowLeft size={16} />
                    Employees
                </button>

                <button
                    type="button"
                    onClick={() => loadEmployee({ refresh: true })}
                    disabled={isRefreshing}
                    className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface)] px-3 text-sm text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface-soft)] disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={isRefreshing ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
                    {error}
                </div>
            )}

            <section className="min-w-0 overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">
                <div className="h-24 bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-transparent sm:h-32" />

                <div className="min-w-0 px-4 pb-5 sm:px-6 sm:pb-6">
                    <div className="-mt-10 flex min-w-0 flex-col gap-4 sm:-mt-12 lg:flex-row lg:items-end lg:justify-between">
                        <div className="flex min-w-0 items-end gap-3 sm:gap-4">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-[var(--bms-surface)] bg-blue-500/10 text-xl font-bold text-blue-500 shadow-lg sm:h-24 sm:w-24">
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

                            <div className="min-w-0 pb-1">
                                <h1 className="truncate text-lg font-bold text-[var(--bms-text)] sm:text-2xl">
                                    {getName(employee)}
                                </h1>

                                <p className="mt-1 truncate text-sm text-[var(--bms-text-secondary)]">
                                    {employee?.jobTitle || "Employee"}
                                </p>

                                <p className="mt-0.5 flex min-w-0 items-center gap-1.5 truncate text-xs text-[var(--bms-text-muted)]">
                                    <Mail size={13} className="shrink-0" />
                                    {user?.email || "No email"}
                                </p>
                            </div>
                        </div>

                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                            <span
                                className={`inline-flex h-10 items-center justify-center rounded-full border px-3 text-xs font-semibold ${statusClass(
                                    employee.employmentStatus
                                )}`}
                            >
                                {labelize(employee.employmentStatus)}
                            </span>

                            <button
                                type="button"
                                onClick={() => {
                                    setFormError("");
                                    setEditing(true);
                                }}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                <Pencil size={16} />
                                Edit Employee
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* RELATIONSHIP OVERVIEW */}
            <section className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <OverviewMetric icon={Award} label="Skills" value={counts.skills} />
                <OverviewMetric icon={Users} label="Teams" value={counts.teams} />
                <OverviewMetric icon={UserRound} label="Team Memberships" value={counts.teamMembers} />
                <OverviewMetric icon={FileText} label="Documents" value={counts.documents} />
                <OverviewMetric icon={Star} label="Performance" value={counts.performance} />
                <OverviewMetric icon={Target} label="Goals" value={counts.goals} />
            </section>

            <div className="grid min-w-0 gap-5 xl:grid-cols-3">
                <section className="min-w-0 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4 sm:p-5 xl:col-span-2">
                    <SectionHeader
                        icon={BriefcaseBusiness}
                        title="Employment Information"
                        subtitle="Core employee profile and employment details."
                    />

                    <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2">
                        <Info label="Employee number" value={employee.employeeNumber} />
                        <Info label="Job title" value={employee.jobTitle} />
                        <Info label="Employment type" value={labelize(employee.employmentType)} />
                        <Info label="Employment status" value={labelize(employee.employmentStatus)} />
                        <Info label="Hire date" value={formatDate(employee.hireDate)} />
                        <Info label="Termination date" value={formatDate(employee.terminationDate)} />
                        <Info label="Work location" value={employee.workLocation} />
                        <Info
                            label="Manager"
                            value={
                                manager
                                    ? `${manager.user?.firstName || ""} ${manager.user?.lastName || ""}`.trim()
                                    : "No manager"
                            }
                        />
                    </div>
                </section>

                <section className="min-w-0 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4 sm:p-5">
                    <SectionHeader
                        icon={ShieldCheck}
                        title="Reporting"
                        subtitle="Manager and direct-report structure."
                    />

                    <div className="mt-5">
                        <Info
                            label="Manager"
                            value={
                                manager
                                    ? `${manager.user?.firstName || ""} ${manager.user?.lastName || ""}`.trim()
                                    : "No manager assigned"
                            }
                        />

                        <div className="mt-5 border-t border-[var(--bms-border)] pt-4">
                            <p className="text-[11px] text-[var(--bms-text-muted)]">
                                Direct reports
                            </p>

                            {directReports.length > 0 ? (
                                <div className="mt-3 space-y-2">
                                    {directReports.slice(0, 5).map((report) => (
                                        <div
                                            key={report.id}
                                            className="flex min-w-0 items-center gap-2 rounded-lg bg-[var(--bms-surface-soft)] p-2.5"
                                        >
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-semibold text-blue-500">
                                                {getInitials(report)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-medium text-[var(--bms-text)]">
                                                    {getName(report)}
                                                </p>
                                                <p className="truncate text-[10px] text-[var(--bms-text-muted)]">
                                                    {report.jobTitle || "Employee"}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-2 text-xs text-[var(--bms-text-muted)]">
                                    No direct reports returned.
                                </p>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            {/* SKILLS */}
            <RelationshipSection
                icon={Award}
                title="Skills"
                subtitle="Professional skills, proficiency and experience."
                count={counts.skills}
                empty="No employee skills have been returned."
            >
                {skills.length > 0 ? (
                    <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {skills.map((item) => (
                            <article
                                key={item.id || item.skillId || getSkillName(item)}
                                className="min-w-0 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-4"
                            >
                                <div className="flex min-w-0 items-start justify-between gap-2">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                                            <Award size={16} />
                                        </div>
                                        <h3 className="truncate text-sm font-semibold text-[var(--bms-text)]">
                                            {getSkillName(item)}
                                        </h3>
                                    </div>

                                    {item.level && (
                                        <span className="shrink-0 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-[10px] font-semibold text-blue-500">
                                            {labelize(item.level)}
                                        </span>
                                    )}
                                </div>

                                {getSkillDescription(item) && (
                                    <p className="mt-3 line-clamp-3 text-xs leading-5 text-[var(--bms-text-muted)]">
                                        {getSkillDescription(item)}
                                    </p>
                                )}

                                {item.yearsOfExperience != null && (
                                    <p className="mt-3 text-xs text-[var(--bms-text-secondary)]">
                                        <span className="font-semibold text-[var(--bms-text)]">
                                            {item.yearsOfExperience}
                                        </span>{" "}
                                        years experience
                                    </p>
                                )}
                            </article>
                        ))}
                    </div>
                ) : (
                    <RelationshipEmpty text="Skills will appear here when the employee relationship data is included in the employee detail response." />
                )}
            </RelationshipSection>

            {/* TEAMS + TEAM MEMBERS */}
            <div className="grid min-w-0 gap-5 lg:grid-cols-2">
                <RelationshipSection
                    icon={Users}
                    title="Teams"
                    subtitle="Teams this employee belongs to."
                    count={counts.teams}
                    empty="No teams have been returned."
                >
                    {teamMemberships.length > 0 ? (
                        <div className="space-y-3">
                            {teamMemberships.map((item) => (
                                <div
                                    key={item.id || item.teamId || getTeamName(item)}
                                    className="flex min-w-0 items-start gap-3 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-4"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                                        <Users size={18} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                                            <h3 className="truncate text-sm font-semibold text-[var(--bms-text)]">
                                                {getTeamName(item)}
                                            </h3>

                                            <span
                                                className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${
                                                    getTeamMemberRole(item) === "LEAD"
                                                        ? "border-blue-500/20 bg-blue-500/10 text-blue-500"
                                                        : "border-[var(--bms-border)] bg-[var(--bms-surface)] text-[var(--bms-text-muted)]"
                                                }`}
                                            >
                                                {labelize(getTeamMemberRole(item))}
                                            </span>

                                            {item.isActive === false && (
                                                <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-1 text-[10px] font-semibold text-red-500">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>

                                        {getTeamDescription(item) && (
                                            <p className="mt-1 line-clamp-2 text-xs text-[var(--bms-text-muted)]">
                                                {getTeamDescription(item)}
                                            </p>
                                        )}

                                        {item.joinedAt && (
                                            <p className="mt-2 text-[11px] text-[var(--bms-text-muted)]">
                                                Joined {formatDate(item.joinedAt)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <RelationshipEmpty text="Teams will appear here when team membership data is included in the employee detail response." />
                    )}
                </RelationshipSection>

                <RelationshipSection
                    icon={Users}
                    title="Team Memberships"
                    subtitle="Employee-level membership records, roles and membership state."
                    count={counts.teamMembers}
                    empty="No team membership records have been returned."
                >
                    {teamMemberships.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[520px] text-left">
                                <thead>
                                    <tr className="border-b border-[var(--bms-border)]">
                                        <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                                            Team
                                        </th>
                                        <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                                            Role
                                        </th>
                                        <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                                            Joined
                                        </th>
                                        <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {teamMemberships.map((item) => (
                                        <tr
                                            key={item.id || `${item.teamId}-${item.employeeId}`}
                                            className="border-b border-[var(--bms-border)]/70 last:border-0"
                                        >
                                            <td className="px-3 py-3 text-xs font-medium text-[var(--bms-text)]">
                                                {getTeamName(item)}
                                            </td>
                                            <td className="px-3 py-3 text-xs text-[var(--bms-text-secondary)]">
                                                {labelize(getTeamMemberRole(item))}
                                            </td>
                                            <td className="px-3 py-3 text-xs text-[var(--bms-text-muted)]">
                                                {formatDate(item.joinedAt)}
                                            </td>
                                            <td className="px-3 py-3">
                                                <span
                                                    className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${
                                                        item.isActive === false
                                                            ? "border-red-500/20 bg-red-500/10 text-red-500"
                                                            : "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                                                    }`}
                                                >
                                                    {item.isActive === false ? "Inactive" : "Active"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <RelationshipEmpty text="Team member records will appear here when returned by the employee API." />
                    )}
                </RelationshipSection>
            </div>

            {/* DOCUMENTS */}
            <RelationshipSection
                icon={FileText}
                title="Documents"
                subtitle="Employee-related files such as contracts, IDs, certificates, CVs and performance reviews."
                count={counts.documents}
                empty="No employee documents have been returned."
            >
                {documents.length > 0 ? (
                    <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {documents.map((document) => (
                            <article
                                key={document.id || document.fileUrl || document.name}
                                className="min-w-0 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-4"
                            >
                                <div className="flex min-w-0 items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                                        <FileText size={18} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-sm font-semibold text-[var(--bms-text)]">
                                            {document.name || document.fileName || "Employee document"}
                                        </h3>

                                        <p className="mt-1 truncate text-[11px] text-[var(--bms-text-muted)]">
                                            {labelize(getDocumentType(document))}
                                        </p>
                                    </div>
                                </div>

                                {document.description && (
                                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-[var(--bms-text-muted)]">
                                        {document.description}
                                    </p>
                                )}

                                <div className="mt-4 flex items-center justify-between gap-3 text-[11px] text-[var(--bms-text-muted)]">
                                    <span>
                                        {document.fileSize
                                            ? formatBytes(document.fileSize)
                                            : document.mimeType || "File"}
                                    </span>

                                    {document.fileUrl && (
                                        <a
                                            href={document.fileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex shrink-0 items-center gap-1 font-medium text-blue-500 hover:text-blue-600"
                                        >
                                            <FolderOpen size={13} />
                                            Open
                                        </a>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <RelationshipEmpty text="Documents will appear here when employee document records are returned by the backend." />
                )}
            </RelationshipSection>

            {/* PERFORMANCE */}
            <RelationshipSection
                icon={Star}
                title="Performance"
                subtitle="Performance reviews, ratings, summaries, strengths and development recommendations."
                count={counts.performance}
                empty="No performance records have been returned."
            >
                {performanceRecords.length > 0 ? (
                    <div className="space-y-3">
                        {performanceRecords.map((record) => (
                            <article
                                key={record.id || record.reviewDate}
                                className="min-w-0 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-4 sm:p-5"
                            >
                                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                                            <span
                                                className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${getPerformanceRatingClass(
                                                    record.rating
                                                )}`}
                                            >
                                                {labelize(record.rating)}
                                            </span>

                                            {record.reviewDate && (
                                                <span className="inline-flex items-center gap-1 text-[11px] text-[var(--bms-text-muted)]">
                                                    <CalendarDays size={12} />
                                                    {formatDate(record.reviewDate)}
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-2 text-xs text-[var(--bms-text-muted)]">
                                            Reviewer:{" "}
                                            <span className="font-medium text-[var(--bms-text-secondary)]">
                                                {getReviewerName(record)}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-3">
                                    <TextBlock title="Summary" value={record.summary} />
                                    <TextBlock title="Strengths" value={record.strengths} />
                                    <TextBlock
                                        title="Areas for improvement"
                                        value={record.areasForImprovement}
                                    />
                                </div>

                                {record.recommendations && (
                                    <div className="mt-4 rounded-lg border border-blue-500/10 bg-blue-500/[0.04] p-3">
                                        <p className="text-[11px] font-semibold text-blue-500">
                                            Recommendations
                                        </p>
                                        <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-[var(--bms-text-secondary)]">
                                            {record.recommendations}
                                        </p>
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                ) : (
                    <RelationshipEmpty text="Performance records will appear here when returned by the employee API." />
                )}
            </RelationshipSection>

            {/* GOALS */}
            <RelationshipSection
                icon={Target}
                title="Goals"
                subtitle="Employee objectives, progress state and target dates."
                count={counts.goals}
                empty="No employee goals have been returned."
            >
                {goals.length > 0 ? (
                    <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                        {goals.map((goal) => (
                            <article
                                key={goal.id || goal.title}
                                className="min-w-0 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-4 sm:p-5"
                            >
                                <div className="flex min-w-0 items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                                            <Target size={18} />
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className="break-words text-sm font-semibold text-[var(--bms-text)]">
                                                {goal.title || "Employee goal"}
                                            </h3>

                                            {goal.targetDate && (
                                                <p className="mt-1 flex items-center gap-1 text-[11px] text-[var(--bms-text-muted)]">
                                                    <CalendarDays size={12} />
                                                    Target {formatDate(goal.targetDate)}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {goal.status && (
                                        <span
                                            className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold ${getGoalStatusClass(
                                                goal.status
                                            )}`}
                                        >
                                            {labelize(goal.status)}
                                        </span>
                                    )}
                                </div>

                                {goal.description && (
                                    <p className="mt-4 whitespace-pre-wrap text-xs leading-5 text-[var(--bms-text-secondary)]">
                                        {goal.description}
                                    </p>
                                )}

                                {goal.completedAt && (
                                    <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-emerald-500">
                                        <CheckCircle2 size={13} />
                                        Completed {formatDate(goal.completedAt)}
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                ) : (
                    <RelationshipEmpty text="Goals will appear here when employee goal records are returned by the backend." />
                )}
            </RelationshipSection>

            {/* CONTACT */}
            <div className="grid min-w-0 gap-5 lg:grid-cols-2">
                <section className="min-w-0 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4 sm:p-5">
                    <SectionHeader
                        icon={Phone}
                        title="Contact Information"
                        subtitle="Contact details stored on the employee profile."
                    />

                    <div className="mt-5 space-y-4">
                        <Info label="Email" value={user?.email} />
                        <Info label="Phone" value={employee.phone} />
                        <Info label="Address" value={employee.address} />
                        <Info label="Work location" value={employee.workLocation} />
                    </div>
                </section>

                <section className="min-w-0 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4 sm:p-5">
                    <SectionHeader
                        icon={UserRound}
                        title="Emergency Contact"
                        subtitle="Emergency contact information."
                    />

                    <div className="mt-5 space-y-4">
                        <Info label="Name" value={employee.emergencyContactName} />
                        <Info label="Phone" value={employee.emergencyContactPhone} />
                        <Info
                            label="Relationship"
                            value={employee.emergencyContactRelationship}
                        />
                    </div>
                </section>
            </div>

            <section className="min-w-0 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4 sm:p-5">
                <SectionHeader
                    icon={UserRound}
                    title="Biography"
                    subtitle="Employee biography and profile notes."
                />

                <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--bms-text-secondary)]">
                    {employee.bio || "No biography has been added for this employee."}
                </p>
            </section>

            <section className="min-w-0 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4 sm:p-5">
                <SectionHeader
                    icon={CalendarDays}
                    title="Record Metadata"
                    subtitle="System timestamps for this employee profile."
                />

                <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2">
                    <Info label="Created" value={formatDate(employee.createdAt, true)} />
                    <Info label="Last updated" value={formatDate(employee.updatedAt, true)} />
                </div>
            </section>

            {editing && (
                <Modal title="Edit Employee" onClose={() => !isSaving && setEditing(false)}>
                    <form onSubmit={handleSave} className="space-y-5">
                        {formError && (
                            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500">
                                {formError}
                            </div>
                        )}

                        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                            <Field label="Employee number">
                                <input
                                    value={form.employeeNumber}
                                    onChange={(event) =>
                                        updateField("employeeNumber", event.target.value)
                                    }
                                    className={INPUT_CLASS}
                                    maxLength={50}
                                    required
                                />
                            </Field>

                            <Field label="Job title">
                                <input
                                    value={form.jobTitle}
                                    onChange={(event) =>
                                        updateField("jobTitle", event.target.value)
                                    }
                                    className={INPUT_CLASS}
                                    maxLength={150}
                                />
                            </Field>

                            <Field label="Employment type">
                                <select
                                    value={form.employmentType}
                                    onChange={(event) =>
                                        updateField("employmentType", event.target.value)
                                    }
                                    className={INPUT_CLASS}
                                >
                                    {EMPLOYMENT_TYPES.map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Employment status">
                                <select
                                    value={form.employmentStatus}
                                    onChange={(event) =>
                                        updateField("employmentStatus", event.target.value)
                                    }
                                    className={INPUT_CLASS}
                                >
                                    {EMPLOYMENT_STATUS.map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Hire date">
                                <input
                                    type="date"
                                    value={form.hireDate}
                                    onChange={(event) =>
                                        updateField("hireDate", event.target.value)
                                    }
                                    className={INPUT_CLASS}
                                />
                            </Field>

                            <Field label="Termination date">
                                <input
                                    type="date"
                                    value={form.terminationDate}
                                    onChange={(event) =>
                                        updateField("terminationDate", event.target.value)
                                    }
                                    className={INPUT_CLASS}
                                />
                            </Field>

                            <Field label="Work location">
                                <input
                                    value={form.workLocation}
                                    onChange={(event) =>
                                        updateField("workLocation", event.target.value)
                                    }
                                    className={INPUT_CLASS}
                                    maxLength={150}
                                />
                            </Field>

                            <Field label="Manager">
                                <select
                                    value={form.managerId}
                                    onChange={(event) =>
                                        updateField("managerId", event.target.value)
                                    }
                                    className={INPUT_CLASS}
                                >
                                    <option value="">No manager</option>
                                    {managers.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {getName(item)} — {item.employeeNumber}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Phone">
                                <input
                                    value={form.phone}
                                    onChange={(event) =>
                                        updateField("phone", event.target.value)
                                    }
                                    className={INPUT_CLASS}
                                    maxLength={50}
                                />
                            </Field>

                            <Field label="Address">
                                <input
                                    value={form.address}
                                    onChange={(event) =>
                                        updateField("address", event.target.value)
                                    }
                                    className={INPUT_CLASS}
                                    maxLength={500}
                                />
                            </Field>
                        </div>

                        <div className="grid min-w-0 gap-4 sm:grid-cols-3">
                            <Field label="Emergency contact name">
                                <input
                                    value={form.emergencyContactName}
                                    onChange={(event) =>
                                        updateField(
                                            "emergencyContactName",
                                            event.target.value
                                        )
                                    }
                                    className={INPUT_CLASS}
                                    maxLength={150}
                                />
                            </Field>

                            <Field label="Emergency contact phone">
                                <input
                                    value={form.emergencyContactPhone}
                                    onChange={(event) =>
                                        updateField(
                                            "emergencyContactPhone",
                                            event.target.value
                                        )
                                    }
                                    className={INPUT_CLASS}
                                    maxLength={50}
                                />
                            </Field>

                            <Field label="Relationship">
                                <input
                                    value={form.emergencyContactRelationship}
                                    onChange={(event) =>
                                        updateField(
                                            "emergencyContactRelationship",
                                            event.target.value
                                        )
                                    }
                                    className={INPUT_CLASS}
                                    maxLength={100}
                                />
                            </Field>
                        </div>

                        <Field label="Bio">
                            <textarea
                                value={form.bio}
                                onChange={(event) =>
                                    updateField("bio", event.target.value)
                                }
                                className={`${INPUT_CLASS} h-32 resize-y py-3`}
                                maxLength={2000}
                            />
                        </Field>

                        <div className="flex flex-col-reverse gap-2 border-t border-[var(--bms-border)] pt-4 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setEditing(false)}
                                disabled={isSaving}
                                className="h-10 rounded-lg border border-[var(--bms-border)] px-4 text-sm text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface-soft)] disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isSaving && (
                                    <RefreshCw size={15} className="animate-spin" />
                                )}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

function OverviewMetric({ icon: Icon, label, value }) {
    return (
        <div className="min-w-0 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-[11px] text-[var(--bms-text-muted)]">
                        {label}
                    </p>
                    <p className="mt-1 text-xl font-bold text-[var(--bms-text)]">
                        {value}
                    </p>
                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                    <Icon size={17} />
                </div>
            </div>
        </div>
    );
}

function RelationshipSection({
    icon: Icon,
    title,
    subtitle,
    count,
    children,
    empty,
}) {
    return (
        <section className="min-w-0 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4 sm:p-5">
            <div className="flex min-w-0 items-start justify-between gap-3">
                <SectionHeader icon={Icon} title={title} subtitle={subtitle} />

                <span className="shrink-0 rounded-full border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--bms-text-secondary)]">
                    {count}
                </span>
            </div>

            <div className="mt-5">
                {children || <RelationshipEmpty text={empty} />}
            </div>
        </section>
    );
}

function RelationshipEmpty({ text }) {
    return (
        <div className="rounded-xl border border-dashed border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-4 py-8 text-center">
            <FolderOpen
                size={24}
                className="mx-auto text-[var(--bms-text-muted)]"
            />
            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[var(--bms-text-muted)]">
                {text}
            </p>
        </div>
    );
}

function TextBlock({ title, value }) {
    return (
        <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[var(--bms-text-muted)]">
                {title}
            </p>
            <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-[var(--bms-text-secondary)]">
                {value || "—"}
            </p>
        </div>
    );
}

function SectionHeader({ icon: Icon, title, subtitle }) {
    return (
        <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                <Icon size={18} />
            </div>

            <div className="min-w-0">
                <h2 className="text-sm font-semibold text-[var(--bms-text)]">
                    {title}
                </h2>

                <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                    {subtitle}
                </p>
            </div>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div className="min-w-0">
            <p className="text-[11px] text-[var(--bms-text-muted)]">{label}</p>
            <p className="mt-1 break-words text-sm font-medium text-[var(--bms-text)]">
                {value || "—"}
            </p>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <label className="block min-w-0">
            <span className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">
                {label}
            </span>
            {children}
        </label>
    );
}

function Modal({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-2xl">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--bms-border)] px-4 py-3 sm:px-5 sm:py-4">
                    <h2 className="min-w-0 truncate text-sm font-semibold text-[var(--bms-text)]">
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--bms-text-muted)] hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)]"
                        aria-label="Close"
                    >
                        <X size={17} />
                    </button>
                </div>

                <div className="max-h-[calc(92vh-60px)] overflow-y-auto p-4 sm:p-5">
                    {children}
                </div>
            </div>
        </div>
    );
}

function EmployeeDetailsSkeleton() {
    return (
        <div className="min-w-0 space-y-5 sm:space-y-6">
            <div className="h-10 w-32 animate-pulse rounded-lg bg-[var(--bms-surface-soft)]" />

            <div className="h-52 animate-pulse rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)]" />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-24 animate-pulse rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]"
                    />
                ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-48 animate-pulse rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]"
                    />
                ))}
            </div>
        </div>
    );
}

function formatBytes(bytes) {
    const value = Number(bytes);
    if (!Number.isFinite(value) || value <= 0) return "File";

    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(
        Math.floor(Math.log(value) / Math.log(1024)),
        units.length - 1
    );

    return `${(value / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}

import {
  ArrowLeft,
  Award,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Mail,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  addEmployeeSkill,
  getSkillById,
  removeEmployeeSkill,
  updateEmployeeSkill,
} from "../api/skills.js";

import {
  getEmployees,
} from "../api/employee.js";

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
  selectClass,
} from "../components/employeeManagement/ManagementUI.jsx";


/* =========================================================
   CONSTANTS
   ========================================================= */

const levels = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
];


/* =========================================================
   HELPERS
   ========================================================= */

function formatLabel(value = "") {
  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}


function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

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
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}


function getEmployeeName(
  employee
) {
  if (!employee) {
    return "Unknown employee";
  }

  return nameOf(
    employee,
    "Unknown employee"
  );
}


function getInitials(
  employee
) {
  const user =
    employee?.user ||
    employee;

  const first =
    user?.firstName?.charAt(
      0
    ) || "";

  const last =
    user?.lastName?.charAt(
      0
    ) || "";

  return (
    `${first}${last}`.toUpperCase() ||
    "E"
  );
}


function getLevelClasses(
  level
) {
  switch (level) {
    case "EXPERT":
      return "border-purple-500/20 bg-purple-500/10 text-purple-400";

    case "ADVANCED":
      return "border-blue-500/20 bg-blue-500/10 text-blue-400";

    case "INTERMEDIATE":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";

    case "BEGINNER":
      return "border-amber-500/20 bg-amber-500/10 text-amber-400";

    default:
      return "border-slate-500/20 bg-slate-500/10 text-slate-400";
  }
}


function getYearsValue(
  assignment
) {
  const value =
    assignment?.yearsOfExperience;

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : 0;
}


function getYearsLabel(
  value
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Not specified";
  }

  const number =
    Number(value);

  if (
    !Number.isFinite(
      number
    )
  ) {
    return "Not specified";
  }

  if (number === 1) {
    return "1 year";
  }

  return `${number} years`;
}


/* =========================================================
   EMPLOYEE CARD
   ========================================================= */

function EmployeeSkillCard({
  assignment,
  onEdit,
}) {
  const employee =
    assignment?.employee;

  const user =
    employee?.user ||
    employee;

  const employeeName =
    getEmployeeName(
      employee
    );

  return (
    <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">

      {/* Header */}
      <div className="flex items-start gap-3">

        {/* Avatar */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-500/10 font-semibold text-blue-500">

          {user?.avatarUrl ? (
            <img
              src={
                user.avatarUrl
              }
              alt={employeeName}
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(
              employee
            )
          )}

        </div>


        {/* Employee name */}
        <div className="min-w-0 flex-1">

          <h3 className="truncate font-semibold text-[var(--bms-text)]">
            {employeeName}
          </h3>

          {employee?.employeeNumber && (
            <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
              Employee No:{" "}
              {
                employee.employeeNumber
              }
            </p>
          )}

        </div>


        {/* Edit */}
        <button
          type="button"
          onClick={() =>
            onEdit(
              assignment
            )
          }
          className="rounded-lg p-2 text-[var(--bms-text-muted)] transition hover:bg-[var(--bms-surface-soft)] hover:text-blue-500"
          title="Edit skill assignment"
        >
          <Pencil size={16} />
        </button>

      </div>


      {/* Information */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">

        {/* Job title */}
        <div className="rounded-lg bg-[var(--bms-surface-soft)] p-3">

          <div className="flex items-center gap-2">
            <BriefcaseBusiness
              size={14}
              className="text-blue-500"
            />

            <span className="text-[10px] text-[var(--bms-text-muted)]">
              Job title
            </span>
          </div>

          <p className="mt-1 text-xs font-medium text-[var(--bms-text)]">
            {employee?.jobTitle ||
              "Not specified"}
          </p>

        </div>


        {/* Email */}
        <div className="rounded-lg bg-[var(--bms-surface-soft)] p-3">

          <div className="flex items-center gap-2">
            <Mail
              size={14}
              className="text-blue-500"
            />

            <span className="text-[10px] text-[var(--bms-text-muted)]">
              Email
            </span>
          </div>

          <p className="mt-1 truncate text-xs font-medium text-[var(--bms-text)]">
            {user?.email ||
              "Not specified"}
          </p>

        </div>


        {/* Status */}
        <div className="rounded-lg bg-[var(--bms-surface-soft)] p-3">

          <div className="flex items-center gap-2">
            <User
              size={14}
              className="text-blue-500"
            />

            <span className="text-[10px] text-[var(--bms-text-muted)]">
              Employee status
            </span>
          </div>

          <p className="mt-1 text-xs font-medium text-[var(--bms-text)]">
            {formatLabel(
              employee?.employmentStatus ||
                user?.status ||
                "UNKNOWN"
            )}
          </p>

        </div>


        {/* Level */}
        <div className="rounded-lg bg-[var(--bms-surface-soft)] p-3">

          <div className="flex items-center gap-2">
            <Award
              size={14}
              className="text-blue-500"
            />

            <span className="text-[10px] text-[var(--bms-text-muted)]">
              Skill level
            </span>
          </div>

          <span
            className={`mt-1 inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold ${getLevelClasses(
              assignment?.level
            )}`}
          >
            {formatLabel(
              assignment?.level ||
                "NOT_SPECIFIED"
            )}
          </span>

        </div>


        {/* Experience */}
        <div className="rounded-lg bg-[var(--bms-surface-soft)] p-3">

          <div className="flex items-center gap-2">
            <TrendingUp
              size={14}
              className="text-blue-500"
            />

            <span className="text-[10px] text-[var(--bms-text-muted)]">
              Experience
            </span>
          </div>

          <p className="mt-1 text-xs font-medium text-[var(--bms-text)]">
            {getYearsLabel(
              assignment?.yearsOfExperience
            )}
          </p>

        </div>


        {/* Assigned date */}
        <div className="rounded-lg bg-[var(--bms-surface-soft)] p-3">

          <div className="flex items-center gap-2">
            <CalendarDays
              size={14}
              className="text-blue-500"
            />

            <span className="text-[10px] text-[var(--bms-text-muted)]">
              Assigned
            </span>
          </div>

          <p className="mt-1 text-xs font-medium text-[var(--bms-text)]">
            {formatDate(
              assignment?.createdAt
            )}
          </p>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   MAIN PAGE
   ========================================================= */

export default function SkillsDetails() {
  const navigate =
    useNavigate();

  const { id } =
    useParams();


  /* -------------------------------------------------------
     Skill
     ------------------------------------------------------- */

  const [skill, setSkill] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");


  /* -------------------------------------------------------
     Employees
     ------------------------------------------------------- */

  const [employees, setEmployees] =
    useState([]);


  /* -------------------------------------------------------
     Edit assignment
     ------------------------------------------------------- */

  const [editAssignment, setEditAssignment] =
    useState(null);

  const [editLevel, setEditLevel] =
    useState("INTERMEDIATE");

  const [editYears, setEditYears] =
    useState("");

  const [saving, setSaving] =
    useState(false);


  /* -------------------------------------------------------
     Manage employees dialog
     ------------------------------------------------------- */

  const [manageOpen, setManageOpen] =
    useState(false);

  const [assignEmployeeId, setAssignEmployeeId] =
    useState("");

  const [assignLevel, setAssignLevel] =
    useState("INTERMEDIATE");

  const [assignYears, setAssignYears] =
    useState("");

  const [assigning, setAssigning] =
    useState(false);


  /* -------------------------------------------------------
     Remove confirmation
     ------------------------------------------------------- */

  const [removeTarget, setRemoveTarget] =
    useState(null);

  const [removing, setRemoving] =
    useState(false);


  /* =========================================================
     LOAD SKILL
     ========================================================= */

  async function loadSkill(
    refresh = false
  ) {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response =
        await getSkillById(id);

      const data =
        response?.data ||
        response;

      setSkill(data);
    } catch (loadError) {
      setError(
        getError(
          loadError,
          "Unable to load skill details."
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }


  /* =========================================================
     LOAD EMPLOYEES
     ========================================================= */

  async function loadEmployees() {
    try {
      const response =
        await getEmployees({
          page: 1,
          limit: 100,
        });

      setEmployees(
        arrayData(
          response,
          ["employees"]
        )
      );
    } catch (employeeError) {
      setError(
        getError(
          employeeError,
          "Unable to load employees."
        )
      );
    }
  }


  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  useEffect(() => {
    if (!id) {
      setError(
        "Skill ID is missing."
      );

      setLoading(false);

      return;
    }

    async function initialize() {
      await Promise.all([
        loadSkill(),
        loadEmployees(),
      ]);
    }

    initialize();
  }, [id]);


  /* =========================================================
     ASSIGNMENTS
     ========================================================= */

  const assignments =
    useMemo(() => {
      if (!skill) {
        return [];
      }

      if (
        Array.isArray(
          skill.employees
        )
      ) {
        return skill.employees;
      }

      if (
        Array.isArray(
          skill.employeeSkills
        )
      ) {
        return skill.employeeSkills;
      }

      return [];
    }, [skill]);


  /* =========================================================
     AVAILABLE EMPLOYEES
     ========================================================= */

  const availableEmployees =
    useMemo(() => {
      const assignedIds =
        new Set(
          assignments
            .map(
              (assignment) =>
                assignment?.employeeId ||
                assignment?.employee?.id
            )
            .filter(Boolean)
        );

      return employees.filter(
        (employee) =>
          !assignedIds.has(
            employee.id
          )
      );
    }, [
      employees,
      assignments,
    ]);


  /* =========================================================
     STATISTICS
     ========================================================= */

  const statistics =
    useMemo(() => {
      const levelCounts = {
        BEGINNER: 0,
        INTERMEDIATE: 0,
        ADVANCED: 0,
        EXPERT: 0,
      };

      let totalExperience =
        0;

      assignments.forEach(
        (assignment) => {
          const level =
            assignment?.level;

          if (
            Object.prototype.hasOwnProperty.call(
              levelCounts,
              level
            )
          ) {
            levelCounts[level] += 1;
          }

          totalExperience +=
            getYearsValue(
              assignment
            );
        }
      );

      const total =
        assignments.length;

      const averageExperience =
        total > 0
          ? totalExperience /
            total
          : 0;

      return {
        total,
        levelCounts,
        totalExperience,
        averageExperience,
      };
    }, [assignments]);


  /* =========================================================
     OPEN MANAGE DIALOG
     ========================================================= */

  async function openManageDialog() {
    setError("");

    /*
     * Refresh employees before opening the dialog so
     * the employee selector contains the latest data.
     */
    await loadEmployees();

    setAssignEmployeeId("");
    setAssignLevel(
      "INTERMEDIATE"
    );
    setAssignYears("");

    setManageOpen(true);
  }


  /* =========================================================
     CLOSE MANAGE DIALOG
     ========================================================= */

  function closeManageDialog() {
    if (assigning) {
      return;
    }

    setManageOpen(false);

    setAssignEmployeeId("");
    setAssignLevel(
      "INTERMEDIATE"
    );
    setAssignYears("");
  }


  /* =========================================================
     ASSIGN EMPLOYEE
     ========================================================= */

  async function assignEmployee() {
    if (!skill?.id) {
      return;
    }

    if (!assignEmployeeId) {
      setError(
        "Please select an employee."
      );

      return;
    }

    try {
      setAssigning(true);
      setError("");

      await addEmployeeSkill(
        assignEmployeeId,
        {
          skillId: skill.id,
          level: assignLevel,
          yearsOfExperience:
            assignYears === ""
              ? null
              : Number(
                  assignYears
                ),
        }
      );

      /*
       * Refresh the skill so the newly
       * assigned employee immediately
       * appears in both the dialog and
       * the employee cards.
       */
      await loadSkill(true);

      setAssignEmployeeId("");
      setAssignLevel(
        "INTERMEDIATE"
      );
      setAssignYears("");
    } catch (assignError) {
      setError(
        getError(
          assignError,
          "Unable to assign employee to this skill."
        )
      );
    } finally {
      setAssigning(false);
    }
  }


  /* =========================================================
     OPEN EDIT ASSIGNMENT
     ========================================================= */

  function openEditAssignment(
    assignment
  ) {
    setEditAssignment(
      assignment
    );

    setEditLevel(
      assignment?.level ||
        "INTERMEDIATE"
    );

    setEditYears(
      assignment?.yearsOfExperience ??
        ""
    );
  }


  /* =========================================================
     CLOSE EDIT ASSIGNMENT
     ========================================================= */

  function closeEditAssignment() {
    if (saving) {
      return;
    }

    setEditAssignment(null);
  }


  /* =========================================================
     SAVE ASSIGNMENT
     ========================================================= */

  async function saveAssignment() {
    if (
      !editAssignment?.id
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateEmployeeSkill(
        editAssignment.id,
        {
          level: editLevel,
          yearsOfExperience:
            editYears === ""
              ? null
              : Number(
                  editYears
                ),
        }
      );

      setEditAssignment(null);

      await loadSkill(true);
    } catch (saveError) {
      setError(
        getError(
          saveError,
          "Unable to update employee skill."
        )
      );
    } finally {
      setSaving(false);
    }
  }


  /* =========================================================
     OPEN REMOVE CONFIRMATION
     ========================================================= */

  function openRemoveDialog(
    assignment
  ) {
    setRemoveTarget(
      assignment
    );
  }


  /* =========================================================
     CLOSE REMOVE CONFIRMATION
     ========================================================= */

  function closeRemoveDialog() {
    if (removing) {
      return;
    }

    setRemoveTarget(null);
  }


  /* =========================================================
     REMOVE EMPLOYEE
     ========================================================= */

  async function confirmRemove() {
    if (
      !removeTarget?.id
    ) {
      return;
    }

    try {
      setRemoving(true);
      setError("");

      await removeEmployeeSkill(
        removeTarget.id
      );

      setRemoveTarget(null);

      await loadSkill(true);
    } catch (removeError) {
      setError(
        getError(
          removeError,
          "Unable to remove employee from this skill."
        )
      );
    } finally {
      setRemoving(false);
    }
  }


  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">
          <Empty
            text="Loading skill details..."
          />
        </div>
      </div>
    );
  }


  /* =========================================================
     NOT FOUND
     ========================================================= */

  if (!skill) {
    return (
      <div className="p-4 sm:p-6">

        <button
          type="button"
          onClick={() =>
            navigate("/skills")
          }
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--bms-text-muted)] transition hover:text-blue-500"
        >
          <ArrowLeft size={16} />
          Back to skills
        </button>

        {error ? (
          <ErrorBox
            message={error}
          />
        ) : (
          <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">
            <Empty
              text="Skill not found."
            />
          </div>
        )}

      </div>
    );
  }


  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <div className="p-4 sm:p-6">

      {/* =====================================================
          TOP ACTIONS
          ===================================================== */}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <button
          type="button"
          onClick={() =>
            navigate("/skills")
          }
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-[var(--bms-text-muted)] transition hover:text-blue-500"
        >
          <ArrowLeft size={16} />
          Back to skills
        </button>

        <Button
          variant="secondary"
          onClick={() =>
            loadSkill(true)
          }
          disabled={refreshing}
        >
          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </Button>

      </div>


      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <div className="mb-4">
          <ErrorBox
            message={error}
          />
        </div>
      )}


      {/* =====================================================
          SKILL HEADER
          ===================================================== */}

      <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5 sm:p-6">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

          <div className="flex min-w-0 items-start gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Award size={26} />
            </div>

            <div className="min-w-0">

              <p className="text-xs font-medium uppercase tracking-wider text-blue-500">
                Employee skill
              </p>

              <h1 className="mt-1 text-2xl font-bold text-[var(--bms-text)] sm:text-3xl">
                {skill.name}
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--bms-text-secondary)]">
                {skill.description ||
                  "No description has been provided for this skill."}
              </p>

            </div>

          </div>


          {/* Employee count */}
          <div className="shrink-0 rounded-xl bg-[var(--bms-surface-soft)] px-5 py-4 text-center">

            <Users
              size={20}
              className="mx-auto text-blue-500"
            />

            <p className="mt-2 text-2xl font-bold text-[var(--bms-text)]">
              {statistics.total}
            </p>

            <p className="text-[10px] text-[var(--bms-text-muted)]">
              Assigned employees
            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          STATISTICS
          ===================================================== */}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

        {[
          [
            "Beginner",
            statistics
              .levelCounts
              .BEGINNER,
          ],
          [
            "Intermediate",
            statistics
              .levelCounts
              .INTERMEDIATE,
          ],
          [
            "Advanced",
            statistics
              .levelCounts
              .ADVANCED,
          ],
          [
            "Expert",
            statistics
              .levelCounts
              .EXPERT,
          ],
        ].map(
          ([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4"
            >

              <p className="text-xs text-[var(--bms-text-muted)]">
                {label}
              </p>

              <p className="mt-1 text-2xl font-semibold text-[var(--bms-text)]">
                {value}
              </p>

            </div>
          )
        )}

      </div>


      {/* =====================================================
          EXPERIENCE SUMMARY
          ===================================================== */}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">

        <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <TrendingUp
                size={18}
              />
            </div>

            <div>

              <p className="text-xs text-[var(--bms-text-muted)]">
                Total experience
              </p>

              <p className="mt-1 text-lg font-semibold text-[var(--bms-text)]">
                {statistics.totalExperience.toFixed(
                  1
                )}{" "}
                years
              </p>

            </div>

          </div>

        </div>


        <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Award size={18} />
            </div>

            <div>

              <p className="text-xs text-[var(--bms-text-muted)]">
                Average experience
              </p>

              <p className="mt-1 text-lg font-semibold text-[var(--bms-text)]">
                {statistics.averageExperience.toFixed(
                  1
                )}{" "}
                years
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          EMPLOYEES SECTION
          ===================================================== */}

      <div className="mt-6">

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-lg font-semibold text-[var(--bms-text)]">
              Employees with this skill
            </h2>

            <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
              View employee expertise,
              experience and assignment
              information.
            </p>
          </div>


          {/* Manage employees */}
          <button
            type="button"
            onClick={
              openManageDialog
            }
            className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <UserPlus size={16} />
            Manage employees
          </button>

        </div>


        {/* Employee cards */}
        {assignments.length === 0 ? (

          <div className="rounded-xl border border-dashed border-[var(--bms-border)] bg-[var(--bms-surface)] p-10 text-center">

            <Users
              size={28}
              className="mx-auto text-[var(--bms-text-muted)]"
            />

            <h3 className="mt-3 font-medium text-[var(--bms-text)]">
              No employees assigned
            </h3>

            <p className="mt-1 text-sm text-[var(--bms-text-muted)]">
              Use the Manage employees
              button to assign an employee
              to this skill.
            </p>

          </div>

        ) : (

          <div className="grid gap-4 lg:grid-cols-2">

            {assignments.map(
              (assignment) => (
                <EmployeeSkillCard
                  key={
                    assignment.id
                  }
                  assignment={
                    assignment
                  }
                  onEdit={
                    openEditAssignment
                  }
                />
              )
            )}

          </div>

        )}

      </div>


      {/* =====================================================
          MANAGE EMPLOYEES DIALOG
          ===================================================== */}

      <Modal
        open={manageOpen}
        onClose={
          closeManageDialog
        }
        title={
          `Manage employees — ${skill.name}`
        }
        width="max-w-2xl"
      >

        <div className="space-y-5 p-5">

          {/* -------------------------------------------------
              ADD EMPLOYEE
              ------------------------------------------------- */}

          <div className="rounded-xl border border-[var(--bms-border)] p-4">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <Plus size={18} />
              </div>

              <div>

                <h3 className="font-semibold text-[var(--bms-text)]">
                  Add employee
                </h3>

                <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                  Assign an employee to{" "}
                  <span className="font-medium text-[var(--bms-text)]">
                    {skill.name}
                  </span>
                  .
                </p>

              </div>

            </div>


            <div className="mt-4 space-y-4">

              {/* Employee */}
              <Field
                label="Employee"
                required
              >

                <select
                  className={
                    selectClass
                  }
                  value={
                    assignEmployeeId
                  }
                  onChange={(
                    event
                  ) =>
                    setAssignEmployeeId(
                      event.target.value
                    )
                  }
                >

                  <option value="">
                    Select employee
                  </option>

                  {availableEmployees.map(
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

                {availableEmployees.length ===
                  0 && (
                  <p className="mt-2 text-xs text-[var(--bms-text-muted)]">
                    All available employees
                    are already assigned to
                    this skill.
                  </p>
                )}

              </Field>


              {/* Level + experience */}
              <div className="grid gap-4 sm:grid-cols-2">

                <Field
                  label="Skill level"
                  required
                >

                  <select
                    className={
                      selectClass
                    }
                    value={
                      assignLevel
                    }
                    onChange={(
                      event
                    ) =>
                      setAssignLevel(
                        event.target.value
                      )
                    }
                  >

                    {levels.map(
                      (level) => (
                        <option
                          key={
                            level
                          }
                          value={
                            level
                          }
                        >
                          {formatLabel(
                            level
                          )}
                        </option>
                      )
                    )}

                  </select>

                </Field>


                <Field label="Years of experience">

                  <input
                    className={
                      inputClass
                    }
                    type="number"
                    min="0"
                    max="999.9"
                    step="0.1"
                    value={
                      assignYears
                    }
                    onChange={(
                      event
                    ) =>
                      setAssignYears(
                        event.target.value
                      )
                    }
                    placeholder="e.g. 3.5"
                  />

                </Field>

              </div>


              {/* Add button */}
              <div className="flex justify-end">

                <Button
                  type="button"
                  onClick={
                    assignEmployee
                  }
                  disabled={
                    assigning ||
                    !assignEmployeeId
                  }
                >

                  <UserPlus
                    size={15}
                  />

                  {assigning
                    ? "Adding..."
                    : "Add employee"}

                </Button>

              </div>

            </div>

          </div>


          {/* -------------------------------------------------
              CURRENT EMPLOYEES
              ------------------------------------------------- */}

          <div>

            <div className="mb-3 flex items-center justify-between">

              <div>
                <h3 className="font-semibold text-[var(--bms-text)]">
                  Current employees
                </h3>

                <p className="mt-1 text-[10px] text-[var(--bms-text-muted)]">
                  Employees currently assigned
                  to this skill.
                </p>
              </div>

              <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-medium text-blue-500">
                {assignments.length} assigned
              </span>

            </div>


            {assignments.length ===
            0 ? (

              <div className="rounded-lg border border-dashed border-[var(--bms-border)] p-5 text-center">

                <Users
                  size={20}
                  className="mx-auto text-[var(--bms-text-muted)]"
                />

                <p className="mt-2 text-xs text-[var(--bms-text-muted)]">
                  No employees assigned
                  yet.
                </p>

              </div>

            ) : (

              <div className="space-y-2">

                {assignments.map(
                  (assignment) => {

                    const employee =
                      assignment?.employee;

                    return (
                      <div
                        key={
                          assignment.id
                        }
                        className="flex items-center gap-3 rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-3"
                      >

                        {/* Avatar */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-500/10 text-xs font-semibold text-blue-500">

                          {employee?.user
                            ?.avatarUrl ? (
                            <img
                              src={
                                employee
                                  .user
                                  .avatarUrl
                              }
                              alt={getEmployeeName(
                                employee
                              )}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            getInitials(
                              employee
                            )
                          )}

                        </div>


                        {/* Information */}
                        <div className="min-w-0 flex-1">

                          <p className="truncate text-sm font-medium text-[var(--bms-text)]">
                            {getEmployeeName(
                              employee
                            )}
                          </p>

                          <p className="mt-0.5 truncate text-[10px] text-[var(--bms-text-muted)]">

                            {employee?.employeeNumber ||
                              "No employee number"}

                            {" · "}

                            {formatLabel(
                              assignment?.level ||
                                "NOT_SPECIFIED"
                            )}

                            {" · "}

                            {getYearsLabel(
                              assignment?.yearsOfExperience
                            )}

                          </p>

                        </div>


                        {/* Status */}
                        <CheckCircle2
                          size={15}
                          className="shrink-0 text-emerald-500"
                        />


                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() =>
                            openRemoveDialog(
                              assignment
                            )
                          }
                          className="shrink-0 rounded-lg p-2 text-red-500 transition hover:bg-red-500/10"
                          title="Remove employee"
                        >
                          <Trash2
                            size={14}
                          />
                        </button>

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </div>


          {/* Close */}
          <div className="flex justify-end border-t border-[var(--bms-border)] pt-4">

            <Button
              type="button"
              variant="secondary"
              onClick={
                closeManageDialog
              }
              disabled={assigning}
            >
              Close
            </Button>

          </div>

        </div>

      </Modal>


      {/* =====================================================
          EDIT EMPLOYEE SKILL DIALOG
          ===================================================== */}

      <Modal
        open={
          !!editAssignment
        }
        onClose={
          closeEditAssignment
        }
        title="Edit skill assignment"
        width="max-w-md"
      >

        {editAssignment && (
          <div className="space-y-4 p-5">

            <div className="rounded-xl bg-[var(--bms-surface-soft)] p-4">

              <p className="text-sm font-semibold text-[var(--bms-text)]">
                {getEmployeeName(
                  editAssignment.employee
                )}
              </p>

              <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                Update this employee's
                expertise level and
                experience.
              </p>

            </div>


            <Field
              label="Skill level"
              required
            >

              <select
                className={
                  selectClass
                }
                value={
                  editLevel
                }
                onChange={(
                  event
                ) =>
                  setEditLevel(
                    event.target.value
                  )
                }
              >

                {levels.map(
                  (level) => (
                    <option
                      key={level}
                      value={level}
                    >
                      {formatLabel(
                        level
                      )}
                    </option>
                  )
                )}

              </select>

            </Field>


            <Field label="Years of experience">

              <input
                className={
                  inputClass
                }
                type="number"
                min="0"
                max="999.9"
                step="0.1"
                value={
                  editYears
                }
                onChange={(
                  event
                ) =>
                  setEditYears(
                    event.target.value
                  )
                }
                placeholder="e.g. 3.5"
              />

            </Field>


            <div className="flex justify-end gap-2">

              <Button
                type="button"
                variant="secondary"
                onClick={
                  closeEditAssignment
                }
                disabled={saving}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={
                  saveAssignment
                }
                disabled={saving}
              >
                <Pencil
                  size={14}
                />

                {saving
                  ? "Saving..."
                  : "Save changes"}
              </Button>

            </div>

          </div>
        )}

      </Modal>


      {/* =====================================================
          REMOVE EMPLOYEE CONFIRMATION
          ===================================================== */}

      <Modal
        open={
          !!removeTarget
        }
        onClose={
          closeRemoveDialog
        }
        title="Remove employee"
        width="max-w-md"
      >

        {removeTarget && (
          <div className="p-5">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <Trash2
                size={22}
              />
            </div>


            <h3 className="mt-4 text-lg font-semibold text-[var(--bms-text)]">
              Remove employee?
            </h3>


            <p className="mt-2 text-sm leading-6 text-[var(--bms-text-secondary)]">

              Are you sure you want to
              remove{" "}

              <span className="font-semibold text-[var(--bms-text)]">
                {getEmployeeName(
                  removeTarget.employee
                )}
              </span>

              {" "}from the{" "}

              <span className="font-semibold text-[var(--bms-text)]">
                {skill.name}
              </span>

              {" "}skill?

            </p>


            <div className="mt-5 flex justify-end gap-2">

              <Button
                type="button"
                variant="secondary"
                onClick={
                  closeRemoveDialog
                }
                disabled={removing}
              >
                Cancel
              </Button>


              <button
                type="button"
                onClick={
                  confirmRemove
                }
                disabled={
                  removing
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <Trash2
                  size={15}
                />

                {removing
                  ? "Removing..."
                  : "Remove employee"}

              </button>

            </div>

          </div>
        )}

      </Modal>

    </div>
  );
}
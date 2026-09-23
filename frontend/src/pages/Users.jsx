import {
  Search,
  Users as UsersIcon,
  UserCheck,
  UserRound,
  UserX,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Mail,
  CalendarDays,
  Clock3,
  Activity,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { getUsers } from "../api/users";


function Users() {
  const navigate = useNavigate();

  /*
   * ==================================================
   * STATE
   * ==================================================
   */

  const [users, setUsers] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");


  /*
   * ==================================================
   * LOAD USERS
   * ==================================================
   */

  const loadUsers = useCallback(
    async ({ page = 1 } = {}) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getUsers({
          page,
          limit: 20,
        });

        const data = response?.data;

        if (!data) {
          throw new Error(
            "The server returned an invalid users response."
          );
        }

        setUsers(
          Array.isArray(data.users)
            ? data.users
            : []
        );

        setPagination({
          page:
            Number(data.pagination?.page) || page,

          limit:
            Number(data.pagination?.limit) || 20,

          total:
            Number(data.pagination?.total) || 0,

          totalPages:
            Number(data.pagination?.totalPages) || 0,
        });
      } catch (err) {
        console.error(
          "Failed to load users:",
          err
        );

        setUsers([]);

        setError(
          err?.message ||
            "Unable to load users."
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );


  /*
   * ==================================================
   * INITIAL LOAD
   * ==================================================
   */

  useEffect(() => {
    loadUsers({
      page: 1,
    });
  }, [loadUsers]);


  /*
   * ==================================================
   * FILTER USERS
   * ==================================================
   */

  const filteredUsers = useMemo(() => {
    const query =
      searchQuery
        .trim()
        .toLowerCase();

    return users.filter((user) => {
      const fullName =
        `${user.firstName || ""} ${
          user.lastName || ""
        }`
          .trim()
          .toLowerCase();

      const email =
        user.email?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        email.includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        user.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    users,
    searchQuery,
    statusFilter,
  ]);


  /*
   * ==================================================
   * STATISTICS
   * ==================================================
   */

  const totalUsers =
    pagination.total;

  const activeUsers =
    users.filter(
      (user) =>
        user.status === "ACTIVE"
    ).length;

  const pendingUsers =
    users.filter(
      (user) =>
        user.status === "PENDING"
    ).length;

  const suspendedUsers =
    users.filter(
      (user) =>
        user.status === "SUSPENDED"
    ).length;


  /*
   * ==================================================
   * PAGINATION
   * ==================================================
   */

  function goToPage(page) {
    if (
      page < 1 ||
      page > pagination.totalPages ||
      page === pagination.page
    ) {
      return;
    }

    loadUsers({
      page,
    });
  }


  /*
   * ==================================================
   * DATE FORMATTER
   * ==================================================
   */

  function formatDate(value) {
    if (!value) {
      return "Never";
    }

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Unknown";
    }

    return new Intl.DateTimeFormat(
      "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(date);
  }


  /*
   * ==================================================
   * LOADING STATE
   * ==================================================
   */

  if (isLoading) {
    return <UsersLoading />;
  }


  /*
   * ==================================================
   * MAIN UI
   * ==================================================
   */

  return (
    <div className="min-h-full space-y-6 pb-8">

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <section className="relative overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-600/[0.055] blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-blue-500/[0.035] blur-3xl" />

        <div className="relative p-6 sm:p-7 lg:p-8">

          <div className="flex items-start gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/10 bg-blue-600/10 text-blue-500">

              <UsersIcon
                size={26}
                strokeWidth={1.8}
              />

            </div>

            <div className="min-w-0">

              <div className="mb-1.5 flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-blue-500" />

                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-500">
                  User Management
                </span>

              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[var(--bms-text)] sm:text-3xl">
                Users
              </h1>

              <p className="mt-1.5 max-w-xl text-sm leading-6 text-[var(--bms-text-secondary)]">
                Manage system users, account access,
                roles and activity from one place.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.07] p-4">

          <div className="flex items-start gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">

              <Activity size={17} />

            </div>

            <div>

              <p className="text-sm font-semibold text-red-500">
                Unable to load users
              </p>

              <p className="mt-1 text-xs leading-5 text-red-500/80">
                {error}
              </p>

            </div>

          </div>

        </div>
      )}


      {/* ==================================================
          STATISTICS
      ================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={UsersIcon}
          label="Total Users"
          value={totalUsers}
          description="Registered accounts"
          accent="blue"
        />

        <StatCard
          icon={UserCheck}
          label="Active Users"
          value={activeUsers}
          description="Currently active"
          accent="green"
        />

        <StatCard
          icon={UserRound}
          label="Pending Users"
          value={pendingUsers}
          description="Awaiting approval"
          accent="amber"
        />

        <StatCard
          icon={UserX}
          label="Suspended Users"
          value={suspendedUsers}
          description="Access suspended"
          accent="red"
        />

      </div>


      {/* ==================================================
          USERS SECTION
      ================================================== */}

      <section className="overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-sm">

        {/* ==================================================
            SECTION HEADER
        ================================================== */}

        <div className="border-b border-[var(--bms-border)] p-5 sm:p-6">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <h2 className="text-base font-bold text-[var(--bms-text)]">
                  All Users
                </h2>

                <span className="rounded-full bg-[var(--bms-surface-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--bms-text-muted)]">
                  {filteredUsers.length}
                </span>

              </div>

              <p className="mt-1 text-xs leading-5 text-[var(--bms-text-muted)]">
                Browse registered users and view their
                account information.
              </p>

            </div>


            {/* Search + filter */}

            <div className="flex w-full flex-col gap-2.5 sm:flex-row lg:w-auto">

              <div className="relative">

                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--bms-text-muted)]"
                />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search users..."
                  aria-label="Search users"
                  className="h-11 w-full rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] pl-10 pr-4 text-sm text-[var(--bms-text)] outline-none transition-all placeholder:text-[var(--bms-text-muted)] hover:border-blue-500/20 focus:border-blue-500 focus:bg-[var(--bms-surface)] focus:ring-4 focus:ring-blue-500/[0.08] sm:w-64"
                />

              </div>


              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                aria-label="Filter users by status"
                className="h-11 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-3 text-sm font-medium text-[var(--bms-text-secondary)] outline-none transition-all hover:border-blue-500/20 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/[0.08] sm:w-40"
              >

                <option value="ALL">
                  All Statuses
                </option>

                <option value="ACTIVE">
                  Active
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="SUSPENDED">
                  Suspended
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>

              </select>

            </div>

          </div>

        </div>


        {/* ==================================================
            USERS GRID
        ================================================== */}

        {filteredUsers.length === 0 ? (

          <EmptyState
            hasUsers={
              users.length > 0
            }
          />

        ) : (

          <div className="p-4 sm:p-5 lg:p-6">

            <div className="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

              {filteredUsers.map(
                (user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    navigate={navigate}
                    formatDate={formatDate}
                  />
                )
              )}

            </div>

          </div>

        )}


        {/* ==================================================
            PAGINATION
        ================================================== */}

        {pagination.totalPages > 0 && (
          <Pagination
            pagination={pagination}
            goToPage={goToPage}
          />
        )}

      </section>

    </div>
  );
}


/*
 * ==================================================
 * USER CARD
 * ==================================================
 */

function UserCard({
  user,
  navigate,
  formatDate,
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/20 hover:shadow-xl hover:shadow-blue-500/[0.05]">

      {/* ==================================================
          PROFILE IMAGE
      ================================================== */}

      <div className="relative h-48 w-full overflow-hidden bg-[var(--bms-surface-soft)] sm:h-52">

        {user.avatarUrl ? (

          <img
            src={user.avatarUrl}
            alt={`${user.firstName || ""} ${user.lastName || ""}`}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />

        ) : (

          <div className="flex h-full w-full items-center justify-center bg-blue-600/[0.06]">

            <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-[var(--bms-surface)] bg-blue-600/10 text-3xl font-bold text-blue-500 shadow-lg sm:h-32 sm:w-32 sm:text-4xl">

              {getInitials(user)}

            </div>

          </div>

        )}


        {/* Subtle image overlay */}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent" />


        {/* Status */}

        <div className="absolute right-3 top-3">

          <StatusBadge
            status={user.status}
          />

        </div>

      </div>


      {/* ==================================================
          CARD BODY
      ================================================== */}

      <div className="flex flex-1 flex-col p-4 sm:p-5">

        {/* ==================================================
            USER NAME + EMAIL
        ================================================== */}

        <div>

          <h3 className="truncate text-base font-bold tracking-tight text-[var(--bms-text)]">
            {user.firstName}{" "}
            {user.lastName}
          </h3>


          <div className="mt-1 flex min-w-0 items-center gap-1.5">

            <Mail
              size={13}
              className="shrink-0 text-[var(--bms-text-muted)]"
            />

            <p className="truncate text-xs text-[var(--bms-text-secondary)]">
              {user.email}
            </p>

          </div>

        </div>


        {/* ==================================================
            COMPACT INFORMATION GRID
        ================================================== */}

        <div className="mt-4 grid grid-cols-2 gap-2.5">

          {/* Role */}

          <CompactInfo
            icon={ShieldCheck}
            label="Role"
          >

            <UserRoles
              user={user}
            />

          </CompactInfo>


          {/* Account */}

          <CompactInfo
            icon={Activity}
            label="Account"
          >

            <span className="truncate text-[11px] font-semibold text-[var(--bms-text-secondary)]">
              System User
            </span>

          </CompactInfo>


          {/* Last Login */}

          <CompactInfo
            icon={Clock3}
            label="Last Login"
          >

            <span className="truncate text-[11px] font-medium text-[var(--bms-text-secondary)]">
              {formatDate(
                user.lastloginAt
              )}
            </span>

          </CompactInfo>


          {/* Created */}

          <CompactInfo
            icon={CalendarDays}
            label="Created"
          >

            <span className="truncate text-[11px] font-medium text-[var(--bms-text-secondary)]">
              {formatDate(
                user.createdAt
              )}
            </span>

          </CompactInfo>

        </div>


        {/* ==================================================
            VIEW PROFILE BUTTON
        ================================================== */}

        <button
          type="button"
          onClick={() =>
            navigate(
              `/users/${user.id}`
            )
          }
          className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/15 transition-all hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 active:scale-[0.99]"
        >

          <Eye
            size={16}
            strokeWidth={2}
          />

          View Profile

        </button>

      </div>

    </article>
  );
}


/*
 * ==================================================
 * COMPACT INFO
 * ==================================================
 */

function CompactInfo({
  icon: Icon,
  label,
  children,
}) {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface-soft)]/45 px-2.5 py-2">

      <div className="flex min-w-0 items-center gap-1.5">

        <Icon
          size={12}
          className="shrink-0 text-[var(--bms-text-muted)]"
          strokeWidth={1.8}
        />

        <span className="truncate text-[8px] font-bold uppercase tracking-[0.06em] text-[var(--bms-text-muted)]">
          {label}
        </span>

      </div>

      <div className="mt-1 min-w-0">
        {children}
      </div>

    </div>
  );
}


/*
 * ==================================================
 * GET INITIALS
 * ==================================================
 */

function getInitials(user) {
  const first =
    user.firstName?.[0] || "";

  const last =
    user.lastName?.[0] || "";

  return (
    `${first}${last}`.toUpperCase() ||
    "U"
  );
}


/*
 * ==================================================
 * USER ROLES
 * ==================================================
 */

function UserRoles({
  user,
}) {
  const roles =
    Array.isArray(user.userRoles)
      ? user.userRoles
          .map(
            (userRole) =>
              userRole?.role
          )
          .filter(Boolean)
      : [];


  if (roles.length === 0) {
    return (
      <span className="text-[10px] text-[var(--bms-text-muted)]">
        No role
      </span>
    );
  }


  const firstRole =
    roles[0];

  const additionalRoles =
    roles.length - 1;


  return (
    <div className="flex min-w-0 items-center gap-1">

      <span className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-md border border-blue-500/15 bg-blue-500/[0.07] px-1.5 py-0.5 text-[9px] font-semibold text-blue-500">

        <ShieldCheck
          size={10}
          strokeWidth={1.8}
        />

        <span className="truncate">
          {firstRole.name}
        </span>

      </span>


      {additionalRoles > 0 && (
        <span
          title={roles
            .slice(1)
            .map(
              (role) =>
                role.name
            )
            .join(", ")}
          className="shrink-0 rounded-md border border-[var(--bms-border)] bg-[var(--bms-surface)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--bms-text-secondary)]"
        >
          +{additionalRoles}
        </span>
      )}

    </div>
  );
}


/*
 * ==================================================
 * STATUS BADGE
 * ==================================================
 */

function StatusBadge({
  status,
}) {
  const styles = {
    ACTIVE: {
      wrapper:
        "border-emerald-500/20 bg-emerald-500/[0.09] text-emerald-500",
      dot: "bg-emerald-500",
    },

    PENDING: {
      wrapper:
        "border-amber-500/20 bg-amber-500/[0.09] text-amber-500",
      dot: "bg-amber-500",
    },

    SUSPENDED: {
      wrapper:
        "border-red-500/20 bg-red-500/[0.09] text-red-500",
      dot: "bg-red-500",
    },

    INACTIVE: {
      wrapper:
        "border-gray-500/20 bg-gray-500/[0.09] text-gray-500",
      dot: "bg-gray-500",
    },
  };


  const style =
    styles[status] || {
      wrapper:
        "border-gray-500/20 bg-gray-500/[0.09] text-gray-500",
      dot: "bg-gray-500",
    };


  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wide backdrop-blur-sm ${style.wrapper}`}
    >

      <span
        className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
      />

      {status || "UNKNOWN"}

    </span>
  );
}


/*
 * ==================================================
 * STAT CARD
 * ==================================================
 */

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  accent = "blue",
}) {
  const accentStyles = {
    blue: {
      icon: "bg-blue-500/10 text-blue-500",
      dot: "bg-blue-500",
    },

    green: {
      icon: "bg-emerald-500/10 text-emerald-500",
      dot: "bg-emerald-500",
    },

    amber: {
      icon: "bg-amber-500/10 text-amber-500",
      dot: "bg-amber-500",
    },

    red: {
      icon: "bg-red-500/10 text-red-500",
      dot: "bg-red-500",
    },
  };


  const styles =
    accentStyles[accent] ||
    accentStyles.blue;


  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/20 hover:shadow-md">

      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-500/[0.025] transition-transform duration-300 group-hover:scale-125" />


      <div className="relative flex items-start justify-between gap-4">

        <div className="min-w-0">

          <div className="flex items-center gap-2">

            <span
              className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
            />

            <p className="truncate text-xs font-semibold text-[var(--bms-text-muted)]">
              {label}
            </p>

          </div>


          <p className="mt-3 text-3xl font-bold tracking-tight text-[var(--bms-text)]">
            {value}
          </p>


          <p className="mt-1 text-[11px] text-[var(--bms-text-muted)]">
            {description}
          </p>

        </div>


        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
        >

          <Icon
            size={21}
            strokeWidth={1.8}
          />

        </div>

      </div>

    </div>
  );
}


/*
 * ==================================================
 * EMPTY STATE
 * ==================================================
 */

function EmptyState({
  hasUsers,
}) {
  return (
    <div className="flex min-h-[340px] flex-col items-center justify-center px-6 py-12 text-center">

      <div className="relative">

        <div className="absolute inset-0 scale-150 rounded-full bg-blue-500/[0.03] blur-2xl" />

        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] text-[var(--bms-text-muted)]">

          {hasUsers ? (
            <Search
              size={27}
              strokeWidth={1.6}
            />
          ) : (
            <UsersIcon
              size={27}
              strokeWidth={1.6}
            />
          )}

        </div>

      </div>


      <h3 className="mt-5 text-sm font-bold text-[var(--bms-text)]">

        {hasUsers
          ? "No matching users"
          : "No users found"}

      </h3>


      <p className="mt-1.5 max-w-sm text-xs leading-5 text-[var(--bms-text-secondary)]">

        {hasUsers
          ? "Try adjusting your search term or status filter to find the user you're looking for."
          : "There are currently no registered users available in the system."}

      </p>

    </div>
  );
}


/*
 * ==================================================
 * PAGINATION
 * ==================================================
 */

function Pagination({
  pagination,
  goToPage,
}) {
  const start =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) *
          pagination.limit +
        1;


  const end =
    Math.min(
      pagination.page *
        pagination.limit,
      pagination.total
    );


  const pages = Array.from(
    {
      length:
        pagination.totalPages,
    },
    (_, index) =>
      index + 1
  ).slice(
    Math.max(
      0,
      pagination.page - 3
    ),
    Math.min(
      pagination.totalPages,
      pagination.page + 2
    )
  );


  return (
    <div className="flex flex-col gap-4 border-t border-[var(--bms-border)] px-5 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">

      {/* Results */}

      <p className="text-xs text-[var(--bms-text-muted)]">

        Showing{" "}

        <span className="font-semibold text-[var(--bms-text-secondary)]">
          {start}
        </span>

        {" – "}

        <span className="font-semibold text-[var(--bms-text-secondary)]">
          {end}
        </span>

        {" of "}

        <span className="font-semibold text-[var(--bms-text-secondary)]">
          {pagination.total}
        </span>

      </p>


      {/* Controls */}

      <div className="flex items-center justify-between gap-2 sm:justify-end">

        {/* Previous */}

        <button
          type="button"
          disabled={
            pagination.page <= 1
          }
          onClick={() =>
            goToPage(
              pagination.page - 1
            )
          }
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface)] px-3 text-xs font-medium text-[var(--bms-text-secondary)] transition hover:border-blue-500/20 hover:bg-blue-500/[0.05] hover:text-[var(--bms-text)] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >

          <ChevronLeft size={15} />

          <span className="hidden sm:inline">
            Previous
          </span>

        </button>


        {/* Pages */}

        <div className="flex items-center gap-1">

          {pages.map(
            (page) => (
              <button
                key={page}
                type="button"
                onClick={() =>
                  goToPage(page)
                }
                aria-current={
                  page ===
                  pagination.page
                    ? "page"
                    : undefined
                }
                className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold transition-all ${
                  page ===
                  pagination.page
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                    : "text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)]"
                }`}
              >
                {page}
              </button>
            )
          )}

        </div>


        {/* Next */}

        <button
          type="button"
          disabled={
            pagination.page >=
            pagination.totalPages
          }
          onClick={() =>
            goToPage(
              pagination.page + 1
            )
          }
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface)] px-3 text-xs font-medium text-[var(--bms-text-secondary)] transition hover:border-blue-500/20 hover:bg-blue-500/[0.05] hover:text-[var(--bms-text)] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >

          <span className="hidden sm:inline">
            Next
          </span>

          <ChevronRight size={15} />

        </button>

      </div>

    </div>
  );
}


/*
 * ==================================================
 * LOADING STATE
 * ==================================================
 */

function UsersLoading() {
  return (
    <div className="space-y-6 pb-8">

      {/* Header */}

      <div className="overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-6 sm:p-7">

        <div className="flex items-center gap-4">

          <div className="h-14 w-14 animate-pulse rounded-2xl bg-[var(--bms-surface-soft)]" />

          <div className="space-y-2">

            <div className="h-3 w-28 animate-pulse rounded bg-[var(--bms-surface-soft)]" />

            <div className="h-7 w-24 animate-pulse rounded bg-[var(--bms-surface-soft)]" />

            <div className="h-3 w-64 animate-pulse rounded bg-[var(--bms-surface-soft)]" />

          </div>

        </div>

      </div>


      {/* Statistics */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {[1, 2, 3, 4].map(
          (item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)]"
            />
          )
        )}

      </div>


      {/* Users */}

      <div className="overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

        <div className="border-b border-[var(--bms-border)] p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="space-y-2">

              <div className="h-5 w-32 animate-pulse rounded bg-[var(--bms-surface-soft)]" />

              <div className="h-3 w-56 animate-pulse rounded bg-[var(--bms-surface-soft)]" />

            </div>

            <div className="flex gap-2">

              <div className="h-11 w-56 animate-pulse rounded-xl bg-[var(--bms-surface-soft)]" />

              <div className="h-11 w-36 animate-pulse rounded-xl bg-[var(--bms-surface-soft)]" />

            </div>

          </div>

        </div>


        <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-3 2xl:grid-cols-4">

          {[
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
          ].map(
            (item) => (
              <div
                key={item}
                className="h-[430px] animate-pulse rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)]"
              />
            )
          )}

        </div>

      </div>

    </div>
  );
}


export default Users;
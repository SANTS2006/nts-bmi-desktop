import {
  ArrowLeft,
  CalendarDays,
  Check,
  KeyRound,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getPermissionById,
} from "../api/permissions";


function PermissionDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [permission, setPermission] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [successMessage, setSuccessMessage] =
    useState(null);


  /*
   * ==================================================
   * UUID VALIDATION
   * ==================================================
   */

  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


  /*
   * ==================================================
   * LOAD PERMISSION
   * ==================================================
   */

  const loadPermission =
    useCallback(
      async ({
        showLoader = true,
      } = {}) => {

        try {

          if (showLoader) {
            setIsLoading(true);
          } else {
            setIsRefreshing(true);
          }

          setError(null);

          const response =
            await getPermissionById(id);

          setPermission(
            response?.data || null
          );

        } catch (err) {

          setError(
            err?.message ||
            "Unable to load permission information."
          );

        } finally {

          setIsLoading(false);
          setIsRefreshing(false);

        }
      },
      [id]
    );


  /*
   * ==================================================
   * INITIAL LOAD
   * ==================================================
   */

  useEffect(() => {

    if (
      !id ||
      !UUID_REGEX.test(id)
    ) {

      setError(
        "Invalid permission ID."
      );

      setIsLoading(false);

      return;
    }

    loadPermission();

  }, [
    id,
    loadPermission,
  ]);


  /*
   * ==================================================
   * SUCCESS MESSAGE
   * ==================================================
   */

  useEffect(() => {

    if (!successMessage) {
      return undefined;
    }

    const timer =
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3500);

    return () => {
      clearTimeout(timer);
    };

  }, [successMessage]);


  /*
   * ==================================================
   * REFRESH
   * ==================================================
   */

  async function handleRefresh() {

    await loadPermission({
      showLoader: false,
    });

    setSuccessMessage(
      "Permission details refreshed successfully."
    );
  }


  /*
   * ==================================================
   * LOADING STATE
   * ==================================================
   */

  if (isLoading) {

    return (
      <div className="space-y-6">

        {/* Header skeleton */}

        <div className="h-5 w-32 animate-pulse rounded-lg bg-[var(--bms-surface-soft)]" />

        <div className="flex items-center gap-3">

          <div className="h-12 w-12 animate-pulse rounded-xl bg-[var(--bms-surface-soft)]" />

          <div className="space-y-2">

            <div className="h-5 w-52 animate-pulse rounded bg-[var(--bms-surface-soft)]" />

            <div className="h-4 w-72 animate-pulse rounded bg-[var(--bms-surface-soft)]" />

          </div>

        </div>


        {/* Statistics skeleton */}

        <div className="grid gap-4 sm:grid-cols-3">

          {[1, 2, 3].map(
            (item) => (

              <div
                key={item}
                className="h-28 animate-pulse rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]"
              />

            )
          )}

        </div>


        {/* Roles skeleton */}

        <div className="h-96 animate-pulse rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]" />

      </div>
    );
  }


  /*
   * ==================================================
   * PERMISSION NOT FOUND
   * ==================================================
   */

  if (!permission) {

    return (
      <div className="flex min-h-96 flex-col items-center justify-center text-center">

        <KeyRound
          size={40}
          className="text-[var(--bms-text-muted)]"
        />

        <h2 className="mt-4 text-lg font-semibold text-[var(--bms-text)]">
          Permission not found
        </h2>

        <p className="mt-1 max-w-md text-sm text-[var(--bms-text-secondary)]">
          {error ||
            "The requested permission could not be found."}
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/permissions")
          }
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-[0.98]"
        >

          <ArrowLeft
            size={17}
          />

          Back to Permissions

        </button>

      </div>
    );
  }


  /*
   * ==================================================
   * ROLE ASSIGNMENTS
   * ==================================================
   */

  const assignedRoles =
    permission.rolePermissions || [];


  /*
   * ==================================================
   * DATE FORMATTER
   * ==================================================
   */

  function formatDate(
    value
  ) {

    if (!value) {
      return "—";
    }

    return new Intl.DateTimeFormat(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(
      new Date(value)
    );
  }


  /*
   * ==================================================
   * RENDER
   * ==================================================
   */

  return (
    <div className="space-y-6">

      {/* =========================================
          HEADER
      ========================================== */}

      <div>

        <button
          type="button"
          onClick={() =>
            navigate("/permissions")
          }
          className="mb-4 inline-flex items-center gap-2 text-sm text-[var(--bms-text-secondary)] transition hover:text-[var(--bms-text)]"
        >

          <ArrowLeft
            size={17}
          />

          Back to Permissions

        </button>


        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">

              <KeyRound
                size={24}
                strokeWidth={1.8}
              />

            </div>


            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-2">

                <h1 className="break-all text-xl font-semibold text-[var(--bms-text)]">
                  {permission.name}
                </h1>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500">

                  <Check
                    size={11}
                  />

                  Active

                </span>

              </div>


              <p className="mt-1 text-sm text-[var(--bms-text-secondary)]">

                {permission.description ||
                  "No description provided."}

              </p>

            </div>

          </div>


          {/* Refresh */}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)] disabled:cursor-not-allowed disabled:opacity-50"
          >

            {isRefreshing ? (

              <Loader2
                size={16}
                className="animate-spin"
              />

            ) : (

              <RefreshCw
                size={16}
              />

            )}

            {isRefreshing
              ? "Refreshing..."
              : "Refresh"}

          </button>

        </div>

      </div>


      {/* =========================================
          FEEDBACK
      ========================================== */}

      {successMessage && (

        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-500">

          <Check
            size={18}
          />

          <span>
            {successMessage}
          </span>

        </div>

      )}


      {error && (

        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">

          <X
            size={18}
            className="mt-0.5 shrink-0"
          />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* =========================================
          STATISTICS
      ========================================== */}

      <div className="grid gap-4 sm:grid-cols-3">

        <InfoCard
          icon={ShieldCheck}
          label="Assigned Roles"
          value={assignedRoles.length}
        />

        <InfoCard
          icon={CalendarDays}
          label="Created"
          value={formatDate(
            permission.createdAt
          )}
          compact
        />

        <InfoCard
          icon={RefreshCw}
          label="Last Updated"
          value={formatDate(
            permission.updatedAt
          )}
          compact
        />

      </div>


      {/* =========================================
          PERMISSION INFORMATION
      ========================================== */}

      <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

        <div className="border-b border-[var(--bms-border)] px-5 py-4">

          <h2 className="text-sm font-semibold text-[var(--bms-text)]">
            Permission Information
          </h2>

          <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
            Details and configuration for this system permission.
          </p>

        </div>


        <div className="grid gap-5 p-5 sm:grid-cols-2">

          <DetailItem
            label="Permission ID"
            value={permission.id}
          />

          <DetailItem
            label="Permission Name"
            value={permission.name}
          />

          <div className="sm:col-span-2">

            <DetailItem
              label="Description"
              value={
                permission.description ||
                "No description provided."
              }
            />

          </div>

        </div>

      </div>


      {/* =========================================
          ROLES USING PERMISSION
      ========================================== */}

      <div className="overflow-hidden rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

        <div className="border-b border-[var(--bms-border)] px-5 py-4">

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-sm font-semibold text-[var(--bms-text)]">
                Roles Using This Permission
              </h2>

              <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                Roles that currently have this permission assigned.
              </p>

            </div>


            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-500">

              <Users
                size={13}
              />

              {assignedRoles.length}
              {" "}
              {assignedRoles.length === 1
                ? "Role"
                : "Roles"}

            </span>

          </div>

        </div>


        {assignedRoles.length === 0 ? (

          <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">

            <ShieldCheck
              size={34}
              className="text-[var(--bms-text-muted)]"
            />

            <h3 className="mt-3 text-sm font-semibold text-[var(--bms-text)]">
              No roles assigned
            </h3>

            <p className="mt-1 max-w-sm text-xs text-[var(--bms-text-secondary)]">
              This permission is not currently assigned to any role.
            </p>

          </div>

        ) : (

          <div className="divide-y divide-[var(--bms-border)]">

            {assignedRoles.map(
              (assignment) => {

                const assignedRole =
                  assignment.role;

                return (
                  <div
                    key={
                      assignedRole.id
                    }
                    className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-[var(--bms-surface-soft)] sm:flex-row sm:items-center sm:justify-between"
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-500">

                        <ShieldCheck
                          size={19}
                        />

                      </div>


                      <div className="min-w-0">

                        <p className="text-sm font-semibold text-[var(--bms-text)]">
                          {assignedRole.name}
                        </p>

                        <p className="mt-1 truncate text-xs text-[var(--bms-text-secondary)]">
                          {assignedRole.description ||
                            "No description provided."}
                        </p>

                      </div>

                    </div>


                    <div className="flex shrink-0 items-center gap-2">

                      <div className="text-right">

                        <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--bms-text-muted)]">
                          Assigned
                        </p>

                        <p className="mt-1 text-xs text-[var(--bms-text-secondary)]">
                          {formatDate(
                            assignment.assignedAt
                          )}
                        </p>

                      </div>


                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-500">

                        <Check
                          size={13}
                        />

                        Assigned

                      </span>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </div>

    </div>
  );
}


/*
 * ==================================================
 * INFO CARD
 * ==================================================
 */

function InfoCard({
  icon: Icon,
  label,
  value,
  compact = false,
}) {

  return (
    <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5">

      <div className="flex items-center justify-between gap-4">

        <div className="min-w-0">

          <p className="text-xs font-medium text-[var(--bms-text-muted)]">
            {label}
          </p>

          <p
            className={
              compact
                ? "mt-2 truncate text-sm font-semibold text-[var(--bms-text)]"
                : "mt-2 text-2xl font-semibold text-[var(--bms-text)]"
            }
          >
            {value}
          </p>

        </div>


        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-500">

          <Icon
            size={20}
            strokeWidth={1.8}
          />

        </div>

      </div>

    </div>
  );
}


/*
 * ==================================================
 * DETAIL ITEM
 * ==================================================
 */

function DetailItem({
  label,
  value,
}) {

  return (
    <div>

      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
        {label}
      </p>

      <p className="mt-2 break-all text-sm text-[var(--bms-text-secondary)]">
        {value}
      </p>

    </div>
  );
}


export default PermissionDetails;
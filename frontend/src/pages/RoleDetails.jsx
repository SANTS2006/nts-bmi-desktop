import {
  ArrowLeft,
  Check,
  KeyRound,
  Loader2,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getRoleById,
  getRolePermissions,
  assignPermission,
  removePermission,
} from "../api/roles";

import {
  getPermissions,
} from "../api/permissions";


const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


function RoleDetails() {

  const navigate = useNavigate();

  const { id } = useParams();


  const [role, setRole] =
    useState(null);

  const [assignedPermissions, setAssignedPermissions] =
    useState([]);

  const [allPermissions, setAllPermissions] =
    useState([]);


  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [successMessage, setSuccessMessage] =
    useState(null);


  const [searchQuery, setSearchQuery] =
    useState("");


  const [isAssigning, setIsAssigning] =
    useState(false);

  const [isRemoving, setIsRemoving] =
    useState(false);


  /*
   * ==================================================
   * CONFIRMATION MODAL
   * ==================================================
   */

  const [confirmation, setConfirmation] =
    useState(null);


  /*
   * ==================================================
   * LOAD ROLE DATA
   * ==================================================
   */

  const loadRoleData = useCallback(
    async () => {

      if (!id || !UUID_REGEX.test(id)) {
        setError("Invalid role ID.");
        setIsLoading(false);
        return;
      }

      try {

        setIsLoading(true);
        setError(null);


        const [
          roleResponse,
          rolePermissionsResponse,
          permissionsResponse,
        ] = await Promise.all([

          getRoleById(id),

          getRolePermissions(id),

          getPermissions(),

        ]);


        setRole(
          roleResponse?.data || null
        );


        setAssignedPermissions(
          rolePermissionsResponse
            ?.data
            ?.permissions || []
        );


        setAllPermissions(
          permissionsResponse
            ?.data || []
        );

      } catch (err) {

        setError(
          err?.message ||
          "Unable to load role information."
        );

      } finally {

        setIsLoading(false);

      }

    },
    [id]
  );


  useEffect(() => {

    loadRoleData();

  }, [loadRoleData]);


  /*
   * ==================================================
   * CLEAR SUCCESS MESSAGE
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
   * ASSIGNED PERMISSION IDS
   * ==================================================
   */

  const assignedPermissionIds =
    useMemo(() => {

      return new Set(

        assignedPermissions.map(
          (permission) =>
            permission.id
        )

      );

    }, [
      assignedPermissions,
    ]);


  /*
   * ==================================================
   * FILTER PERMISSIONS
   * ==================================================
   */

  const filteredPermissions =
    useMemo(() => {

      const query =
        searchQuery
          .trim()
          .toLowerCase();


      if (!query) {
        return allPermissions;
      }


      return allPermissions.filter(
        (permission) =>

          permission.name
            ?.toLowerCase()
            .includes(query) ||

          permission.description
            ?.toLowerCase()
            .includes(query)
      );

    }, [
      allPermissions,
      searchQuery,
    ]);


  /*
   * ==================================================
   * REQUEST ASSIGNMENT
   * ==================================================
   */

  function requestAssignPermission(
    permission
  ) {

    if (
      assignedPermissionIds.has(
        permission.id
      )
    ) {
      return;
    }


    setConfirmation({
      type: "assign",
      permission,
    });

  }


  /*
   * ==================================================
   * REQUEST REMOVAL
   * ==================================================
   */

  function requestRemovePermission(
    permission
  ) {

    setConfirmation({
      type: "remove",
      permission,
    });

  }


  /*
   * ==================================================
   * CLOSE CONFIRMATION
   * ==================================================
   */

  function closeConfirmation() {

    if (
      isAssigning ||
      isRemoving
    ) {
      return;
    }


    setConfirmation(null);

  }


  /*
   * ==================================================
   * CONFIRM ACTION
   * ==================================================
   */

  async function handleConfirmedAction() {

    if (!confirmation) {
      return;
    }


    const {
      type,
      permission,
    } = confirmation;


    if (type === "assign") {

      await handleAssignPermission(
        permission
      );

    } else {

      await handleRemovePermission(
        permission
      );

    }

  }


  /*
   * ==================================================
   * ASSIGN PERMISSION
   * ==================================================
   */

  async function handleAssignPermission(
    permission
  ) {

    if (
      assignedPermissionIds.has(
        permission.id
      )
    ) {
      setConfirmation(null);
      return;
    }


    try {

      setIsAssigning(true);

      setError(null);


      await assignPermission(
        id,
        permission.id
      );


      /*
       * Reload from backend rather than
       * manually modifying the state.
       *
       * This keeps the frontend synchronized
       * with the database.
       */

      await loadRoleData();


      setSuccessMessage(
        `Permission "${permission.name}" assigned successfully.`
      );


      setConfirmation(null);

    } catch (err) {

      setError(
        err?.message ||
        "Unable to assign permission."
      );

    } finally {

      setIsAssigning(false);

    }

  }


  /*
   * ==================================================
   * REMOVE PERMISSION
   * ==================================================
   */

  async function handleRemovePermission(
    permission
  ) {

    try {

      setIsRemoving(true);

      setError(null);


      await removePermission(
        id,
        permission.id
      );


      /*
       * Reload from backend.
       */

      await loadRoleData();


      setSuccessMessage(
        `Permission "${permission.name}" removed successfully.`
      );


      setConfirmation(null);

    } catch (err) {

      setError(
        err?.message ||
        "Unable to remove permission."
      );

    } finally {

      setIsRemoving(false);

    }

  }


  /*
   * ==================================================
   * LOADING STATE
   * ==================================================
   */

  if (isLoading) {

    return (

      <div className="space-y-6">

        <div className="h-10 w-48 animate-pulse rounded-lg bg-[var(--bms-surface-soft)]" />


        <div className="grid gap-4 sm:grid-cols-2">

          {[1, 2].map(
            (item) => (

              <div
                key={item}
                className="h-28 animate-pulse rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]"
              />

            )
          )}

        </div>


        <div className="h-96 animate-pulse rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]" />

      </div>

    );

  }


  /*
   * ==================================================
   * ROLE NOT FOUND
   * ==================================================
   */

  if (!role) {

    return (

      <div className="flex min-h-96 flex-col items-center justify-center text-center">

        <ShieldCheck
          size={40}
          className="text-[var(--bms-text-muted)]"
        />


        <h2 className="mt-4 text-lg font-semibold text-[var(--bms-text)]">
          Role not found
        </h2>


        <p className="mt-1 text-sm text-[var(--bms-text-secondary)]">
          {error ||
            "The requested role could not be found."}
        </p>


        <button
          type="button"
          onClick={() =>
            navigate("/roles")
          }
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >

          <ArrowLeft size={17} />

          Back to Roles

        </button>

      </div>

    );

  }


  return (

    <div className="space-y-6">


      {/* =========================================
          HEADER
      ========================================== */}

      <div>

        <button
          type="button"
          onClick={() =>
            navigate("/roles")
          }
          className="mb-4 inline-flex items-center gap-2 text-sm text-[var(--bms-text-secondary)] transition hover:text-[var(--bms-text)]"
        >

          <ArrowLeft size={17} />

          Back to Roles

        </button>


        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-500">

              <ShieldCheck
                size={24}
                strokeWidth={1.8}
              />

            </div>


            <div>

              <div className="flex items-center gap-2">

                <h1 className="text-xl font-semibold text-[var(--bms-text)]">
                  {role.name}
                </h1>


                {role.name ===
                  "ADMIN" && (

                  <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-500">
                    System Role
                  </span>

                )}

              </div>


              <p className="mt-1 text-sm text-[var(--bms-text-secondary)]">
                {role.description ||
                  "No description provided."}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* =========================================
          SUCCESS
      ========================================== */}

      {successMessage && (

        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-500">

          <Check size={18} />

          <span>
            {successMessage}
          </span>

        </div>

      )}


      {/* =========================================
          ERROR
      ========================================== */}

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

      <div className="grid gap-4 sm:grid-cols-2">

        <InfoCard
          icon={UserRound}
          label="Assigned Users"
          value={
            role._count?.userRoles ||
            0
          }
        />


        <InfoCard
          icon={KeyRound}
          label="Assigned Permissions"
          value={
            assignedPermissions.length
          }
        />

      </div>


      {/* =========================================
          PERMISSIONS
      ========================================== */}

      <div className="overflow-hidden rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">


        {/* HEADER */}

        <div className="border-b border-[var(--bms-border)] px-5 py-4">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h2 className="text-sm font-semibold text-[var(--bms-text)]">
                Role Permissions
              </h2>

              <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                Manage the permissions assigned to this role.
              </p>

            </div>


            <div className="relative">

              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bms-text-muted)]"
              />


              <input
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search permissions..."
                aria-label="Search permissions"
                className="h-10 w-full rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] pl-9 pr-3 text-sm text-[var(--bms-text)] outline-none transition placeholder:text-[var(--bms-text-muted)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 sm:w-72"
              />

            </div>

          </div>

        </div>


        {/* PERMISSION LIST */}

        <div className="divide-y divide-[var(--bms-border)]">


          {filteredPermissions.length ===
          0 ? (

            <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">

              <KeyRound
                size={34}
                className="text-[var(--bms-text-muted)]"
              />


              <h3 className="mt-3 text-sm font-semibold text-[var(--bms-text)]">
                No permissions found
              </h3>


              <p className="mt-1 text-xs text-[var(--bms-text-secondary)]">
                Try another search term.
              </p>

            </div>

          ) : (

            filteredPermissions.map(
              (permission) => {

                const isAssigned =
                  assignedPermissionIds.has(
                    permission.id
                  );


                const isBusy =
                  isAssigning ||
                  isRemoving;


                return (

                  <div
                    key={permission.id}
                    className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-[var(--bms-surface-soft)] sm:flex-row sm:items-center sm:justify-between"
                  >


                    {/* PERMISSION INFO */}

                    <div className="min-w-0">

                      <div className="flex items-center gap-2">

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">

                          <KeyRound
                            size={16}
                          />

                        </div>


                        <p className="truncate text-sm font-semibold text-[var(--bms-text)]">
                          {permission.name}
                        </p>

                      </div>


                      <p className="mt-1 pl-10 text-xs text-[var(--bms-text-secondary)]">
                        {permission.description ||
                          "No description provided."}
                      </p>

                    </div>


                    {/* ACTION */}

                    <div className="shrink-0">

                      {isAssigned ? (

                        <div className="flex items-center gap-2">


                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-500">

                            <Check
                              size={13}
                            />

                            Assigned

                          </span>


                          <button
                            type="button"
                            onClick={() =>
                              requestRemovePermission(
                                permission
                              )
                            }
                            disabled={
                              isBusy
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            <X size={14} />

                            Remove

                          </button>

                        </div>

                      ) : (

                        <button
                          type="button"
                          onClick={() =>
                            requestAssignPermission(
                              permission
                            )
                          }
                          disabled={
                            isBusy
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                          <Check
                            size={14}
                          />

                          Assign

                        </button>

                      )}

                    </div>

                  </div>

                );

              }

            )

          )}

        </div>

      </div>


      {/* =========================================
          CONFIRMATION MODAL
      ========================================== */}

      {confirmation && (

        <PermissionConfirmationModal

          type={
            confirmation.type
          }

          permission={
            confirmation.permission
          }

          isLoading={
            isAssigning ||
            isRemoving
          }

          onCancel={
            closeConfirmation
          }

          onConfirm={
            handleConfirmedAction
          }

        />

      )}

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
}) {

  return (

    <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-xs font-medium text-[var(--bms-text-muted)]">
            {label}
          </p>


          <p className="mt-2 text-2xl font-semibold text-[var(--bms-text)]">
            {value}
          </p>

        </div>


        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10 text-blue-500">

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
 * PERMISSION CONFIRMATION MODAL
 * ==================================================
 */

function PermissionConfirmationModal({
  type,
  permission,
  isLoading,
  onCancel,
  onConfirm,
}) {

  const isAssign =
    type === "assign";


  return (

    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="permission-confirmation-title"
    >

      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-2xl">


        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-[var(--bms-border)] px-5 py-4">

          <div className="flex items-center gap-3">

            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                isAssign
                  ? "bg-blue-500/10 text-blue-500"
                  : "bg-red-500/10 text-red-500"
              }`}
            >

              <KeyRound
                size={19}
              />

            </div>


            <div>

              <h2
                id="permission-confirmation-title"
                className="text-sm font-semibold text-[var(--bms-text)]"
              >
                {isAssign
                  ? "Assign Permission"
                  : "Remove Permission"}
              </h2>


              <p className="mt-0.5 text-xs text-[var(--bms-text-muted)]">
                Confirm this authorization change.
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--bms-text-muted)] transition hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)] disabled:opacity-50"
          >

            <X size={18} />

          </button>

        </div>


        {/* BODY */}

        <div className="px-5 py-5">

          <p className="text-sm leading-6 text-[var(--bms-text-secondary)]">

            {isAssign
              ? "You are about to grant this permission to the role:"
              : "You are about to remove this permission from the role:"}

          </p>


          <div className="mt-4 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">

                <KeyRound
                  size={17}
                />

              </div>


              <div className="min-w-0">

                <p className="truncate text-sm font-semibold text-[var(--bms-text)]">
                  {permission.name}
                </p>


                <p className="mt-1 text-xs text-[var(--bms-text-secondary)]">
                  {permission.description ||
                    "No description provided."}
                </p>

              </div>

            </div>

          </div>


          {!isAssign && (

            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs leading-5 text-red-500">

              Removing this permission may immediately restrict users assigned to this role.

            </div>

          )}

        </div>


        {/* FOOTER */}

        <div className="flex items-center justify-end gap-2 border-t border-[var(--bms-border)] px-5 py-4">

          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg border border-[var(--bms-border)] px-4 py-2.5 text-sm font-medium text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)] disabled:opacity-50"
          >

            Cancel

          </button>


          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isAssign
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >

            {isLoading ? (

              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />

                {isAssign
                  ? "Assigning..."
                  : "Removing..."}
              </>

            ) : (

              <>
                {isAssign ? (
                  <Check size={16} />
                ) : (
                  <X size={16} />
                )}

                {isAssign
                  ? "Assign Permission"
                  : "Remove Permission"}

              </>

            )}

          </button>

        </div>

      </div>

    </div>

  );

}


export default RoleDetails;
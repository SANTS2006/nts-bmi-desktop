import {
  ArrowLeft,
  Check,
  CheckSquare,
  KeyRound,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Square,
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
} from "../../api/roles";

import {
  getPermissions,
} from "../../api/permissions";


/*
 * ==================================================
 * CONSTANTS
 * ==================================================
 */

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


/*
 * ==================================================
 * ROLE DETAILS
 * ==================================================
 */

function RoleDetails() {

  const navigate = useNavigate();

  const { id } = useParams();


  /*
   * ==================================================
   * STATE
   * ==================================================
   */

  const [role, setRole] =
    useState(null);


  const [assignedPermissions, setAssignedPermissions] =
    useState([]);


  const [allPermissions, setAllPermissions] =
    useState([]);


  /*
   * Initial page loading.
   */

  const [isLoading, setIsLoading] =
    useState(true);


  /*
   * Refresh loading.
   */

  const [isRefreshing, setIsRefreshing] =
    useState(false);


  const [error, setError] =
    useState(null);


  const [successMessage, setSuccessMessage] =
    useState(null);


  /*
   * ==================================================
   * SEARCH
   * ==================================================
   */

  const [searchQuery, setSearchQuery] =
    useState("");


  /*
   * ==================================================
   * PERMISSION FILTER
   * ==================================================
   */

  const [permissionFilter, setPermissionFilter] =
    useState("all");


  /*
   * ==================================================
   * INDIVIDUAL ACTION LOADING
   * ==================================================
   */

  const [isAssigning, setIsAssigning] =
    useState(false);


  const [isRemoving, setIsRemoving] =
    useState(false);


  /*
   * ==================================================
   * BULK ACTION LOADING
   * ==================================================
   */

  const [isBulkAssigning, setIsBulkAssigning] =
    useState(false);


  const [isBulkRemoving, setIsBulkRemoving] =
    useState(false);


  /*
   * ==================================================
   * SELECTED PERMISSIONS
   * ==================================================
   *
   * Store permission IDs rather than entire objects.
   *
   * This keeps the selection stable even when the
   * permission list is refreshed from the backend.
   */

  const [selectedPermissionIds, setSelectedPermissionIds] =
    useState(() => new Set());


  /*
   * ==================================================
   * CONFIRMATION MODAL
   * ==================================================
   *
   * type:
   *
   * assign
   * remove
   * bulk-assign
   * bulk-remove
   *
   */

  const [confirmation, setConfirmation] =
    useState(null);


  /*
   * ==================================================
   * LOAD ROLE DATA
   * ==================================================
   */

  const loadRoleData =
    useCallback(
      async ({
        initial = false,
      } = {}) => {

        if (
          !id ||
          !UUID_REGEX.test(id)
        ) {

          setError(
            "Invalid role ID."
          );

          setIsLoading(false);

          return;

        }


        try {

          /*
           * Initial page loading.
           */

          if (initial) {

            setIsLoading(true);

          } else {

            setIsRefreshing(true);

          }


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


          /*
           * Update role.
           */

          setRole(
            roleResponse?.data ||
            null
          );


          /*
           * Update assigned permissions.
           */

          setAssignedPermissions(
            rolePermissionsResponse
              ?.data
              ?.permissions ||
            []
          );


          /*
           * Update all permissions.
           */

          setAllPermissions(
            permissionsResponse
              ?.data ||
            []
          );


        } catch (err) {

          setError(
            err?.message ||
            "Unable to load role information."
          );

        } finally {

          if (initial) {

            setIsLoading(false);

          } else {

            setIsRefreshing(false);

          }

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

    loadRoleData({
      initial: true,
    });

  }, [
    loadRoleData,
  ]);


  /*
   * ==================================================
   * MANUAL REFRESH
   * ==================================================
   */

  const handleRefresh =
    useCallback(
      async () => {

        if (
          isRefreshing ||
          isAssigning ||
          isRemoving ||
          isBulkAssigning ||
          isBulkRemoving
        ) {

          return;

        }


        await loadRoleData({
          initial: false,
        });

      },
      [
        isRefreshing,
        isAssigning,
        isRemoving,
        isBulkAssigning,
        isBulkRemoving,
        loadRoleData,
      ]
    );


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
      setTimeout(
        () => {

          setSuccessMessage(null);

        },
        3500
      );


    return () => {

      clearTimeout(timer);

    };

  }, [
    successMessage,
  ]);


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
   * PERMISSION COUNTS
   * ==================================================
   */

  const permissionCounts =
    useMemo(() => {

      const total =
        allPermissions.length;


      const assigned =
        allPermissions.filter(
          (permission) =>
            assignedPermissionIds.has(
              permission.id
            )
        ).length;


      const unassigned =
        total -
        assigned;


      return {

        all:
          total,

        assigned:
          assigned,

        unassigned:
          unassigned,

      };

    }, [
      allPermissions,
      assignedPermissionIds,
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


      return allPermissions.filter(
        (permission) => {

          /*
           * Search.
           */

          const matchesSearch =
            !query ||
            permission.name
              ?.toLowerCase()
              .includes(query) ||
            permission.description
              ?.toLowerCase()
              .includes(query);


          if (!matchesSearch) {

            return false;

          }


          /*
           * Assignment status.
           */

          const isAssigned =
            assignedPermissionIds.has(
              permission.id
            );


          if (
            permissionFilter ===
            "assigned"
          ) {

            return isAssigned;

          }


          if (
            permissionFilter ===
            "unassigned"
          ) {

            return !isAssigned;

          }


          return true;

        }
      );

    }, [
      allPermissions,
      assignedPermissionIds,
      permissionFilter,
      searchQuery,
    ]);


  /*
   * ==================================================
   * SELECTED PERMISSIONS
   * ==================================================
   */

  const selectedPermissions =
    useMemo(() => {

      return allPermissions.filter(
        (permission) =>
          selectedPermissionIds.has(
            permission.id
          )
      );

    }, [
      allPermissions,
      selectedPermissionIds,
    ]);


  /*
   * ==================================================
   * SELECTED COUNTS
   * ==================================================
   */

  const selectedAssignedPermissions =
    useMemo(() => {

      return selectedPermissions.filter(
        (permission) =>
          assignedPermissionIds.has(
            permission.id
          )
      );

    }, [
      selectedPermissions,
      assignedPermissionIds,
    ]);


  const selectedUnassignedPermissions =
    useMemo(() => {

      return selectedPermissions.filter(
        (permission) =>
          !assignedPermissionIds.has(
            permission.id
          )
      );

    }, [
      selectedPermissions,
      assignedPermissionIds,
    ]);


  /*
   * ==================================================
   * SELECTION STATE
   * ==================================================
   */

  const filteredPermissionIds =
    useMemo(() => {

      return filteredPermissions.map(
        (permission) =>
          permission.id
      );

    }, [
      filteredPermissions,
    ]);


  const selectedFilteredCount =
    useMemo(() => {

      return filteredPermissionIds.filter(
        (permissionId) =>
          selectedPermissionIds.has(
            permissionId
          )
      ).length;

    }, [
      filteredPermissionIds,
      selectedPermissionIds,
    ]);


  const allFilteredSelected =
    filteredPermissions.length > 0 &&
    selectedFilteredCount ===
    filteredPermissions.length;


  const someFilteredSelected =
    selectedFilteredCount > 0 &&
    selectedFilteredCount <
    filteredPermissions.length;


  /*
   * ==================================================
   * BUSY STATE
   * ==================================================
   */

  const isBusy =
    isRefreshing ||
    isAssigning ||
    isRemoving ||
    isBulkAssigning ||
    isBulkRemoving;


  /*
   * ==================================================
   * TOGGLE SINGLE PERMISSION
   * ==================================================
   */

  const togglePermissionSelection =
    useCallback(
      (permissionId) => {

        if (isBusy) {

          return;

        }


        setSelectedPermissionIds(
          (current) => {

            const next =
              new Set(current);


            if (
              next.has(
                permissionId
              )
            ) {

              next.delete(
                permissionId
              );

            } else {

              next.add(
                permissionId
              );

            }


            return next;

          }
        );

      },
      [isBusy]
    );


  /*
   * ==================================================
   * TOGGLE ALL FILTERED PERMISSIONS
   * ==================================================
   */

  const toggleSelectAll =
    useCallback(() => {

      if (
        isBusy ||
        filteredPermissions.length === 0
      ) {

        return;

      }


      setSelectedPermissionIds(
        (current) => {

          const next =
            new Set(current);


          const everySelected =
            filteredPermissions.every(
              (permission) =>
                next.has(
                  permission.id
                )
            );


          if (everySelected) {

            /*
             * Remove only the currently
             * filtered permissions.
             *
             * This preserves selections that
             * may exist outside the current filter.
             */

            for (
              const permission of
              filteredPermissions
            ) {

              next.delete(
                permission.id
              );

            }

          } else {

            /*
             * Select all currently filtered
             * permissions.
             */

            for (
              const permission of
              filteredPermissions
            ) {

              next.add(
                permission.id
              );

            }

          }


          return next;

        }
      );

    }, [
      filteredPermissions,
      isBusy,
    ]);


  /*
   * ==================================================
   * CLEAR SELECTION
   * ==================================================
   */

  const clearSelection =
    useCallback(() => {

      if (isBusy) {

        return;

      }


      setSelectedPermissionIds(
        new Set()
      );

    }, [
      isBusy,
    ]);


  /*
   * ==================================================
   * KEEP SELECTION VALID AFTER REFRESH
   * ==================================================
   *
   * If a permission was deleted from the system,
   * remove it from the local selection.
   */

  useEffect(() => {

    if (
      selectedPermissionIds.size === 0
    ) {

      return;

    }


    const validIds =
      new Set(
        allPermissions.map(
          (permission) =>
            permission.id
        )
      );


    setSelectedPermissionIds(
      (current) => {

        const next =
          new Set();


        for (
          const permissionId of
          current
        ) {

          if (
            validIds.has(
              permissionId
            )
          ) {

            next.add(
              permissionId
            );

          }

        }


        if (
          next.size ===
          current.size
        ) {

          return current;

        }


        return next;

      }
    );

  }, [
    allPermissions,
    selectedPermissionIds.size,
  ]);


  /*
   * ==================================================
   * REQUEST SINGLE ASSIGNMENT
   * ==================================================
   */

  function requestAssignPermission(
    permission
  ) {

    if (
      isBusy ||
      assignedPermissionIds.has(
        permission.id
      )
    ) {

      return;

    }


    setConfirmation({

      type:
        "assign",

      permissions:
        [permission],

    });

  }


  /*
   * ==================================================
   * REQUEST SINGLE REMOVAL
   * ==================================================
   */

  function requestRemovePermission(
    permission
  ) {

    if (isBusy) {

      return;

    }


    setConfirmation({

      type:
        "remove",

      permissions:
        [permission],

    });

  }


  /*
   * ==================================================
   * REQUEST BULK ASSIGNMENT
   * ==================================================
   */

  function requestBulkAssign() {

    if (
      isBusy ||
      selectedUnassignedPermissions.length === 0
    ) {

      return;

    }


    setConfirmation({

      type:
        "bulk-assign",

      permissions:
        selectedUnassignedPermissions,

    });

  }


  /*
   * ==================================================
   * REQUEST BULK REMOVAL
   * ==================================================
   */

  function requestBulkRemove() {

    if (
      isBusy ||
      selectedAssignedPermissions.length === 0
    ) {

      return;

    }


    setConfirmation({

      type:
        "bulk-remove",

      permissions:
        selectedAssignedPermissions,

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
      isRemoving ||
      isBulkAssigning ||
      isBulkRemoving
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
      permissions = [],
    } = confirmation;


    if (
      type ===
      "assign"
    ) {

      await handleAssignPermission(
        permissions[0]
      );

      return;

    }


    if (
      type ===
      "remove"
    ) {

      await handleRemovePermission(
        permissions[0]
      );

      return;

    }


    if (
      type ===
      "bulk-assign"
    ) {

      await handleBulkAssign(
        permissions
      );

      return;

    }


    if (
      type ===
      "bulk-remove"
    ) {

      await handleBulkRemove(
        permissions
      );

    }

  }


  /*
   * ==================================================
   * ASSIGN SINGLE PERMISSION
   * ==================================================
   */

  async function handleAssignPermission(
    permission
  ) {

    if (!permission) {

      return;

    }


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
       * Refresh backend data.
       */

      await loadRoleData({
        initial: false,
      });


      /*
       * Remove this permission from
       * the selection.
       */

      setSelectedPermissionIds(
        (current) => {

          const next =
            new Set(current);

          next.delete(
            permission.id
          );

          return next;

        }
      );


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
   * REMOVE SINGLE PERMISSION
   * ==================================================
   */

  async function handleRemovePermission(
    permission
  ) {

    if (!permission) {

      return;

    }


    try {

      setIsRemoving(true);

      setError(null);


      await removePermission(
        id,
        permission.id
      );


      /*
       * Refresh backend data.
       */

      await loadRoleData({
        initial: false,
      });


      /*
       * Remove this permission from
       * the selection.
       */

      setSelectedPermissionIds(
        (current) => {

          const next =
            new Set(current);

          next.delete(
            permission.id
          );

          return next;

        }
      );


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
   * BULK ASSIGN
   * ==================================================
   */

  async function handleBulkAssign(
    permissions
  ) {

    const permissionsToAssign =
      permissions.filter(
        (permission) =>
          !assignedPermissionIds.has(
            permission.id
          )
      );


    if (
      permissionsToAssign.length === 0
    ) {

      setConfirmation(null);

      return;

    }


    try {

      setIsBulkAssigning(true);

      setError(null);


      /*
       * Use the existing API function for each
       * selected permission.
       *
       * Promise.allSettled allows the operation
       * to continue even if one permission fails.
       */

      const results =
        await Promise.allSettled(

          permissionsToAssign.map(
            (permission) =>
              assignPermission(
                id,
                permission.id
              )
          )

        );


      const failed =
        results.filter(
          (result) =>
            result.status ===
            "rejected"
        );


      /*
       * Always synchronize with the database
       * after the bulk operation.
       */

      await loadRoleData({
        initial: false,
      });


      /*
       * Clear selection after processing.
       */

      setSelectedPermissionIds(
        new Set()
      );


      setConfirmation(null);


      if (
        failed.length === 0
      ) {

        setSuccessMessage(
          `${permissionsToAssign.length} ${permissionsToAssign.length === 1
            ? "permission was"
            : "permissions were"
          } assigned successfully.`
        );

      } else {

        setError(
          `${permissionsToAssign.length - failed.length} of ${permissionsToAssign.length
          } permissions were assigned. ${failed.length
          } failed.`
        );

      }

    } catch (err) {

      setError(
        err?.message ||
        "Unable to assign selected permissions."
      );

    } finally {

      setIsBulkAssigning(false);

    }

  }


  /*
   * ==================================================
   * BULK REMOVE
   * ==================================================
   */

  async function handleBulkRemove(
    permissions
  ) {

    const permissionsToRemove =
      permissions.filter(
        (permission) =>
          assignedPermissionIds.has(
            permission.id
          )
      );


    if (
      permissionsToRemove.length === 0
    ) {

      setConfirmation(null);

      return;

    }


    try {

      setIsBulkRemoving(true);

      setError(null);


      /*
       * Remove each permission using
       * the existing API.
       */

      const results =
        await Promise.allSettled(

          permissionsToRemove.map(
            (permission) =>
              removePermission(
                id,
                permission.id
              )
          )

        );


      const failed =
        results.filter(
          (result) =>
            result.status ===
            "rejected"
        );


      /*
       * Synchronize with backend.
       */

      await loadRoleData({
        initial: false,
      });


      /*
       * Clear selection.
       */

      setSelectedPermissionIds(
        new Set()
      );


      setConfirmation(null);


      if (
        failed.length === 0
      ) {

        setSuccessMessage(
          `${permissionsToRemove.length} ${permissionsToRemove.length === 1
            ? "permission was"
            : "permissions were"
          } removed successfully.`
        );

      } else {

        setError(
          `${permissionsToRemove.length - failed.length} of ${permissionsToRemove.length
          } permissions were removed. ${failed.length
          } failed.`
        );

      }

    } catch (err) {

      setError(
        err?.message ||
        "Unable to remove selected permissions."
      );

    } finally {

      setIsBulkRemoving(false);

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

          <ArrowLeft
            size={17}
          />

          Back to Roles

        </button>

      </div>

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
            navigate("/roles")
          }
          className="mb-4 inline-flex items-center gap-2 text-sm text-[var(--bms-text-secondary)] transition hover:text-[var(--bms-text)]"
        >

          <ArrowLeft
            size={17}
          />

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

          <Check
            size={18}
          />

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


        {/* =========================================
            HEADER
        ========================================== */}

        <div className="border-b border-[var(--bms-border)] px-5 py-4">

          <div className="flex flex-col gap-4">


            {/* TITLE + REFRESH + SEARCH */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <h2 className="text-sm font-semibold text-[var(--bms-text)]">

                  Role Permissions

                </h2>

                <p className="mt-1 text-xs text-[var(--bms-text-muted)]">

                  Manage the permissions assigned to this role.

                </p>

              </div>


              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">


                {/* REFRESH */}

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isBusy}
                  title="Refresh permissions"
                  aria-label="Refresh permissions"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-3 text-xs font-medium text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface)] hover:text-[var(--bms-text)] disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <RefreshCw
                    size={16}
                    className={
                      isRefreshing
                        ? "animate-spin"
                        : ""
                    }
                  />

                  <span className="hidden sm:inline">

                    {isRefreshing
                      ? "Refreshing..."
                      : "Refresh"}

                  </span>

                </button>


                {/* SEARCH */}

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


            {/* =========================================
                FILTERS
            ========================================== */}

            <div className="flex flex-wrap items-center gap-2">

              <span className="mr-1 text-xs font-medium text-[var(--bms-text-muted)]">

                Filter:

              </span>


              <PermissionFilterButton
                active={
                  permissionFilter ===
                  "all"
                }
                onClick={() =>
                  setPermissionFilter(
                    "all"
                  )
                }
                label="All"
                count={
                  permissionCounts.all
                }
              />


              <PermissionFilterButton
                active={
                  permissionFilter ===
                  "assigned"
                }
                onClick={() =>
                  setPermissionFilter(
                    "assigned"
                  )
                }
                label="Assigned"
                count={
                  permissionCounts.assigned
                }
                variant="assigned"
              />


              <PermissionFilterButton
                active={
                  permissionFilter ===
                  "unassigned"
                }
                onClick={() =>
                  setPermissionFilter(
                    "unassigned"
                  )
                }
                label="Unassigned"
                count={
                  permissionCounts.unassigned
                }
                variant="unassigned"
              />

            </div>

          </div>

        </div>


        {/* =========================================
            BULK ACTION TOOLBAR
        ========================================== */}

        {selectedPermissions.length > 0 && (

          <div className="border-b border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-5 py-3">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">

                  <CheckSquare
                    size={17}
                  />

                </div>


                <div className="min-w-0">

                  <p className="text-xs font-semibold text-[var(--bms-text)]">

                    {selectedPermissions.length}{" "}

                    {selectedPermissions.length === 1
                      ? "permission"
                      : "permissions"}{" "}

                    selected

                  </p>


                  <p className="mt-0.5 text-[11px] text-[var(--bms-text-muted)]">

                    {selectedUnassignedPermissions.length > 0 &&
                      `${selectedUnassignedPermissions.length} unassigned`}

                    {selectedUnassignedPermissions.length > 0 &&
                      selectedAssignedPermissions.length > 0 &&
                      " · "}

                    {selectedAssignedPermissions.length > 0 &&
                      `${selectedAssignedPermissions.length} assigned`}

                  </p>

                </div>

              </div>


              <div className="flex flex-wrap items-center gap-2">


                {/* ASSIGN SELECTED */}

                {selectedUnassignedPermissions.length > 0 && (

                  <button
                    type="button"
                    onClick={
                      requestBulkAssign
                    }
                    disabled={isBusy}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    <Check
                      size={14}
                    />

                    Assign{" "}

                    {selectedUnassignedPermissions.length}

                  </button>

                )}


                {/* REMOVE SELECTED */}

                {selectedAssignedPermissions.length > 0 && (

                  <button
                    type="button"
                    onClick={
                      requestBulkRemove
                    }
                    disabled={isBusy}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    <X
                      size={14}
                    />

                    Remove{" "}

                    {selectedAssignedPermissions.length}

                  </button>

                )}


                {/* CLEAR */}

                <button
                  type="button"
                  onClick={
                    clearSelection
                  }
                  disabled={isBusy}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--bms-border)] px-3 py-2 text-xs font-medium text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface)] hover:text-[var(--bms-text)] disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <X
                    size={14}
                  />

                  Clear

                </button>

              </div>

            </div>

          </div>

        )}


        {/* =========================================
            PERMISSION LIST
        ========================================== */}

        <div className="relative">


          {/* REFRESH OVERLAY */}

          {isRefreshing && (

            <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-[var(--bms-surface)]/50 pt-5 backdrop-blur-[1px]">

              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--bms-border)] bg-[var(--bms-surface)] px-3 py-1.5 text-xs font-medium text-[var(--bms-text-secondary)] shadow-sm">

                <Loader2
                  size={14}
                  className="animate-spin text-blue-500"
                />

                Updating permissions...

              </div>

            </div>

          )}


          {/* =========================================
              SELECT ALL BAR
          ========================================== */}

          {filteredPermissions.length > 0 && (

            <div className="flex items-center justify-between border-b border-[var(--bms-border)] bg-[var(--bms-surface-soft)]/50 px-5 py-2.5">

              <button
                type="button"
                onClick={
                  toggleSelectAll
                }
                disabled={isBusy}
                className="inline-flex items-center gap-2 text-xs font-medium text-[var(--bms-text-secondary)] transition hover:text-[var(--bms-text)] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={
                  allFilteredSelected
                    ? "Deselect all visible permissions"
                    : "Select all visible permissions"
                }
              >

                {allFilteredSelected ? (

                  <CheckSquare
                    size={17}
                    className="text-blue-500"
                  />

                ) : someFilteredSelected ? (

                  <div className="relative flex h-[17px] w-[17px] items-center justify-center">

                    <Square
                      size={17}
                      className="text-blue-500"
                    />

                    <span className="absolute h-1.5 w-1.5 rounded-sm bg-blue-500" />

                  </div>

                ) : (

                  <Square
                    size={17}
                    className="text-[var(--bms-text-muted)]"
                  />

                )}


                {allFilteredSelected
                  ? "Deselect all"
                  : "Select all"}

              </button>


              {selectedFilteredCount > 0 && (

                <span className="text-[11px] text-[var(--bms-text-muted)]">

                  {selectedFilteredCount} selected

                </span>

              )}

            </div>

          )}


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

                  {permissionFilter ===
                    "assigned"
                    ? "This role has no permissions matching your search."
                    : permissionFilter ===
                      "unassigned"
                      ? "All permissions matching your search are already assigned."
                      : "Try another search term."}

                </p>


                {(searchQuery ||
                  permissionFilter !==
                  "all") && (

                    <button
                      type="button"
                      onClick={() => {

                        setSearchQuery("");

                        setPermissionFilter(
                          "all"
                        );

                      }}
                      className="mt-4 rounded-lg border border-[var(--bms-border)] px-3 py-2 text-xs font-medium text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)]"
                    >

                      Clear Filters

                    </button>

                  )}

              </div>

            ) : (

              filteredPermissions.map(
                (permission) => {

                  const isAssigned =
                    assignedPermissionIds.has(
                      permission.id
                    );


                  const isSelected =
                    selectedPermissionIds.has(
                      permission.id
                    );


                  return (

                    <div
                      key={permission.id}
                      className={`flex flex-col gap-4 px-5 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between ${isSelected
                          ? "bg-blue-500/[0.035]"
                          : "hover:bg-[var(--bms-surface-soft)]"
                        }`}
                    >


                      {/* =================================
                          PERMISSION INFO
                      ================================== */}

                      <div className="flex min-w-0 items-start gap-3">


                        {/* CHECKBOX */}

                        <button
                          type="button"
                          onClick={() =>
                            togglePermissionSelection(
                              permission.id
                            )
                          }
                          disabled={isBusy}
                          aria-label={
                            isSelected
                              ? `Deselect ${permission.name}`
                              : `Select ${permission.name}`
                          }
                          aria-pressed={
                            isSelected
                          }
                          className="mt-1 shrink-0 rounded-md text-[var(--bms-text-muted)] transition hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                          {isSelected ? (

                            <CheckSquare
                              size={18}
                              className="text-blue-500"
                            />

                          ) : (

                            <Square
                              size={18}
                            />

                          )}

                        </button>


                        <div className="min-w-0 flex-1">

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

                      </div>


                      {/* =================================
                          ACTION
                      ================================== */}

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
                              disabled={isBusy}
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                              <X
                                size={14}
                              />

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
                            disabled={isBusy}
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


          {/* =========================================
              FILTER SUMMARY
          ========================================== */}

          {allPermissions.length > 0 && (

            <div className="border-t border-[var(--bms-border)] px-5 py-3">

              <p className="text-xs text-[var(--bms-text-muted)]">

                Showing{" "}

                <span className="font-medium text-[var(--bms-text-secondary)]">

                  {filteredPermissions.length}

                </span>

                {" "}of{" "}

                <span className="font-medium text-[var(--bms-text-secondary)]">

                  {allPermissions.length}

                </span>

                {" "}permissions


                {permissionFilter !==
                  "all" && (

                    <>
                      {" "}·{" "}

                      {permissionFilter ===
                        "assigned"
                        ? "Assigned only"
                        : "Unassigned only"}

                    </>

                  )}

              </p>

            </div>

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

          permissions={
            confirmation.permissions
          }

          isLoading={
            isAssigning ||
            isRemoving ||
            isBulkAssigning ||
            isBulkRemoving
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
 * PERMISSION FILTER BUTTON
 * ==================================================
 */

function PermissionFilterButton({
  active,
  onClick,
  label,
  count,
  variant = "default",
}) {

  const getClasses = () => {

    if (active) {

      if (
        variant ===
        "assigned"
      ) {

        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-500";

      }


      if (
        variant ===
        "unassigned"
      ) {

        return "border-orange-500/30 bg-orange-500/10 text-orange-500";

      }


      return "border-blue-500/30 bg-blue-500/10 text-blue-500";

    }


    return "border-[var(--bms-border)] bg-[var(--bms-surface-soft)] text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface)] hover:text-[var(--bms-text)]";

  };


  return (

    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${getClasses()}`}
    >

      <span>
        {label}
      </span>


      <span
        className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${active
            ? "bg-white/10"
            : "bg-[var(--bms-surface)]"
          }`}
      >

        {count}

      </span>

    </button>

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
  permissions = [],
  isLoading,
  onCancel,
  onConfirm,
}) {

  const isAssign =
    type === "assign" ||
    type === "bulk-assign";


  const isBulk =
    type === "bulk-assign" ||
    type === "bulk-remove";


  const actionVerb =
    isAssign
      ? "assign"
      : "remove";


  const actionLabel =
    isAssign
      ? "Assign"
      : "Remove";


  const actionLoadingLabel =
    isAssign
      ? "Assigning..."
      : "Removing...";


  const permissionCount =
    permissions.length;


  return (

    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="permission-confirmation-title"
    >

      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-2xl">


        {/* =========================================
            HEADER
        ========================================== */}

        <div className="flex items-center justify-between border-b border-[var(--bms-border)] px-5 py-4">

          <div className="flex items-center gap-3">

            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${isAssign
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

                {isBulk
                  ? `${actionLabel} Permissions`
                  : `${actionLabel} Permission`}

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

            <X
              size={18}
            />

          </button>

        </div>


        {/* =========================================
            BODY
        ========================================== */}

        <div className="px-5 py-5">

          <p className="text-sm leading-6 text-[var(--bms-text-secondary)]">

            {isAssign
              ? isBulk
                ? `You are about to grant ${permissionCount} ${permissionCount === 1
                  ? "permission"
                  : "permissions"
                } to this role:`
                : "You are about to grant this permission to the role:"
              : isBulk
                ? `You are about to remove ${permissionCount} ${permissionCount === 1
                  ? "permission"
                  : "permissions"
                } from this role:`
                : "You are about to remove this permission from the role:"}

          </p>


          {/* =========================================
              PERMISSION LIST
          ========================================== */}

          <div className="mt-4 max-h-64 overflow-y-auto rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)]">

            <div className="divide-y divide-[var(--bms-border)]">

              {permissions.map(
                (permission) => (

                  <div
                    key={permission.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">

                      <KeyRound
                        size={15}
                      />

                    </div>


                    <div className="min-w-0">

                      <p className="truncate text-sm font-semibold text-[var(--bms-text)]">

                        {permission.name}

                      </p>


                      <p className="mt-0.5 truncate text-xs text-[var(--bms-text-secondary)]">

                        {permission.description ||
                          "No description provided."}

                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>


          {/* =========================================
              BULK INFORMATION
          ========================================== */}

          {isBulk && (

            <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2.5 text-xs leading-5 text-blue-500">

              This action will update{" "}

              <span className="font-semibold">

                {permissionCount}

              </span>{" "}

              {permissionCount === 1
                ? "permission"
                : "permissions"}{" "}

              at once.

            </div>

          )}


          {/* =========================================
              REMOVE WARNING
          ========================================== */}

          {!isAssign && (

            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs leading-5 text-red-500">

              Removing{" "}

              {permissionCount === 1
                ? "this permission"
                : "these permissions"}{" "}

              may immediately restrict users assigned to this role.

            </div>

          )}

        </div>


        {/* =========================================
            FOOTER
        ========================================== */}

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
            disabled={
              isLoading ||
              permissionCount === 0
            }
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${isAssign
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

                {actionLoadingLabel}

              </>

            ) : (

              <>

                {isAssign ? (

                  <Check
                    size={16}
                  />

                ) : (

                  <X
                    size={16}
                  />

                )}


                {actionLabel}{" "}

                {isBulk
                  ? `${permissionCount} ${permissionCount === 1
                    ? "Permission"
                    : "Permissions"
                  }`
                  : "Permission"}

              </>

            )}

          </button>

        </div>

      </div>

    </div>

  );

}


export default RoleDetails;
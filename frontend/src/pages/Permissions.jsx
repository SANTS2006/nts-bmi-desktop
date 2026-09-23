import {
  Check,
  Eye,
  KeyRound,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
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
} from "react-router-dom";

import {
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from "../api/permissions";


/*
 * ==================================================
 * PERMISSION NAME VALIDATION
 * ==================================================
 *
 * Examples:
 *
 * users.read
 * users.create
 * roles.manage
 * permissions.delete
 *
 * Invalid:
 *
 * Users.Read
 * users-read
 * users read
 * users.
 * .users
 */

const PERMISSION_NAME_REGEX =
  /^[a-z0-9]+(?:\.[a-z0-9]+)*$/;


/*
 * ==================================================
 * MAIN COMPONENT
 * ==================================================
 */

function Permissions() {

  const navigate = useNavigate();


  /*
   * ==================================================
   * STATE
   * ==================================================
   */

  const [permissions, setPermissions] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [successMessage, setSuccessMessage] =
    useState(null);

  const [searchQuery, setSearchQuery] =
    useState("");


  /*
   * ==================================================
   * CREATE / EDIT MODAL
   * ==================================================
   */

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [editingPermission, setEditingPermission] =
    useState(null);

  const [formData, setFormData] =
    useState({
      name: "",
      description: "",
    });

  const [formErrors, setFormErrors] =
    useState({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);


  /*
   * ==================================================
   * DELETE MODAL
   * ==================================================
   */

  const [permissionToDelete, setPermissionToDelete] =
    useState(null);

  const [isDeleting, setIsDeleting] =
    useState(false);


  /*
   * ==================================================
   * LOAD PERMISSIONS
   * ==================================================
   */

  const loadPermissions =
    useCallback(
      async ({
        refresh = false,
      } = {}) => {

        try {

          if (refresh) {
            setIsRefreshing(true);
          } else {
            setIsLoading(true);
          }

          setError(null);

          const response =
            await getPermissions();

          setPermissions(
            response?.data || []
          );

        } catch (err) {

          setError(
            err?.message ||
            "Unable to load permissions."
          );

        } finally {

          setIsLoading(false);
          setIsRefreshing(false);

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

    loadPermissions();

  }, [loadPermissions]);


  /*
   * ==================================================
   * SUCCESS MESSAGE TIMER
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
   * SEARCH
   * ==================================================
   */

  const filteredPermissions =
    useMemo(() => {

      const query =
        searchQuery
          .trim()
          .toLowerCase();

      if (!query) {
        return permissions;
      }

      return permissions.filter(
        (permission) =>
          permission.name
            ?.toLowerCase()
            .includes(query) ||

          permission.description
            ?.toLowerCase()
            .includes(query)
      );

    }, [
      permissions,
      searchQuery,
    ]);


  /*
   * ==================================================
   * STATISTICS
   * ==================================================
   */

  const totalPermissions =
    permissions.length;


  const assignedPermissions =
    permissions.filter(
      (permission) =>
        (permission._count
          ?.rolePermissions || 0) > 0
    ).length;


  const totalAssignments =
    permissions.reduce(
      (total, permission) =>
        total +
        (
          permission._count
            ?.rolePermissions || 0
        ),
      0
    );


  const unusedPermissions =
    permissions.filter(
      (permission) =>
        (
          permission._count
            ?.rolePermissions || 0
        ) === 0
    ).length;


  /*
   * ==================================================
   * REFRESH
   * ==================================================
   */

  function handleRefresh() {

    if (isRefreshing) {
      return;
    }

    loadPermissions({
      refresh: true,
    });

  }


  /*
   * ==================================================
   * OPEN CREATE FORM
   * ==================================================
   */

  function openCreateForm() {

    setEditingPermission(null);

    setFormData({
      name: "",
      description: "",
    });

    setFormErrors({});

    setError(null);

    setIsFormOpen(true);
  }


  /*
   * ==================================================
   * OPEN EDIT FORM
   * ==================================================
   */

  function openEditForm(permission) {

    setEditingPermission(permission);

    setFormData({
      name:
        permission.name || "",

      description:
        permission.description || "",
    });

    setFormErrors({});

    setError(null);

    setIsFormOpen(true);
  }


  /*
   * ==================================================
   * CLOSE FORM
   * ==================================================
   */

  function closeForm() {

    if (isSubmitting) {
      return;
    }

    setIsFormOpen(false);

    setEditingPermission(null);

    setFormData({
      name: "",
      description: "",
    });

    setFormErrors({});
  }


  /*
   * ==================================================
   * FORM CHANGE
   * ==================================================
   */

  function handleFormChange(event) {

    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );


    /*
     * Clear field-specific
     * validation error as the
     * user corrects it.
     */

    setFormErrors(
      (previous) => ({
        ...previous,
        [name]: undefined,
      })
    );

  }


  /*
   * ==================================================
   * VALIDATE FORM
   * ==================================================
   */

  function validateForm() {

    const errors = {};

    const name =
      formData.name.trim();

    const description =
      formData.description.trim();


    /*
     * NAME
     */

    if (!name) {

      errors.name =
        "Permission name is required.";

    } else if (name.length < 3) {

      errors.name =
        "Permission name must be at least 3 characters.";

    } else if (name.length > 100) {

      errors.name =
        "Permission name must not exceed 100 characters.";

    } else if (
      !PERMISSION_NAME_REGEX.test(name)
    ) {

      errors.name =
        "Use lowercase letters, numbers and dots only. Example: users.read.";

    }


    /*
     * DESCRIPTION
     */

    if (description.length > 255) {

      errors.description =
        "Description must not exceed 255 characters.";

    }


    setFormErrors(errors);

    return (
      Object.keys(errors).length === 0
    );
  }


  /*
   * ==================================================
   * SUBMIT FORM
   * ==================================================
   */

  async function handleSubmit(event) {

    event.preventDefault();


    const isValid =
      validateForm();


    if (!isValid) {
      return;
    }


    try {

      setIsSubmitting(true);

      setError(null);

      const name =
        formData.name.trim();

      const description =
        formData.description.trim();


      /*
       * CREATE
       */

      if (!editingPermission) {

        const response =
          await createPermission({
            name,
            description:
              description || undefined,
          });


        const createdPermission =
          response?.data;


        /*
         * Add new permission
         * directly to the list.
         */

        if (createdPermission) {

          setPermissions(
            (previous) =>
              [
                ...previous,
                {
                  ...createdPermission,

                  _count:
                    createdPermission._count ||
                    {
                      rolePermissions: 0,
                    },
                },
              ].sort(
                (a, b) =>
                  a.name.localeCompare(
                    b.name
                  )
              )
          );

        } else {

          await loadPermissions();
        }


        setSuccessMessage(
          "Permission created successfully."
        );

      }


      /*
       * UPDATE
       */

      else {

        const response =
          await updatePermission(
            editingPermission.id,
            {
              name,
              description:
                description || undefined,
            }
          );


        const updatedPermission =
          response?.data;


        setPermissions(
          (previous) =>
            previous.map(
              (permission) =>
                permission.id ===
                editingPermission.id
                  ? {
                      ...permission,
                      ...(updatedPermission ||
                        {
                          name,
                          description:
                            description ||
                            null,
                        }),
                    }
                  : permission
            )
        );


        setSuccessMessage(
          "Permission updated successfully."
        );

      }


      closeForm();

    } catch (err) {

      setError(
        err?.message ||
        (
          editingPermission
            ? "Unable to update permission."
            : "Unable to create permission."
        )
      );

    } finally {

      setIsSubmitting(false);

    }

  }


  /*
   * ==================================================
   * OPEN DELETE CONFIRMATION
   * ==================================================
   */

  function openDeleteConfirmation(
    permission
  ) {

    setPermissionToDelete(
      permission
    );

    setError(null);
  }


  /*
   * ==================================================
   * CLOSE DELETE CONFIRMATION
   * ==================================================
   */

  function closeDeleteConfirmation() {

    if (isDeleting) {
      return;
    }

    setPermissionToDelete(null);
  }


  /*
   * ==================================================
   * DELETE PERMISSION
   * ==================================================
   */

  async function handleDelete() {

    if (!permissionToDelete) {
      return;
    }


    try {

      setIsDeleting(true);

      setError(null);


      await deletePermission(
        permissionToDelete.id
      );


      setPermissions(
        (previous) =>
          previous.filter(
            (permission) =>
              permission.id !==
              permissionToDelete.id
          )
      );


      setSuccessMessage(
        `Permission "${permissionToDelete.name}" deleted successfully.`
      );


      setPermissionToDelete(null);

    } catch (err) {

      setError(
        err?.message ||
        "Unable to delete permission."
      );

    } finally {

      setIsDeleting(false);

    }

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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600/10 text-purple-500">

              <KeyRound
                size={22}
                strokeWidth={1.8}
              />

            </div>


            <div>

              <h1 className="text-xl font-semibold text-[var(--bms-text)]">
                Permissions
              </h1>

              <p className="mt-1 text-sm text-[var(--bms-text-secondary)]">
                Manage system permissions and access capabilities.
              </p>

            </div>

          </div>

        </div>


        <div className="flex items-center gap-2">


          {/* REFRESH */}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh permissions"
            aria-label="Refresh permissions"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface)] text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)] disabled:cursor-not-allowed disabled:opacity-50"
          >

            <RefreshCw
              size={17}
              className={
                isRefreshing
                  ? "animate-spin"
                  : ""
              }
            />

          </button>


          {/* CREATE */}

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-[0.98]"
          >

            <Plus
              size={18}
            />

            Create Permission

          </button>

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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={KeyRound}
          label="Total Permissions"
          value={totalPermissions}
        />

        <StatCard
          icon={Users}
          label="Assigned Permissions"
          value={assignedPermissions}
        />

        <StatCard
          icon={Users}
          label="Role Assignments"
          value={totalAssignments}
        />

        <StatCard
          icon={KeyRound}
          label="Unused Permissions"
          value={unusedPermissions}
        />

      </div>


      {/* =========================================
          PERMISSIONS TABLE
      ========================================== */}

      <div className="overflow-hidden rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">


        {/* TABLE HEADER */}

        <div className="border-b border-[var(--bms-border)] px-5 py-4">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h2 className="text-sm font-semibold text-[var(--bms-text)]">
                System Permissions
              </h2>

              <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                Permissions define what actions users and roles can perform.
              </p>

            </div>


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
            LOADING
        ========================================== */}

        {isLoading ? (

          <div className="space-y-3 p-5">

            {[1, 2, 3, 4, 5].map(
              (item) => (

                <div
                  key={item}
                  className="h-16 animate-pulse rounded-lg bg-[var(--bms-surface-soft)]"
                />

              )
            )}

          </div>

        ) : filteredPermissions.length === 0 ? (

            <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">

            <KeyRound
              size={34}
              className="text-[var(--bms-text-muted)]"
            />

            <h3 className="mt-3 text-sm font-semibold text-[var(--bms-text)]">

              {searchQuery
                ? "No permissions found"
                : "No permissions configured"}

            </h3>

            <p className="mt-1 max-w-sm text-xs text-[var(--bms-text-secondary)]">

              {searchQuery
                ? "Try another search term."
                : "There are currently no permissions configured in the system."}

            </p>

            {!searchQuery && (

              <button
                type="button"
                onClick={openCreateForm}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
              >

                <Plus
                  size={15}
                />

                Create Permission

              </button>

            )}

          </div>

       ) : (

            <div className="overflow-x-auto">

            <table className="w-full min-w-[850px]">

              <thead>

                <tr className="border-b border-[var(--bms-border)] bg-[var(--bms-surface-soft)]">

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                    Permission
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                    Description
                  </th>

                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                    Roles
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                    Created
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredPermissions.map(
                  (permission) => (

                    <tr
                      key={permission.id}
                      className="border-b border-[var(--bms-border)] last:border-0 transition-colors hover:bg-[var(--bms-surface-soft)]"
                    >


                      {/* PERMISSION */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">

                            <KeyRound
                              size={18}
                            />

                          </div>


                          <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-[var(--bms-text)]">
                              {permission.name}
                            </p>

                            <p className="mt-0.5 text-[10px] text-[var(--bms-text-muted)]">
                              Permission
                            </p>

                          </div>

                        </div>

                      </td>


                      {/* DESCRIPTION */}

                      <td className="max-w-sm px-5 py-4">

                        <p className="truncate text-sm text-[var(--bms-text-secondary)]">

                          {permission.description ||
                            "No description provided."}

                        </p>

                      </td>


                      {/* ROLES */}

                      <td className="px-5 py-4 text-center">

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-500">

                          <Users
                            size={13}
                          />

                          {permission._count
                            ?.rolePermissions ||
                            0}

                        </span>

                      </td>


                      {/* CREATED */}

                      <td className="px-5 py-4">

                        <span className="text-sm text-[var(--bms-text-secondary)]">

                          {formatDate(
                            permission.createdAt
                          )}

                        </span>

                      </td>


                      {/* ACTIONS */}

                      <td className="px-5 py-4">

                        <div className="flex items-center justify-end gap-1">


                          {/* VIEW */}

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/permissions/${permission.id}`
                              )
                            }
                            title={`View ${permission.name}`}
                            aria-label={`View ${permission.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--bms-text-secondary)] transition hover:bg-blue-500/10 hover:text-blue-500"
                          >

                            <Eye
                              size={17}
                            />

                          </button>


                          {/* EDIT */}

                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(
                                permission
                              )
                            }
                            title={`Edit ${permission.name}`}
                            aria-label={`Edit ${permission.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--bms-text-secondary)] transition hover:bg-blue-500/10 hover:text-blue-500"
                          >

                            <Pencil
                              size={17}
                            />

                          </button>


                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() =>
                              openDeleteConfirmation(
                                permission
                              )
                            }
                            title={`Delete ${permission.name}`}
                            aria-label={`Delete ${permission.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--bms-text-secondary)] transition hover:bg-red-500/10 hover:text-red-500"
                          >

                            <Trash2
                              size={17}
                            />

                          </button>


                          {/* MORE */}

                          <button
                            type="button"
                            title="More actions"
                            aria-label="More actions"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--bms-text-muted)] transition hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)]"
                          >

                            <MoreHorizontal
                              size={17}
                            />

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =========================================
          CREATE / EDIT MODAL
      ========================================== */}

      {isFormOpen && (

        <PermissionFormModal
          isEditing={
            Boolean(editingPermission)
          }

          formData={formData}

          formErrors={formErrors}

          isSubmitting={isSubmitting}

          onChange={handleFormChange}

          onSubmit={handleSubmit}

          onClose={closeForm}
        />

      )}


      {/* =========================================
          DELETE MODAL
      ========================================== */}

      {permissionToDelete && (

        <DeletePermissionModal
          permission={
            permissionToDelete
          }

          isDeleting={isDeleting}

          onConfirm={handleDelete}

          onClose={
            closeDeleteConfirmation
          }
        />

      )}

    </div>
  );
}


/*
 * ==================================================
 * PERMISSION FORM MODAL
 * ==================================================
 */

function PermissionFormModal({
  isEditing,
  formData,
  formErrors,
  isSubmitting,
  onChange,
  onSubmit,
  onClose,
}) {

  const hasNameError =
    Boolean(formErrors.name);

  const hasDescriptionError =
    Boolean(formErrors.description);


  return (

    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="permission-form-title"
    >

      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-2xl">


        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-[var(--bms-border)] px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/10 text-purple-500">

              <KeyRound
                size={19}
              />

            </div>

            <div>

              <h2
                id="permission-form-title"
                className="text-sm font-semibold text-[var(--bms-text)]"
              >
                {isEditing
                  ? "Edit Permission"
                  : "Create Permission"}
              </h2>

              <p className="mt-0.5 text-xs text-[var(--bms-text-muted)]">
                {isEditing
                  ? "Update this permission's details."
                  : "Add a new system permission."}
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)] disabled:opacity-50"
            aria-label="Close"
          >

            <X
              size={18}
            />

          </button>

        </div>


        {/* FORM */}

        <form
          onSubmit={onSubmit}
          noValidate
          className="space-y-5 p-5"
        >


          {/* NAME */}

          <div>

            <label
              htmlFor="permission-name"
              className="mb-2 block text-xs font-semibold text-[var(--bms-text)]"
            >
              Permission Name
            </label>

            <input
              id="permission-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={onChange}
              placeholder="users.read"
              autoComplete="off"
              disabled={isSubmitting}
              aria-invalid={hasNameError}
              aria-describedby={
                hasNameError
                  ? "permission-name-error"
                  : "permission-name-help"
              }
              className={`h-11 w-full rounded-lg border bg-[var(--bms-surface-soft)] px-3 text-sm text-[var(--bms-text)] outline-none transition placeholder:text-[var(--bms-text-muted)] disabled:cursor-not-allowed disabled:opacity-60 ${
                hasNameError
                  ? "border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.12),0_0_18px_rgba(239,68,68,0.16)] focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                  : "border-[var(--bms-border)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              }`}
            />

            {hasNameError ? (

              <p
                id="permission-name-error"
                className="mt-2 text-xs text-red-500"
              >
                {formErrors.name}
              </p>

            ) : (

              <p
                id="permission-name-help"
                className="mt-2 text-[11px] text-[var(--bms-text-muted)]"
              >
                Use lowercase letters, numbers and dots. Example: users.read
              </p>

            )}

          </div>


          {/* DESCRIPTION */}

          <div>

            <div className="mb-2 flex items-center justify-between">

              <label
                htmlFor="permission-description"
                className="text-xs font-semibold text-[var(--bms-text)]"
              >
                Description
              </label>

              <span className="text-[10px] text-[var(--bms-text-muted)]">
                {formData.description.length}/255
              </span>

            </div>

            <textarea
              id="permission-description"
              name="description"
              value={formData.description}
              onChange={onChange}
              placeholder="Describe what this permission allows."
              rows={4}
              disabled={isSubmitting}
              aria-invalid={
                hasDescriptionError
              }
              aria-describedby={
                hasDescriptionError
                  ? "permission-description-error"
                  : undefined
              }
              className={`w-full resize-none rounded-lg border bg-[var(--bms-surface-soft)] px-3 py-3 text-sm text-[var(--bms-text)] outline-none transition placeholder:text-[var(--bms-text-muted)] disabled:cursor-not-allowed disabled:opacity-60 ${
                hasDescriptionError
                  ? "border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.12),0_0_18px_rgba(239,68,68,0.16)] focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                  : "border-[var(--bms-border)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              }`}
            />

            {hasDescriptionError && (

              <p
                id="permission-description-error"
                className="mt-2 text-xs text-red-500"
              >
                {formErrors.description}
              </p>

            )}

          </div>


          {/* ACTIONS */}

          <div className="flex flex-col-reverse gap-2 border-t border-[var(--bms-border)] pt-5 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-[var(--bms-border)] px-4 py-2.5 text-sm font-medium text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {isSubmitting ? (

                <Loader2
                  size={16}
                  className="animate-spin"
                />

              ) : (

                <Check
                  size={16}
                />

              )}

              {isSubmitting
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                  ? "Save Changes"
                  : "Create Permission"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


/*
 * ==================================================
 * DELETE MODAL
 * ==================================================
 */

function DeletePermissionModal({
  permission,
  isDeleting,
  onConfirm,
  onClose,
}) {

  const assignedRoles =
    permission._count
      ?.rolePermissions || 0;


  return (

    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-permission-title"
    >

      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-2xl">


        {/* HEADER */}

        <div className="border-b border-[var(--bms-border)] px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-500">

              <Trash2
                size={19}
              />

            </div>

            <div>

              <h2
                id="delete-permission-title"
                className="text-sm font-semibold text-[var(--bms-text)]"
              >
                Delete Permission
              </h2>

              <p className="mt-0.5 text-xs text-[var(--bms-text-muted)]">
                This action cannot be undone.
              </p>

            </div>

          </div>

        </div>


        {/* BODY */}

        <div className="px-5 py-5">

          <p className="text-sm leading-6 text-[var(--bms-text-secondary)]">

            Are you sure you want to delete{" "}

            <span className="font-semibold text-[var(--bms-text)]">
              {permission.name}
            </span>
            ?

          </p>


          {assignedRoles > 0 ? (

            <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">

              <div className="flex gap-2">

                <X
                  size={16}
                  className="mt-0.5 shrink-0 text-amber-500"
                />

                <p className="text-xs leading-5 text-amber-500">

                  This permission is currently assigned to{" "}
                  <strong>
                    {assignedRoles}
                  </strong>{" "}
                  role{assignedRoles === 1 ? "" : "s"}.
                  The server will prevent deletion until it is
                  removed from those roles.

                </p>

              </div>

            </div>

          ) : (

            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3">

              <p className="text-xs leading-5 text-red-500">
                Deleting this permission will permanently remove it from the system.
              </p>

            </div>

          )}

        </div>


        {/* ACTIONS */}

        <div className="flex flex-col-reverse gap-2 border-t border-[var(--bms-border)] px-5 py-4 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg border border-[var(--bms-border)] px-4 py-2.5 text-sm font-medium text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)] disabled:opacity-50"
          >
            Cancel
          </button>


          <button
            type="button"
            onClick={onConfirm}
            disabled={
              isDeleting ||
              assignedRoles > 0
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {isDeleting ? (

              <Loader2
                size={16}
                className="animate-spin"
              />

            ) : (

              <Trash2
                size={16}
              />

            )}

            {isDeleting
              ? "Deleting..."
              : "Delete Permission"}

          </button>

        </div>

      </div>

    </div>
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

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/10 text-purple-500">

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
 * DATE FORMATTER
 * ==================================================
 */

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

  return new Intl.DateTimeFormat(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(date);
}


export default Permissions;
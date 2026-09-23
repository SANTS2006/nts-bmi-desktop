import {
  ShieldCheck,
  Users,
  KeyRound,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  X,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../api/roles";


function Roles() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [searchQuery, setSearchQuery] =
    useState("");

  /*
   * ==================================================
   * CREATE MODAL
   * ==================================================
   */

  const [isCreateOpen, setIsCreateOpen] =
    useState(false);

  const [createForm, setCreateForm] =
    useState({
      name: "",
      description: "",
    });

  const [createErrors, setCreateErrors] =
    useState({});

  const [isCreating, setIsCreating] =
    useState(false);


  /*
   * ==================================================
   * EDIT MODAL
   * ==================================================
   */

  const [isEditOpen, setIsEditOpen] =
    useState(false);

  const [editingRole, setEditingRole] =
    useState(null);

  const [editForm, setEditForm] =
    useState({
      name: "",
      description: "",
    });

  const [editErrors, setEditErrors] =
    useState({});

  const [isUpdating, setIsUpdating] =
    useState(false);


  /*
   * ==================================================
   * DELETE MODAL
   * ==================================================
   */

  const [isDeleteOpen, setIsDeleteOpen] =
    useState(false);

  const [deletingRole, setDeletingRole] =
    useState(null);

  const [isDeleting, setIsDeleting] =
    useState(false);


  /*
   * ==================================================
   * VIEW ROLE
   * ==================================================
   */

  const [viewingRole, setViewingRole] =
    useState(null);


  /*
   * ==================================================
   * FEEDBACK
   * ==================================================
   */

  const [successMessage, setSuccessMessage] =
    useState(null);


  /*
   * ==================================================
   * LOAD ROLES
   * ==================================================
   */

  const loadRoles = useCallback(
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
          await getRoles();

        setRoles(
          response?.data || []
        );
      } catch (err) {
        setError(
          err?.message ||
          "Unable to load roles."
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );


  useEffect(() => {
    loadRoles();
  }, [loadRoles]);


  /*
   * ==================================================
   * AUTO CLEAR SUCCESS MESSAGE
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
   * FILTER ROLES
   * ==================================================
   */

  const filteredRoles =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      if (!query) {
        return roles;
      }

      return roles.filter(
        (role) =>
          role.name
            ?.toLowerCase()
            .includes(query) ||
          role.description
            ?.toLowerCase()
            .includes(query)
      );
    }, [
      roles,
      searchQuery,
    ]);


  /*
   * ==================================================
   * STATISTICS
   * ==================================================
   */

  const totalUsers =
    roles.reduce(
      (total, role) =>
        total +
        (role._count?.userRoles || 0),
      0
    );


  const totalPermissions =
    roles.reduce(
      (total, role) =>
        total +
        (role._count?.rolePermissions || 0),
      0
    );


  const assignedRoles =
    roles.filter(
      (role) =>
        (role._count?.userRoles || 0) > 0
    ).length;


  /*
   * ==================================================
   * CREATE VALIDATION
   * ==================================================
   */

  function validateRoleForm(form) {
    const errors = {};

    const name =
      form.name.trim();

    const description =
      form.description.trim();


    if (!name) {
      errors.name =
        "Role name is required.";
    } else if (name.length < 2) {
      errors.name =
        "Role name must be at least 2 characters.";
    } else if (name.length > 50) {
      errors.name =
        "Role name must not exceed 50 characters.";
    } else if (
      !/^[a-zA-Z0-9 _-]+$/.test(name)
    ) {
      errors.name =
        "Role name contains invalid characters.";
    }


    if (description.length > 255) {
      errors.description =
        "Description must not exceed 255 characters.";
    }

    return errors;
  }


  /*
   * ==================================================
   * CREATE ROLE
   * ==================================================
   */

  async function handleCreateRole(event) {
    event.preventDefault();

    const errors =
      validateRoleForm(createForm);

    setCreateErrors(errors);

    if (
      Object.keys(errors).length > 0
    ) {
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      await createRole({
        name:
          createForm.name.trim(),

        description:
          createForm.description.trim(),
      });

      setIsCreateOpen(false);

      setCreateForm({
        name: "",
        description: "",
      });

      setCreateErrors({});

      setSuccessMessage(
        "Role created successfully."
      );

      await loadRoles({
        refresh: true,
      });
    } catch (err) {
      setCreateErrors({
        form:
          err?.message ||
          "Unable to create role.",
      });
    } finally {
      setIsCreating(false);
    }
  }


  /*
   * ==================================================
   * OPEN EDIT
   * ==================================================
   */

  function openEditModal(role) {
    setEditingRole(role);

    setEditForm({
      name:
        role.name || "",

      description:
        role.description || "",
    });

    setEditErrors({});

    setIsEditOpen(true);
  }


  /*
   * ==================================================
   * UPDATE ROLE
   * ==================================================
   */

  async function handleUpdateRole(event) {
    event.preventDefault();

    const errors =
      validateRoleForm(editForm);

    /*
     * ADMIN role name cannot be changed.
     */

    if (
      editingRole?.name === "ADMIN" &&
      editForm.name
        .trim()
        .toUpperCase() !== "ADMIN"
    ) {
      errors.name =
        "The ADMIN role name cannot be changed.";
    }

    setEditErrors(errors);

    if (
      Object.keys(errors).length > 0
    ) {
      return;
    }

    try {
      setIsUpdating(true);

      setError(null);

      await updateRole(
        editingRole.id,
        {
          name:
            editForm.name.trim(),

          description:
            editForm.description.trim(),
        }
      );

      setIsEditOpen(false);

      setEditingRole(null);

      setEditErrors({});

      setSuccessMessage(
        "Role updated successfully."
      );

      await loadRoles({
        refresh: true,
      });
    } catch (err) {
      setEditErrors({
        form:
          err?.message ||
          "Unable to update role.",
      });
    } finally {
      setIsUpdating(false);
    }
  }


  /*
   * ==================================================
   * OPEN DELETE
   * ==================================================
   */

  function openDeleteModal(role) {
    setDeletingRole(role);

    setIsDeleteOpen(true);
  }


  /*
   * ==================================================
   * DELETE ROLE
   * ==================================================
   */

  async function handleDeleteRole() {
    if (!deletingRole) {
      return;
    }

    try {
      setIsDeleting(true);

      setError(null);

      await deleteRole(
        deletingRole.id
      );

      setIsDeleteOpen(false);

      setDeletingRole(null);

      setSuccessMessage(
        "Role deleted successfully."
      );

      await loadRoles({
        refresh: true,
      });
    } catch (err) {
      setError(
        err?.message ||
        "Unable to delete role."
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

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-500">

              <ShieldCheck
                size={22}
                strokeWidth={1.8}
              />

            </div>

            <div>

              <h1 className="text-xl font-semibold text-[var(--bms-text)]">
                Roles & Permissions
              </h1>

              <p className="mt-1 text-sm text-[var(--bms-text-secondary)]">
                Manage system roles and their permissions.
              </p>

            </div>

          </div>

        </div>


        <button
          type="button"
          onClick={() =>
            setIsCreateOpen(true)
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-[0.98]"
        >

          <Plus size={18} />

          Create Role

        </button>

      </div>


      {/* =========================================
          FEEDBACK
      ========================================== */}

      {successMessage && (

        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-500">

          <CheckCircle2
            size={18}
          />

          <span>
            {successMessage}
          </span>

        </div>

      )}


      {error && (

        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">

          <AlertTriangle
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
          icon={ShieldCheck}
          label="Total Roles"
          value={roles.length}
        />

        <StatCard
          icon={Users}
          label="Assigned Roles"
          value={assignedRoles}
        />

        <StatCard
          icon={Users}
          label="Users Assigned"
          value={totalUsers}
        />

        <StatCard
          icon={KeyRound}
          label="Permission Assignments"
          value={totalPermissions}
        />

      </div>


      {/* =========================================
          ROLES TABLE
      ========================================== */}

      <div className="overflow-hidden rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

        {/* Toolbar */}

        <div className="border-b border-[var(--bms-border)] px-5 py-4">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h2 className="text-sm font-semibold text-[var(--bms-text)]">
                System Roles
              </h2>

              <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                Roles configured for the NTS Business Management System.
              </p>

            </div>


            <div className="flex flex-col gap-2 sm:flex-row">

              {/* Search */}

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
                  placeholder="Search roles..."
                  aria-label="Search roles"
                  className="h-10 w-full rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] pl-9 pr-3 text-sm text-[var(--bms-text)] outline-none transition placeholder:text-[var(--bms-text-muted)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 sm:w-64"
                />

              </div>


              {/* Refresh */}

              <button
                type="button"
                onClick={() =>
                  loadRoles({
                    refresh: true,
                  })
                }
                disabled={isRefreshing}
                title="Refresh roles"
                aria-label="Refresh roles"
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-3 text-sm text-[var(--bms-text-secondary)] transition hover:text-[var(--bms-text)] disabled:cursor-not-allowed disabled:opacity-60"
              >

                <RefreshCw
                  size={17}
                  className={
                    isRefreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                <span className="hidden sm:inline">
                  Refresh
                </span>

              </button>

            </div>

          </div>

        </div>


        {/* Table */}

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

        ) : filteredRoles.length === 0 ? (

          <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">

            <ShieldCheck
              size={34}
              className="text-[var(--bms-text-muted)]"
            />

            <h3 className="mt-3 text-sm font-semibold text-[var(--bms-text)]">

              {searchQuery
                ? "No matching roles"
                : "No roles found"}

            </h3>

            <p className="mt-1 max-w-sm text-xs text-[var(--bms-text-secondary)]">

              {searchQuery
                ? "Try another search term."
                : "There are currently no roles configured in the system."}

            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[820px]">

              <thead>

                <tr className="border-b border-[var(--bms-border)] bg-[var(--bms-surface-soft)]">

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                    Role
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                    Description
                  </th>

                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                    Users
                  </th>

                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                    Permissions
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredRoles.map(
                  (role) => (

                    <tr
                      key={role.id}
                      className="border-b border-[var(--bms-border)] last:border-0 transition-colors hover:bg-[var(--bms-surface-soft)]"
                    >

                      {/* Role */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10 text-blue-500">

                            <ShieldCheck
                              size={18}
                            />

                          </div>

                          <div>

                            <p className="text-sm font-semibold text-[var(--bms-text)]">
                              {role.name}
                            </p>

                            {role.name ===
                              "ADMIN" && (

                              <span className="mt-1 inline-flex rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-500">
                                System Role
                              </span>

                            )}

                          </div>

                        </div>

                      </td>


                      {/* Description */}

                      <td className="max-w-xs px-5 py-4">

                        <p className="truncate text-sm text-[var(--bms-text-secondary)]">
                          {role.description ||
                            "No description provided."}
                        </p>

                      </td>


                      {/* Users */}

                      <td className="px-5 py-4 text-center">

                        <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-500">

                          {role._count?.userRoles ||
                            0}

                        </span>

                      </td>


                      {/* Permissions */}

                      <td className="px-5 py-4 text-center">

                        <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-purple-500/10 px-2 py-1 text-xs font-semibold text-purple-500">

                          {role._count?.rolePermissions ||
                            0}

                        </span>

                      </td>


                      {/* Actions */}

                      <td className="px-5 py-4">

                        <div className="flex items-center justify-end gap-1">

                          <button
                            type="button"
                            onClick={() =>
                                navigate(`/roles/${role.id}`)
                            }
                            title={`View ${role.name}`}
                            aria-label={`View ${role.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--bms-text-secondary)] transition hover:bg-blue-500/10 hover:text-blue-500"
                          >

                            <Eye size={17} />

                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                role
                              )
                            }
                            title={`Edit ${role.name}`}
                            aria-label={`Edit ${role.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--bms-text-secondary)] transition hover:bg-blue-500/10 hover:text-blue-500"
                          >

                            <Pencil
                              size={17}
                            />

                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              openDeleteModal(
                                role
                              )
                            }
                            title={`Delete ${role.name}`}
                            aria-label={`Delete ${role.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--bms-text-secondary)] transition hover:bg-red-500/10 hover:text-red-500"
                          >

                            <Trash2
                              size={17}
                            />

                          </button>


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
          CREATE ROLE MODAL
      ========================================== */}

      {isCreateOpen && (

        <Modal
          title="Create Role"
          description="Create a new role for the NTS Business Management System."
          onClose={() => {
            if (!isCreating) {
              setIsCreateOpen(false);
              setCreateErrors({});
            }
          }}
        >

          <RoleForm
            form={createForm}
            setForm={setCreateForm}
            errors={createErrors}
            setErrors={setCreateErrors}
            onSubmit={handleCreateRole}
            onCancel={() =>
              setIsCreateOpen(false)
            }
            isSubmitting={isCreating}
            submitLabel="Create Role"
          />

        </Modal>

      )}


      {/* =========================================
          EDIT ROLE MODAL
      ========================================== */}

      {isEditOpen && editingRole && (

        <Modal
          title="Edit Role"
          description={`Update the ${editingRole.name} role.`}
          onClose={() => {
            if (!isUpdating) {
              setIsEditOpen(false);
              setEditingRole(null);
              setEditErrors({});
            }
          }}
        >

          <RoleForm
            form={editForm}
            setForm={setEditForm}
            errors={editErrors}
            setErrors={setEditErrors}
            onSubmit={handleUpdateRole}
            onCancel={() => {
              setIsEditOpen(false);
              setEditingRole(null);
              setEditErrors({});
            }}
            isSubmitting={isUpdating}
            submitLabel="Save Changes"
            isEditing
            isAdmin={
              editingRole.name ===
              "ADMIN"
            }
          />

        </Modal>

      )}


      {/* =========================================
          DELETE MODAL
      ========================================== */}

      {isDeleteOpen &&
        deletingRole && (

          <Modal
            title="Delete Role"
            description="This action cannot be undone."
            onClose={() => {
              if (!isDeleting) {
                setIsDeleteOpen(false);
                setDeletingRole(null);
              }
            }}
          >

            <div className="space-y-5">

              <div className="flex items-start gap-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">

                  <AlertTriangle
                    size={20}
                  />

                </div>

                <div>

                  <h3 className="text-sm font-semibold text-[var(--bms-text)]">
                    Delete "{deletingRole.name}"?
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-[var(--bms-text-secondary)]">
                    The role and its permission assignments will be permanently removed.
                  </p>

                </div>

              </div>


              {deletingRole._count?.userRoles >
                0 && (

                <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-500">

                  This role currently has{" "}
                  <strong>
                    {deletingRole._count.userRoles}
                  </strong>{" "}
                  assigned user(s), so it cannot be deleted.

                </div>

              )}


              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => {
                    setIsDeleteOpen(false);
                    setDeletingRole(null);
                  }}
                  className="rounded-lg border border-[var(--bms-border)] px-4 py-2.5 text-sm font-medium text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)] disabled:opacity-50"
                >
                  Cancel
                </button>


                <button
                  type="button"
                  disabled={
                    isDeleting ||
                    deletingRole.name ===
                      "ADMIN" ||
                    deletingRole._count
                      ?.userRoles > 0
                  }
                  onClick={handleDeleteRole}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {isDeleting && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {isDeleting
                    ? "Deleting..."
                    : "Delete Role"}

                </button>

              </div>

            </div>

          </Modal>

        )}


      {/* =========================================
          VIEW ROLE MODAL
      ========================================== */}

      {viewingRole && (

        <Modal
          title={viewingRole.name}
          description="Role information and access summary."
          onClose={() =>
            setViewingRole(null)
          }
        >

          <div className="space-y-5">

            <div className="grid gap-4 sm:grid-cols-2">

              <InfoCard
                icon={Users}
                label="Assigned Users"
                value={
                  viewingRole._count
                    ?.userRoles || 0
                }
              />

              <InfoCard
                icon={KeyRound}
                label="Permissions"
                value={
                  viewingRole._count
                    ?.rolePermissions || 0
                }
              />

            </div>


            <div>

              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                Description
              </p>

              <p className="mt-2 text-sm leading-6 text-[var(--bms-text-secondary)]">
                {viewingRole.description ||
                  "No description provided."}
              </p>

            </div>


            <div className="flex justify-end">

              <button
                type="button"
                onClick={() =>
                  setViewingRole(null)
                }
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Close
              </button>

            </div>

          </div>

        </Modal>

      )}

    </div>
  );
}


/*
 * ==================================================
 * ROLE FORM
 * ==================================================
 */

function RoleForm({
  form,
  setForm,
  errors,
  setErrors,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
  isAdmin = false,
}) {
  function handleChange(
    field,
    value
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    /*
     * Remove the field error as soon
     * as the user starts correcting it.
     */

    if (errors[field]) {
      setErrors((previous) => ({
        ...previous,
        [field]: undefined,
        form: undefined,
      }));
    }
  }


  const nameInvalid =
    Boolean(errors.name);

  const descriptionInvalid =
    Boolean(errors.description);


  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-5"
    >

      {errors.form && (

        <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">

          <AlertTriangle
            size={17}
            className="mt-0.5 shrink-0"
          />

          <span>
            {errors.form}
          </span>

        </div>

      )}


      {/* Role name */}

      <div>

        <label
          htmlFor="role-name"
          className="mb-2 block text-sm font-medium text-[var(--bms-text)]"
        >
          Role Name
        </label>

        <input
          id="role-name"
          type="text"
          value={form.name}
          disabled={isSubmitting || isAdmin}
          onChange={(event) =>
            handleChange(
              "name",
              event.target.value
            )
          }
          placeholder="e.g. HR_MANAGER"
          aria-invalid={nameInvalid}
          aria-describedby={
            nameInvalid
              ? "role-name-error"
              : undefined
          }
          className={`w-full rounded-lg border bg-[var(--bms-surface-soft)] px-3.5 py-3 text-sm text-[var(--bms-text)] outline-none transition-all placeholder:text-[var(--bms-text-muted)] ${
            nameInvalid
              ? "border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.12),0_0_18px_rgba(239,68,68,0.15)] focus:border-red-500"
              : "border-[var(--bms-border)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        />


        {isAdmin && (

          <p className="mt-1.5 text-xs text-[var(--bms-text-muted)]">
            The ADMIN role name is protected.
          </p>

        )}


        {nameInvalid && (

          <p
            id="role-name-error"
            className="mt-1.5 text-xs font-medium text-red-500"
          >
            {errors.name}
          </p>

        )}

      </div>


      {/* Description */}

      <div>

        <label
          htmlFor="role-description"
          className="mb-2 block text-sm font-medium text-[var(--bms-text)]"
        >
          Description
        </label>

        <textarea
          id="role-description"
          rows={4}
          value={form.description}
          disabled={isSubmitting}
          onChange={(event) =>
            handleChange(
              "description",
              event.target.value
            )
          }
          placeholder="Describe what this role is responsible for..."
          aria-invalid={
            descriptionInvalid
          }
          aria-describedby={
            descriptionInvalid
              ? "role-description-error"
              : undefined
          }
          className={`w-full resize-none rounded-lg border bg-[var(--bms-surface-soft)] px-3.5 py-3 text-sm text-[var(--bms-text)] outline-none transition-all placeholder:text-[var(--bms-text-muted)] ${
            descriptionInvalid
              ? "border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.12),0_0_18px_rgba(239,68,68,0.15)] focus:border-red-500"
              : "border-[var(--bms-border)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        />

        <div className="mt-1.5 flex items-center justify-between">

          {descriptionInvalid ? (

            <p
              id="role-description-error"
              className="text-xs font-medium text-red-500"
            >
              {errors.description}
            </p>

          ) : (

            <span />

          )}

          <span className="text-xs text-[var(--bms-text-muted)]">
            {form.description.length}/255
          </span>

        </div>

      </div>


      {/* Actions */}

      <div className="flex justify-end gap-3 border-t border-[var(--bms-border)] pt-5">

        <button
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
          className="rounded-lg border border-[var(--bms-border)] px-4 py-2.5 text-sm font-medium text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>


        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >

          {isSubmitting && (

            <Loader2
              size={17}
              className="animate-spin"
            />

          )}

          {isSubmitting
            ? "Saving..."
            : submitLabel}

        </button>

      </div>

    </form>
  );
}


/*
 * ==================================================
 * MODAL
 * ==================================================
 */

function Modal({
  title,
  description,
  children,
  onClose,
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >

      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <div className="flex items-start justify-between border-b border-[var(--bms-border)] px-5 py-4">

          <div>

            <h2
              id="modal-title"
              className="text-base font-semibold text-[var(--bms-text)]"
            >
              {title}
            </h2>

            {description && (

              <p className="mt-1 text-xs text-[var(--bms-text-secondary)]">
                {description}
              </p>

            )}

          </div>


          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)]"
          >

            <X size={18} />

          </button>

        </div>


        <div className="p-5">
          {children}
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
 * INFO CARD
 * ==================================================
 */

function InfoCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-4">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-xs text-[var(--bms-text-muted)]">
            {label}
          </p>

          <p className="mt-1 text-xl font-semibold text-[var(--bms-text)]">
            {value}
          </p>

        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10 text-blue-500">

          <Icon size={18} />

        </div>

      </div>

    </div>
  );
}


export default Roles;
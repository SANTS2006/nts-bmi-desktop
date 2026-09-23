import {
  ArrowLeft,
  Check,
  Clock3,
  Edit3,
  Mail,
  ShieldCheck,
  UserCheck,
  UserRound,
  UserX,
  X,
  Plus,
  Trash2,
  Loader2,
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
  getUserById,
  updateUser,
  updateUserStatus,
  getUserRoles,
  assignRoleToUser,
  removeRoleFromUser,
} from "../../api/users";

import {
  getRoles,
} from "../../api/roles";


function UserDetails() {

  const navigate =
    useNavigate();

  const { id } =
    useParams();


  /*
   * ==================================================
   * STATE
   * ==================================================
   */

  const [user, setUser] =
    useState(null);

  const [roles, setRoles] =
    useState([]);

  const [availableRoles, setAvailableRoles] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isLoadingRoles, setIsLoadingRoles] =
    useState(false);

  const [isLoadingAvailableRoles, setIsLoadingAvailableRoles] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [successMessage, setSuccessMessage] =
    useState(null);

  const [isEditing, setIsEditing] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isUpdatingStatus, setIsUpdatingStatus] =
    useState(false);

  const [isAssigningRole, setIsAssigningRole] =
    useState(false);

  const [removingRoleId, setRemovingRoleId] =
    useState(null);

  /*
   * ==================================================
   * REMOVE ROLE CONFIRMATION
   * ==================================================
   */
  const [roleToRemove, setRoleToRemove] =
    useState(null);

  const [showRemoveRoleConfirm, setShowRemoveRoleConfirm] =
    useState(false);

  const [showAssignRole, setShowAssignRole] =
    useState(false);

  const [selectedRoleId, setSelectedRoleId] =
    useState("");

  const [roleReason, setRoleReason] =
    useState("");

  const [roleError, setRoleError] =
    useState(null);


  const [form, setForm] =
    useState({
      firstName: "",
      lastName: "",
      email: "",
    });


  /*
   * ==================================================
   * LOAD USER
   * ==================================================
   */

  const loadUser =
    useCallback(
      async () => {

        try {

          setIsLoading(true);

          setError(null);

          const response =
            await getUserById(id);

          const data =
            response?.data;

          if (!data) {
            throw new Error(
              "User information could not be loaded."
            );
          }

          setUser(data);

          setForm({
            firstName:
              data.firstName || "",

            lastName:
              data.lastName || "",

            email:
              data.email || "",
          });

          /*
           * Some versions of the API already
           * return userRoles with the user.
           *
           * Use those immediately while we
           * also load the dedicated roles endpoint.
           */

          const initialRoles =
            Array.isArray(
              data.userRoles
            )
              ? data.userRoles
                  .map(
                    (userRole) =>
                      userRole?.role
                  )
                  .filter(Boolean)
              : [];

          setRoles(
            initialRoles
          );

        } catch (err) {

          console.error(
            "Failed to load user:",
            err
          );

          setError(
            err?.message ||
            "Unable to load user information."
          );

        } finally {

          setIsLoading(false);

        }

      },
      [id]
    );


  /*
   * ==================================================
   * LOAD USER ROLES
   * ==================================================
   */

//   const loadUserRoles =
//     useCallback(
//       async () => {

//         if (!id) {
//           return;
//         }

//         try {

//           setIsLoadingRoles(true);

//           const response =
//             await getUserRoles(id);

//           const data =
//             response?.data;

//           /*
//            * Expected:
//            *
//            * [
//            *   {
//            *     assignedAt,
//            *     role: {
//            *       id,
//            *       name,
//            *       description
//            *     }
//            *   }
//            * ]
//            */

//           const assignedRoles =
//             Array.isArray(data)
//               ? data
//                   .map(
//                     (item) =>
//                       item?.role
//                   )
//                   .filter(Boolean)
//               : [];

//           setRoles(
//             assignedRoles
//           );

//         } catch (err) {

//           console.error(
//             "Failed to load user roles:",
//             err
//           );

//           /*
//            * Do not destroy the entire
//            * user page if the dedicated
//            * roles request fails.
//            */

//         } finally {

//           setIsLoadingRoles(false);

//         }

//       },
//       [id]
//     );


  /*
   * ==================================================
   * LOAD AVAILABLE ROLES
   * ==================================================
   */

  const loadAvailableRoles =
    useCallback(
      async () => {

        try {

          setIsLoadingAvailableRoles(
            true
          );

          const response =
            await getRoles();

          const data =
            response?.data;

          setAvailableRoles(
            Array.isArray(data)
              ? data
              : []
          );

        } catch (err) {

          console.error(
            "Failed to load roles:",
            err
          );

          setRoleError(
            err?.message ||
            "Unable to load available roles."
          );

        } finally {

          setIsLoadingAvailableRoles(
            false
          );

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

    if (!id) {

      setError(
        "Invalid user ID."
      );

      setIsLoading(false);

      return;
    }

    loadUser();

    // loadUserRoles();

  }, [
    id,
    loadUser,
    // loadUserRoles,
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

        setSuccessMessage(
          null
        );

      }, 3500);

    return () => {

      clearTimeout(timer);

    };

  }, [
    successMessage,
  ]);


  /*
   * ==================================================
   * FORM CHANGE
   * ==================================================
   */

  function handleChange(
    event
  ) {

    const {
      name,
      value,
    } = event.target;

    setForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

  }


  /*
   * ==================================================
   * CANCEL EDIT
   * ==================================================
   */

  function handleCancelEdit() {

    if (!user) {
      return;
    }

    setForm({
      firstName:
        user.firstName || "",

      lastName:
        user.lastName || "",

      email:
        user.email || "",
    });

    setIsEditing(false);

    setError(null);

  }


  /*
   * ==================================================
   * SAVE USER
   * ==================================================
   */

  async function handleSaveUser(
    event
  ) {

    event.preventDefault();

    try {

      setIsSaving(true);

      setError(null);

      const response =
        await updateUser(
          id,
          {
            firstName:
              form.firstName
                .trim(),

            lastName:
              form.lastName
                .trim(),

            email:
              form.email
                .trim(),
          }
        );

      const updatedUser =
        response?.data;

      if (!updatedUser) {

        throw new Error(
          "The server returned an invalid user response."
        );

      }

      setUser(
        (previous) => ({
          ...updatedUser,

          userRoles:
            previous?.userRoles ||
            [],
        })
      );

      setForm({
        firstName:
          updatedUser.firstName ||
          "",

        lastName:
          updatedUser.lastName ||
          "",

        email:
          updatedUser.email ||
          "",
      });

      setIsEditing(false);

      setSuccessMessage(
        "User information updated successfully."
      );

    } catch (err) {

      console.error(
        "Failed to update user:",
        err
      );

      setError(
        err?.message ||
        "Unable to update user."
      );

    } finally {

      setIsSaving(false);

    }

  }


  /*
   * ==================================================
   * UPDATE STATUS
   * ==================================================
   */

  async function handleStatusChange(
    status
  ) {

    if (!user) {
      return;
    }

    if (
      user.status === status
    ) {
      return;
    }

    try {

      setIsUpdatingStatus(
        true
      );

      setError(null);

      const response =
        await updateUserStatus(
          id,
          status
        );

      const updatedUser =
        response?.data;

      if (!updatedUser) {

        throw new Error(
          "The server returned an invalid status response."
        );

      }

      setUser(
        (previous) => ({
          ...previous,

          ...updatedUser,

          userRoles:
            previous?.userRoles ||
            [],
        })
      );

      setSuccessMessage(
        "User status updated successfully."
      );

    } catch (err) {

      console.error(
        "Failed to update user status:",
        err
      );

      setError(
        err?.message ||
        "Unable to update user status."
      );

    } finally {

      setIsUpdatingStatus(
        false
      );

    }

  }


  /*
   * ==================================================
   * OPEN ASSIGN ROLE
   * ==================================================
   */

  async function handleOpenAssignRole() {

    setRoleError(null);

    setSelectedRoleId("");

    setRoleReason("");

    setShowAssignRole(true);

    /*
     * Load roles when the dialog
     * is opened so the list is fresh.
     */

    await loadAvailableRoles();

  }


  /*
   * ==================================================
   * CLOSE ASSIGN ROLE
   * ==================================================
   */

  function handleCloseAssignRole() {

    if (isAssigningRole) {
      return;
    }

    setShowAssignRole(false);

    setSelectedRoleId("");

    setRoleReason("");

    setRoleError(null);

  }


  /*
   * ==================================================
   * ASSIGN ROLE
   * ==================================================
   */

  async function handleAssignRole(event) {
  event.preventDefault();

  setRoleError(null);

  if (!selectedRoleId) {
    setRoleError("Please select a role.");
    return;
  }

  if (!roleReason.trim()) {
    setRoleError(
      "Please provide a reason for assigning this role."
    );
    return;
  }

  try {
    setIsAssigningRole(true);

    const response = await assignRoleToUser(
      id,
      {
        roleId: selectedRoleId,
        reason: roleReason.trim(),
      }
    );

    /*
     * The backend should return the newly
     * assigned role in response.data.role.
     */
    const assignedRole =
      response?.data?.role;

    /*
     * If the backend returns the role,
     * immediately add it to the local roles
     * state.
     */
    if (assignedRole) {
      setRoles((previousRoles) => {

        /*
         * Prevent duplicates in the UI.
         */
        const alreadyAssigned =
          previousRoles.some(
            (role) =>
              role.id === assignedRole.id
          );

        if (alreadyAssigned) {
          return previousRoles;
        }

        return [
          ...previousRoles,
          assignedRole,
        ];
      });
    }

    /*
     * Close the modal immediately.
     */
    setShowAssignRole(false);

    setSelectedRoleId("");

    setRoleReason("");

    setSuccessMessage(
      assignedRole
        ? `${assignedRole.name} role assigned successfully.`
        : "Role assigned successfully."
    );

  } catch (err) {

    console.error(
      "Failed to assign role:",
      err
    );

    setRoleError(
      err?.message ||
      "Unable to assign role."
    );

  } finally {

    setIsAssigningRole(false);

  }
}


  /*
   * ==================================================
   * OPEN REMOVE ROLE CONFIRMATION
   * ==================================================
   */

  function handleRemoveRole(role) {

    if (!role?.id) {
      return;
    }

    setRoleToRemove(role);
    setShowRemoveRoleConfirm(true);
    setError(null);
  }


  /*
   * ==================================================
   * CLOSE REMOVE ROLE CONFIRMATION
   * ==================================================
   */

  function handleCancelRemoveRole() {

    if (removingRoleId) {
      return;
    }

    setShowRemoveRoleConfirm(false);
    setRoleToRemove(null);
  }


  /*
   * ==================================================
   * CONFIRM ROLE REMOVAL
   * ==================================================
   */

  async function handleConfirmRemoveRole() {

    if (!roleToRemove?.id) {
      return;
    }

    const role = roleToRemove;

    try {

      setRemovingRoleId(role.id);
      setError(null);
      setShowRemoveRoleConfirm(false);

      await removeRoleFromUser(
        id,
        role.id
      );

      setRoles(
        (previousRoles) =>
          previousRoles.filter(
            (assignedRole) =>
              assignedRole.id !== role.id
          )
      );

      setUser(
        (previousUser) => {

          if (!previousUser) {
            return previousUser;
          }

          return {
            ...previousUser,

            userRoles:
              Array.isArray(
                previousUser.userRoles
              )
                ? previousUser.userRoles.filter(
                    (userRole) =>
                      userRole?.role?.id !==
                      role.id
                  )
                : [],
          };

        }
      );

      setAvailableRoles(
        (previousRoles) => {

          const alreadyExists =
            previousRoles.some(
              (availableRole) =>
                availableRole.id === role.id
            );

          if (alreadyExists) {
            return previousRoles;
          }

          return [
            ...previousRoles,
            role,
          ].sort(
            (a, b) =>
              a.name.localeCompare(b.name)
          );

        }
      );

      setRoleToRemove(null);

      setSuccessMessage(
        `${role.name} role removed successfully.`
      );

    } catch (err) {

      console.error(
        "Failed to remove role:",
        err
      );

      setError(
        err?.message ||
        "Unable to remove role."
      );

      setShowRemoveRoleConfirm(true);

    } finally {

      setRemovingRoleId(null);

    }

  }

  /*
   * ==================================================
   * FORMAT DATE
   * ==================================================
   */

  function formatDate(
    value
  ) {

    if (!value) {
      return "Never";
    }

    const date =
      new Date(value);

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
        dateStyle:
          "medium",

        timeStyle:
          "short",
      }
    ).format(date);

  }


  /*
   * ==================================================
   * LOADING
   * ==================================================
   */

  if (isLoading) {

    return (

      <div className="space-y-6">

        <div className="h-5 w-32 animate-pulse rounded bg-[var(--bms-surface-soft)]" />

        <div className="h-48 animate-pulse rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]" />

        <div className="grid gap-4 lg:grid-cols-2">

          <div className="h-72 animate-pulse rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]" />

          <div className="h-72 animate-pulse rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]" />

        </div>

      </div>

    );

  }


  /*
   * ==================================================
   * ERROR / USER NOT FOUND
   * ==================================================
   */

  if (!user) {

    return (

      <div className="flex min-h-96 flex-col items-center justify-center text-center">

        <UserX
          size={40}
          className="text-[var(--bms-text-muted)]"
        />

        <h2 className="mt-4 text-lg font-semibold text-[var(--bms-text)]">
          User not found
        </h2>

        <p className="mt-1 text-sm text-[var(--bms-text-secondary)]">
          {error ||
            "The requested user could not be found."}
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/users")
          }
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >

          <ArrowLeft
            size={17}
          />

          Back to Users

        </button>

      </div>

    );

  }


  /*
   * ==================================================
   * MAIN UI
   * ==================================================
   */

  return (

    <div className="space-y-6">


      {/* BACK */}

      <button
        type="button"
        onClick={() =>
          navigate("/users")
        }
        className="inline-flex items-center gap-2 text-sm text-[var(--bms-text-secondary)] transition hover:text-[var(--bms-text)]"
      >

        <ArrowLeft
          size={17}
        />

        Back to Users

      </button>


      {/* SUCCESS */}

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


      {/* ERROR */}

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


      {/* USER HEADER */}

      <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-4">

            <UserAvatar
              user={user}
              size="large"
            />

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-2">

                <h1 className="text-xl font-semibold text-[var(--bms-text)]">

                  {user.firstName}{" "}
                  {user.lastName}

                </h1>

                <StatusBadge
                  status={user.status}
                />

              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--bms-text-secondary)]">

                <span className="inline-flex items-center gap-1.5">

                  <Mail
                    size={15}
                  />

                  {user.email}

                </span>

                <span className="inline-flex items-center gap-1.5">

                  <Clock3
                    size={15}
                  />

                  Joined{" "}
                  {formatDate(
                    user.createdAt
                  )}

                </span>

              </div>

            </div>

          </div>


          {!isEditing && (

            <button
              type="button"
              onClick={() =>
                setIsEditing(true)
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-4 py-2.5 text-sm font-medium text-[var(--bms-text-secondary)] transition hover:text-[var(--bms-text)]"
            >

              <Edit3
                size={17}
              />

              Edit User

            </button>

          )}

        </div>

      </div>


      {/* CONTENT */}

      <div className="grid gap-6 lg:grid-cols-2">


        {/* ACCOUNT INFORMATION */}

        <section className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

          <div className="border-b border-[var(--bms-border)] px-5 py-4">

            <h2 className="text-sm font-semibold text-[var(--bms-text)]">
              Account Information
            </h2>

            <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
              Manage the user's basic account information.
            </p>

          </div>


          <form
            onSubmit={
              handleSaveUser
            }
            className="space-y-5 p-5"
          >

            <FormField
              label="First Name"
              name="firstName"
              value={
                form.firstName
              }
              onChange={
                handleChange
              }
              disabled={
                !isEditing ||
                isSaving
              }
            />

            <FormField
              label="Last Name"
              name="lastName"
              value={
                form.lastName
              }
              onChange={
                handleChange
              }
              disabled={
                !isEditing ||
                isSaving
              }
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              value={
                form.email
              }
              onChange={
                handleChange
              }
              disabled={
                !isEditing ||
                isSaving
              }
            />


            {isEditing && (

              <div className="flex justify-end gap-2 pt-1">

                <button
                  type="button"
                  onClick={
                    handleCancelEdit
                  }
                  disabled={
                    isSaving
                  }
                  className="rounded-lg border border-[var(--bms-border)] px-4 py-2 text-sm font-medium text-[var(--bms-text-secondary)] transition hover:text-[var(--bms-text)] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    isSaving
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {isSaving
                    ? "Saving..."
                    : "Save Changes"}

                </button>

              </div>

            )}

          </form>

        </section>


        {/* ACCOUNT STATUS */}

        <section className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

          <div className="border-b border-[var(--bms-border)] px-5 py-4">

            <h2 className="text-sm font-semibold text-[var(--bms-text)]">
              Account Status
            </h2>

            <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
              Control the current state of this account.
            </p>

          </div>


          <div className="space-y-4 p-5">

            <div className="rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-4">

              <p className="text-xs font-medium text-[var(--bms-text-muted)]">
                Current Status
              </p>

              <div className="mt-2">

                <StatusBadge
                  status={
                    user.status
                  }
                />

              </div>

            </div>


            <div>

              <p className="mb-2 text-xs font-medium text-[var(--bms-text-muted)]">
                Change Status
              </p>


              <div className="grid gap-2 sm:grid-cols-2">

                <StatusButton
                  icon={
                    UserCheck
                  }
                  label="Activate"
                  active={
                    user.status ===
                    "ACTIVE"
                  }
                  disabled={
                    isUpdatingStatus
                  }
                  onClick={() =>
                    handleStatusChange(
                      "ACTIVE"
                    )
                  }
                />

                <StatusButton
                  icon={
                    UserRound
                  }
                  label="Set Pending"
                  active={
                    user.status ===
                    "PENDING"
                  }
                  disabled={
                    isUpdatingStatus
                  }
                  onClick={() =>
                    handleStatusChange(
                      "PENDING"
                    )
                  }
                />

                <StatusButton
                  icon={
                    UserX
                  }
                  label="Suspend"
                  active={
                    user.status ===
                    "SUSPENDED"
                  }
                  disabled={
                    isUpdatingStatus
                  }
                  onClick={() =>
                    handleStatusChange(
                      "SUSPENDED"
                    )
                  }
                />

                <StatusButton
                  icon={
                    UserX
                  }
                  label="Set Inactive"
                  active={
                    user.status ===
                    "INACTIVE"
                  }
                  disabled={
                    isUpdatingStatus
                  }
                  onClick={() =>
                    handleStatusChange(
                      "INACTIVE"
                    )
                  }
                />

              </div>

            </div>

          </div>

        </section>

      </div>


      {/* ==================================================
          ROLES
      ================================================== */}

      <section className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

        <div className="border-b border-[var(--bms-border)] px-5 py-4">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-sm font-semibold text-[var(--bms-text)]">
                Assigned Roles
              </h2>

              <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                Roles currently assigned to this user.
              </p>

            </div>


            <div className="flex items-center gap-2">

              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-500">

                <ShieldCheck
                  size={13}
                />

                {roles.length}{" "}
                {roles.length === 1
                  ? "Role"
                  : "Roles"}

              </span>


              <button
                type="button"
                onClick={
                  handleOpenAssignRole
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700 active:scale-[0.98]"
              >

                <Plus
                  size={15}
                />

                Assign Role

              </button>

            </div>

          </div>

        </div>


        <div className="p-5">

          {isLoadingRoles ? (

            <div className="flex min-h-28 items-center justify-center">

              <Loader2
                size={24}
                className="animate-spin text-blue-500"
              />

            </div>

          ) : roles.length === 0 ? (

            <div className="flex min-h-28 flex-col items-center justify-center text-center">

              <ShieldCheck
                size={30}
                className="text-[var(--bms-text-muted)]"
              />

              <p className="mt-2 text-sm font-medium text-[var(--bms-text)]">
                No roles assigned
              </p>

              <p className="mt-1 text-xs text-[var(--bms-text-secondary)]">
                This user currently has no assigned roles.
              </p>

            </div>

          ) : (

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

              {roles.map(
                (role) => (

                  <div
                    key={role.id}
                    className="rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-4"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex min-w-0 items-start gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-500">

                          <ShieldCheck
                            size={18}
                          />

                        </div>


                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-[var(--bms-text)]">
                            {role.name}
                          </p>

                          <p className="mt-1 text-xs text-[var(--bms-text-secondary)]">

                            {role.description ||
                              "No description provided."}

                          </p>

                        </div>

                      </div>


                      <button
                        type="button"
                        title={`Remove ${role.name}`}
                        aria-label={`Remove ${role.name}`}
                        onClick={() =>
                          handleRemoveRole(
                            role
                          )
                        }
                        disabled={
                          removingRoleId ===
                          role.id
                        }
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >

                        {removingRoleId ===
                        role.id ? (

                          <Loader2
                            size={15}
                            className="animate-spin"
                          />

                        ) : (

                          <Trash2
                            size={15}
                          />

                        )}

                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </section>


      {/* ACCOUNT ACTIVITY */}

      <section className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

        <div className="border-b border-[var(--bms-border)] px-5 py-4">

          <h2 className="text-sm font-semibold text-[var(--bms-text)]">
            Account Activity
          </h2>

        </div>


        <div className="grid gap-4 p-5 sm:grid-cols-2">

          <InfoItem
            label="Account Created"
            value={
              formatDate(
                user.createdAt
              )
            }
          />

          <InfoItem
            label="Last Updated"
            value={
              formatDate(
                user.updatedAt
              )
            }
          />

          <InfoItem
            label="Last Login"
            value={
              formatDate(
                user.lastloginAt
              )
            }
          />

          <InfoItem
            label="User ID"
            value={
              user.id
            }
            mono
          />

        </div>

      </section>


      {/* ==================================================
          REMOVE ROLE CONFIRMATION MODAL
      ================================================== */}

      {showRemoveRoleConfirm && roleToRemove && (

        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-role-title"
          aria-describedby="remove-role-description"
        >

          <div className="w-full max-w-md overflow-hidden rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-2xl">

            <div className="flex items-start justify-between border-b border-[var(--bms-border)] px-5 py-4">

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                  <Trash2 size={19} />
                </div>

                <div>
                  <h2 id="remove-role-title" className="text-sm font-semibold text-[var(--bms-text)]">
                    Remove Role
                  </h2>

                  <p id="remove-role-description" className="mt-1 text-xs leading-5 text-[var(--bms-text-secondary)]">
                    Confirm that you want to remove this role from the user.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCancelRemoveRole}
                disabled={Boolean(removingRoleId)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close remove role confirmation"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-5">

              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                <p className="text-sm leading-6 text-[var(--bms-text-secondary)]">
                  Are you sure you want to remove the{" "}
                  <span className="font-semibold text-[var(--bms-text)]">
                    {roleToRemove.name}
                  </span>
                  {" "}role from{" "}
                  <span className="font-semibold text-[var(--bms-text)]">
                    {user.firstName} {user.lastName}
                  </span>?
                </p>

                <p className="mt-2 text-xs leading-5 text-[var(--bms-text-muted)]">
                  This will remove the role from the user's account. The role can be assigned again later if needed.
                </p>
              </div>

              <div className="flex justify-end gap-2 border-t border-[var(--bms-border)] pt-4">
                <button
                  type="button"
                  onClick={handleCancelRemoveRole}
                  disabled={Boolean(removingRoleId)}
                  className="rounded-lg border border-[var(--bms-border)] px-4 py-2.5 text-sm font-medium text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmRemoveRole}
                  disabled={Boolean(removingRoleId)}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {removingRoleId ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Remove Role
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}


      {/* ==================================================
          ASSIGN ROLE MODAL
      ================================================== */}

      {showAssignRole && (

        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assign-role-title"
        >

          <div className="w-full max-w-lg overflow-hidden rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-[var(--bms-border)] px-5 py-4">

              <div>

                <h2
                  id="assign-role-title"
                  className="text-sm font-semibold text-[var(--bms-text)]"
                >
                  Assign Role
                </h2>

                <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                  Assign an additional role to this user.
                </p>

              </div>


              <button
                type="button"
                onClick={
                  handleCloseAssignRole
                }
                disabled={
                  isAssigningRole
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)] disabled:opacity-50"
                aria-label="Close assign role dialog"
              >

                <X
                  size={18}
                />

              </button>

            </div>


            {/* MODAL FORM */}

            <form
              onSubmit={
                handleAssignRole
              }
              className="space-y-5 p-5"
            >

              {roleError && (

                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500">

                  {roleError}

                </div>

              )}


              {/* ROLE */}

              <div>

                <label
                  htmlFor="role"
                  className="mb-1.5 block text-xs font-medium text-[var(--bms-text-muted)]"
                >
                  Role
                </label>


                <select
                  id="role"
                  value={
                    selectedRoleId
                  }
                  onChange={(event) =>
                    setSelectedRoleId(
                      event.target.value
                    )
                  }
                  disabled={
                    isAssigningRole ||
                    isLoadingAvailableRoles
                  }
                  className="h-11 w-full rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-3 text-sm text-[var(--bms-text)] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  <option value="">
                    {isLoadingAvailableRoles
                      ? "Loading roles..."
                      : "Select a role"}
                  </option>


                  {availableRoles
                    .filter(
                      (role) =>
                        !roles.some(
                          (assignedRole) =>
                            assignedRole.id ===
                            role.id
                        )
                    )
                    .map(
                      (role) => (

                        <option
                          key={role.id}
                          value={role.id}
                        >
                          {role.name}
                        </option>

                      )
                    )}

                </select>

              </div>


              {/* REASON */}

              <div>

                <label
                  htmlFor="roleReason"
                  className="mb-1.5 block text-xs font-medium text-[var(--bms-text-muted)]"
                >
                  Reason
                </label>


                <textarea
                  id="roleReason"
                  value={
                    roleReason
                  }
                  onChange={(event) =>
                    setRoleReason(
                      event.target.value
                    )
                  }
                  disabled={
                    isAssigningRole
                  }
                  rows={5}
                  maxLength={500}
                  placeholder="Explain why this role is being assigned to the user..."
                  className="w-full resize-none rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-3 py-3 text-sm text-[var(--bms-text)] outline-none transition placeholder:text-[var(--bms-text-muted)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <div className="mt-1 flex justify-end">

                  <span className="text-[11px] text-[var(--bms-text-muted)]">
                    {roleReason.length}/500
                  </span>

                </div>

              </div>


              {/* ACTIONS */}

              <div className="flex justify-end gap-2 border-t border-[var(--bms-border)] pt-4">

                <button
                  type="button"
                  onClick={
                    handleCloseAssignRole
                  }
                  disabled={
                    isAssigningRole
                  }
                  className="rounded-lg border border-[var(--bms-border)] px-4 py-2.5 text-sm font-medium text-[var(--bms-text-secondary)] transition hover:text-[var(--bms-text)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={
                    isAssigningRole ||
                    !selectedRoleId ||
                    !roleReason.trim()
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {isAssigningRole ? (

                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />

                      Assigning...

                    </>

                  ) : (

                    <>
                      <Plus
                        size={16}
                      />

                      Assign Role

                    </>

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );
}


/*
 * ==================================================
 * FORM FIELD
 * ==================================================
 */

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  disabled,
}) {

  return (

    <div>

      <label
        htmlFor={name}
        className="mb-1.5 block text-xs font-medium text-[var(--bms-text-muted)]"
      >

        {label}

      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="h-10 w-full rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-3 text-sm text-[var(--bms-text)] outline-none transition placeholder:text-[var(--bms-text-muted)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-default disabled:opacity-70"
      />

    </div>

  );

}


/*
 * ==================================================
 * STATUS BUTTON
 * ==================================================
 */

function StatusButton({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
}) {

  return (

    <button
      type="button"
      onClick={onClick}
      disabled={
        disabled ||
        active
      }
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition ${
        active
          ? "border-blue-500/20 bg-blue-500/10 text-blue-500"
          : "border-[var(--bms-border)] text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)]"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >

      <Icon
        size={15}
      />

      {label}

    </button>

  );

}


/*
 * ==================================================
 * USER AVATAR
 * ==================================================
 */

function UserAvatar({
  user,
  size = "normal",
}) {

  const initials =
    `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`
      .toUpperCase();

  const sizeClass =
    size === "large"
      ? "h-16 w-16 text-lg"
      : "h-10 w-10 text-sm";

  if (user.avatarUrl) {

    return (

      <img
        src={user.avatarUrl}
        alt={`${user.firstName} ${user.lastName}`}
        className={`${sizeClass} shrink-0 rounded-full object-cover`}
      />

    );

  }

  return (

    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-blue-600/10 font-semibold text-blue-500`}
    >

      {initials || "U"}

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

    ACTIVE:
      "bg-emerald-500/10 text-emerald-500",

    PENDING:
      "bg-amber-500/10 text-amber-500",

    SUSPENDED:
      "bg-red-500/10 text-red-500",

    INACTIVE:
      "bg-gray-500/10 text-gray-500",

  };

  return (

    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] ||
        "bg-gray-500/10 text-gray-500"
      }`}
    >

      {status || "UNKNOWN"}

    </span>

  );

}


/*
 * ==================================================
 * INFO ITEM
 * ==================================================
 */

function InfoItem({
  label,
  value,
  mono = false,
}) {

  return (

    <div className="rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-4">

      <p className="text-xs font-medium text-[var(--bms-text-muted)]">
        {label}
      </p>

      <p
        className={`mt-2 break-all text-sm text-[var(--bms-text-secondary)] ${
          mono
            ? "font-mono text-xs"
            : ""
        }`}
      >

        {value}

      </p>

    </div>

  );

}


export default UserDetails;
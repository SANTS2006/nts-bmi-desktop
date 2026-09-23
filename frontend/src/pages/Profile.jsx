import {
  UserRound,
  Mail,
  ShieldCheck,
  CalendarDays,
  Clock3,
  Camera,
  Pencil,
  Save,
  X,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";

import { useAuth } from "../context/AuthContext";

import {
  updateMyProfile,
  uploadMyAvatar,
  deleteMyAvatar,
} from "../api/users";


function Profile() {
  const {
    user,
    refreshUser,
  } = useAuth();

  const fileInputRef =
    useRef(null);


  /*
   * ==================================================
   * PROFILE STATE
   * ==================================================
   */

  const [isEditing, setIsEditing] =
    useState(false);

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [
    selectedFile,
    setSelectedFile,
  ] = useState(null);

  const [
    previewUrl,
    setPreviewUrl,
  ] = useState(null);


  /*
   * ==================================================
   * UI STATE
   * ==================================================
   */

  const [
    isSavingProfile,
    setIsSavingProfile,
  ] = useState(false);

  const [
    isUploadingAvatar,
    setIsUploadingAvatar,
  ] = useState(false);

  const [
    isDeletingAvatar,
    setIsDeletingAvatar,
  ] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");


  /*
   * ==================================================
   * SYNCHRONIZE USER DATA
   * ==================================================
   */

  useEffect(() => {
    if (!user) {
      return;
    }

    setFirstName(
      user.firstName || ""
    );

    setLastName(
      user.lastName || ""
    );
  }, [user]);


  /*
   * ==================================================
   * DERIVED DATA
   * ==================================================
   */

  const fullName =
    `${user?.firstName || ""} ${
      user?.lastName || ""
    }`.trim();

  const initials =
    `${user?.firstName?.[0] || ""}${
      user?.lastName?.[0] || ""
    }`.toUpperCase();

  const avatarUrl =
    previewUrl ||
    user?.avatarUrl ||
    null;

  const formattedStatus =
    user?.status
      ? user.status.charAt(0) +
        user.status
          .slice(1)
          .toLowerCase()
      : "Unknown";

  const formattedCreatedAt =
    user?.createdAt
      ? new Date(
          user.createdAt
        ).toLocaleDateString(
          undefined,
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )
      : "—";

  const formattedLastLogin =
    user?.lastloginAt
      ? new Date(
          user.lastloginAt
        ).toLocaleString(
          undefined,
          {
            dateStyle: "medium",
            timeStyle: "short",
          }
        )
      : "Never";


  /*
   * ==================================================
   * CLEAR MESSAGES
   * ==================================================
   */

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };


  /*
   * ==================================================
   * START EDITING
   * ==================================================
   */

  const handleStartEditing = () => {
    clearMessages();

    setFirstName(
      user?.firstName || ""
    );

    setLastName(
      user?.lastName || ""
    );

    setIsEditing(true);
  };


  /*
   * ==================================================
   * CANCEL EDITING
   * ==================================================
   */

  const handleCancelEditing = () => {
    setFirstName(
      user?.firstName || ""
    );

    setLastName(
      user?.lastName || ""
    );

    clearMessages();

    setIsEditing(false);
  };


  /*
   * ==================================================
   * SAVE PROFILE
   * ==================================================
   */

  const handleSaveProfile = async (
    event
  ) => {
    event.preventDefault();

    clearMessages();

    const cleanFirstName =
      firstName.trim();

    const cleanLastName =
      lastName.trim();

    if (cleanFirstName.length < 2) {
      setErrorMessage(
        "First name must be at least 2 characters."
      );

      return;
    }

    if (cleanLastName.length < 2) {
      setErrorMessage(
        "Last name must be at least 2 characters."
      );

      return;
    }

    try {
      setIsSavingProfile(true);

      await updateMyProfile({
        firstName: cleanFirstName,
        lastName: cleanLastName,
      });

      /*
       * Get the authoritative user
       * from the backend.
       */

      await refreshUser();

      setIsEditing(false);

      setSuccessMessage(
        "Your profile was updated successfully."
      );
    } catch (error) {
      setErrorMessage(
        error?.message ||
          "Unable to update your profile."
      );
    } finally {
      setIsSavingProfile(false);
    }
  };


  /*
   * ==================================================
   * OPEN FILE PICKER
   * ==================================================
   */

  const handleChooseAvatar = () => {
    clearMessages();

    fileInputRef.current?.click();
  };


  /*
   * ==================================================
   * HANDLE FILE SELECTION
   * ==================================================
   */

  const handleAvatarChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    /*
     * Reset input so selecting
     * the same image again still
     * triggers change.
     */

    event.target.value = "";

    if (!file) {
      return;
    }

    clearMessages();

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setErrorMessage(
        "Please select a JPEG, PNG, or WebP image."
      );

      return;
    }

    const maxSize =
      2 * 1024 * 1024;

    if (file.size > maxSize) {
      setErrorMessage(
        "Profile image must not exceed 2 MB."
      );

      return;
    }

    /*
     * Create preview.
     */

    const objectUrl =
      URL.createObjectURL(file);

    setSelectedFile(file);

    setPreviewUrl(objectUrl);
  };


  /*
   * ==================================================
   * UPLOAD AVATAR
   * ==================================================
   */

  const handleUploadAvatar =
    async () => {
      if (!selectedFile) {
        return;
      }

      clearMessages();

      try {
        setIsUploadingAvatar(
          true
        );

        await uploadMyAvatar(
          selectedFile
        );

        /*
         * Refresh the global user.
         */

        await refreshUser();

        /*
         * Release the temporary
         * browser object URL.
         */

        if (previewUrl) {
          URL.revokeObjectURL(
            previewUrl
          );
        }

        setSelectedFile(null);
        setPreviewUrl(null);

        setSuccessMessage(
          "Your profile picture was updated successfully."
        );
      } catch (error) {
        setErrorMessage(
          error?.message ||
            "Unable to upload your profile picture."
        );
      } finally {
        setIsUploadingAvatar(
          false
        );
      }
    };


  /*
   * ==================================================
   * REMOVE AVATAR
   * ==================================================
   */

  const handleDeleteAvatar =
    async () => {
      if (!user?.avatarUrl) {
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to remove your profile picture?"
        );

      if (!confirmed) {
        return;
      }

      clearMessages();

      try {
        setIsDeletingAvatar(
          true
        );

        await deleteMyAvatar();

        await refreshUser();

        setSuccessMessage(
          "Your profile picture was removed successfully."
        );
      } catch (error) {
        setErrorMessage(
          error?.message ||
            "Unable to remove your profile picture."
        );
      } finally {
        setIsDeletingAvatar(
          false
        );
      }
    };


  /*
   * ==================================================
   * CLEAN UP PREVIEW URL
   * ==================================================
   */

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl
        );
      }
    };
  }, [previewUrl]);


  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2
          className="animate-spin text-blue-500"
          size={28}
        />
      </div>
    );
  }


  return (
    <div className="mx-auto w-full space-y-6">

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <UserRound
                size={21}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--bms-text)] sm:text-3xl">
                My Profile
              </h1>

              <p className="mt-1 text-sm text-[var(--bms-text-secondary)]">
                Manage your personal information and profile picture.
              </p>
            </div>

          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={
                handleStartEditing
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-600/25 active:scale-[0.98]"
            >
              <Pencil size={16} />
              Edit profile
            </button>
          )}

        </div>
      </section>


      {/* ==================================================
          MESSAGES
      ================================================== */}

      {successMessage && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-500"
        >
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0"
          />

          <span>
            {successMessage}
          </span>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-500"
        >
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <span>
            {errorMessage}
          </span>
        </div>
      )}


      {/* ==================================================
          PROFILE HERO
      ================================================== */}

      <section className="overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-sm">

        <div className="h-28 bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-transparent sm:h-36" />

        <div className="px-5 pb-6 sm:px-6">

          <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">

            {/* Avatar */}

            <div className="flex items-end gap-4">

              <div className="relative">

                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-[var(--bms-surface)] bg-blue-600/10 text-2xl font-bold text-blue-500 shadow-lg sm:h-28 sm:w-28">

                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={`${fullName} profile`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials || "U"
                  )}

                </div>

                {/* Camera button */}

                <button
                  type="button"
                  onClick={
                    handleChooseAvatar
                  }
                  disabled={
                    isUploadingAvatar ||
                    isDeletingAvatar
                  }
                  className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-4 border-[var(--bms-surface)] bg-blue-600 text-white shadow-lg transition-all duration-200 hover:bg-blue-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Change profile picture"
                  title="Change profile picture"
                >
                  <Camera
                    size={15}
                  />
                </button>

                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handleAvatarChange
                  }
                  className="hidden"
                  aria-label="Choose profile picture"
                />

              </div>

              <div className="pb-1">

                <h2 className="text-xl font-bold text-[var(--bms-text)]">
                  {fullName ||
                    "User"}
                </h2>

                <p className="mt-1 text-sm text-[var(--bms-text-secondary)]">
                  {user.email}
                </p>

              </div>

            </div>


            {/* Avatar actions */}

            <div className="flex flex-wrap gap-2">

              {selectedFile && (
                <button
                  type="button"
                  onClick={
                    handleUploadAvatar
                  }
                  disabled={
                    isUploadingAvatar
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:bg-blue-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploadingAvatar ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />

                      Uploading...
                    </>
                  ) : (
                    <>
                      <Save
                        size={16}
                      />

                      Save photo
                    </>
                  )}
                </button>
              )}

              {selectedFile && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      previewUrl
                    ) {
                      URL.revokeObjectURL(
                        previewUrl
                      );
                    }

                    setSelectedFile(
                      null
                    );

                    setPreviewUrl(
                      null
                    );

                    clearMessages();
                  }}
                  disabled={
                    isUploadingAvatar
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-4 text-sm font-medium text-[var(--bms-text-secondary)] transition hover:text-[var(--bms-text)] disabled:opacity-50"
                >
                  <X size={16} />
                  Cancel
                </button>
              )}

              {!selectedFile &&
                user.avatarUrl && (
                  <button
                    type="button"
                    onClick={
                      handleDeleteAvatar
                    }
                    disabled={
                      isDeletingAvatar
                    }
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 text-sm font-medium text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDeletingAvatar ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2
                        size={16}
                      />
                    )}

                    Remove photo
                  </button>
                )}

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          PERSONAL INFORMATION
      ================================================== */}

      <section className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5 shadow-sm sm:p-6">

        <div className="flex items-center justify-between gap-4">

          <div>
            <h2 className="text-base font-semibold text-[var(--bms-text)]">
              Personal Information
            </h2>

            <p className="mt-1 text-xs text-[var(--bms-text-secondary)]">
              Your basic account information.
            </p>
          </div>

        </div>


        {isEditing ? (
          <form
            onSubmit={
              handleSaveProfile
            }
            className="mt-6 space-y-5"
            noValidate
          >

            {/* First name */}

            <div>
              <label
                htmlFor="profile-first-name"
                className="mb-2 block text-sm font-medium text-[var(--bms-text)]"
              >
                First name
              </label>

              <input
                id="profile-first-name"
                name="firstName"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(event) =>
                  setFirstName(
                    event.target.value
                  )
                }
                className="h-12 w-full rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-4 text-sm text-[var(--bms-text)] outline-none transition-all duration-300 placeholder:text-[var(--bms-text-muted)] focus:border-blue-500/70 focus:ring-4 focus:ring-blue-500/10"
                placeholder="First name"
              />
            </div>


            {/* Last name */}

            <div>
              <label
                htmlFor="profile-last-name"
                className="mb-2 block text-sm font-medium text-[var(--bms-text)]"
              >
                Last name
              </label>

              <input
                id="profile-last-name"
                name="lastName"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(event) =>
                  setLastName(
                    event.target.value
                  )
                }
                className="h-12 w-full rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-4 text-sm text-[var(--bms-text)] outline-none transition-all duration-300 placeholder:text-[var(--bms-text-muted)] focus:border-blue-500/70 focus:ring-4 focus:ring-blue-500/10"
                placeholder="Last name"
              />
            </div>


            {/* Email */}

            <div>
              <label
                htmlFor="profile-email"
                className="mb-2 block text-sm font-medium text-[var(--bms-text)]"
              >
                Email address
              </label>

              <div className="relative">

                <Mail
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--bms-text-muted)]"
                />

                <input
                  id="profile-email"
                  type="email"
                  value={user.email}
                  disabled
                  className="h-12 w-full cursor-not-allowed rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] pl-11 pr-4 text-sm text-[var(--bms-text-muted)] outline-none"
                />

              </div>

              <p className="mt-2 text-xs text-[var(--bms-text-muted)]">
                Email address changes are handled separately for security reasons.
              </p>
            </div>


            {/* Actions */}

            <div className="flex flex-wrap gap-3 pt-2">

              <button
                type="submit"
                disabled={
                  isSavingProfile
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:bg-blue-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />

                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />

                    Save changes
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={
                  handleCancelEditing
                }
                disabled={
                  isSavingProfile
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-5 text-sm font-medium text-[var(--bms-text-secondary)] transition-all duration-200 hover:text-[var(--bms-text)] disabled:opacity-50"
              >
                <X size={16} />

                Cancel
              </button>

            </div>

          </form>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* First name */}

            <ProfileField
              icon={UserRound}
              label="First name"
              value={
                user.firstName ||
                "—"
              }
            />


            {/* Last name */}

            <ProfileField
              icon={UserRound}
              label="Last name"
              value={
                user.lastName ||
                "—"
              }
            />


            {/* Email */}

            <ProfileField
              icon={Mail}
              label="Email address"
              value={
                user.email ||
                "—"
              }
            />


            {/* Status */}

            <ProfileField
              icon={ShieldCheck}
              label="Account status"
              value={
                formattedStatus
              }
              valueClass={
                user.status ===
                "ACTIVE"
                  ? "text-emerald-500"
                  : "text-[var(--bms-text)]"
              }
            />

          </div>
        )}

      </section>


      {/* ==================================================
          ACCOUNT INFORMATION
      ================================================== */}

      <section className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5 shadow-sm sm:p-6">

        <h2 className="text-base font-semibold text-[var(--bms-text)]">
          Account Information
        </h2>

        <p className="mt-1 text-xs text-[var(--bms-text-secondary)]">
          Information about your NTS BMS account.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

          <ProfileField
            icon={CalendarDays}
            label="Account created"
            value={
              formattedCreatedAt
            }
          />

          <ProfileField
            icon={Clock3}
            label="Last login"
            value={
              formattedLastLogin
            }
          />

        </div>

      </section>


      {/* ==================================================
          PHOTO HELP
      ================================================== */}

      <section className="rounded-2xl border border-blue-500/10 bg-blue-500/[0.03] p-5 sm:p-6">

        <div className="flex gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <Camera size={17} />
          </div>

          <div>

            <h2 className="text-sm font-semibold text-[var(--bms-text)]">
              Profile picture requirements
            </h2>

            <p className="mt-1 text-xs leading-5 text-[var(--bms-text-secondary)]">
              Use a clear JPEG, PNG, or WebP image. The maximum file size is 2 MB. Your image will automatically be optimized for your profile.
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}


/*
 * ==================================================
 * PROFILE FIELD
 * ==================================================
 */

function ProfileField({
  icon: Icon,
  label,
  value,
  valueClass = "",
}) {
  return (
    <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-4">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
          <Icon
            size={17}
            strokeWidth={1.8}
          />
        </div>

        <div className="min-w-0">

          <p className="text-xs text-[var(--bms-text-muted)]">
            {label}
          </p>

          <p
            className={`mt-1 truncate text-sm font-semibold text-[var(--bms-text)] ${valueClass}`}
          >
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}


export default Profile;
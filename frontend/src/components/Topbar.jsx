import {
  Menu,
  Search,
  ChevronDown,
  Moon,
  Sun,
  User,
  Settings,
  ShieldCheck,
  LogOut,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import NotificationDropdown from "./NotificationDropdown";

import { useTheme } from "../context/ThemeContext";

import { useAuth } from "../context/AuthContext";

import {
  switchActiveRole,
} from "../api/auth";


function Topbar({
  onMenuClick,
}) {

  const {
    theme,
    toggleTheme,
  } = useTheme();


  const {
    user,
    logout,
    refreshUser,
  } = useAuth();


  const navigate =
    useNavigate();


  const profileRef =
    useRef(null);


  /*
   * ==================================================
   * STATE
   * ==================================================
   */

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);


  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);


  const [
    switchingRoleId,
    setSwitchingRoleId,
  ] = useState(null);


  const [
    roleSwitchError,
    setRoleSwitchError,
  ] = useState(null);


  /*
   * ==================================================
   * USER INFORMATION
   * ==================================================
   */

  const fullName = [
  user?.firstName,
  user?.lastName,
]
  .filter(Boolean)
  .join(" ");

  const avatarUrl =
    user?.avatarUrl || null;

  /*
   * ==================================================
   * INITIALS
   * ==================================================
   */

  const initials = [
    user?.firstName?.charAt(0),
    user?.lastName?.charAt(0),
  ]
    .filter(Boolean)
    .join("")
    .toUpperCase();


  /*
   * ==================================================
   * ROLES
   * ==================================================
   *
   * user.roles contains every role assigned
   * to the user.
   *
   * user.activeRole contains the role currently
   * controlling permissions.
   */

  const roles =
    Array.isArray(user?.roles)
      ? user.roles
      : [];


  const activeRole =
    user?.activeRole ||
    null;


  /*
   * ==================================================
   * ACTIVE ROLE NAME
   * ==================================================
   */

  const activeRoleName =
    activeRole?.name ||
    roles?.[0]?.name ||
    "User";


  /*
   * ==================================================
   * FORMAT ROLE NAME
   * ==================================================
   */

  const formatRoleName = (
    roleName
  ) => {

    if (!roleName) {
      return "User";
    }


    return roleName
      .toLowerCase()
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");

  };


  const formattedRole =
    formatRoleName(
      activeRoleName
    );


  /*
   * ==================================================
   * FORMAT STATUS
   * ==================================================
   */

  const formattedStatus =
    user?.status
      ? user.status
          .charAt(0)
          .toUpperCase() +
        user.status
          .slice(1)
          .toLowerCase()
      : "Unknown";


  /*
   * ==================================================
   * ROLE SWITCH
   * ==================================================
   */

  const handleRoleSwitch =
    async (
      role
    ) => {

      /*
       * Prevent invalid selection.
       */

      if (
        !role?.id ||
        switchingRoleId
      ) {
        return;
      }


      /*
       * Don't make a request if the
       * selected role is already active.
       */

      if (
        activeRole?.id ===
        role.id
      ) {

        setProfileOpen(
          false
        );

        return;
      }


      try {

        setRoleSwitchError(
          null
        );


        setSwitchingRoleId(
          role.id
        );


        /*
         * Tell the backend to change
         * the active role stored on the
         * current session.
         */

        await switchActiveRole(
          role.id
        );


        /*
         * Refresh authenticated user.
         *
         * This updates:
         *
         * - activeRole
         * - roles
         * - user state
         *
         * without refreshing the page.
         */

        if (
          typeof refreshUser ===
          "function"
        ) {

          await refreshUser();

        }


        /*
         * Close dropdown after
         * successful role switch.
         */

        setProfileOpen(
          false
        );


      } catch (error) {

        console.error(
          "Failed to switch role:",
          error
        );


        setRoleSwitchError(
          error?.message ||
          "Unable to switch role."
        );


      } finally {

        setSwitchingRoleId(
          null
        );

      }

    };


  /*
   * ==================================================
   * CLEAR ROLE SWITCH ERROR
   * ==================================================
   */

  useEffect(() => {

    if (!roleSwitchError) {
      return undefined;
    }


    const timer =
      setTimeout(
        () => {

          setRoleSwitchError(
            null
          );

        },
        4000
      );


    return () => {

      clearTimeout(
        timer
      );

    };

  }, [
    roleSwitchError,
  ]);


  /*
   * ==================================================
   * CLOSE DROPDOWN WHEN CLICKING OUTSIDE
   * ==================================================
   */

  useEffect(() => {

    const handleOutsideClick =
      (event) => {

        if (
          profileRef.current &&
          !profileRef.current.contains(
            event.target
          )
        ) {

          setProfileOpen(
            false
          );

        }

      };


    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

    };

  }, []);


  /*
   * ==================================================
   * ESCAPE KEY
   * ==================================================
   */

  useEffect(() => {

    const handleEscape =
      (event) => {

        if (
          event.key === "Escape" &&
          profileOpen
        ) {

          setProfileOpen(
            false
          );

        }

      };


    document.addEventListener(
      "keydown",
      handleEscape
    );


    return () => {

      document.removeEventListener(
        "keydown",
        handleEscape
      );

    };

  }, [
    profileOpen,
  ]);


  /*
   * ==================================================
   * LOGOUT
   * ==================================================
   */

  const handleLogout =
    async () => {

      if (
        isLoggingOut
      ) {
        return;
      }


      setIsLoggingOut(
        true
      );


      try {

        await logout();

      } finally {

        setProfileOpen(
          false
        );


        navigate(
          "/login",
          {
            replace: true,
          }
        );


        setIsLoggingOut(
          false
        );

      }

    };


  /*
   * ==================================================
   * RENDER
   * ==================================================
   */

  return (

    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--bms-border)] bg-[var(--bms-surface)]/95 px-4 backdrop-blur-xl transition-colors duration-300 sm:px-6">

      {/* ==================================================
          LEFT SIDE
      ================================================== */}

      <div className="flex items-center gap-3">

        {/* MOBILE HAMBURGER + LOGO */}

        <div className="flex items-center gap-3 md:hidden">

          <button
            type="button"
            onClick={
              onMenuClick
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--bms-text-secondary)] transition-all duration-200 hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)] active:scale-95"
            aria-label="Open navigation menu"
          >

            <Menu
              size={21}
              strokeWidth={1.8}
            />

          </button>


          <img
            src="/nts-logo.png"
            alt="NTS Digital Solutions"
            className="h-9 w-9 rounded-lg object-cover"
          />

        </div>


        {/* DESKTOP TITLE */}

        <div className="hidden md:block">

          <p className="text-sm font-medium text-[var(--bms-text-secondary)]">
            NTS BMS
          </p>

        </div>

      </div>


      {/* ==================================================
          RIGHT SIDE
      ================================================== */}

      <div className="flex items-center gap-2 sm:gap-4">

        {/* ==================================================
            NOTIFICATIONS
        ================================================== */}

        <NotificationDropdown />


        {/* ==================================================
            THEME
        ================================================== */}

        <button
          type="button"
          onClick={
            toggleTheme
          }
          aria-label={
            theme === "dark"
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          title={
            theme === "dark"
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] text-[var(--bms-text-secondary)] transition-all duration-300 hover:border-blue-500/50 hover:text-[var(--bms-text)] active:scale-95"
        >

          <span
            className={`absolute transition-all duration-300 ${
              theme === "dark"
                ? "rotate-0 scale-100 opacity-100"
                : "rotate-90 scale-0 opacity-0"
            }`}
          >

            <Moon
              size={18}
              strokeWidth={1.8}
            />

          </span>


          <span
            className={`absolute transition-all duration-300 ${
              theme === "light"
                ? "rotate-0 scale-100 opacity-100"
                : "-rotate-90 scale-0 opacity-0"
            }`}
          >

            <Sun
              size={18}
              strokeWidth={1.8}
            />

          </span>

        </button>


        {/* DIVIDER */}

        <div className="h-7 w-px bg-[var(--bms-border)]" />


        {/* ==================================================
            PROFILE
        ================================================== */}

        <div
          ref={profileRef}
          className="relative"
        >

          {/* ==================================================
              PROFILE TRIGGER
          ================================================== */}

          <button
            type="button"
            onClick={() => {

              setRoleSwitchError(
                null
              );

              setProfileOpen(
                (previous) =>
                  !previous
              );

            }}
            aria-expanded={
              profileOpen
            }
            aria-haspopup="menu"
            aria-label={`Account menu for ${
              fullName ||
              "current user"
            }`}
            className="group flex items-center gap-2 rounded-lg px-1 py-1 transition-all duration-200 hover:bg-[var(--bms-surface-soft)]"
          >

            {/* AVATAR */}

            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-600/15 text-sm font-semibold text-blue-500 ring-1 ring-blue-500/10 transition-all duration-300 group-hover:ring-blue-500/30">

                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`${fullName || "User"} profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials || "U"
                )}

                {user?.status === "ACTIVE" && (
                  <span
                    className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[var(--bms-surface)] bg-emerald-500"
                    aria-hidden="true"
                  />
                )}

              </div>


            {/* USER INFORMATION */}

            <div className="hidden min-w-0 text-left sm:block">

              <p className="max-w-32 truncate text-sm font-medium text-[var(--bms-text)] lg:max-w-40">

                {fullName ||
                  "User"}

              </p>


              <div className="flex items-center gap-1.5">

                <p className="max-w-24 truncate text-xs text-[var(--bms-text-muted)] lg:max-w-32">

                  {formattedRole}

                </p>


                <span
                  className="h-1 w-1 shrink-0 rounded-full bg-[var(--bms-text-muted)]"
                  aria-hidden="true"
                />


                <p
                  className={`text-xs ${
                    user?.status ===
                    "ACTIVE"
                      ? "text-emerald-500"
                      : "text-[var(--bms-text-muted)]"
                  }`}
                >

                  {formattedStatus}

                </p>

              </div>

            </div>


            <ChevronDown
              size={16}
              strokeWidth={1.8}
              className={`hidden text-[var(--bms-text-muted)] transition-transform duration-200 sm:block ${
                profileOpen
                  ? "rotate-180"
                  : ""
              }`}
            />

          </button>


          {/* ==================================================
              PROFILE DROPDOWN
          ================================================== */}

          <div
            role="menu"
            aria-hidden={
              !profileOpen
            }
            className={`absolute right-0 top-[calc(100%+0.6rem)] w-80 origin-top-right transition-all duration-200 ${
              profileOpen
                ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                : "pointer-events-none -translate-y-2 scale-95 opacity-0"
            }`}
          >

            {/* ==================================================
                SINGLE SCROLL CONTAINER
            ================================================== */}

            <div
              className="
                max-h-[calc(100vh-5.5rem)]
                overflow-y-auto
                overscroll-contain
                scroll-smooth
                rounded-2xl
                border
                border-[var(--bms-border)]
                bg-[var(--bms-surface)]
                shadow-2xl
                shadow-black/10
                bms-dropdown-scroll
              "
            >

              {/* ==================================================
                  PROFILE HEADER
              ================================================== */}

              <div className="border-b border-[var(--bms-border)] p-4">

                <div className="flex items-center gap-3">

                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-600/15 text-sm font-semibold text-blue-500 ring-1 ring-blue-500/10">

                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={`${fullName || "User"} profile`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials || "U"
                    )}

                    {user?.status === "ACTIVE" && (
                      <span
                        className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--bms-surface)] bg-emerald-500"
                        aria-hidden="true"
                      />
                    )}

                  </div>


                  <div className="min-w-0">

                    <p className="truncate text-sm font-semibold text-[var(--bms-text)]">

                      {fullName ||
                        "Current User"}

                    </p>


                    <p className="mt-0.5 truncate text-xs text-[var(--bms-text-muted)]">

                      {user?.email}

                    </p>

                  </div>

                </div>


                {/* ACTIVE ROLE + STATUS */}

                <div className="mt-3 flex items-center gap-2">

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-medium text-blue-500">

                    <ShieldCheck
                      size={12}
                    />

                    {formattedRole}

                  </span>


                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      user?.status ===
                      "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-slate-500/10 text-[var(--bms-text-muted)]"
                    }`}
                  >

                    {formattedStatus}

                  </span>

                </div>

              </div>


              {/* ==================================================
                  ROLE SWITCHER
              ================================================== */}

              {roles.length >
                0 && (

                <div className="border-b border-[var(--bms-border)] p-3">

                  <div className="mb-2 px-1">

                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                      Switch Role
                    </p>


                    <p className="mt-0.5 text-[11px] text-[var(--bms-text-muted)]">
                      Choose which assigned role is active.
                    </p>

                  </div>


                  {/* ROLE SWITCH ERROR */}

                  {roleSwitchError && (

                    <div className="mb-2 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-500">

                      <AlertCircle
                        size={14}
                        className="mt-0.5 shrink-0"
                      />

                      <span>
                        {roleSwitchError}
                      </span>

                    </div>

                  )}


                  {/* ROLES */}

                  <div
                    className="space-y-1"
                    role="group"
                    aria-label="Available roles"
                  >

                    {roles.map(
                      (role) => {

                        const isActive =
                          activeRole?.id ===
                          role.id;


                        const isSwitching =
                          switchingRoleId ===
                          role.id;


                        return (

                          <button
                            key={
                              role.id
                            }
                            type="button"
                            role="menuitem"
                            disabled={
                              Boolean(
                                switchingRoleId
                              ) ||
                              isActive
                            }
                            onClick={() =>
                              handleRoleSwitch(
                                role
                              )
                            }
                            className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-200 ${
                              isActive
                                ? "border-blue-500/20 bg-blue-500/10"
                                : "border-transparent hover:border-[var(--bms-border)] hover:bg-[var(--bms-surface-soft)]"
                            } disabled:cursor-not-allowed disabled:opacity-70`}
                          >

                            {/* ROLE ICON */}

                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                isActive
                                  ? "bg-blue-500/15 text-blue-500"
                                  : "bg-[var(--bms-surface-soft)] text-[var(--bms-text-muted)]"
                              }`}
                            >

                              {isSwitching ? (

                                <Loader2
                                  size={16}
                                  className="animate-spin"
                                />

                              ) : (

                                <ShieldCheck
                                  size={16}
                                />

                              )}

                            </span>


                            {/* ROLE INFORMATION */}

                            <span className="min-w-0 flex-1">

                              <span
                                className={`block truncate text-sm font-medium ${
                                  isActive
                                    ? "text-blue-500"
                                    : "text-[var(--bms-text)]"
                                }`}
                              >

                                {formatRoleName(
                                  role.name
                                )}

                              </span>


                              <span className="mt-0.5 block truncate text-[11px] text-[var(--bms-text-muted)]">

                                {role.description ||
                                  "No description provided."}

                              </span>

                            </span>


                            {/* ACTIVE INDICATOR */}

                            {isActive && (

                              <Check
                                size={17}
                                className="shrink-0 text-blue-500"
                              />

                            )}

                          </button>

                        );

                      }
                    )}

                  </div>

                </div>

              )}


              {/* ==================================================
                  MENU
              ================================================== */}

              <div
                className="p-2"
                role="none"
              >

                {/* PROFILE */}

                <Link
                  to="/profile"
                  role="menuitem"
                  onClick={() =>
                    setProfileOpen(
                      false
                    )
                  }
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--bms-text-secondary)] transition-all duration-200 hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)]"
                >

                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">

                    <User
                      size={17}
                      strokeWidth={1.8}
                    />

                  </span>


                  <span>
                    Profile
                  </span>

                </Link>


                {/* ACCOUNT SETTINGS */}

                <Link
                  to="/settings"
                  role="menuitem"
                  onClick={() =>
                    setProfileOpen(
                      false
                    )
                  }
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--bms-text-secondary)] transition-all duration-200 hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)]"
                >

                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">

                    <Settings
                      size={17}
                      strokeWidth={1.8}
                    />

                  </span>


                  <span>
                    Account Settings
                  </span>

                </Link>


                {/* SECURITY */}

                <Link
                  to="/security"
                  role="menuitem"
                  onClick={() =>
                    setProfileOpen(
                      false
                    )
                  }
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--bms-text-secondary)] transition-all duration-200 hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)]"
                >

                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">

                    <ShieldCheck
                      size={17}
                      strokeWidth={1.8}
                    />

                  </span>


                  <span>
                    Security
                  </span>

                </Link>

              </div>


              {/* ==================================================
                  LOGOUT
              ================================================== */}

              <div className="border-t border-[var(--bms-border)] p-2">

                <button
                  type="button"
                  role="menuitem"
                  onClick={
                    handleLogout
                  }
                  disabled={
                    isLoggingOut
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 transition-all duration-200 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10">

                    <LogOut
                      size={17}
                      strokeWidth={1.8}
                    />

                  </span>


                  <span>

                    {isLoggingOut
                      ? "Signing out..."
                      : "Logout"}

                  </span>

                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

    </header>

  );

}


export default Topbar;
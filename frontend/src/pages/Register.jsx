import { useState } from "react";
import {
  User,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  Moon,
  Sun,
  UserPlus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useTheme } from "../context/ThemeContext";
import { registerUser } from "../api/auth";

function Register() {
  const { theme, toggleTheme } = useTheme();

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const [serverError, setServerError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const validateForm = () => {
    const newErrors = {};

    const firstName =
      formData.firstName.trim();

    const lastName =
      formData.lastName.trim();

    const email =
      formData.email.trim();

    const password =
      formData.password;

    const confirmPassword =
      formData.confirmPassword;

    /*
     * First name
     */
    if (!firstName) {
      newErrors.firstName =
        "First name is required.";
    } else if (firstName.length < 2) {
      newErrors.firstName =
        "First name must be at least 2 characters.";
    } else if (firstName.length > 50) {
      newErrors.firstName =
        "First name must not exceed 50 characters.";
    }

    /*
     * Last name
     */
    if (!lastName) {
      newErrors.lastName =
        "Last name is required.";
    } else if (lastName.length < 2) {
      newErrors.lastName =
        "Last name must be at least 2 characters.";
    } else if (lastName.length > 50) {
      newErrors.lastName =
        "Last name must not exceed 50 characters.";
    }

    /*
     * Email
     */
    if (!email) {
      newErrors.email =
        "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      newErrors.email =
        "Enter a valid email address.";
    } else if (email.length > 254) {
      newErrors.email =
        "Email address is too long.";
    }

    /*
     * Password
     *
     * Backend requires a minimum of 12 characters.
     */
    if (!password) {
      newErrors.password =
        "Password is required.";
    } else if (password.length < 12) {
      newErrors.password =
        "Password must be at least 12 characters.";
    } else if (password.length > 128) {
      newErrors.password =
        "Password must not exceed 128 characters.";
    }

    /*
     * Confirm password
     */
    if (!confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password.";
    } else if (
      password !== confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    /*
     * Clear field-level validation error
     * while the user corrects the input.
     */
    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    /*
     * Clear server feedback when the
     * user starts editing again.
     */
    setServerError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setServerError("");
    setSuccessMessage("");

    const isValid =
      validateForm();

    if (!isValid) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response =
        await registerUser({
          firstName:
            formData.firstName.trim(),

          lastName:
            formData.lastName.trim(),

          email:
            formData.email.trim(),

          password:
            formData.password,
        });

      /*
       * Backend returns:
       *
       * Registration submitted successfully.
       *
       * The account is created with PENDING
       * status and an approval request.
       */
      setSuccessMessage(
        response.message ||
          "Registration submitted successfully."
      );

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setErrors({});
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      /*
       * Handle field-specific backend
       * validation errors when available.
       */
      if (
        Array.isArray(error.details) &&
        error.details.length > 0
      ) {
        const backendErrors = {};

        error.details.forEach(
          (detail) => {
            const field =
              detail.field?.replace(
                "body.",
                ""
              );

            if (field) {
              backendErrors[field] =
                detail.message;
            }
          }
        );

        setErrors(
          backendErrors
        );
      }

      setServerError(
        error.message ||
          "Unable to complete registration."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (
    field,
    extraClasses = ""
  ) =>
    `h-12 w-full rounded-2xl border bg-[var(--bms-surface-soft)] text-sm text-[var(--bms-text)] outline-none transition-all duration-300 placeholder:text-[var(--bms-text-muted)] ${
      errors[field]
        ? "border-red-500/80 shadow-[0_0_0_4px_rgba(239,68,68,0.10)] focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
        : "border-[var(--bms-border)] hover:border-slate-400/40 focus:border-blue-500/70 focus:bg-[var(--bms-surface)] focus:ring-4 focus:ring-blue-500/10"
    } ${extraClasses}`;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bms-bg)] text-[var(--bms-text)] transition-colors duration-300">

      {/* ==================================================
          THEME TOGGLE
      ================================================== */}
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <button
          type="button"
          onClick={toggleTheme}
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
          className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] text-[var(--bms-text-secondary)] shadow-sm transition-all duration-300 hover:border-blue-500/50 hover:text-[var(--bms-text)] active:scale-95"
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
      </div>

      {/* ==================================================
          MAIN LAYOUT
      ================================================== */}
      <div className="mx-auto flex min-h-screen w-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">

        <div className="grid w-full max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_420px] lg:gap-12">

          {/* ==================================================
              DESKTOP BRANDING
          ================================================== */}
          <section className="hidden flex-col items-center text-center lg:flex lg:items-start lg:text-left">

            <div className="relative flex h-56 w-56 items-center justify-center overflow-hidden rounded-[2.5rem] shadow-2xl shadow-blue-600/15 transition-transform duration-500 hover:scale-[1.02] xl:h-64 xl:w-64 2xl:h-72 2xl:w-72">
              <img
                src="/nts-logo.png"
                alt="NTS Digital Solutions"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mt-7 max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">
                NTS Digital Solutions
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--bms-text)] xl:text-4xl">
                Business Management System
              </h1>

              <p className="mt-3 text-sm leading-7 text-[var(--bms-text-secondary)]">
                Empowering Businesses Through Digital Innovation.
              </p>
            </div>
          </section>

          {/* ==================================================
              REGISTER SECTION
          ================================================== */}
          <section className="w-full max-w-[420px] justify-self-center lg:justify-self-start">

            <div className="rounded-3xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5 shadow-xl shadow-black/5 transition-all duration-300 sm:p-7">

              {/* Mobile branding */}
              <div className="mb-7 flex flex-col items-center text-center lg:hidden">

                <img
                  src="/nts-logo.png"
                  alt="NTS Digital Solutions"
                  className="h-16 w-16 rounded-2xl object-cover shadow-lg shadow-blue-500/10 transition-transform duration-300 hover:scale-105"
                />

                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-blue-500">
                  NTS Digital Solutions
                </p>
              </div>

              {/* Heading */}
              <div className="mb-6">
                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-500">
                    <UserPlus
                      size={20}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[var(--bms-text)]">
                      Create account
                    </h2>

                    <p className="mt-1 text-xs text-[var(--bms-text-secondary)]">
                      Register for NTS BMS access
                    </p>
                  </div>

                </div>
              </div>

              {/* ==================================================
                  SERVER SUCCESS MESSAGE
              ================================================== */}
              {successMessage && (
                <div
                  role="status"
                  className="mb-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4"
                >
                  <div className="flex gap-3">

                    <CheckCircle2
                      size={20}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />

                    <div>
                      <p className="text-sm font-semibold text-emerald-500">
                        Registration submitted
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[var(--bms-text-secondary)]">
                        {successMessage}
                      </p>

                      <p className="mt-2 text-xs leading-5 text-[var(--bms-text-secondary)]">
                        Your account is awaiting administrator approval. You will be able to sign in once your account becomes active.
                      </p>
                    </div>

                  </div>
                </div>
              )}

              {/* ==================================================
                  SERVER ERROR
              ================================================== */}
              {serverError && !successMessage && (
                <div
                  role="alert"
                  className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4"
                >
                  <div className="flex gap-3">

                    <AlertCircle
                      size={20}
                      className="mt-0.5 shrink-0 text-red-500"
                    />

                    <p className="text-sm leading-5 text-red-500">
                      {serverError}
                    </p>

                  </div>
                </div>
              )}

              {/* ==================================================
                  FORM
              ================================================== */}
              <form
                onSubmit={handleSubmit}
                noValidate
              >

                {/* First name */}
                <div className="group relative">

                  <User
                    size={19}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className={`pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 transition-colors duration-200 ${
                      errors.firstName
                        ? "text-red-500"
                        : "text-[var(--bms-text-muted)] group-focus-within:text-blue-500"
                    }`}
                  />

                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    aria-label="First name"
                    aria-invalid={Boolean(
                      errors.firstName
                    )}
                    aria-describedby={
                      errors.firstName
                        ? "firstName-error"
                        : undefined
                    }
                    required
                    className={inputClass(
                      "firstName",
                      "pl-12 pr-4"
                    )}
                  />

                  {errors.firstName && (
                    <p
                      id="firstName-error"
                      className="mt-1.5 px-1 text-xs font-medium text-red-500"
                    >
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last name */}
                <div className="group relative mt-4">

                  <User
                    size={19}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className={`pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 transition-colors duration-200 ${
                      errors.lastName
                        ? "text-red-500"
                        : "text-[var(--bms-text-muted)] group-focus-within:text-blue-500"
                    }`}
                  />

                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    aria-label="Last name"
                    aria-invalid={Boolean(
                      errors.lastName
                    )}
                    aria-describedby={
                      errors.lastName
                        ? "lastName-error"
                        : undefined
                    }
                    required
                    className={inputClass(
                      "lastName",
                      "pl-12 pr-4"
                    )}
                  />

                  {errors.lastName && (
                    <p
                      id="lastName-error"
                      className="mt-1.5 px-1 text-xs font-medium text-red-500"
                    >
                      {errors.lastName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="group relative mt-4">

                  <Mail
                    size={19}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className={`pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 transition-colors duration-200 ${
                      errors.email
                        ? "text-red-500"
                        : "text-[var(--bms-text-muted)] group-focus-within:text-blue-500"
                    }`}
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email address"
                    aria-label="Email address"
                    aria-invalid={Boolean(
                      errors.email
                    )}
                    aria-describedby={
                      errors.email
                        ? "register-email-error"
                        : undefined
                    }
                    required
                    className={inputClass(
                      "email",
                      "pl-12 pr-4"
                    )}
                  />

                  {errors.email && (
                    <p
                      id="register-email-error"
                      className="mt-1.5 px-1 text-xs font-medium text-red-500"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="group relative mt-4">

                  <LockKeyhole
                    size={19}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className={`pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 transition-colors duration-200 ${
                      errors.password
                        ? "text-red-500"
                        : "text-[var(--bms-text-muted)] group-focus-within:text-blue-500"
                    }`}
                  />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    aria-label="Password"
                    aria-invalid={Boolean(
                      errors.password
                    )}
                    aria-describedby={
                      errors.password
                        ? "register-password-error"
                        : undefined
                    }
                    required
                    className={inputClass(
                      "password",
                      "pl-12 pr-12"
                    )}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[var(--bms-text-muted)] transition-all duration-200 hover:bg-[var(--bms-surface)] hover:text-[var(--bms-text)] active:scale-95"
                  >
                    {showPassword ? (
                      <EyeOff
                        size={18}
                        strokeWidth={1.8}
                      />
                    ) : (
                      <Eye
                        size={18}
                        strokeWidth={1.8}
                      />
                    )}
                  </button>

                  {errors.password && (
                    <p
                      id="register-password-error"
                      className="mt-1.5 px-1 text-xs font-medium text-red-500"
                    >
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm password */}
                <div className="group relative mt-4">

                  <LockKeyhole
                    size={19}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className={`pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 transition-colors duration-200 ${
                      errors.confirmPassword
                        ? "text-red-500"
                        : "text-[var(--bms-text-muted)] group-focus-within:text-blue-500"
                    }`}
                  />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={
                      formData.confirmPassword
                    }
                    onChange={handleChange}
                    placeholder="Confirm password"
                    aria-label="Confirm password"
                    aria-invalid={Boolean(
                      errors.confirmPassword
                    )}
                    aria-describedby={
                      errors.confirmPassword
                        ? "confirm-password-error"
                        : undefined
                    }
                    required
                    className={inputClass(
                      "confirmPassword",
                      "pl-12 pr-12"
                    )}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[var(--bms-text-muted)] transition-all duration-200 hover:bg-[var(--bms-surface)] hover:text-[var(--bms-text)] active:scale-95"
                  >
                    {showConfirmPassword ? (
                      <EyeOff
                        size={18}
                        strokeWidth={1.8}
                      />
                    ) : (
                      <Eye
                        size={18}
                        strokeWidth={1.8}
                      />
                    )}
                  </button>

                  {errors.confirmPassword && (
                    <p
                      id="confirm-password-error"
                      className="mt-1.5 px-1 text-xs font-medium text-red-500"
                    >
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative mt-6 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-600/25 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-blue-600 disabled:hover:shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <span className="relative z-10 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      <span className="relative z-10">
                        Creating account...
                      </span>
                    </>
                  ) : (
                    <>
                      <UserPlus
                        size={18}
                        strokeWidth={1.8}
                        className="relative z-10"
                      />

                      <span className="relative z-10">
                        Create account
                      </span>
                    </>
                  )}

                  {!isSubmitting && (
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  )}
                </button>
              </form>
            </div>

            {/* Login prompt */}
            <p className="mt-5 text-center text-sm text-[var(--bms-text-secondary)]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-500 transition-colors duration-200 hover:text-blue-400 hover:underline"
              >
                Sign in
              </Link>
            </p>

            {/* Footer */}
            <p className="mt-5 text-center text-xs text-[var(--bms-text-muted)]">
              © {new Date().getFullYear()} NTS Digital Solutions
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Register;
import { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Moon,
  Sun,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { theme, toggleTheme } = useTheme();
  const { login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [serverError, setServerError] =
    useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    /*
     * Remove the field's error as soon
     * as the user starts correcting it.
     */
    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};

    const email =
      formData.email.trim();

    const password =
      formData.password;

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
    }

    if (!password) {
      newErrors.password =
        "Password is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors)
      .length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setServerError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      const user = result?.user;

      /*
       * The backend/session layer is now
       * the source of truth.
       */

      if (!user) {
        throw new Error(
          "Unable to verify your account."
        );
      }

      /*
       * Handle account status explicitly.
       */
      if (user.status === "PENDING") {
        setServerError(
          "Your account is awaiting administrator approval."
        );

        return;
      }

      if (user.status === "REJECTED") {
        setServerError(
          "Your account registration was rejected."
        );

        return;
      }

      if (user.status === "SUSPENDED") {
        setServerError(
          "Your account has been suspended. Please contact an administrator."
        );

        return;
      }

      /*
       * If the user originally attempted
       * to access a protected page,
       * return them there.
       *
       * Otherwise go to dashboard.
       */
      const destination =
        location.state?.from?.pathname ||
        "/dashboard";

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setServerError(
        error?.message ||
          "Unable to sign in. Please check your credentials and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `h-13 w-full rounded-2xl border bg-[var(--bms-surface-soft)] text-sm text-[var(--bms-text)] outline-none transition-all duration-300 placeholder:text-[var(--bms-text-muted)] ${
      errors[field]
        ? "border-red-500/80 ring-4 ring-red-500/10 focus:border-red-500"
        : "border-[var(--bms-border)] hover:border-slate-400/40 focus:border-blue-500/70 focus:bg-[var(--bms-surface)] focus:ring-4 focus:ring-blue-500/10"
    }`;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bms-bg)] text-[var(--bms-text)] transition-colors duration-300">

      {/* Theme toggle */}
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
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
            <Moon size={18} />
          </span>

          <span
            className={`absolute transition-all duration-300 ${
              theme === "light"
                ? "rotate-0 scale-100 opacity-100"
                : "-rotate-90 scale-0 opacity-0"
            }`}
          >
            <Sun size={18} />
          </span>
        </button>
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* Branding */}
          <section className="hidden flex-col items-center text-center lg:flex lg:items-start lg:text-left">

            <div className="relative flex h-72 w-72 items-center justify-center overflow-hidden rounded-[2.5rem] shadow-2xl shadow-blue-600/15 transition-transform duration-500 hover:scale-[1.02] lg:h-96 lg:w-96">
              <img
                src="/nts-logo.png"
                alt="NTS Digital Solutions"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mt-8 max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">
                NTS Digital Solutions
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--bms-text)] lg:text-5xl">
                Business Management System
              </h1>

              <p className="mt-4 text-base leading-7 text-[var(--bms-text-secondary)]">
                Empowering Businesses Through Digital Innovation.
              </p>
            </div>
          </section>

          {/* Login */}
          <section className="w-full max-w-md justify-self-center lg:justify-self-start">

            <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5 shadow-xl shadow-black/5 transition-colors duration-300 sm:p-7">

              {/* Mobile logo */}
              <div className="mb-6 flex flex-col items-center text-center lg:hidden">
                <img
                  src="/nts-logo.png"
                  alt="NTS Digital Solutions"
                  className="h-16 w-16 rounded-2xl object-cover shadow-lg shadow-blue-500/10"
                />

                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-blue-500">
                  NTS Digital Solutions
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                noValidate
              >

                {/* Server error */}
                {serverError && (
                  <div
                    role="alert"
                    className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500"
                  >
                    {serverError}
                  </div>
                )}

                {/* Email */}
                <div className="group relative">
                  <Mail
                    size={19}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className={`pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 transition-colors ${
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
                    aria-invalid={
                      Boolean(errors.email)
                    }
                    aria-describedby={
                      errors.email
                        ? "email-error"
                        : undefined
                    }
                    className={`${inputClass(
                      "email"
                    )} pl-12 pr-4`}
                  />

                  {errors.email && (
                    <p
                      id="email-error"
                      className="mt-1.5 px-1 text-xs text-red-500"
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
                    className={`pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 transition-colors ${
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
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    aria-label="Password"
                    aria-invalid={
                      Boolean(
                        errors.password
                      )
                    }
                    aria-describedby={
                      errors.password
                        ? "password-error"
                        : undefined
                    }
                    className={`${inputClass(
                      "password"
                    )} pl-12 pr-12`}
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
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[var(--bms-text-muted)] transition-all hover:bg-[var(--bms-surface)] hover:text-[var(--bms-text)] active:scale-95"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                  {errors.password && (
                    <p
                      id="password-error"
                      className="mt-1.5 px-1 text-xs text-red-500"
                    >
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Options */}
                <div className="mt-5 flex items-center justify-between gap-4">
                  <label className="flex cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={
                        formData.rememberMe
                      }
                      onChange={
                        handleChange
                      }
                      className="h-4 w-4 cursor-pointer rounded border-[var(--bms-border)] accent-blue-600"
                    />

                    <span className="text-xs font-medium text-[var(--bms-text-secondary)]">
                      Remember me
                    </span>
                  </label>

                  <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-blue-500 transition-colors hover:text-blue-400"
                  >
                      Forgot password?
                  </Link>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative mt-6 flex h-12 w-full items-center justify-center overflow-hidden rounded-2xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-600/25 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="relative z-10">
                    {isSubmitting
                      ? "Signing in..."
                      : "Sign in"}
                  </span>

                  {!isSubmitting && (
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  )}
                </button>
              </form>

              {/* Register */}
              <p className="mt-6 text-center text-sm text-[var(--bms-text-secondary)]">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-blue-500 transition-colors hover:text-blue-400"
                >
                  Register here
                </Link>
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-[var(--bms-text-muted)]">
              © {new Date().getFullYear()} NTS Digital Solutions
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Login;
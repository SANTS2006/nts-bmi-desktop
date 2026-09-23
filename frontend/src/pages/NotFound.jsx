import { motion } from "framer-motion";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <main
      className="flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bms-bg)] px-6 py-12 text-[var(--bms-text)] transition-colors duration-300"
      aria-labelledby="not-found-title"
    >
      <div className="relative w-full max-w-2xl text-center">

        {/* Decorative background */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl"
          aria-hidden="true"
        />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className="relative"
        >
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.4,
              delay: 0.1,
              ease: "easeOut",
            }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] text-blue-500 shadow-lg shadow-blue-500/10"
          >
            <SearchX
              size={38}
              strokeWidth={1.7}
              aria-hidden="true"
            />
          </motion.div>

          {/* Error code */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-7xl font-bold tracking-tight text-blue-500 sm:text-8xl"
          >
            404
          </motion.p>

          {/* Heading */}
          <h1
            id="not-found-title"
            className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Page not found
          </h1>

          {/* Description */}
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--bms-text-secondary)] sm:text-base">
            The page you're looking for doesn't exist,
            may have been moved, or the address may be
            incorrect.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">

            {/* Go back */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] px-5 text-sm font-semibold text-[var(--bms-text-secondary)] shadow-sm transition-all duration-300 hover:border-blue-500/40 hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)] active:scale-[0.98] sm:w-auto"
            >
              <ArrowLeft
                size={17}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              Go back
            </button>

            {/* Dashboard */}
            <Link
              to="/dashboard"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-600/25 active:scale-[0.98] sm:w-auto"
            >
              <Home
                size={17}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              Dashboard
            </Link>
          </div>

          {/* Branding */}
          <div className="mt-10 flex items-center justify-center gap-3">
            <img
              src="/nts-logo.png"
              alt="NTS Digital Solutions"
              className="h-9 w-9 rounded-lg object-cover"
            />

            <div className="text-left">
              <p className="text-xs font-semibold text-[var(--bms-text)]">
                NTS Digital Solutions
              </p>

              <p className="text-[11px] text-[var(--bms-text-muted)]">
                Business Management System
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default NotFound;
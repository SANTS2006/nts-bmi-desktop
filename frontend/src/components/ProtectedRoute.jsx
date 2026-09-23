import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {
  const {
    isAuthenticated,
    isLoading,
  } = useAuth();

  const location = useLocation();

  if (isLoading) {
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-[var(--bms-bg)] px-6 text-[var(--bms-text)]"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex flex-col items-center">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--bms-border)] border-t-blue-500"
            aria-hidden="true"
          />

          <p className="mt-4 text-sm text-[var(--bms-text-secondary)]">
            Checking your session...
          </p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
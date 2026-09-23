import {
  ShieldX,
  ArrowLeft,
  Home,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
  getActiveRoleName,
} from "../../security/authorization";


export default function AccessDenied() {

  const navigate =
    useNavigate();

  const {
    user,
  } = useAuth();


  const role =
    getActiveRoleName(user);


  return (

    <div className="flex min-h-[70vh] items-center justify-center px-6">

      <div className="w-full max-w-md text-center">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">

          <ShieldX
            size={30}
            className="text-red-500"
          />

        </div>


        <h1 className="mt-6 text-2xl font-bold text-[var(--bms-text)]">

          Access Denied

        </h1>


        <p className="mt-3 text-sm leading-6 text-[var(--bms-text-secondary)]">

          You do not have permission to access
          this workspace or resource.

        </p>


        {role && (

          <p className="mt-2 text-xs text-[var(--bms-text-muted)]">

            Active role:{" "}

            <span className="font-semibold">

              {role}

            </span>

          </p>

        )}


        <div className="mt-7 flex items-center justify-center gap-3">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              inline-flex
              items-center
              gap-2
              rounded-lg
              border
              border-[var(--bms-border)]
              px-4
              py-2.5
              text-sm
              font-medium
              text-[var(--bms-text)]
              transition
              hover:bg-[var(--bms-surface-soft)]
            "
          >

            <ArrowLeft size={16} />

            Go Back

          </button>


          <button
            type="button"
            onClick={() => navigate("/home")}
            className="
              inline-flex
              items-center
              gap-2
              rounded-lg
              bg-blue-600
              px-4
              py-2.5
              text-sm
              font-medium
              text-white
              transition
              hover:bg-blue-700
            "
          >

            <Home size={16} />

            Home

          </button>

        </div>

      </div>

    </div>

  );

}
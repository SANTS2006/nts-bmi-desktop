import {
  ShieldCheck,
  LockKeyhole,
  Monitor,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  History,
  ChevronRight,
} from "lucide-react";

import { useState } from "react";

import {
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../api/client";

function Security() {

  const { user, refreshUser } = useAuth();

  const navigate = useNavigate();


  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);


  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });


  const [errors, setErrors] = useState({});


  const [isChangingPassword, setIsChangingPassword] =
    useState(false);


  const [successMessage, setSuccessMessage] =
    useState("");


  const [errorMessage, setErrorMessage] =
    useState("");


  /*
   * ==================================================
   * PASSWORD REQUIREMENTS
   * ==================================================
   */

  const passwordRequirements = {

    minLength:
      formData.newPassword.length >= 8,

    lowercase:
      /[a-z]/.test(
        formData.newPassword
      ),

    uppercase:
      /[A-Z]/.test(
        formData.newPassword
      ),

    number:
      /[0-9]/.test(
        formData.newPassword
      ),

    special:
      /[^A-Za-z0-9]/.test(
        formData.newPassword
      ),

    matching:
      formData.newPassword.length > 0 &&
      formData.confirmPassword.length > 0 &&
      formData.newPassword ===
        formData.confirmPassword,
  };


  const allPasswordRequirementsMet =
    passwordRequirements.minLength &&
    passwordRequirements.lowercase &&
    passwordRequirements.uppercase &&
    passwordRequirements.number &&
    passwordRequirements.special &&
    passwordRequirements.matching;


  /*
   * ==================================================
   * HANDLE INPUT
   * ==================================================
   */

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;


    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));


    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));


    setSuccessMessage("");
    setErrorMessage("");
  };


  /*
   * ==================================================
   * VALIDATE PASSWORD FORM
   * ==================================================
   */

  const validatePasswordForm = () => {

    const nextErrors = {};


    if (!formData.currentPassword) {

      nextErrors.currentPassword =
        "Enter your current password.";

    }


    if (!formData.newPassword) {

      nextErrors.newPassword =
        "Enter your new password.";

    } else if (
      !passwordRequirements.minLength
    ) {

      nextErrors.newPassword =
        "Password must contain at least 8 characters.";

    } else if (
      !passwordRequirements.lowercase
    ) {

      nextErrors.newPassword =
        "Password must contain at least one lowercase letter.";

    } else if (
      !passwordRequirements.uppercase
    ) {

      nextErrors.newPassword =
        "Password must contain at least one uppercase letter.";

    } else if (
      !passwordRequirements.number
    ) {

      nextErrors.newPassword =
        "Password must contain at least one number.";

    } else if (
      !passwordRequirements.special
    ) {

      nextErrors.newPassword =
        "Password must contain at least one special character.";

    }


    if (!formData.confirmPassword) {

      nextErrors.confirmPassword =
        "Confirm your new password.";

    } else if (
      formData.confirmPassword !==
      formData.newPassword
    ) {

      nextErrors.confirmPassword =
        "Passwords do not match.";

    }


    setErrors(nextErrors);


    return (
      Object.keys(nextErrors).length === 0
    );

  };


  /*
   * ==================================================
   * CHANGE PASSWORD
   * ==================================================
   */

  const handlePasswordSubmit =
    async (event) => {

      event.preventDefault();


      setSuccessMessage("");
      setErrorMessage("");


      if (!validatePasswordForm()) {
        return;
      }


      try {

        setIsChangingPassword(true);


        await apiRequest(
          "/api/auth/password",
          {
            method: "PATCH",

            body: {
              currentPassword:
                formData.currentPassword,

              newPassword:
                formData.newPassword,
            },
          }
        );


        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });


        setErrors({});


        setSuccessMessage(
          "Password changed successfully. Please sign in again."
        );


        /*
         * The backend clears the session after
         * a successful password change.
         */

        if (refreshUser) {
          await refreshUser();
        }


      } catch (error) {

        setErrorMessage(
          error?.message ||
          "Unable to change your password."
        );


      } finally {

        setIsChangingPassword(false);

      }

    };


  /*
   * ==================================================
   * INPUT CLASS
   * ==================================================
   */

  const getInputClass = (
    fieldName
  ) => {

    const hasError =
      Boolean(errors[fieldName]);


    return `
      h-12
      w-full
      rounded-xl
      border
      bg-[var(--bms-surface-soft)]
      px-4
      text-sm
      text-[var(--bms-text)]
      outline-none
      transition-all
      duration-300
      placeholder:text-[var(--bms-text-muted)]
      ${
        hasError
          ? "border-red-500/80 ring-4 ring-red-500/10"
          : "border-[var(--bms-border)] focus:border-blue-500/70 focus:ring-4 focus:ring-blue-500/10"
      }
    `;

  };


  /*
   * ==================================================
   * USER STATUS
   * ==================================================
   */

  const formattedStatus =
    user?.status
      ? user.status.charAt(0) +
        user.status.slice(1).toLowerCase()
      : "Unknown";


  const isActive =
    user?.status === "ACTIVE";


  return (

    <div
      className="
        mx-auto
        w-full
        space-y-6
      "
    >

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <section>

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-blue-500/10
              text-blue-500
            "
          >

            <ShieldCheck
              size={21}
              strokeWidth={1.8}
            />

          </div>


          <div>

            <h1
              className="
                text-2xl
                font-bold
                tracking-tight
                text-[var(--bms-text)]
                sm:text-3xl
              "
            >
              Security
            </h1>


            <p
              className="
                mt-1
                text-sm
                text-[var(--bms-text-secondary)]
              "
            >
              Manage your password and account security.
            </p>

          </div>

        </div>

      </section>


      {/* ==================================================
          SECURITY STATUS
      ================================================== */}

      <section
        className="
          rounded-2xl
          border
          border-[var(--bms-border)]
          bg-[var(--bms-surface)]
          p-5
          shadow-sm
          transition-colors
          duration-300
          sm:p-6
        "
      >

        <div
          className="
            flex
            items-start
            gap-3
          "
        >

          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-emerald-500/10
              text-emerald-500
            "
          >

            <CheckCircle2 size={19} />

          </div>


          <div>

            <h2
              className="
                text-base
                font-semibold
                text-[var(--bms-text)]
              "
            >
              Security status
            </h2>


            <p
              className="
                mt-1
                text-xs
                leading-5
                text-[var(--bms-text-secondary)]
              "
            >
              Your account is protected by the NTS Business Management System authentication system.
            </p>

          </div>

        </div>


        <div
          className="
            mt-5
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-3
          "
        >

          <SecurityStatus
            icon={ShieldCheck}
            title="Account"
            value={
              isActive
                ? "Active"
                : formattedStatus
            }
            iconClass="bg-emerald-500/10 text-emerald-500"
          />


          <SecurityStatus
            icon={LockKeyhole}
            title="Authentication"
            value="Session protected"
            iconClass="bg-blue-500/10 text-blue-500"
          />


          <SecurityStatus
            icon={KeyRound}
            title="Password"
            value="Protected"
            iconClass="bg-purple-500/10 text-purple-500"
          />

        </div>

      </section>


      {/* ==================================================
          PASSWORD HISTORY
      ================================================== */}

      <section
        className="
          rounded-2xl
          border
          border-[var(--bms-border)]
          bg-[var(--bms-surface)]
          p-5
          shadow-sm
          transition-all
          duration-300
          sm:p-6
        "
      >

        <div
          className="
            flex
            flex-col
            gap-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div
            className="
              flex
              items-start
              gap-3
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-blue-500/10
                text-blue-500
              "
            >

              <History
                size={19}
                strokeWidth={1.8}
              />

            </div>


            <div>

              <h2
                className="
                  text-base
                  font-semibold
                  text-[var(--bms-text)]
                "
              >
                Password history
              </h2>


              <p
                className="
                  mt-1
                  max-w-xl
                  text-xs
                  leading-5
                  text-[var(--bms-text-secondary)]
                "
              >
                Review when your previous passwords were changed.
                Previous passwords are securely stored and cannot
                be viewed.
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={() =>
              navigate("/password-history")
            }
            className="
              group
              inline-flex
              h-10
              shrink-0
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-[var(--bms-border)]
              bg-[var(--bms-surface-soft)]
              px-4
              text-sm
              font-semibold
              text-[var(--bms-text)]
              transition-all
              duration-300
              hover:border-blue-500/50
              hover:bg-blue-500/5
              hover:text-blue-500
              active:scale-[0.98]
            "
          >

            <span>
              View password history
            </span>


            <ChevronRight
              size={16}
              className="
                transition-transform
                duration-300
                group-hover:translate-x-0.5
              "
            />

          </button>

        </div>

      </section>


      {/* ==================================================
          CHANGE PASSWORD
      ================================================== */}

      <section
        className="
          rounded-2xl
          border
          border-[var(--bms-border)]
          bg-[var(--bms-surface)]
          p-5
          shadow-sm
          transition-colors
          duration-300
          sm:p-6
        "
      >

        <div
          className="
            flex
            items-start
            gap-3
          "
        >

          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-orange-500/10
              text-orange-500
            "
          >

            <LockKeyhole
              size={19}
              strokeWidth={1.8}
            />

          </div>


          <div>

            <h2
              className="
                text-base
                font-semibold
                text-[var(--bms-text)]
              "
            >
              Change password
            </h2>


            <p
              className="
                mt-1
                text-xs
                leading-5
                text-[var(--bms-text-secondary)]
              "
            >
              Create a strong password to protect your account.
            </p>

          </div>

        </div>


        {/* Success */}

        {successMessage && (

          <div
            role="status"
            className="
              mt-5
              flex
              items-start
              gap-3
              rounded-xl
              border
              border-emerald-500/20
              bg-emerald-500/5
              p-4
              text-sm
              text-emerald-500
            "
          >

            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />


            <p>
              {successMessage}
            </p>

          </div>

        )}


        {/* Error */}

        {errorMessage && (

          <div
            role="alert"
            className="
              mt-5
              flex
              items-start
              gap-3
              rounded-xl
              border
              border-red-500/20
              bg-red-500/5
              p-4
              text-sm
              text-red-500
            "
          >

            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0"
            />


            <p>
              {errorMessage}
            </p>

          </div>

        )}


        <form
          onSubmit={handlePasswordSubmit}
          noValidate
          className="
            mt-6
            max-w-2xl
            space-y-5
          "
        >

          {/* Current password */}

          <PasswordInput
            id="currentPassword"
            name="currentPassword"
            label="Current password"
            placeholder="Enter your current password"
            value={formData.currentPassword}
            onChange={handleChange}
            showPassword={
              showCurrentPassword
            }
            setShowPassword={
              setShowCurrentPassword
            }
            error={
              errors.currentPassword
            }
            inputClass={getInputClass(
              "currentPassword"
            )}
          />


          {/* New password */}

          <PasswordInput
            id="newPassword"
            name="newPassword"
            label="New password"
            placeholder="Enter your new password"
            value={formData.newPassword}
            onChange={handleChange}
            showPassword={
              showNewPassword
            }
            setShowPassword={
              setShowNewPassword
            }
            error={
              errors.newPassword
            }
            inputClass={getInputClass(
              "newPassword"
            )}
          />


          {/* Password requirements */}

          <PasswordRequirements
            requirements={
              passwordRequirements
            }
            hasStarted={
              formData.newPassword.length > 0
            }
          />


          {/* Confirm password */}

          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm new password"
            placeholder="Confirm your new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            showPassword={
              showConfirmPassword
            }
            setShowPassword={
              setShowConfirmPassword
            }
            error={
              errors.confirmPassword
            }
            inputClass={getInputClass(
              "confirmPassword"
            )}
          />


          {/* Submit */}

          <button
            type="submit"
            disabled={
              isChangingPassword ||
              !allPasswordRequirementsMet ||
              !formData.currentPassword
            }
            className="
              flex
              h-12
              w-full
              items-center
              justify-center
              rounded-xl
              bg-blue-600
              px-5
              text-sm
              font-semibold
              text-white
              shadow-lg
              shadow-blue-600/20
              transition-all
              duration-300
              hover:bg-blue-500
              hover:shadow-xl
              hover:shadow-blue-600/20
              active:scale-[0.99]
              disabled:cursor-not-allowed
              disabled:opacity-50
              sm:w-auto
            "
          >

            {isChangingPassword
              ? "Changing password..."
              : "Change password"}

          </button>

        </form>

      </section>


      {/* ==================================================
          ACTIVE SESSIONS
      ================================================== */}

      <section
        className="
          rounded-2xl
          border
          border-[var(--bms-border)]
          bg-[var(--bms-surface)]
          p-5
          shadow-sm
          transition-colors
          duration-300
          sm:p-6
        "
      >

        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div
            className="
              flex
              items-start
              gap-3
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-purple-500/10
                text-purple-500
              "
            >

              <Monitor
                size={19}
                strokeWidth={1.8}
              />

            </div>


            <div>

              <h2
                className="
                  text-base
                  font-semibold
                  text-[var(--bms-text)]
                "
              >
                Active sessions
              </h2>


              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-[var(--bms-text-secondary)]
                "
              >
                Review devices and sessions connected to your account.
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={() =>
              navigate("/sessions")
            }
            className="
              inline-flex
              items-center
              justify-center
              rounded-xl
              border
              border-[var(--bms-border)]
              bg-[var(--bms-surface-soft)]
              px-4
              py-2.5
              text-sm
              font-medium
              text-[var(--bms-text)]
              transition-all
              duration-300
              hover:border-blue-500/50
              hover:text-blue-500
            "
          >
            View sessions
          </button>

        </div>

      </section>


      {/* ==================================================
          SECURITY WARNING
      ================================================== */}

      <section
        className="
          rounded-2xl
          border
          border-orange-500/15
          bg-orange-500/[0.04]
          p-5
          sm:p-6
        "
      >

        <div
          className="
            flex
            gap-3
          "
        >

          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-orange-500/10
              text-orange-500
            "
          >

            <AlertTriangle size={17} />

          </div>


          <div>

            <h2
              className="
                text-sm
                font-semibold
                text-[var(--bms-text)]
              "
            >
              Protect your account
            </h2>


            <p
              className="
                mt-1
                text-xs
                leading-5
                text-[var(--bms-text-secondary)]
              "
            >
              Never share your password or authentication information
              with another person. If you notice suspicious activity,
              review your active sessions and sign out of sessions you
              do not recognize.
            </p>

          </div>

        </div>

      </section>

    </div>

  );
}


/*
 * ==================================================
 * PASSWORD INPUT
 * ==================================================
 */

function PasswordInput({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  showPassword,
  setShowPassword,
  error,
  inputClass,
}) {

  return (

    <div>

      <label
        htmlFor={id}
        className="
          text-sm
          font-medium
          text-[var(--bms-text)]
        "
      >
        {label}
      </label>


      <div
        className="
          relative
          mt-2
        "
      >

        <LockKeyhole
          size={18}
          strokeWidth={1.8}
          className="
            pointer-events-none
            absolute
            left-4
            top-1/2
            z-10
            -translate-y-1/2
            text-[var(--bms-text-muted)]
          "
          aria-hidden="true"
        />


        <input
          id={id}
          name={name}
          type={
            showPassword
              ? "text"
              : "password"
          }
          autoComplete={
            name === "currentPassword"
              ? "current-password"
              : "new-password"
          }
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={
            Boolean(error)
          }
          aria-describedby={
            error
              ? `${id}-error`
              : undefined
          }
          className={`
            ${inputClass}
            pl-11
            pr-12
          `}
        />


        <button
          type="button"
          onClick={() =>
            setShowPassword(
              (previous) => !previous
            )
          }
          className="
            absolute
            right-2
            top-1/2
            flex
            h-9
            w-9
            -translate-y-1/2
            items-center
            justify-center
            rounded-lg
            text-[var(--bms-text-muted)]
            transition
            hover:bg-[var(--bms-surface)]
            hover:text-[var(--bms-text)]
          "
          aria-label={
            showPassword
              ? `Hide ${label}`
              : `Show ${label}`
          }
        >

          {showPassword ? (
            <EyeOff size={17} />
          ) : (
            <Eye size={17} />
          )}

        </button>

      </div>


      {error && (

        <p
          id={`${id}-error`}
          className="
            mt-1.5
            text-xs
            text-red-500
          "
          role="alert"
        >
          {error}
        </p>

      )}

    </div>

  );
}


/*
 * ==================================================
 * PASSWORD REQUIREMENTS
 * ==================================================
 */

function PasswordRequirements({
  requirements,
  hasStarted,
}) {

  const items = [

    {
      key: "minLength",
      label: "At least 8 characters",
    },

    {
      key: "lowercase",
      label: "At least one lowercase letter",
    },

    {
      key: "uppercase",
      label: "At least one uppercase letter",
    },

    {
      key: "number",
      label: "At least one number",
    },

    {
      key: "special",
      label: "At least one special character",
    },

  ];


  return (

    <div
      className="
        rounded-xl
        border
        border-[var(--bms-border)]
        bg-[var(--bms-surface-soft)]
        p-4
      "
    >

      <p
        className="
          text-xs
          font-semibold
          text-[var(--bms-text)]
        "
      >
        Password requirements
      </p>


      <div
        className="
          mt-3
          grid
          grid-cols-1
          gap-2
          sm:grid-cols-2
        "
      >

        {items.map(
          (item) => {

            const passed =
              requirements[item.key];


            return (

              <div
                key={item.key}
                className={`
                  flex
                  items-center
                  gap-2
                  text-xs
                  transition-colors
                  duration-200
                  ${
                    passed
                      ? "text-emerald-500"
                      : hasStarted
                        ? "text-red-500"
                        : "text-[var(--bms-text-muted)]"
                  }
                `}
              >

                <CheckCircle2
                  size={14}
                  strokeWidth={1.8}
                />


                <span>
                  {item.label}
                </span>

              </div>

            );

          }
        )}

      </div>


      {/* Password match */}

      <div
        className={`
          mt-2
          flex
          items-center
          gap-2
          text-xs
          transition-colors
          duration-200
          ${
            requirements.matching
              ? "text-emerald-500"
              : "text-[var(--bms-text-muted)]"
          }
        `}
      >

        <CheckCircle2
          size={14}
          strokeWidth={1.8}
        />


        <span>
          New passwords must match
        </span>

      </div>

    </div>

  );
}


/*
 * ==================================================
 * SECURITY STATUS CARD
 * ==================================================
 */

function SecurityStatus({
  icon: Icon,
  title,
  value,
  iconClass,
}) {

  return (

    <div
      className="
        rounded-xl
        border
        border-[var(--bms-border)]
        bg-[var(--bms-surface-soft)]
        p-4
      "
    >

      <div
        className={`
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-lg
          ${iconClass}
        `}
      >

        <Icon
          size={17}
          strokeWidth={1.8}
        />

      </div>


      <p
        className="
          mt-4
          text-xs
          text-[var(--bms-text-muted)]
        "
      >
        {title}
      </p>


      <p
        className="
          mt-1
          text-sm
          font-semibold
          text-[var(--bms-text)]
        "
      >
        {value}
      </p>

    </div>

  );
}


export default Security;
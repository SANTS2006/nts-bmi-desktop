import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
    Link,
} from "react-router-dom";

import {
    Eye,
    EyeOff,
    ArrowLeft,
    CheckCircle2,
    AlertTriangle,
    LockKeyhole,
} from "lucide-react";

import {
    useTheme,
} from "../context/ThemeContext";

import {
    resetPassword,
} from "../api/auth";


function ResetPassword() {

    const {
        theme,
    } = useTheme();

    const navigate =
        useNavigate();


    /*
     * ==================================================
     * TOKEN
     * ==================================================
     */

    const [
        token,
        setToken,
    ] = useState("");


    /*
     * ==================================================
     * FORM
     * ==================================================
     */

    const [
        newPassword,
        setNewPassword,
    ] = useState("");


    const [
        confirmPassword,
        setConfirmPassword,
    ] = useState("");


    /*
     * ==================================================
     * UI STATE
     * ==================================================
     */

    const [
        showPassword,
        setShowPassword,
    ] = useState(false);


    const [
        showConfirmPassword,
        setShowConfirmPassword,
    ] = useState(false);


    const [
        isSubmitting,
        setIsSubmitting,
    ] = useState(false);


    const [
        successMessage,
        setSuccessMessage,
    ] = useState("");


    const [
        errorMessage,
        setErrorMessage,
    ] = useState("");


    const [
        fieldErrors,
        setFieldErrors,
    ] = useState({});


    /*
     * ==================================================
     * READ RESET TOKEN
     * ==================================================
     */

    useEffect(() => {

        const searchParams =
            new URLSearchParams(
                window.location.search
            );


        const resetToken =
            searchParams.get("token");


        if (resetToken) {

            setToken(
                resetToken
            );

        } else {

            setErrorMessage(
                "This password reset link is invalid or incomplete."
            );

        }

    }, []);


    /*
     * ==================================================
     * VALIDATE PASSWORD
     * ==================================================
     */

    const validateForm = () => {

        const errors = {};


        if (!newPassword) {

            errors.newPassword =
                "New password is required.";

        } else if (
            newPassword.length < 12
        ) {

            errors.newPassword =
                "Password must be at least 12 characters.";

        } else if (
            newPassword.length > 128
        ) {

            errors.newPassword =
                "Password must not exceed 128 characters.";

        } else if (
            !/[A-Z]/.test(newPassword)
        ) {

            errors.newPassword =
                "Password must contain an uppercase letter.";

        } else if (
            !/[a-z]/.test(newPassword)
        ) {

            errors.newPassword =
                "Password must contain a lowercase letter.";

        } else if (
            !/[0-9]/.test(newPassword)
        ) {

            errors.newPassword =
                "Password must contain a number.";

        } else if (
            !/[^A-Za-z0-9]/.test(newPassword)
        ) {

            errors.newPassword =
                "Password must contain a special character.";

        }


        if (!confirmPassword) {

            errors.confirmPassword =
                "Please confirm your new password.";

        } else if (
            newPassword !== confirmPassword
        ) {

            errors.confirmPassword =
                "Passwords do not match.";

        }


        setFieldErrors(
            errors
        );


        return (
            Object.keys(errors).length === 0
        );

    };


    /*
     * ==================================================
     * SUBMIT
     * ==================================================
     */

    const handleSubmit =
        async (event) => {

            event.preventDefault();


            setErrorMessage("");
            setSuccessMessage("");


            if (!token) {

                setErrorMessage(
                    "This password reset link is invalid or incomplete."
                );

                return;

            }


            if (!validateForm()) {

                return;

            }


            try {

                setIsSubmitting(
                    true
                );


                const result =
                    await resetPassword({

                        token,

                        newPassword,

                    });


                setSuccessMessage(
                    result?.message ||
                    "Password reset successfully. Please log in again."
                );


                /*
                 * Clear password fields.
                 */

                setNewPassword("");
                setConfirmPassword("");


                /*
                 * Give the user a short moment
                 * to see the success message.
                 */

                setTimeout(() => {

                    navigate(
                        "/login",
                        {
                            replace: true,
                        }
                    );

                }, 1800);

            } catch (error) {

                console.error(
                    "Reset password error:",
                    error
                );


                setErrorMessage(
                    error?.message ||
                    "Unable to reset your password. Please try again."
                );

            } finally {

                setIsSubmitting(
                    false
                );

            }

        };


    /*
     * ==================================================
     * INPUT CLASS
     * ==================================================
     */

    const inputClass = (field) => {

        return `
            h-13
            w-full
            rounded-2xl
            border
            bg-[var(--bms-surface-soft)]
            text-sm
            text-[var(--bms-text)]
            outline-none
            transition-all
            duration-300
            placeholder:text-[var(--bms-text-muted)]
            ${
                fieldErrors[field]
                    ? "border-red-500/80 ring-4 ring-red-500/10"
                    : "border-[var(--bms-border)] hover:border-slate-400/40 focus:border-blue-500/70 focus:bg-[var(--bms-surface)] focus:ring-4 focus:ring-blue-500/10"
            }
        `;

    };


    return (

        <main
            className="
                relative
                min-h-screen
                overflow-hidden
                bg-[var(--bms-bg)]
                text-[var(--bms-text)]
                transition-colors
                duration-300
            "
        >

            <div
                className="
                    mx-auto
                    flex
                    min-h-screen
                    w-full
                    max-w-7xl
                    items-center
                    px-4
                    py-12
                    sm:px-6
                    lg:px-8
                "
            >

                <div
                    className="
                        grid
                        w-full
                        grid-cols-1
                        items-center
                        gap-12
                        lg:grid-cols-2
                        lg:gap-16
                    "
                >

                    {/* BRANDING */}

                    <section
                        className="
                            hidden
                            flex-col
                            items-center
                            text-center
                            lg:flex
                            lg:items-start
                            lg:text-left
                        "
                    >

                        <div
                            className="
                                relative
                                flex
                                h-72
                                w-72
                                items-center
                                justify-center
                                overflow-hidden
                                rounded-[2.5rem]
                                shadow-2xl
                                shadow-blue-600/15
                                transition-transform
                                duration-500
                                hover:scale-[1.02]
                                lg:h-96
                                lg:w-96
                            "
                        >

                            <img
                                src="/nts-logo.png"
                                alt="NTS Digital Solutions"
                                className="
                                    h-full
                                    w-full
                                    object-cover
                                "
                            />

                        </div>


                        <div
                            className="
                                mt-8
                                max-w-xl
                            "
                        >

                            <p
                                className="
                                    text-sm
                                    font-semibold
                                    uppercase
                                    tracking-[0.2em]
                                    text-blue-500
                                "
                            >
                                NTS Digital Solutions
                            </p>


                            <h1
                                className="
                                    mt-3
                                    text-3xl
                                    font-bold
                                    tracking-tight
                                    text-[var(--bms-text)]
                                    lg:text-5xl
                                "
                            >
                                Secure Account Recovery
                            </h1>


                            <p
                                className="
                                    mt-4
                                    text-base
                                    leading-7
                                    text-[var(--bms-text-secondary)]
                                "
                            >
                                Create a new secure password for
                                your Business Management System account.
                            </p>

                        </div>

                    </section>


                    {/* FORM */}

                    <section
                        className="
                            w-full
                            max-w-md
                            justify-self-center
                            lg:justify-self-start
                        "
                    >

                        <div
                            className="
                                rounded-2xl
                                border
                                border-[var(--bms-border)]
                                bg-[var(--bms-surface)]
                                p-5
                                shadow-xl
                                shadow-black/5
                                transition-colors
                                duration-300
                                sm:p-7
                            "
                        >

                            <div
                                className="
                                    mb-6
                                    flex
                                    flex-col
                                    items-center
                                    text-center
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-14
                                        w-14
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        bg-blue-500/10
                                        text-blue-500
                                    "
                                >

                                    <LockKeyhole
                                        size={25}
                                    />

                                </div>


                                <h2
                                    className="
                                        mt-4
                                        text-xl
                                        font-bold
                                        text-[var(--bms-text)]
                                    "
                                >
                                    Reset password
                                </h2>


                                <p
                                    className="
                                        mt-2
                                        text-sm
                                        leading-6
                                        text-[var(--bms-text-secondary)]
                                    "
                                >
                                    Create a new password for your account.
                                </p>

                            </div>


                            {successMessage && (

                                <div
                                    role="status"
                                    className="
                                        mb-5
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


                            {errorMessage && (

                                <div
                                    role="alert"
                                    className="
                                        mb-5
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
                                onSubmit={handleSubmit}
                                noValidate
                            >

                                {/* NEW PASSWORD */}

                                <div className="group relative">

                                    <LockKeyhole
                                        size={19}
                                        strokeWidth={1.8}
                                        className="
                                            pointer-events-none
                                            absolute
                                            left-4
                                            top-1/2
                                            z-10
                                            -translate-y-1/2
                                            text-[var(--bms-text-muted)]
                                            transition-colors
                                            group-focus-within:text-blue-500
                                        "
                                    />


                                    <input
                                        id="newPassword"
                                        name="newPassword"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        autoComplete="new-password"
                                        value={newPassword}
                                        onChange={(event) => {

                                            setNewPassword(
                                                event.target.value
                                            );

                                            setFieldErrors(
                                                (previous) => ({
                                                    ...previous,
                                                    newPassword: "",
                                                })
                                            );

                                            setErrorMessage("");

                                        }}
                                        placeholder="New password"
                                        aria-label="New password"
                                        aria-invalid={
                                            Boolean(
                                                fieldErrors.newPassword
                                            )
                                        }
                                        aria-describedby={
                                            fieldErrors.newPassword
                                                ? "new-password-error"
                                                : undefined
                                        }
                                        className={`
                                            ${inputClass("newPassword")}
                                            pl-12
                                            pr-12
                                        `}
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
                                                ? "Hide new password"
                                                : "Show new password"
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
                                            rounded-xl
                                            text-[var(--bms-text-muted)]
                                            transition-all
                                            hover:bg-[var(--bms-surface)]
                                            hover:text-[var(--bms-text)]
                                            active:scale-95
                                        "
                                    >

                                        {showPassword ? (
                                            <EyeOff
                                                size={18}
                                            />
                                        ) : (
                                            <Eye
                                                size={18}
                                            />
                                        )}

                                    </button>


                                    {fieldErrors.newPassword && (

                                        <p
                                            id="new-password-error"
                                            className="
                                                mt-1.5
                                                px-1
                                                text-xs
                                                text-red-500
                                            "
                                        >
                                            {
                                                fieldErrors.newPassword
                                            }
                                        </p>

                                    )}

                                </div>


                                {/* CONFIRM PASSWORD */}

                                <div className="group relative mt-4">

                                    <LockKeyhole
                                        size={19}
                                        strokeWidth={1.8}
                                        className="
                                            pointer-events-none
                                            absolute
                                            left-4
                                            top-1/2
                                            z-10
                                            -translate-y-1/2
                                            text-[var(--bms-text-muted)]
                                            transition-colors
                                            group-focus-within:text-blue-500
                                        "
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
                                        value={confirmPassword}
                                        onChange={(event) => {

                                            setConfirmPassword(
                                                event.target.value
                                            );

                                            setFieldErrors(
                                                (previous) => ({
                                                    ...previous,
                                                    confirmPassword: "",
                                                })
                                            );

                                            setErrorMessage("");

                                        }}
                                        placeholder="Confirm new password"
                                        aria-label="Confirm new password"
                                        aria-invalid={
                                            Boolean(
                                                fieldErrors.confirmPassword
                                            )
                                        }
                                        aria-describedby={
                                            fieldErrors.confirmPassword
                                                ? "confirm-password-error"
                                                : undefined
                                        }
                                        className={`
                                            ${inputClass("confirmPassword")}
                                            pl-12
                                            pr-12
                                        `}
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
                                                ? "Hide password confirmation"
                                                : "Show password confirmation"
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
                                            rounded-xl
                                            text-[var(--bms-text-muted)]
                                            transition-all
                                            hover:bg-[var(--bms-surface)]
                                            hover:text-[var(--bms-text)]
                                            active:scale-95
                                        "
                                    >

                                        {showConfirmPassword ? (
                                            <EyeOff
                                                size={18}
                                            />
                                        ) : (
                                            <Eye
                                                size={18}
                                            />
                                        )}

                                    </button>


                                    {fieldErrors.confirmPassword && (

                                        <p
                                            id="confirm-password-error"
                                            className="
                                                mt-1.5
                                                px-1
                                                text-xs
                                                text-red-500
                                            "
                                        >
                                            {
                                                fieldErrors.confirmPassword
                                            }
                                        </p>

                                    )}

                                </div>


                                {/* PASSWORD REQUIREMENTS */}

                                <div
                                    className="
                                        mt-4
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


                                    <ul
                                        className="
                                            mt-2
                                            space-y-1
                                            text-xs
                                            text-[var(--bms-text-secondary)]
                                        "
                                    >

                                        <li>
                                            • At least 12 characters
                                        </li>

                                        <li>
                                            • One uppercase letter
                                        </li>

                                        <li>
                                            • One lowercase letter
                                        </li>

                                        <li>
                                            • One number
                                        </li>

                                        <li>
                                            • One special character
                                        </li>

                                    </ul>

                                </div>


                                <button
                                    type="submit"
                                    disabled={
                                        isSubmitting ||
                                        !token ||
                                        Boolean(successMessage)
                                    }
                                    className="
                                        group
                                        relative
                                        mt-6
                                        flex
                                        h-12
                                        w-full
                                        items-center
                                        justify-center
                                        overflow-hidden
                                        rounded-2xl
                                        bg-blue-600
                                        px-4
                                        text-sm
                                        font-semibold
                                        text-white
                                        shadow-lg
                                        shadow-blue-600/20
                                        transition-all
                                        duration-300
                                        hover:bg-blue-500
                                        hover:shadow-xl
                                        hover:shadow-blue-600/25
                                        active:scale-[0.985]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-60
                                    "
                                >

                                    <span
                                        className="
                                            relative
                                            z-10
                                        "
                                    >

                                        {isSubmitting
                                            ? "Resetting password..."
                                            : "Reset password"}

                                    </span>


                                    {!isSubmitting && (

                                        <span
                                            className="
                                                absolute
                                                inset-0
                                                -translate-x-full
                                                bg-gradient-to-r
                                                from-transparent
                                                via-white/10
                                                to-transparent
                                                transition-transform
                                                duration-700
                                                group-hover:translate-x-full
                                            "
                                        />

                                    )}

                                </button>

                            </form>


                            <Link
                                to="/login"
                                className="
                                    mt-6
                                    flex
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    text-sm
                                    font-medium
                                    text-[var(--bms-text-secondary)]
                                    transition-colors
                                    hover:text-blue-500
                                "
                            >

                                <ArrowLeft
                                    size={16}
                                />

                                Back to sign in

                            </Link>

                        </div>


                        <p
                            className="
                                mt-6
                                text-center
                                text-xs
                                text-[var(--bms-text-muted)]
                            "
                        >
                            © {new Date().getFullYear()} NTS Digital Solutions
                        </p>

                    </section>

                </div>

            </div>

        </main>

    );

}


export default ResetPassword;
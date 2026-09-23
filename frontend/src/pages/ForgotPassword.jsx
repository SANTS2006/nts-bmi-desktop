import {
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    Mail,
    ArrowLeft,
    CheckCircle2,
    AlertTriangle,
    LockKeyhole,
} from "lucide-react";

import {
    useTheme,
} from "../context/ThemeContext";

import {
    requestPasswordReset,
} from "../api/auth";


function ForgotPassword() {

    const {
        theme,
    } = useTheme();

    const navigate =
        useNavigate();


    const [
        email,
        setEmail,
    ] = useState("");


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
        fieldError,
        setFieldError,
    ] = useState("");


    /*
     * ==================================================
     * SUBMIT
     * ==================================================
     */

    const handleSubmit =
        async (event) => {

            event.preventDefault();


            setSuccessMessage("");
            setErrorMessage("");
            setFieldError("");


            const normalizedEmail =
                email.trim();


            if (!normalizedEmail) {

                setFieldError(
                    "Email address is required."
                );

                return;

            }


            if (
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    .test(normalizedEmail)
            ) {

                setFieldError(
                    "Enter a valid email address."
                );

                return;

            }


            try {

                setIsSubmitting(
                    true
                );


                const result =
                        await requestPasswordReset(
                            normalizedEmail
                        );


                    setSuccessMessage(
                        result?.message ||
                        "If an account exists for that email, a password reset link will be sent."
                    );


                    setEmail("");

            } catch (error) {

                console.error(
                    "Forgot password error:",
                    error
                );


                setErrorMessage(
                    error?.message ||
                    "Unable to process your request. Please try again."
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

    const inputClass = `
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
            fieldError
                ? "border-red-500/80 ring-4 ring-red-500/10"
                : "border-[var(--bms-border)] hover:border-slate-400/40 focus:border-blue-500/70 focus:bg-[var(--bms-surface)] focus:ring-4 focus:ring-blue-500/10"
        }
    `;


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
                                Account Recovery
                            </h1>


                            <p
                                className="
                                    mt-4
                                    text-base
                                    leading-7
                                    text-[var(--bms-text-secondary)]
                                "
                            >
                                Securely recover access to your
                                Business Management System account.
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
                                    Forgot password?
                                </h2>


                                <p
                                    className="
                                        mt-2
                                        text-sm
                                        leading-6
                                        text-[var(--bms-text-secondary)]
                                    "
                                >
                                    Enter your email address and
                                    we'll help you recover your account.
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

                                <div className="group relative">

                                    <Mail
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
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(event) => {

                                            setEmail(
                                                event.target.value
                                            );

                                            setFieldError("");
                                            setErrorMessage("");

                                        }}
                                        placeholder="Email address"
                                        aria-label="Email address"
                                        aria-invalid={
                                            Boolean(fieldError)
                                        }
                                        aria-describedby={
                                            fieldError
                                                ? "email-error"
                                                : undefined
                                        }
                                        className={`
                                            ${inputClass}
                                            pl-12
                                            pr-4
                                        `}
                                    />


                                    {fieldError && (

                                        <p
                                            id="email-error"
                                            className="
                                                mt-1.5
                                                px-1
                                                text-xs
                                                text-red-500
                                            "
                                        >
                                            {fieldError}
                                        </p>

                                    )}

                                </div>


                                <button
                                    type="submit"
                                    disabled={isSubmitting}
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

                                    <span className="relative z-10">

                                        {isSubmitting
                                            ? "Sending..."
                                            : "Send reset instructions"}

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


                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/login")
                                }
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

                            </button>

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


export default ForgotPassword;
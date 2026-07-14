"use client";

import { useState } from "react";
import Link from "next/link";
import * as Icon from "@phosphor-icons/react/dist/ssr";

import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import { useForgotPassword } from "@/hooks/useAuth";
import styles from "../auth.module.scss";

const ForgotPassword = () => {
  const forgotPasswordMutation = useForgotPassword();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [devResetToken, setDevResetToken] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setDevResetToken("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      const response = await forgotPasswordMutation.mutateAsync({
        email,
      });

      setMessage(
        response.message ||
          "If an account exists with this email, a password reset link has been sent.",
      );

      if (response.devResetToken) {
        setDevResetToken(response.devResetToken);
      }
    } catch (err) {
      setError(
        (err as Error).message ||
          "Password reset link could not be sent. Please try again.",
      );
    }
  };

  return (
    <>
      <TopNavOne
        props="style-one bg-black"
        slogan="New customers save 10% with the code GET10"
      />

      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Forgot Password" subHeading="Forgot Password" />
      </div>

      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.shell}>
            <section className={styles.formPanel}>
              <div className={styles.eyebrow}>ACCOUNT RECOVERY</div>

              <h1 className={styles.title}>Reset your password</h1>

              <p className={styles.subtitle}>
                Enter your email address and we’ll send you a link to create a
                new password.
              </p>

              <form className={styles.form} onSubmit={handleSubmit}>
                {error && (
                  <div className={styles.error} role="alert">
                    {error}
                  </div>
                )}

                {message && (
                  <div className={styles.success} role="status">
                    {message}
                  </div>
                )}

                {devResetToken && (
                  <div className={styles.notice}>
                    Local test link:{" "}
                    <Link href={`/reset-password?token=${devResetToken}`}>
                      Open reset page
                    </Link>
                  </div>
                )}

                <label className={styles.field}>
                  <span>Email address</span>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                  />
                </label>

                <button
                  className={styles.submit}
                  disabled={forgotPasswordMutation.isPending}
                >
                  {forgotPasswordMutation.isPending
                    ? "Sending..."
                    : "Send reset link"}
                </button>
              </form>
            </section>

            <aside className={styles.sidePanel}>
              <span className={styles.sideIcon}>
                <Icon.SignIn size={26} />
              </span>

              <h2>Remember your password?</h2>

              <p>
                Go back to login and sign in with your email and current
                password.
              </p>

              <Link href="/login" className={styles.sideLink}>
                Back to login
              </Link>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ForgotPassword;

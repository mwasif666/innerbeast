"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as Icon from "@phosphor-icons/react/dist/ssr";

import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import { useResetPassword, useVerifyResetToken } from "@/hooks/useAuth";
import styles from "../auth.module.scss";

const ResetPasswordContent = () => {
  const searchParams = useSearchParams();
  const token = String(searchParams.get("token") || "");

  const verifyQuery = useVerifyResetToken(token, Boolean(token));
  const resetPasswordMutation = useResetPassword();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const tokenError =
    !token ||
    verifyQuery.isError ||
    (!verifyQuery.isLoading && !verifyQuery.data?.success);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (!token) {
      setError("Reset token is missing.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await resetPasswordMutation.mutateAsync({
        token,
        payload: {
          password,
          confirmPassword,
        },
      });

      setMessage(response.message || "Password has been reset successfully.");
      event.currentTarget.reset();
    } catch (err) {
      setError(
        (err as Error).message ||
          "Password could not be reset. Please request a new link.",
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
        <Breadcrumb heading="Reset Password" subHeading="Reset Password" />
      </div>

      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.shell}>
            <section className={styles.formPanel}>
              <div className={styles.eyebrow}>SECURE RESET</div>

              <h1 className={styles.title}>Create a new password</h1>

              <p className={styles.subtitle}>
                Choose a strong password for your Inner Beast account.
              </p>

              {verifyQuery.isLoading && token && (
                <div className={styles.notice}>Checking reset link...</div>
              )}

              {tokenError && !message ? (
                <div className={styles.error} role="alert">
                  This reset link is invalid or has expired. Please request a
                  new password reset link.
                </div>
              ) : (
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

                  {!message && (
                    <>
                      <label className={styles.field}>
                        <span>New password</span>
                        <input
                          name="password"
                          type="password"
                          autoComplete="new-password"
                          placeholder="Enter new password"
                          minLength={6}
                          required
                        />
                      </label>

                      <label className={styles.field}>
                        <span>Confirm password</span>
                        <input
                          name="confirmPassword"
                          type="password"
                          autoComplete="new-password"
                          placeholder="Confirm new password"
                          minLength={6}
                          required
                        />
                      </label>

                      <button
                        className={styles.submit}
                        disabled={resetPasswordMutation.isPending}
                      >
                        {resetPasswordMutation.isPending
                          ? "Resetting..."
                          : "Reset password"}
                      </button>
                    </>
                  )}

                  {message && (
                    <Link href="/login" className={styles.submit}>
                      Go to login
                    </Link>
                  )}
                </form>
              )}
            </section>

            <aside className={styles.sidePanel}>
              <span className={styles.sideIcon}>
                <Icon.LockKey size={26} />
              </span>

              <h2>Reset link expired?</h2>

              <p>
                Request a fresh password reset link and try again with your
                registered email address.
              </p>

              <Link href="/forgot-password" className={styles.sideLink}>
                Request new link
              </Link>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

const ResetPassword = () => (
  <Suspense fallback={null}>
    <ResetPasswordContent />
  </Suspense>
);

export default ResetPassword;

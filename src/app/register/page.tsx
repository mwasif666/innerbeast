"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as Icon from "@phosphor-icons/react/dist/ssr";

import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import { useRegister } from "@/hooks/useAuth";
import styles from "../auth.module.scss";

const RegisterContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registerMutation = useRegister();
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    if (password !== String(formData.get("confirmPassword") || "")) return setError("Passwords do not match.");
    if (!formData.get("terms")) return setError("Please agree to the Terms & Conditions.");

    try {
      await registerMutation.mutateAsync({
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
        password,
      });
      const redirect = searchParams.get("redirect");
      router.replace(redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : "/my-account");
    } catch (err) {
      setError((err as Error).message || "Registration failed. Please try again.");
    }
  };

  return (
    <>
      <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
      <div id="header" className="relative w-full"><MenuOne props="bg-transparent" /><Breadcrumb heading="Create Account" subHeading="Create Account" /></div>
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.shell}>
            <section className={styles.formPanel}>
              <div className={styles.eyebrow}>JOIN THE PACK</div>
              <h1 className={styles.title}>Create your account</h1>
              <p className={styles.subtitle}>Your orders, addresses and account details—kept together.</p>
              <form className={styles.form} onSubmit={handleSubmit}>
                {error && <div className={styles.error} role="alert">{error}</div>}
                <label className={styles.field}><span>Full name</span><input name="name" type="text" autoComplete="name" placeholder="Your full name" required /></label>
                <label className={styles.field}><span>Email address</span><input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
                <label className={styles.field}><span>Phone number</span><input name="phone" type="tel" autoComplete="tel" placeholder="+44 7700 900000" /></label>
                <label className={styles.field}><span>Password</span><input name="password" type="password" autoComplete="new-password" placeholder="At least 6 characters" minLength={6} required /></label>
                <label className={styles.field}><span>Confirm password</span><input name="confirmPassword" type="password" autoComplete="new-password" placeholder="Repeat your password" minLength={6} required /></label>
                <label className={styles.terms}><input type="checkbox" name="terms" /><span>I agree to the <Link href="/terms-and-conditions">Terms & Conditions</Link> and <Link href="/privacy-policy">Privacy Policy</Link>.</span></label>
                <button className={styles.submit} disabled={registerMutation.isPending}>{registerMutation.isPending ? "Creating account..." : "Create account"}</button>
              </form>
            </section>
            <aside className={styles.sidePanel}>
              <span className={styles.sideIcon}><Icon.SignIn size={26} /></span>
              <h2>Already a member?</h2>
              <p>Sign in to view your dashboard, follow active orders and manage your saved information.</p>
              <Link href="/login" className={styles.sideLink}>Sign in</Link>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

const Register = () => <Suspense fallback={null}><RegisterContent /></Suspense>;
export default Register;

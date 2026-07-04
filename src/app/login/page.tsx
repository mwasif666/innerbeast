"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as Icon from "@phosphor-icons/react/dist/ssr";

import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import { useLogin } from "@/hooks/useAuth";
import styles from "../auth.module.scss";

const safeRedirect = (value: string | null) =>
  value?.startsWith("/") && !value.startsWith("//") ? value : "";

const LoginContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLogin();
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);

    try {
      const response = await loginMutation.mutateAsync({
        email: String(formData.get("email") || "").trim(),
        password: String(formData.get("password") || ""),
      });
      const role = response.data?.role || response.user?.role;
      const redirect = safeRedirect(searchParams.get("redirect"));
      router.replace(
        redirect || (role === "admin" || role === "superAdmin" ? "/admin" : "/my-account"),
      );
    } catch (err) {
      setError((err as Error).message || "Login failed. Please try again.");
    }
  };

  return (
    <>
      <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
      <div id="header" className="relative w-full"><MenuOne props="bg-transparent" /><Breadcrumb heading="Login" subHeading="Login" /></div>
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.shell}>
            <section className={styles.formPanel}>
              <div className={styles.eyebrow}>WELCOME BACK</div>
              <h1 className={styles.title}>Sign in to your account</h1>
              <p className={styles.subtitle}>Track orders, manage your details and checkout faster.</p>
              <form className={styles.form} onSubmit={handleSubmit}>
                {error && <div className={styles.error} role="alert">{error}</div>}
                <label className={styles.field}><span>Email address</span><input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
                <label className={styles.field}><span>Password</span><input name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required /></label>
                <div className={styles.formRow}>
                  <label className={styles.remember}><input type="checkbox" name="remember" />Remember me</label>
                  <Link href="/forgot-password" className={styles.link}>Forgot password?</Link>
                </div>
                <button className={styles.submit} disabled={loginMutation.isPending}>{loginMutation.isPending ? "Signing in..." : "Sign in"}</button>
              </form>
            </section>
            <aside className={styles.sidePanel}>
              <span className={styles.sideIcon}><Icon.UserPlus size={26} /></span>
              <h2>New to Inner Beast?</h2>
              <p>Create your account to keep your order history, delivery details and account preferences in one place.</p>
              <Link href="/register" className={styles.sideLink}>Create account</Link>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

const Login = () => <Suspense fallback={null}><LoginContent /></Suspense>;
export default Login;

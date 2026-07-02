"use client";

import { CSSProperties, FormEvent, useState } from "react";
import { useCurrentUser, useLogin, useLogout } from "../../hooks/useAuth";

const TestAuthPage = () => {
  const [email, setEmail] = useState("test2@example.com");
  const [password, setPassword] = useState("123456");

  const currentUserQuery = useCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await loginMutation.mutateAsync({
      email,
      password,
    });

    currentUserQuery.refetch();
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    currentUserQuery.refetch();
  };

  const user = currentUserQuery.data?.data;

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <header style={styles.header}>
          <span style={styles.badge}>API</span>
          <h1 style={styles.title}>Auth API Test</h1>
        </header>

        <section style={styles.section}>
          <div style={styles.sectionLabel}>Current User</div>

          {currentUserQuery.isPending ? (
            <p style={styles.muted}>Checking current user…</p>
          ) : user ? (
            <div style={styles.userBox}>
              <div style={styles.userRow}>
                <span style={styles.userKey}>Name</span>
                <span style={styles.userVal}>{user.name}</span>
              </div>
              <div style={styles.userRow}>
                <span style={styles.userKey}>Email</span>
                <span style={styles.userVal}>{user.email}</span>
              </div>
              <div style={styles.userRow}>
                <span style={styles.userKey}>Role</span>
                <span style={styles.roleTag}>{user.role}</span>
              </div>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <span style={styles.statusDot} />
              No user logged in
            </div>
          )}
        </section>

        <div style={styles.divider} />

        <form onSubmit={handleLogin} style={styles.section}>
          <div style={styles.sectionLabel}>Login</div>

          <label style={styles.field}>
            <span style={styles.fieldLabel}>Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              type="email"
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.fieldLabel}>Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              type="password"
              style={styles.input}
            />
          </label>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            style={{
              ...styles.button,
              ...styles.primaryButton,
              ...(loginMutation.isPending ? styles.buttonDisabled : {}),
            }}
          >
            {loginMutation.isPending ? "Logging in…" : "Login"}
          </button>

          {loginMutation.error && (
            <p style={styles.error}>{loginMutation.error.message}</p>
          )}
        </form>

        <div style={styles.divider} />

        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          style={{
            ...styles.button,
            ...styles.ghostButton,
            ...(logoutMutation.isPending ? styles.buttonDisabled : {}),
          }}
        >
          {logoutMutation.isPending ? "Logging out…" : "Logout"}
        </button>
      </div>
    </main>
  );
};

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    background: "radial-gradient(circle at 50% 0%, #1a1a1a 0%, #0a0a0a 60%)",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 440,
    padding: 32,
    background: "#141414",
    border: "1px solid #262626",
    borderRadius: 16,
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
    color: "#f5f5f5",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  badge: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    color: "#0a0a0a",
    background: "#e5e5e5",
    padding: "4px 8px",
    borderRadius: 6,
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#888",
  },
  muted: {
    margin: 0,
    color: "#888",
    fontSize: 14,
  },
  userBox: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: 16,
    background: "#1c1c1c",
    borderRadius: 10,
    border: "1px solid #262626",
  },
  userRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 14,
  },
  userKey: {
    color: "#888",
  },
  userVal: {
    color: "#f5f5f5",
    fontWeight: 500,
  },
  roleTag: {
    fontSize: 12,
    fontWeight: 600,
    color: "#4ade80",
    background: "rgba(74, 222, 128, 0.12)",
    padding: "3px 10px",
    borderRadius: 999,
  },
  emptyState: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: 16,
    background: "#1c1c1c",
    borderRadius: 10,
    border: "1px solid #262626",
    color: "#aaa",
    fontSize: 14,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#666",
    display: "inline-block",
  },
  divider: {
    height: 1,
    background: "#262626",
    margin: "24px 0",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    color: "#aaa",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    fontSize: 14,
    color: "#f5f5f5",
    background: "#1c1c1c",
    border: "1px solid #333",
    borderRadius: 10,
    outline: "none",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "12px 16px",
    fontSize: 14,
    fontWeight: 600,
    borderRadius: 10,
    cursor: "pointer",
    border: "1px solid transparent",
    transition: "opacity 0.15s ease",
  },
  primaryButton: {
    color: "#0a0a0a",
    background: "#f5f5f5",
    marginTop: 4,
  },
  ghostButton: {
    color: "#f5f5f5",
    background: "transparent",
    border: "1px solid #333",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  error: {
    margin: 0,
    marginTop: 4,
    padding: "10px 12px",
    fontSize: 13,
    color: "#f87171",
    background: "rgba(248, 113, 113, 0.1)",
    border: "1px solid rgba(248, 113, 113, 0.25)",
    borderRadius: 8,
  },
};

export default TestAuthPage;

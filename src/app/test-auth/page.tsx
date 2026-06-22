"use client";

import { FormEvent, useState } from "react";
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
    <main
      style={{
        maxWidth: 600,
        margin: "40px auto",
        padding: 24,
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Auth API Test</h1>

      <section style={{ marginTop: 24 }}>
        <h2>Current User</h2>

        {currentUserQuery.isPending && <p>Checking current user...</p>}

        {user ? (
          <div>
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
          </div>
        ) : (
          <p>No user logged in</p>
        )}
      </section>

      <form onSubmit={handleLogin} style={{ marginTop: 24 }}>
        <h2>Login</h2>

        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          style={{
            display: "block",
            width: "100%",
            padding: 12,
            marginBottom: 12,
          }}
        />

        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          type="password"
          style={{
            display: "block",
            width: "100%",
            padding: 12,
            marginBottom: 12,
          }}
        />

        <button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Logging in..." : "Login"}
        </button>

        {loginMutation.error && (
          <p style={{ color: "red" }}>{loginMutation.error.message}</p>
        )}
      </form>

      <button
        onClick={handleLogout}
        disabled={logoutMutation.isPending}
        style={{ marginTop: 24 }}
      >
        {logoutMutation.isPending ? "Logging out..." : "Logout"}
      </button>
    </main>
  );
};

export default TestAuthPage;

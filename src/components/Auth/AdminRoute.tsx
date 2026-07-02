"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useAuth";

type AdminRouteProps = {
  children: ReactNode;
};

const AdminRoute = ({ children }: AdminRouteProps) => {
  const router = useRouter();
  const currentUserQuery = useCurrentUser();

  const user = currentUserQuery.data?.data;

  useEffect(() => {
    if (currentUserQuery.isError) {
      router.replace("/test-auth");
    }
  }, [currentUserQuery.isError, router]);

  if (currentUserQuery.isLoading) {
    return (
      <div style={{ padding: "40px", fontSize: "18px" }}>
        Checking admin access...
      </div>
    );
  }

  if (currentUserQuery.isError) {
    return (
      <div style={{ padding: "40px", fontSize: "18px" }}>
        Redirecting to login...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: "40px", fontSize: "18px" }}>No user found</div>
    );
  }

  const isAdmin = user.role === "admin" || user.role === "superAdmin";

  if (!isAdmin) {
    return (
      <div style={{ padding: "40px" }}>
        <h1>Access Denied</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;

"use client";

import { useRouter } from "next/navigation";
import { Button, Menu } from "antd";
import { LogoutOutlined } from "@ant-design/icons";

import { useLogout } from "@/hooks/useAuth";
import { ADMIN_NAV } from "./adminNav";

type AdminSidebarProps = {
  activeKey: string;
  onNavigate?: () => void;
};

const AdminSidebar = ({ activeKey, onNavigate }: AdminSidebarProps) => {
  const router = useRouter();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      router.replace("/test-auth");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "18px 8px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "4px 12px 20px",
          marginBottom: 8,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <span
          style={{
            display: "grid",
            width: 40,
            height: 40,
            placeItems: "center",
            color: "#fff",
            background: "linear-gradient(135deg, #60a5fa, #2563eb)",
            borderRadius: 11,
            fontSize: 15,
            fontWeight: 700,
          }}
        >
          IB
        </span>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ color: "#fff", fontSize: 15, fontWeight: 650 }}>
            Inner Beast
          </div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
            Admin Panel
          </div>
        </div>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[activeKey]}
        style={{ flex: 1, border: "none", background: "transparent" }}
        items={ADMIN_NAV.map((item) => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
        }))}
        onClick={({ key }) => {
          router.push(key);
          onNavigate?.();
        }}
      />

      <div
        style={{
          paddingTop: 14,
          marginTop: 8,
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <Button
          block
          danger
          icon={<LogoutOutlined />}
          loading={logoutMutation.isPending}
          onClick={handleLogout}
          style={{ height: 42, justifyContent: "flex-start" }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;

"use client";

import { Avatar, Button, Tooltip } from "antd";
import { MenuOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";

import { User } from "@/services/auth.service";
import { useAdminTheme } from "@/providers/AdminAntdProvider";
import LiveBadge from "./LiveBadge";

type AdminTopbarProps = {
  title: string;
  user?: User;
  onMenuClick: () => void;
  showMenuButton?: boolean;
};

const getInitials = (name?: string) =>
  (name || "A").split(" ").map((part) => part[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

const AdminTopbar = ({ title, user, onMenuClick, showMenuButton }: AdminTopbarProps) => {
  const { mode, toggleMode } = useAdminTheme();
  const avatarUrl = user?.avatar?.url || "";

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, height: "100%", padding: "0 clamp(16px, 3vw, 28px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {showMenuButton && <Button type="text" icon={<MenuOutlined />} onClick={onMenuClick} aria-label="Toggle menu" />}
        <div style={{ lineHeight: 1.25 }}>
          <div style={{ color: "var(--adm-text-3)", fontSize: 12 }}>Admin</div>
          <div style={{ color: "var(--adm-text)", fontSize: 19, fontWeight: 650 }}>{title}</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <LiveBadge />
        <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
          <Button type="text" shape="circle" icon={mode === "dark" ? <SunOutlined /> : <MoonOutlined />} onClick={toggleMode} aria-label="Toggle theme" />
        </Tooltip>

        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "5px 14px 5px 5px", background: "var(--adm-wash)", border: "1px solid var(--adm-border)", borderRadius: 999 }}>
            <Avatar size={34} src={avatarUrl || undefined} style={{ background: "linear-gradient(135deg, #e57112, #c4610f)", fontSize: 12, fontWeight: 700 }}>
              {!avatarUrl && getInitials(user.name)}
            </Avatar>
            <div className="admin-user-meta" style={{ lineHeight: 1.25 }}>
              <div style={{ color: "var(--adm-text)", fontSize: 13, fontWeight: 600 }}>{user.name}</div>
              <div style={{ color: "var(--adm-text-3)", fontSize: 12, textTransform: "capitalize" }}>{user.role}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTopbar;

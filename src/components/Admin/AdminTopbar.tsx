"use client";

import { Avatar, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";

import { User } from "@/services/auth.service";

type AdminTopbarProps = {
  title: string;
  user?: User;
  onMenuClick: () => void;
  showMenuButton?: boolean;
};

const getInitials = (name?: string) =>
  (name || "A")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const AdminTopbar = ({
  title,
  user,
  onMenuClick,
  showMenuButton,
}: AdminTopbarProps) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        height: "100%",
        padding: "0 clamp(16px, 3vw, 28px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {showMenuButton && (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={onMenuClick}
            aria-label="Toggle menu"
          />
        )}
        <div style={{ lineHeight: 1.25 }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
            Admin
          </div>
          <div style={{ color: "#fff", fontSize: 19, fontWeight: 650 }}>
            {title}
          </div>
        </div>
      </div>

      {user && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            padding: "5px 14px 5px 5px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 999,
          }}
        >
          <Avatar
            size={34}
            style={{
              background: "linear-gradient(135deg, #60a5fa, #2563eb)",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {getInitials(user.name)}
          </Avatar>
          <div className="admin-user-meta" style={{ lineHeight: 1.25 }}>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>
              {user.name}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: 12,
                textTransform: "capitalize",
              }}
            >
              {user.role}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTopbar;

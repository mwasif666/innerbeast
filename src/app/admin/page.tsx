"use client";

import { useRouter } from "next/navigation";
import { Card, Col, Row, Statistic } from "antd";
import {
  AppstoreOutlined,
  RightOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";

import { useCurrentUser } from "@/hooks/useAuth";
import { useAdminOrders } from "@/hooks/useOrders";
import { useCustomers } from "@/hooks/useUsers";
import { getOrdersCount } from "@/services/order.service";

type StatCard = {
  label: string;
  value: number | string;
  icon: ReactNode;
  accent: string;
  href: string;
};

type QuickAction = {
  label: string;
  description: string;
  icon: ReactNode;
  href: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Manage Customers",
    description: "View, edit roles and status of accounts.",
    icon: <TeamOutlined />,
    href: "/admin/users",
  },
  {
    label: "Manage Categories",
    description: "Organise your store categories.",
    icon: <TagsOutlined />,
    href: "/admin/categories",
  },
  {
    label: "Manage Products",
    description: "Add and update your catalogue.",
    icon: <AppstoreOutlined />,
    href: "/admin/products",
  },
  {
    label: "Manage Orders",
    description: "Track and fulfil customer orders.",
    icon: <ShoppingCartOutlined />,
    href: "/admin/orders",
  },
];

const AdminPage = () => {
  const router = useRouter();
  const currentUserQuery = useCurrentUser();
  const customersQuery = useCustomers();
  const ordersQuery = useAdminOrders();

  const user = currentUserQuery.data?.data;
  const firstName = user?.name ? user.name.split(" ")[0] : "";

  const stats: StatCard[] = [
    {
      label: "Customers",
      value: customersQuery.isLoading ? "…" : customersQuery.data?.count ?? 0,
      icon: <TeamOutlined />,
      accent: "#60a5fa",
      href: "/admin/users",
    },
    {
      label: "Categories",
      value: 8,
      icon: <TagsOutlined />,
      accent: "#a78bfa",
      href: "/admin/categories",
    },
    {
      label: "Products",
      value: 124,
      icon: <AppstoreOutlined />,
      accent: "#22c55e",
      href: "/admin/products",
    },
    {
      label: "Orders",
      value: ordersQuery.isLoading ? "..." : getOrdersCount(ordersQuery.data),
      icon: <ShoppingCartOutlined />,
      accent: "#f59e0b",
      href: "/admin/orders",
    },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <header style={{ marginBottom: 28 }}>
        <div
          style={{
            color: "#60a5fa",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Overview
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(24px, 3vw, 32px)",
            fontWeight: 650,
            letterSpacing: "-0.03em",
            color: "#fff",
          }}
        >
          Welcome back{firstName ? `, ${firstName}` : ""} 👋
        </h1>
        <p style={{ marginTop: 8, color: "rgba(255,255,255,0.55)", fontSize: 15 }}>
          Here&apos;s what&apos;s happening across your store today.
        </p>
      </header>

      <Row gutter={[18, 18]} style={{ marginBottom: 32 }}>
        {stats.map((stat) => (
          <Col key={stat.label} xs={24} sm={12} xl={6}>
            <Card
              hoverable
              onClick={() => router.push(stat.href)}
              styles={{ body: { padding: 20 } }}
              style={{ borderColor: "rgba(255,255,255,0.09)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 50,
                    height: 50,
                    borderRadius: 13,
                    fontSize: 20,
                    color: stat.accent,
                    background: `${stat.accent}1f`,
                    flexShrink: 0,
                  }}
                >
                  {stat.icon}
                </span>
                <Statistic
                  title={stat.label}
                  value={stat.value}
                  valueStyle={{
                    color: "#fff",
                    fontSize: 26,
                    fontWeight: 700,
                  }}
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: "#fff" }}>
        Quick actions
      </h3>

      <Row gutter={[16, 16]}>
        {QUICK_ACTIONS.map((action) => (
          <Col key={action.href} xs={24} md={12}>
            <Card
              hoverable
              onClick={() => router.push(action.href)}
              styles={{ body: { padding: 20 } }}
              style={{ borderColor: "rgba(255,255,255,0.09)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    fontSize: 19,
                    color: "#60a5fa",
                    background: "rgba(96,165,250,0.12)",
                    flexShrink: 0,
                  }}
                >
                  {action.icon}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>
                    {action.label}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      color: "rgba(255,255,255,0.5)",
                      fontSize: 13,
                    }}
                  >
                    {action.description}
                  </div>
                </div>
                <RightOutlined style={{ color: "rgba(255,255,255,0.35)" }} />
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AdminPage;

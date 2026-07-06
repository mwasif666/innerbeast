"use client";

import { useRouter } from "next/navigation";
import { Alert, Card, Col, Progress, Row, Skeleton, Space, Statistic, Table, Tag, Typography } from "antd";
import {
  AppstoreOutlined,
  RightOutlined,
  ShoppingCartOutlined,
  PercentageOutlined,
  TagsOutlined,
  TeamOutlined,
  DollarOutlined,
  WarningOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { ReactNode } from "react";

import { useAdminStats } from "@/hooks/useAdminStats";
import { useCurrentUser } from "@/hooks/useAuth";
import type { AdminRecentOrder, AdminLowStockProduct } from "@/services/admin.service";

const { Title, Text } = Typography;

type StatCard = {
  label: string;
  value: number | string;
  icon: ReactNode;
  accent: string;
  href: string;
  prefix?: string;
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
  {
    label: "Manage Coupons",
    description: "Create and manage storefront discount codes.",
    icon: <PercentageOutlined />,
    href: "/admin/coupons",
  },
  {
    label: "Store Settings",
    description: "Update store, support and SEO settings.",
    icon: <SettingOutlined />,
    href: "/admin/settings",
  },
];

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "gold",
  confirmed: "blue",
  processing: "purple",
  shipped: "cyan",
  delivered: "green",
  cancelled: "red",
  returned: "orange",
};

const formatMoney = (value?: number) =>
  `Rs. ${Number(value || 0).toLocaleString("en-PK")}`;

const formatDate = (value?: string) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const getStatusLabel = (status?: string) =>
  STATUS_LABELS[status || ""] || status || "Pending";

const AdminPage = () => {
  const router = useRouter();
  const currentUserQuery = useCurrentUser();
  const statsQuery = useAdminStats();

  const user = currentUserQuery.data?.data;
  const firstName = user?.name ? user.name.split(" ")[0] : "";
  const statsData = statsQuery.data?.data;
  const totals = statsData?.totals;
  const ordersByStatus = statsData?.ordersByStatus || {};
  const totalOrders = totals?.orders || 0;

  const stats: StatCard[] = [
    {
      label: "Revenue",
      value: statsQuery.isLoading ? "…" : formatMoney(totals?.revenue),
      icon: <DollarOutlined />,
      accent: "#22c55e",
      href: "/admin/orders",
    },
    {
      label: "Orders",
      value: statsQuery.isLoading ? "…" : totals?.orders ?? 0,
      icon: <ShoppingCartOutlined />,
      accent: "#f59e0b",
      href: "/admin/orders",
    },
    {
      label: "Customers",
      value: statsQuery.isLoading ? "…" : totals?.customers ?? 0,
      icon: <TeamOutlined />,
      accent: "#60a5fa",
      href: "/admin/users",
    },
    {
      label: "Products",
      value: statsQuery.isLoading ? "…" : totals?.products ?? 0,
      icon: <AppstoreOutlined />,
      accent: "#a78bfa",
      href: "/admin/products",
    },
    {
      label: "Categories",
      value: statsQuery.isLoading ? "…" : totals?.categories ?? 0,
      icon: <TagsOutlined />,
      accent: "#38bdf8",
      href: "/admin/categories",
    },
    {
      label: "Low Stock",
      value: statsQuery.isLoading ? "…" : totals?.lowStock ?? 0,
      icon: <WarningOutlined />,
      accent: "#ef4444",
      href: "/admin/products",
    },
  ];

  const recentOrderColumns: ColumnsType<AdminRecentOrder> = [
    {
      title: "Order",
      dataIndex: "orderNumber",
      render: (orderNumber?: string) => (
        <strong style={{ color: "#fff" }}>{orderNumber || "-"}</strong>
      ),
    },
    {
      title: "Customer",
      render: (_, order) => order.customer?.name || order.customer?.email || "Guest",
    },
    {
      title: "Status",
      dataIndex: "orderStatus",
      render: (status?: string) => (
        <Tag color={STATUS_COLORS[status || ""] || "default"}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: "Payment",
      dataIndex: "paymentStatus",
      render: (status?: string) => <Tag>{status || "pending"}</Tag>,
    },
    {
      title: "Total",
      dataIndex: "grandTotal",
      render: (total?: number) => <strong>{formatMoney(total)}</strong>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      render: (date?: string) => formatDate(date),
    },
  ];

  const lowStockColumns: ColumnsType<AdminLowStockProduct> = [
    {
      title: "Product",
      dataIndex: "title",
      render: (title: string) => <strong style={{ color: "#fff" }}>{title}</strong>,
    },
    {
      title: "SKU",
      dataIndex: "sku",
      render: (sku?: string) => sku || "-",
    },
    {
      title: "Stock",
      dataIndex: "stock",
      render: (stock?: number) => (
        <Tag color={Number(stock || 0) <= 0 ? "red" : "orange"}>
          {Number(stock || 0)} left
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1500, margin: "0 auto" }}>
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
        <Title level={1} style={{ color: "#fff", margin: 0 }}>
          Welcome back{firstName ? `, ${firstName}` : ""} 👋
        </Title>
        <Text type="secondary">
          Here&apos;s what&apos;s happening across your store today.
        </Text>
      </header>

      {statsQuery.isError && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 18 }}
          message="Dashboard stats could not be loaded."
          description="Check backend /api/admin/stats and admin authentication."
        />
      )}

      <Row gutter={[18, 18]} style={{ marginBottom: 28 }}>
        {stats.map((stat) => (
          <Col key={stat.label} xs={24} sm={12} xl={8} xxl={4}>
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
                    fontSize: 24,
                    fontWeight: 700,
                  }}
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[18, 18]} style={{ marginBottom: 28 }}>
        <Col xs={24} xl={10}>
          <Card
            title={<span style={{ color: "#fff" }}>Order status breakdown</span>}
            styles={{ body: { padding: 20 } }}
          >
            {statsQuery.isLoading ? (
              <Skeleton active paragraph={{ rows: 5 }} />
            ) : (
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                {Object.keys(STATUS_LABELS).map((status) => {
                  const count = Number(ordersByStatus[status] || 0);
                  const percent = totalOrders ? Math.round((count / totalOrders) * 100) : 0;

                  return (
                    <div key={status}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 6,
                          color: "rgba(255,255,255,0.72)",
                        }}
                      >
                        <span>{getStatusLabel(status)}</span>
                        <strong style={{ color: "#fff" }}>{count}</strong>
                      </div>
                      <Progress percent={percent} showInfo={false} />
                    </div>
                  );
                })}
              </Space>
            )}
          </Card>
        </Col>

        <Col xs={24} xl={14}>
          <Card
            title={<span style={{ color: "#fff" }}>Recent orders</span>}
            extra={
              <a onClick={() => router.push("/admin/orders")}>
                View all <RightOutlined />
              </a>
            }
            styles={{ body: { padding: 0 } }}
          >
            <Table<AdminRecentOrder>
              rowKey="_id"
              columns={recentOrderColumns}
              dataSource={statsData?.recentOrders || []}
              loading={statsQuery.isLoading}
              pagination={false}
              scroll={{ x: 850 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[18, 18]}>
        <Col xs={24} xl={10}>
          <Card
            title={<span style={{ color: "#fff" }}>Low stock products</span>}
            styles={{ body: { padding: 0 } }}
          >
            <Table<AdminLowStockProduct>
              rowKey="_id"
              columns={lowStockColumns}
              dataSource={statsData?.lowStockProducts || []}
              loading={statsQuery.isLoading}
              pagination={false}
              locale={{ emptyText: "No low stock products." }}
            />
          </Card>
        </Col>

        <Col xs={24} xl={14}>
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
                      <div style={{ marginTop: 4, color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                        {action.description}
                      </div>
                    </div>
                    <RightOutlined style={{ color: "rgba(255,255,255,0.35)" }} />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default AdminPage;

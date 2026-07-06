"use client";

import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  Col,
  Progress,
  Row,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  AppstoreOutlined,
  ArrowRightOutlined,
  DollarOutlined,
  PercentageOutlined,
  RightOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  TeamOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { CSSProperties, ReactNode } from "react";

import { useAdminStats } from "@/hooks/useAdminStats";
import { useCurrentUser } from "@/hooks/useAuth";
import type {
  AdminLowStockProduct,
  AdminRecentOrder,
} from "@/services/admin.service";

const { Title, Text } = Typography;

type StatCard = {
  label: string;
  value: number | string;
  note: string;
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

const STATUS_ACCENTS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#60a5fa",
  processing: "#a78bfa",
  shipped: "#22d3ee",
  delivered: "#22c55e",
  cancelled: "#ef4444",
  returned: "#fb923c",
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Customers",
    description: "Accounts, roles and status.",
    icon: <TeamOutlined />,
    href: "/admin/users",
  },
  {
    label: "Categories",
    description: "Organise store categories.",
    icon: <TagsOutlined />,
    href: "/admin/categories",
  },
  {
    label: "Products",
    description: "Manage catalogue and stock.",
    icon: <AppstoreOutlined />,
    href: "/admin/products",
  },
  {
    label: "Orders",
    description: "Track and fulfil orders.",
    icon: <ShoppingCartOutlined />,
    href: "/admin/orders",
  },
  {
    label: "Coupons",
    description: "Manage discount codes.",
    icon: <PercentageOutlined />,
    href: "/admin/coupons",
  },
  {
    label: "Settings",
    description: "Store and support settings.",
    icon: <SettingOutlined />,
    href: "/admin/settings",
  },
];

const panelStyle: CSSProperties = {
  borderColor: "rgba(255,255,255,0.08)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))",
};

const heroStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  padding: 28,
  borderRadius: 28,
  border: "1px solid rgba(255,255,255,0.08)",
  marginBottom: 24,
  background:
    "radial-gradient(circle at top left, rgba(96,165,250,0.28), transparent 34%), linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.88))",
};

const formatMoney = (value?: number) =>
  `Rs. ${Number(value || 0).toLocaleString("en-PK")}`;

const formatNumber = (value?: number) =>
  Number(value || 0).toLocaleString("en-PK");

const formatDate = (value?: string) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const getStatusLabel = (status?: string) =>
  STATUS_LABELS[status || ""] || status || "Pending";

const RevenueSplit = ({
  paid = 0,
  pending = 0,
}: {
  paid?: number;
  pending?: number;
}) => {
  const total = paid + pending;
  const paidPercent = total ? Math.round((paid / total) * 100) : 0;
  const pendingPercent = total ? 100 - paidPercent : 0;

  return (
    <div>
      <div
        style={{
          display: "flex",
          height: 18,
          borderRadius: 999,
          overflow: "hidden",
          background: "rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            width: `${paidPercent}%`,
            background: "#22c55e",
          }}
        />
        <div
          style={{
            width: `${pendingPercent}%`,
            background: "#f59e0b",
          }}
        />
      </div>

      <Row gutter={12} style={{ marginTop: 18 }}>
        <Col span={12}>
          <div
            style={{
              padding: 14,
              borderRadius: 14,
              background: "rgba(34,197,94,0.1)",
            }}
          >
            <Text type="secondary">Paid</Text>
            <div style={{ color: "#fff", fontWeight: 800, marginTop: 4 }}>
              {formatMoney(paid)}
            </div>
          </div>
        </Col>

        <Col span={12}>
          <div
            style={{
              padding: 14,
              borderRadius: 14,
              background: "rgba(245,158,11,0.1)",
            }}
          >
            <Text type="secondary">Pending</Text>
            <div style={{ color: "#fff", fontWeight: 800, marginTop: 4 }}>
              {formatMoney(pending)}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

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

  const deliveredCount = Number(ordersByStatus.delivered || 0);
  const deliveredPercent = totalOrders
    ? Math.round((deliveredCount / totalOrders) * 100)
    : 0;

  const revenueCollectionPercent = totals?.revenue
    ? Math.round(
        (Number(totals?.paidRevenue || 0) / Number(totals.revenue)) * 100,
      )
    : 0;

  const statCards: StatCard[] = [
    {
      label: "Revenue",
      value: statsQuery.isLoading ? "…" : formatMoney(totals?.revenue),
      note: "Active order value",
      icon: <DollarOutlined />,
      accent: "#22c55e",
      href: "/admin/orders",
    },
    {
      label: "Orders",
      value: statsQuery.isLoading ? "…" : (totals?.orders ?? 0),
      note: "All customer orders",
      icon: <ShoppingCartOutlined />,
      accent: "#f59e0b",
      href: "/admin/orders",
    },
    {
      label: "Customers",
      value: statsQuery.isLoading ? "…" : (totals?.customers ?? 0),
      note: "Registered accounts",
      icon: <TeamOutlined />,
      accent: "#60a5fa",
      href: "/admin/users",
    },
    {
      label: "Products",
      value: statsQuery.isLoading ? "…" : (totals?.products ?? 0),
      note: "Catalogue items",
      icon: <AppstoreOutlined />,
      accent: "#a78bfa",
      href: "/admin/products",
    },
    {
      label: "Categories",
      value: statsQuery.isLoading ? "…" : (totals?.categories ?? 0),
      note: "Product groups",
      icon: <TagsOutlined />,
      accent: "#38bdf8",
      href: "/admin/categories",
    },
    {
      label: "Low Stock",
      value: statsQuery.isLoading ? "…" : (totals?.lowStock ?? 0),
      note: "Needs restock",
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
      render: (_, order) => (
        <div>
          <div style={{ color: "#fff", fontWeight: 700 }}>
            {order.customer?.name || "Guest"}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {order.customer?.phone || order.customer?.email || "No contact"}
          </Text>
        </div>
      ),
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
      render: (status?: string) => (
        <Tag color={status === "paid" ? "green" : "gold"}>
          {status || "pending"}
        </Tag>
      ),
    },
    {
      title: "Total",
      dataIndex: "grandTotal",
      align: "right",
      render: (total?: number) => <strong>{formatMoney(total)}</strong>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      render: (createdAt?: string) => formatDate(createdAt),
    },
  ];

  const lowStockColumns: ColumnsType<AdminLowStockProduct> = [
    {
      title: "Product",
      dataIndex: "title",
      render: (title: string, product) => (
        <div>
          <strong style={{ color: "#fff" }}>{title}</strong>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
            {product.sku || "No SKU"}
          </div>
        </div>
      ),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      align: "right",
      render: (stock?: number) => (
        <Tag color={Number(stock || 0) <= 0 ? "red" : "orange"}>
          {Number(stock || 0)} left
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1540, margin: "0 auto" }}>
      <div style={heroStyle}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              color: "#60a5fa",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Executive overview
          </div>

          <Title
            level={1}
            style={{
              color: "#fff",
              margin: 0,
              letterSpacing: "-0.04em",
            }}
          >
            Welcome back{firstName ? `, ${firstName}` : ""} 👋
          </Title>

          <Text style={{ color: "rgba(255,255,255,0.62)", fontSize: 15 }}>
            Sales, orders, customers, inventory and fulfilment overview.
          </Text>

          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} md={8}>
              <Card
                styles={{ body: { padding: 18 } }}
                style={{ ...panelStyle, height: "100%" }}
              >
                <Text type="secondary">Total revenue</Text>
                <div
                  style={{
                    color: "#fff",
                    fontSize: 28,
                    fontWeight: 900,
                    marginTop: 6,
                  }}
                >
                  {statsQuery.isLoading ? "…" : formatMoney(totals?.revenue)}
                </div>
                <Text type="secondary">
                  Excluding cancelled / returned orders
                </Text>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card
                styles={{ body: { padding: 18 } }}
                style={{ ...panelStyle, height: "100%" }}
              >
                <Text type="secondary">Fulfilment health</Text>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    marginTop: 10,
                  }}
                >
                  <Progress
                    type="circle"
                    percent={deliveredPercent}
                    size={74}
                    strokeColor="#22c55e"
                  />

                  <div>
                    <div style={{ color: "#fff", fontWeight: 800 }}>
                      {formatNumber(deliveredCount)} delivered
                    </div>
                    <Text type="secondary">
                      out of {formatNumber(totalOrders)} orders
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card
                styles={{ body: { padding: 18 } }}
                style={{ ...panelStyle, height: "100%" }}
              >
                <Text type="secondary">Revenue collected</Text>

                <div
                  style={{
                    color: "#fff",
                    fontSize: 28,
                    fontWeight: 900,
                    marginTop: 6,
                  }}
                >
                  {revenueCollectionPercent}%
                </div>

                <Progress
                  percent={revenueCollectionPercent}
                  showInfo={false}
                  strokeColor="#22c55e"
                  style={{ marginTop: 10 }}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {statsQuery.isError && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 18 }}
          message="Dashboard stats could not be loaded."
          description="Check backend /api/admin/stats and admin authentication."
        />
      )}

      <Row gutter={[18, 18]} style={{ marginBottom: 24 }}>
        {statCards.map((stat) => (
          <Col key={stat.label} xs={24} sm={12} xl={8} xxl={4}>
            <Card
              hoverable
              onClick={() => router.push(stat.href)}
              styles={{ body: { padding: 20 } }}
              style={{ ...panelStyle, height: "100%" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 14,
                }}
              >
                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    fontSize: 20,
                    color: stat.accent,
                    background: `${stat.accent}1f`,
                    flexShrink: 0,
                  }}
                >
                  {stat.icon}
                </span>

                <RightOutlined
                  style={{
                    color: "rgba(255,255,255,0.28)",
                    marginTop: 4,
                  }}
                />
              </div>

              <Statistic
                title={stat.label}
                value={stat.value}
                valueStyle={{
                  color: "#fff",
                  fontSize: 24,
                  fontWeight: 800,
                  marginTop: 12,
                }}
              />

              <Text type="secondary" style={{ fontSize: 12 }}>
                {stat.note}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[18, 18]} style={{ marginBottom: 24 }}>
        <Col xs={24} xl={15}>
          <Card
            title={<span style={{ color: "#fff" }}>Order status chart</span>}
            extra={
              <Text type="secondary">
                Distribution across fulfilment stages
              </Text>
            }
            styles={{ body: { padding: 22 } }}
            style={panelStyle}
          >
            {statsQuery.isLoading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                {Object.keys(STATUS_LABELS).map((status) => {
                  const count = Number(ordersByStatus[status] || 0);
                  const percent = totalOrders
                    ? Math.round((count / totalOrders) * 100)
                    : 0;

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

                      <Progress
                        percent={percent}
                        showInfo={false}
                        strokeColor={STATUS_ACCENTS[status]}
                      />
                    </div>
                  );
                })}
              </Space>
            )}
          </Card>
        </Col>

        <Col xs={24} xl={9}>
          <Card
            title={<span style={{ color: "#fff" }}>Revenue collection</span>}
            extra={<Text type="secondary">Paid vs pending</Text>}
            styles={{ body: { padding: 22 } }}
            style={{ ...panelStyle, height: "100%" }}
          >
            {statsQuery.isLoading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
              <RevenueSplit
                paid={Number(totals?.paidRevenue || 0)}
                pending={Number(totals?.pendingRevenue || 0)}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[18, 18]} style={{ marginBottom: 24 }}>
        <Col xs={24} xl={16}>
          <Card
            title={<span style={{ color: "#fff" }}>Recent orders</span>}
            extra={
              <Button type="link" onClick={() => router.push("/admin/orders")}>
                View all <ArrowRightOutlined />
              </Button>
            }
            styles={{ body: { padding: 0 } }}
            style={panelStyle}
          >
            <Table<AdminRecentOrder>
              rowKey="_id"
              columns={recentOrderColumns}
              dataSource={statsData?.recentOrders || []}
              loading={statsQuery.isLoading}
              pagination={false}
              scroll={{ x: 900 }}
            />
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card
            title={<span style={{ color: "#fff" }}>Low stock watchlist</span>}
            extra={
              <Button
                type="link"
                onClick={() => router.push("/admin/products")}
              >
                Products <ArrowRightOutlined />
              </Button>
            }
            styles={{ body: { padding: 0 } }}
            style={panelStyle}
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
      </Row>

      <Card
        title={<span style={{ color: "#fff" }}>Quick actions</span>}
        styles={{ body: { padding: 20 } }}
        style={panelStyle}
      >
        <Row gutter={[16, 16]}>
          {QUICK_ACTIONS.map((action) => (
            <Col key={action.href} xs={24} md={12} xl={8}>
              <Card
                hoverable
                onClick={() => router.push(action.href)}
                styles={{ body: { padding: 18 } }}
                style={{
                  borderColor: "rgba(255,255,255,0.08)",
                  height: "100%",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span
                    style={{
                      display: "grid",
                      placeItems: "center",
                      width: 46,
                      height: 46,
                      borderRadius: 14,
                      fontSize: 19,
                      color: "#60a5fa",
                      background: "rgba(96,165,250,0.12)",
                      flexShrink: 0,
                    }}
                  >
                    {action.icon}
                  </span>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#fff",
                      }}
                    >
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

                  <RightOutlined style={{ color: "rgba(255,255,255,0.32)" }} />
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default AdminPage;

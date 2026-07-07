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
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  AppstoreOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  PercentageOutlined,
  ReloadOutlined,
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
import { useAdminTheme } from "@/providers/AdminAntdProvider";
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

// Per-mode values live in AdminAntdProvider's CSS variables; both palettes
// are validated for colorblind separation and surface contrast.
const getStatusAccent = (status: string) => `var(--adm-status-${status})`;

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
  borderColor: "var(--adm-border)",
  background: "var(--adm-panel-bg)",
};

const heroStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  padding: "22px 26px",
  borderRadius: 20,
  border: "1px solid var(--adm-border)",
  marginBottom: 20,
  background: "var(--adm-hero-bg)",
};

const cardTitleStyle: CSSProperties = { color: "var(--adm-text)" };

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

const formatDateOnly = (value: string) =>
  new Intl.DateTimeFormat("en-PK", { dateStyle: "medium" }).format(
    new Date(value),
  );

const formatTimeOnly = (value: string) =>
  new Intl.DateTimeFormat("en-PK", { timeStyle: "short" }).format(
    new Date(value),
  );

const getStatusLabel = (status?: string) =>
  STATUS_LABELS[status || ""] || status || "Pending";

const sumStatuses = (
  ordersByStatus: Record<string, number>,
  statuses: string[],
) =>
  statuses.reduce(
    (total, status) => total + Number(ordersByStatus[status] || 0),
    0,
  );

const StatusBarChart = ({
  ordersByStatus,
  totalOrders,
}: {
  ordersByStatus: Record<string, number>;
  totalOrders: number;
}) => {
  const statuses = Object.keys(STATUS_LABELS);
  const maxCount = Math.max(
    ...statuses.map((status) => Number(ordersByStatus[status] || 0)),
    1,
  );

  return (
    <div>
      {statuses.map((status) => {
        const count = Number(ordersByStatus[status] || 0);
        const barPercent = (count / maxCount) * 100;
        const share = totalOrders ? Math.round((count / totalOrders) * 100) : 0;

        return (
          <Tooltip
            key={status}
            title={`${getStatusLabel(status)}: ${formatNumber(count)} orders — ${share}% of all orders`}
          >
            <div
              className="dash-bar-row"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "8px 10px",
                borderRadius: 10,
                cursor: "default",
              }}
            >
              <span
                style={{
                  width: 92,
                  flexShrink: 0,
                  fontSize: 13,
                  color: "var(--adm-text-2)",
                }}
              >
                {getStatusLabel(status)}
              </span>

              <div
                style={{
                  flex: 1,
                  height: 14,
                  borderRadius: "0 4px 4px 0",
                  background: "var(--adm-wash)",
                  borderLeft: "1px solid var(--adm-baseline)",
                  overflow: "hidden",
                }}
              >
                <div
                  className="dash-bar-fill"
                  style={{
                    width: `${barPercent}%`,
                    minWidth: count > 0 ? 6 : 0,
                    height: "100%",
                    borderRadius: "0 4px 4px 0",
                    background: getStatusAccent(status),
                  }}
                />
              </div>

              <strong
                style={{
                  width: 44,
                  textAlign: "right",
                  color: "var(--adm-text)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {formatNumber(count)}
              </strong>

              <span
                style={{
                  width: 40,
                  textAlign: "right",
                  fontSize: 12,
                  color: "var(--adm-text-3)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {share}%
              </span>
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
};

const RevenueCollection = ({
  paid = 0,
  pending = 0,
  orders = 0,
}: {
  paid?: number;
  pending?: number;
  orders?: number;
}) => {
  const total = paid + pending;
  const collectedPercent = total ? Math.round((paid / total) * 100) : 0;
  const avgOrderValue = orders ? Math.round(total / orders) : 0;

  const legendRows = [
    { label: "Paid", value: paid, accent: "var(--adm-good)" },
    { label: "Pending", value: pending, accent: "var(--adm-warn)" },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span
          style={{
            color: "var(--adm-text)",
            fontSize: 38,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          {collectedPercent}%
        </span>
        <Text type="secondary">of revenue collected</Text>
      </div>

      <div style={{ display: "flex", gap: 2, height: 14, marginTop: 16 }}>
        <div
          style={{
            width: `${collectedPercent}%`,
            minWidth: paid > 0 ? 6 : 0,
            borderRadius: 4,
            background: "var(--adm-good)",
          }}
        />
        <div
          style={{
            flex: 1,
            borderRadius: 4,
            background: pending > 0 ? "var(--adm-warn)" : "var(--adm-wash)",
          }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        {legendRows.map((row) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 0",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: row.accent,
                flexShrink: 0,
              }}
            />
            <Text type="secondary" style={{ flex: 1 }}>
              {row.label}
            </Text>
            <strong style={{ color: "var(--adm-text)" }}>{formatMoney(row.value)}</strong>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 12,
          paddingTop: 12,
          borderTop: "1px solid var(--adm-border)",
        }}
      >
        <Text type="secondary">Avg. order value</Text>
        <strong style={{ color: "var(--adm-text)" }}>{formatMoney(avgOrderValue)}</strong>
      </div>
    </div>
  );
};

const FulfilmentHealth = ({
  ordersByStatus,
  totalOrders,
}: {
  ordersByStatus: Record<string, number>;
  totalOrders: number;
}) => {
  const { mode } = useAdminTheme();
  const goodColor = mode === "dark" ? "#22c55e" : "#16a34a";

  const delivered = Number(ordersByStatus.delivered || 0);
  const deliveredPercent = totalOrders
    ? Math.round((delivered / totalOrders) * 100)
    : 0;

  const rows = [
    {
      label: "In transit",
      value: sumStatuses(ordersByStatus, ["shipped"]),
    },
    {
      label: "In pipeline",
      value: sumStatuses(ordersByStatus, [
        "pending",
        "confirmed",
        "processing",
      ]),
    },
    {
      label: "Cancelled / returned",
      value: sumStatuses(ordersByStatus, ["cancelled", "returned"]),
    },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <Progress
        type="circle"
        percent={deliveredPercent}
        size={92}
        strokeColor={goodColor}
        railColor={
          mode === "dark" ? "rgba(34,197,94,0.14)" : "rgba(22,163,74,0.16)"
        }
      />

      <div style={{ flex: 1 }}>
        <div style={{ color: "var(--adm-text)", fontWeight: 800 }}>
          {formatNumber(delivered)} delivered
        </div>
        <Text type="secondary" style={{ fontSize: 12 }}>
          out of {formatNumber(totalOrders)} orders
        </Text>

        <div style={{ marginTop: 10 }}>
          {rows.map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                padding: "3px 0",
                fontSize: 13,
              }}
            >
              <Text type="secondary">{row.label}</Text>
              <strong
                style={{ color: "var(--adm-text)", fontVariantNumeric: "tabular-nums" }}
              >
                {formatNumber(row.value)}
              </strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdminPage = () => {
  const router = useRouter();
  const currentUserQuery = useCurrentUser();
  const statsQuery = useAdminStats();
  const { mode } = useAdminTheme();

  // Icon chips tint their accent with hex alpha, so these need concrete hex
  // values per mode rather than CSS variables.
  const isDark = mode === "dark";

  const user = currentUserQuery.data?.data;
  const firstName = user?.name ? user.name.split(" ")[0] : "";

  const statsData = statsQuery.data?.data;
  const totals = statsData?.totals;
  const ordersByStatus = statsData?.ordersByStatus || {};
  const totalOrders = totals?.orders || 0;

  const updatedAt =
    statsData?.meta?.generatedAt ||
    (statsQuery.dataUpdatedAt
      ? new Date(statsQuery.dataUpdatedAt).toISOString()
      : undefined);

  const statCards: StatCard[] = [
    {
      label: "Revenue",
      value: statsQuery.isLoading ? "…" : formatMoney(totals?.revenue),
      note: "Excl. cancelled / returned",
      icon: <DollarOutlined />,
      accent: isDark ? "#22c55e" : "#16a34a",
      href: "/admin/orders",
    },
    {
      label: "Orders",
      value: statsQuery.isLoading ? "…" : formatNumber(totals?.orders),
      note: "All customer orders",
      icon: <ShoppingCartOutlined />,
      accent: isDark ? "#f59e0b" : "#d97706",
      href: "/admin/orders",
    },
    {
      label: "Customers",
      value: statsQuery.isLoading ? "…" : formatNumber(totals?.customers),
      note: "Registered accounts",
      icon: <TeamOutlined />,
      accent: isDark ? "#60a5fa" : "#2563eb",
      href: "/admin/users",
    },
    {
      label: "Products",
      value: statsQuery.isLoading ? "…" : formatNumber(totals?.products),
      note: "Catalogue items",
      icon: <AppstoreOutlined />,
      accent: isDark ? "#a78bfa" : "#7c3aed",
      href: "/admin/products",
    },
    {
      label: "Categories",
      value: statsQuery.isLoading ? "…" : formatNumber(totals?.categories),
      note: "Product groups",
      icon: <TagsOutlined />,
      accent: isDark ? "#38bdf8" : "#0284c7",
      href: "/admin/categories",
    },
    {
      label: "Low Stock",
      value: statsQuery.isLoading ? "…" : formatNumber(totals?.lowStock),
      note: "Needs restock",
      icon: <WarningOutlined />,
      accent: isDark ? "#ef4444" : "#dc2626",
      href: "/admin/products",
    },
  ];

  const recentOrderColumns: ColumnsType<AdminRecentOrder> = [
    {
      title: "Order",
      dataIndex: "orderNumber",
      width: 165,
      render: (orderNumber?: string) => (
        <strong style={{ color: "var(--adm-text)", fontSize: 13, whiteSpace: "nowrap" }}>
          {orderNumber || "-"}
        </strong>
      ),
    },
    {
      title: "Customer",
      width: 180,
      render: (_, order) => (
        <div>
          <div style={{ color: "var(--adm-text)", fontWeight: 700 }}>
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
      width: 110,
      render: (status?: string) => (
        <Tag color={STATUS_COLORS[status || ""] || "default"}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: "Payment",
      dataIndex: "paymentStatus",
      width: 100,
      render: (status?: string) => (
        <Tag
          color={status === "paid" ? "green" : "gold"}
          style={{ textTransform: "capitalize" }}
        >
          {status || "pending"}
        </Tag>
      ),
    },
    {
      title: "Total",
      dataIndex: "grandTotal",
      align: "right",
      width: 110,
      render: (total?: number) => (
        <strong
          style={{
            color: "var(--adm-text)",
            whiteSpace: "nowrap",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatMoney(total)}
        </strong>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      width: 125,
      render: (createdAt?: string) => {
        if (!createdAt) return "-";

        return (
          <div style={{ whiteSpace: "nowrap" }}>
            <div>{formatDateOnly(createdAt)}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatTimeOnly(createdAt)}
            </Text>
          </div>
        );
      },
    },
  ];

  const lowStockColumns: ColumnsType<AdminLowStockProduct> = [
    {
      title: "Product",
      dataIndex: "title",
      render: (title: string, product) => (
        <div>
          <strong style={{ color: "var(--adm-text)" }}>{title}</strong>
          <div style={{ color: "var(--adm-text-3)", fontSize: 12 }}>
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
      <style>{`
        .dash-bar-row { transition: background 0.15s ease; }
        .dash-bar-row:hover { background: var(--adm-wash); }
        .dash-bar-row:hover .dash-bar-fill { filter: brightness(1.18); }
        .dash-action {
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .dash-action:hover,
        .dash-action:focus-visible {
          border-color: var(--adm-accent-border) !important;
          background: var(--adm-accent-soft);
          outline: none;
        }
      `}</style>

      <div style={heroStyle}>
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                color: "var(--adm-accent)",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Executive overview
            </div>

            <Title
              level={2}
              style={{ color: "var(--adm-text)", margin: 0, letterSpacing: "-0.03em" }}
            >
              Welcome back{firstName ? `, ${firstName}` : ""} 👋
            </Title>

            <Text style={{ color: "var(--adm-text-2)", fontSize: 14 }}>
              Sales, orders, customers, inventory and fulfilment overview.
            </Text>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 6,
            }}
          >
            <Button
              icon={<ReloadOutlined />}
              loading={statsQuery.isFetching && !statsQuery.isLoading}
              onClick={() => statsQuery.refetch()}
            >
              Refresh
            </Button>

            <Text type="secondary" style={{ fontSize: 12 }}>
              Updated {formatDate(updatedAt)}
            </Text>
          </div>
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

      <Row gutter={[18, 18]} style={{ marginBottom: 20 }}>
        {statCards.map((stat) => (
          <Col key={stat.label} xs={12} md={8} xxl={4}>
            <Card
              hoverable
              onClick={() => router.push(stat.href)}
              styles={{ body: { padding: 18 } }}
              style={{ ...panelStyle, height: "100%" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    fontSize: 18,
                    color: stat.accent,
                    background: `${stat.accent}1f`,
                    flexShrink: 0,
                  }}
                >
                  {stat.icon}
                </span>

                <RightOutlined
                  style={{
                    color: "var(--adm-text-4)",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: 14,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--adm-text-3)",
                }}
              >
                {stat.label}
              </div>

              <div
                style={{
                  color: "var(--adm-text)",
                  fontSize: 22,
                  fontWeight: 800,
                  marginTop: 4,
                  overflowWrap: "anywhere",
                }}
              >
                {stat.value}
              </div>

              <Text type="secondary" style={{ fontSize: 12 }}>
                {stat.note}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[18, 18]} style={{ marginBottom: 20 }}>
        <Col xs={24} xl={14}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              height: "100%",
            }}
          >
            <Card
              title={<span style={cardTitleStyle}>Orders by status</span>}
              extra={<Text type="secondary">Share of all orders</Text>}
              styles={{ body: { padding: 16 } }}
              style={panelStyle}
            >
              {statsQuery.isLoading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : (
                <StatusBarChart
                  ordersByStatus={ordersByStatus}
                  totalOrders={totalOrders}
                />
              )}
            </Card>

            <Card
              title={<span style={cardTitleStyle}>Low stock watchlist</span>}
              extra={
                <Button
                  type="link"
                  onClick={() => router.push("/admin/products")}
                >
                  Products <ArrowRightOutlined />
                </Button>
              }
              styles={{
                body: {
                  padding: 0,
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                },
              }}
              style={{
                ...panelStyle,
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {!statsQuery.isLoading &&
              (statsData?.lowStockProducts || []).length === 0 ? (
                <div
                  style={{
                    flex: 1,
                    display: "grid",
                    placeItems: "center",
                    padding: "36px 24px",
                    textAlign: "center",
                  }}
                >
                  <div>
                    <CheckCircleOutlined
                      style={{ fontSize: 34, color: "var(--adm-good)" }}
                    />
                    <div
                      style={{ color: "var(--adm-text)", fontWeight: 700, marginTop: 12 }}
                    >
                      All stocked up
                    </div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      No products are below the low stock threshold.
                    </Text>
                  </div>
                </div>
              ) : (
                <Table<AdminLowStockProduct>
                  rowKey="_id"
                  size="middle"
                  columns={lowStockColumns}
                  dataSource={statsData?.lowStockProducts || []}
                  loading={statsQuery.isLoading}
                  pagination={false}
                />
              )}
            </Card>
          </div>
        </Col>

        <Col xs={24} xl={10}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              height: "100%",
            }}
          >
            <Card
              title={<span style={cardTitleStyle}>Revenue collection</span>}
              extra={<Text type="secondary">Paid vs pending</Text>}
              styles={{ body: { padding: 20 } }}
              style={panelStyle}
            >
              {statsQuery.isLoading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : (
                <RevenueCollection
                  paid={Number(totals?.paidRevenue || 0)}
                  pending={Number(totals?.pendingRevenue || 0)}
                  orders={totalOrders}
                />
              )}
            </Card>

            <Card
              title={<span style={cardTitleStyle}>Fulfilment health</span>}
              extra={<Text type="secondary">Delivered share</Text>}
              styles={{ body: { padding: 20 } }}
              style={{ ...panelStyle, flex: 1 }}
            >
              {statsQuery.isLoading ? (
                <Skeleton active paragraph={{ rows: 3 }} />
              ) : (
                <FulfilmentHealth
                  ordersByStatus={ordersByStatus}
                  totalOrders={totalOrders}
                />
              )}
            </Card>
          </div>
        </Col>
      </Row>

      <Card
        title={<span style={cardTitleStyle}>Recent orders</span>}
        extra={
          <Button type="link" onClick={() => router.push("/admin/orders")}>
            View all <ArrowRightOutlined />
          </Button>
        }
        styles={{ body: { padding: 0 } }}
        style={{ ...panelStyle, marginBottom: 20 }}
      >
        <Table<AdminRecentOrder>
          rowKey="_id"
          size="middle"
          columns={recentOrderColumns}
          dataSource={statsData?.recentOrders || []}
          loading={statsQuery.isLoading}
          pagination={false}
          scroll={{ x: 790 }}
        />
      </Card>

      <Card
        title={<span style={cardTitleStyle}>Quick actions</span>}
        styles={{ body: { padding: 18 } }}
        style={panelStyle}
      >
        <Row gutter={[14, 14]}>
          {QUICK_ACTIONS.map((action) => (
            <Col key={action.href} xs={24} md={12} xl={8}>
              <div
                className="dash-action"
                role="button"
                tabIndex={0}
                onClick={() => router.push(action.href)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(action.href);
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  height: "100%",
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid var(--adm-border)",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 42,
                    height: 42,
                    borderRadius: 13,
                    fontSize: 18,
                    color: "var(--adm-accent)",
                    background: "var(--adm-accent-soft)",
                    flexShrink: 0,
                  }}
                >
                  {action.icon}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--adm-text)" }}>
                    {action.label}
                  </div>

                  <div
                    style={{
                      marginTop: 2,
                      color: "var(--adm-text-3)",
                      fontSize: 12,
                    }}
                  >
                    {action.description}
                  </div>
                </div>

                <RightOutlined
                  style={{ color: "var(--adm-text-4)", fontSize: 12 }}
                />
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default AdminPage;

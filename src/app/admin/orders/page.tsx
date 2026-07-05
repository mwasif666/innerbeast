"use client";

import { useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  Descriptions,
  Divider,
  Drawer,
  Empty,
  Input,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";

import {
  useAdminOrder,
  useAdminOrders,
  useUpdateOrderStatus,
} from "@/hooks/useOrders";
import {
  extractOrders,
  getOrdersCount,
  Order as AdminOrder,
  OrderItem,
  OrderStatus,
} from "@/services/order.service";

const { Title, Text } = Typography;
const { TextArea } = Input;

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const formatCurrency = (value?: number) =>
  `Rs. ${Number(value || 0).toLocaleString("en-PK")}`;

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getStatus = (order: AdminOrder) =>
  String(order.orderStatus || order.status || "pending").toLowerCase();

const isOrderCancelled = (order?: AdminOrder | null) =>
  Boolean(order && getStatus(order) === "cancelled");

const CUSTOMER_CANCELLATION_PREFIX = "Cancelled by customer:";
const ADMIN_NOTE_SEPARATOR = "Admin note:";

const getSeparatedNotes = (order?: AdminOrder | null) => {
  if (!order) return { cancellationReason: "", adminNote: "" };

  const explicitReason = order.cancellationReason || order.cancelReason || "";
  const storedAdminNotes = order.adminNotes || "";
  const prefixedCancellation = storedAdminNotes.match(
    /^Cancelled by customer:\s*([\s\S]*?)(?:\r?\nAdmin note:\s*([\s\S]*))?$/i,
  );

  if (prefixedCancellation) {
    return {
      cancellationReason: explicitReason || prefixedCancellation[1].trim(),
      adminNote: (prefixedCancellation[2] || "").trim(),
    };
  }

  return {
    cancellationReason: explicitReason,
    adminNote: storedAdminNotes,
  };
};

const serializeCancelledOrderNotes = (
  cancellationReason: string,
  adminNote: string,
) => {
  const customerNote = `${CUSTOMER_CANCELLATION_PREFIX} ${cancellationReason.trim()}`;
  const internalNote = adminNote.trim();

  return internalNote
    ? `${customerNote}\n${ADMIN_NOTE_SEPARATOR} ${internalNote}`
    : customerNote;
};

const statusColor = (status: string) => {
  if (status === "delivered" || status === "paid") return "success";
  if (["cancelled", "failed", "returned"].includes(status)) return "error";
  if (status === "shipped" || status === "refunded") return "cyan";
  if (status === "processing" || status === "confirmed") return "blue";
  return "gold";
};

const getCustomerName = (order: AdminOrder) =>
  order.shippingAddress?.fullName ||
  order.customer?.name ||
  (typeof order.user === "object" ? order.user.name : "") ||
  "Customer";

const getCustomerEmail = (order: AdminOrder) =>
  order.shippingAddress?.email ||
  order.customer?.email ||
  (typeof order.user === "object" ? order.user.email : "") ||
  "";

const getOrderTotal = (order: AdminOrder) =>
  order.grandTotal ?? order.total ?? order.totalAmount ?? order.subtotal ?? 0;

const getItemName = (item: OrderItem) => {
  if (item.title || item.name) return item.title || item.name || "Product";
  if (item.product && typeof item.product === "object") {
    return item.product.title || item.product.name || "Product";
  }
  return "Product";
};

const getItemImage = (item: OrderItem) => {
  if (typeof item.image === "string") return item.image;
  if (item.image?.url) return item.image.url;
  if (item.product && typeof item.product === "object") {
    const image = item.product.images?.[0];
    if (typeof image === "string") return image;
    return image?.url || "";
  }
  return "";
};

const getItemColor = (item: OrderItem) => {
  const color = item.color || item.selectedColor;
  if (!color) return { name: "", hex: "" };
  if (typeof color === "string") return { name: color, hex: "" };
  return { name: color.name || "", hex: color.hex || "" };
};

const getItemProductId = (item: OrderItem) => {
  if (!item.product) return "";
  return typeof item.product === "string" ? item.product : item.product._id || "";
};

const getItemLineTotal = (item: OrderItem) =>
  item.lineTotal ?? Number(item.price || 0) * Number(item.quantity || 1);

const ProductThumb = ({ item, size = 52 }: { item: OrderItem; size?: number }) => {
  const image = getItemImage(item);
  return (
    <div
      style={{
        width: size,
        height: size,
        flex: `0 0 ${size}px`,
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,.1)",
        background: image
          ? `#1b1b1b url("${image.replace(/"/g, "%22")}") center / cover no-repeat`
          : "#1b1b1b",
        display: "grid",
        placeItems: "center",
        color: "rgba(255,255,255,.35)",
      }}
    >
      {!image && <ShoppingCartOutlined />}
    </div>
  );
};

const AdminOrdersPage = () => {
  const { message } = App.useApp();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [editStatus, setEditStatus] = useState<OrderStatus>("pending");
  const [editPaymentStatus, setEditPaymentStatus] = useState("pending");
  const [adminNotes, setAdminNotes] = useState("");

  const ordersQuery = useAdminOrders();
  const orderQuery = useAdminOrder(selectedOrder?._id || "");
  const updateMutation = useUpdateOrderStatus();
  const detailOrder = orderQuery.data?.data || selectedOrder;
  const cancelledDetailOrder = isOrderCancelled(detailOrder);
  const detailNotes = getSeparatedNotes(detailOrder);

  const orders = useMemo(() => extractOrders(ordersQuery.data), [ordersQuery.data]);
  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (status !== "all" && getStatus(order) !== status) return false;
      if (!query) return true;
      return [
        order.orderNumber,
        order._id,
        getCustomerName(order),
        getCustomerEmail(order),
        order.shippingAddress?.phone,
        ...(order.items || []).flatMap((item) => [getItemName(item), item.sku]),
      ].some((value) => String(value || "").toLowerCase().includes(query));
    });
  }, [orders, search, status]);

  const openOrder = (order: AdminOrder) => {
    setSelectedOrder(order);
    setEditStatus(getStatus(order));
    setEditPaymentStatus(order.paymentStatus || "pending");
    setAdminNotes(getSeparatedNotes(order).adminNote);
  };

  const handleUpdateOrder = async () => {
    if (!detailOrder) return;
    try {
      if (isOrderCancelled(detailOrder)) {
        const response = await updateMutation.mutateAsync({
          id: detailOrder._id,
          payload: {
            adminNotes: detailNotes.cancellationReason
              ? serializeCancelledOrderNotes(
                  detailNotes.cancellationReason,
                  adminNotes,
                )
              : adminNotes,
          },
        });
        setSelectedOrder(response.data);
        message.success(
          "Admin note updated. Cancelled order status cannot be modified.",
        );
        return;
      }

      const response = await updateMutation.mutateAsync({
        id: detailOrder._id,
        payload: {
          orderStatus: editStatus,
          paymentStatus: editPaymentStatus as "pending" | "paid" | "failed" | "refunded",
          adminNotes,
        },
      });
      setSelectedOrder(response.data);
      message.success("Order updated successfully.");
    } catch (error) {
      message.error((error as Error).message || "Failed to update order.");
    }
  };

  const columns: ColumnsType<AdminOrder> = [
    {
      title: "Order",
      key: "order",
      width: 180,
      render: (_, order) => (
        <div>
          <button type="button" onClick={() => openOrder(order)} style={{ color: "#fff", fontWeight: 650, textAlign: "left" }}>
            {order.orderNumber || `#${order._id.slice(-8).toUpperCase()}`}
          </button>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{formatDate(order.createdAt || order.placedAt)}</Text></div>
        </div>
      ),
    },
    {
      title: "Products",
      key: "products",
      width: 290,
      render: (_, order) => {
        const firstItem = order.items?.[0];
        if (!firstItem) return <Text type="secondary">No products</Text>;
        const totalQty = order.totalItems || order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <ProductThumb item={firstItem} size={44} />
            <div style={{ minWidth: 0 }}>
              <div style={{ color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getItemName(firstItem)}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>{totalQty} item{totalQty === 1 ? "" : "s"}{order.items.length > 1 ? ` / +${order.items.length - 1} product` : ""}</Text>
            </div>
          </div>
        );
      },
    },
    {
      title: "Customer",
      key: "customer",
      width: 210,
      render: (_, order) => (
        <div><div style={{ color: "#fff" }}>{getCustomerName(order)}</div><Text type="secondary" style={{ fontSize: 12 }}>{getCustomerEmail(order) || order.shippingAddress?.phone || "-"}</Text></div>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 125,
      render: (_, order) => <Tag color={statusColor(getStatus(order))} style={{ margin: 0, borderRadius: 999, textTransform: "capitalize" }}>{getStatus(order)}</Tag>,
    },
    {
      title: "Total",
      key: "total",
      width: 140,
      align: "right",
      sorter: (a, b) => getOrderTotal(a) - getOrderTotal(b),
      render: (_, order) => <strong style={{ color: "#fff" }}>{formatCurrency(getOrderTotal(order))}</strong>,
    },
    {
      title: "",
      key: "actions",
      width: 64,
      align: "right",
      render: (_, order) => <Button type="text" shape="circle" aria-label="View order" icon={<EyeOutlined />} onClick={() => openOrder(order)} />,
    },
  ];

  return (
    <div style={{ maxWidth: 1600, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
        <div>
          <div style={{ color: "#f59e0b", fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 7 }}>Order management</div>
          <Title level={2} style={{ margin: 0, color: "#fff" }}>Orders</Title>
          <Text type="secondary">Review products, customer details and fulfilment status.</Text>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 14px", borderRadius: 13, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)" }}>
          <ShoppingCartOutlined style={{ color: "#f59e0b" }} /><Text type="secondary">Total orders</Text><strong style={{ color: "#fff" }}>{getOrdersCount(ordersQuery.data)}</strong>
        </div>
      </div>

      <Card styles={{ body: { padding: 18 } }} style={{ borderColor: "rgba(255,255,255,.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
          <Space wrap>
            <Input allowClear size="large" prefix={<SearchOutlined style={{ color: "rgba(255,255,255,.4)" }} />} placeholder="Search order, customer or product..." value={search} onChange={(event) => setSearch(event.target.value)} style={{ width: 360 }} />
            <Select size="large" value={status} onChange={setStatus} style={{ width: 170 }} options={[{ value: "all", label: "All statuses" }, ...ORDER_STATUSES.map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) }))]} />
          </Space>
          <Text type="secondary" style={{ alignSelf: "center" }}>{filteredOrders.length} results</Text>
        </div>

        <Table<AdminOrder> rowKey="_id" columns={columns} dataSource={filteredOrders} loading={ordersQuery.isLoading} scroll={{ x: 1050 }} pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: [10, 20, 50], showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total}` }} locale={{ emptyText: ordersQuery.isError ? <Empty description="Orders could not be loaded. Please confirm your admin session." /> : "No orders found." }} />
      </Card>

      <Drawer title={detailOrder?.orderNumber || "Order details"} width={680} open={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)} styles={{ body: { padding: 24 } }}>
        {orderQuery.isLoading && !orderQuery.data ? (
          <div style={{ minHeight: 300, display: "grid", placeItems: "center" }}><Spin /></div>
        ) : detailOrder ? (
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            <Card size="small" title="Fulfilment" style={{ borderColor: "rgba(255,255,255,.1)" }}>
              {cancelledDetailOrder && (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    marginBottom: 14,
                    border: "1px solid rgba(239,68,68,.35)",
                    background: "rgba(239,68,68,.1)",
                    color: "#fecaca",
                  }}
                >
                  This order is cancelled. Status and payment cannot be modified anymore.
                  You can only update internal admin notes.
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
                <label><Text type="secondary">Order status</Text><Select disabled={cancelledDetailOrder} value={editStatus} onChange={setEditStatus} style={{ width: "100%", marginTop: 6 }} options={ORDER_STATUSES.map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) }))} /></label>
                <label><Text type="secondary">Payment status</Text><Select disabled={cancelledDetailOrder} value={editPaymentStatus} onChange={setEditPaymentStatus} style={{ width: "100%", marginTop: 6 }} options={PAYMENT_STATUSES.map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) }))} /></label>
                <label style={{ gridColumn: "1 / -1" }}><Text type="secondary">Admin notes</Text><TextArea value={adminNotes} onChange={(event) => setAdminNotes(event.target.value)} rows={3} maxLength={1000} placeholder="Internal fulfilment note..." style={{ marginTop: 6 }} /></label>
              </div>
              <Button type="primary" icon={<CheckCircleOutlined />} loading={updateMutation.isPending} onClick={handleUpdateOrder} style={{ marginTop: 14 }}>Save updates</Button>
            </Card>

            <Descriptions title="Customer & order" column={1} size="small" bordered items={[
              { key: "id", label: "Order ID", children: detailOrder._id },
              { key: "customer", label: "Customer", children: getCustomerName(detailOrder) },
              { key: "email", label: "Email", children: getCustomerEmail(detailOrder) || "-" },
              { key: "phone", label: "Phone", children: detailOrder.shippingAddress?.phone || detailOrder.customer?.phone || "-" },
              { key: "payment", label: "Payment", children: <Space><Tag>{detailOrder.paymentMethod || "COD"}</Tag><Tag color={statusColor(detailOrder.paymentStatus || "pending")}>{detailOrder.paymentStatus || "pending"}</Tag></Space> },
              { key: "created", label: "Placed", children: formatDate(detailOrder.placedAt || detailOrder.createdAt) },
            ]} />

            <div>
              <Title level={5} style={{ color: "#fff", marginBottom: 8 }}>Delivery address</Title>
              <Text type="secondary" style={{ lineHeight: 1.7 }}>
                {[detailOrder.shippingAddress?.addressLine1, detailOrder.shippingAddress?.addressLine2, detailOrder.shippingAddress?.city, detailOrder.shippingAddress?.state, detailOrder.shippingAddress?.postalCode, detailOrder.shippingAddress?.country].filter(Boolean).join(", ") || "No address supplied"}
              </Text>
            </div>

            <div>
              <Title level={5} style={{ color: "#fff", marginBottom: 10 }}>Products ({detailOrder.items?.length || 0})</Title>
              <div style={{ display: "grid", gap: 10 }}>
                {(detailOrder.items || []).map((item, index) => {
                  const color = getItemColor(item);
                  const productId = getItemProductId(item);
                  return (
                    <div key={`${item.sku || getItemName(item)}-${index}`} style={{ display: "grid", gridTemplateColumns: "72px minmax(0,1fr) auto", gap: 14, alignItems: "center", padding: 12, border: "1px solid rgba(255,255,255,.09)", borderRadius: 12, background: "rgba(255,255,255,.025)" }}>
                      <ProductThumb item={item} size={72} />
                      <div style={{ minWidth: 0 }}>
                        {productId ? <a href={`/products/${item.slug || productId}`} target="_blank" rel="noreferrer" style={{ color: "#fff", fontWeight: 600 }}>{getItemName(item)}</a> : <div style={{ color: "#fff", fontWeight: 600 }}>{getItemName(item)}</div>}
                        <Text type="secondary" style={{ display: "block", fontSize: 12, marginTop: 3 }}>SKU: {item.sku || "-"}</Text>
                        <Space size={8} wrap style={{ marginTop: 7 }}>
                          <Tag>Qty {item.quantity || 1}</Tag>
                          {(item.size || item.selectedSize) && <Tag>Size {item.size || item.selectedSize}</Tag>}
                          {color.name && <Tag><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: color.hex || "#777", marginRight: 6 }} />{color.name}</Tag>}
                        </Space>
                        <Text type="secondary" style={{ display: "block", fontSize: 12, marginTop: 7 }}>Unit price: {formatCurrency(item.price)}{item.originalPrice && item.originalPrice > Number(item.price || 0) ? ` (was ${formatCurrency(item.originalPrice)})` : ""}</Text>
                      </div>
                      <strong style={{ color: "#fff", whiteSpace: "nowrap" }}>{formatCurrency(getItemLineTotal(item))}</strong>
                    </div>
                  );
                })}
              </div>
            </div>

            <Card size="small" title="Order total" style={{ borderColor: "rgba(255,255,255,.1)" }}>
              {[
                ["Subtotal", detailOrder.subtotal],
                ["Discount", -(detailOrder.discountTotal || detailOrder.discount || 0)],
                ["Shipping", detailOrder.shippingFee || detailOrder.shipping || 0],
                ["Tax", detailOrder.taxTotal || 0],
              ].map(([label, amount]) => <div key={String(label)} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}><Text type="secondary">{label}</Text><span>{formatCurrency(Number(amount))}</span></div>)}
              <Divider style={{ margin: "14px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20 }}><strong>Grand total</strong><strong>{formatCurrency(getOrderTotal(detailOrder))}</strong></div>
            </Card>

            {(detailOrder.notes || detailNotes.cancellationReason || detailNotes.adminNote) && <Descriptions title="Notes" column={1} size="small" bordered items={[
              { key: "customerNote", label: "Customer note", children: detailOrder.notes || "-" },
              ...(detailNotes.cancellationReason ? [{ key: "cancellationReason", label: "Customer cancellation note", children: detailNotes.cancellationReason }] : []),
              { key: "adminNote", label: "Admin note", children: detailNotes.adminNote || "-" },
            ]} />}

            <div>
              <Title level={5} style={{ color: "#fff", marginBottom: 10 }}><ClockCircleOutlined /> Timeline</Title>
              <Space direction="vertical" size={6}>
                <Text type="secondary">Placed: {formatDate(detailOrder.placedAt || detailOrder.createdAt)}</Text>
                {detailOrder.confirmedAt && <Text type="secondary">Confirmed: {formatDate(detailOrder.confirmedAt)}</Text>}
                {detailOrder.shippedAt && <Text type="secondary">Shipped: {formatDate(detailOrder.shippedAt)}</Text>}
                {detailOrder.deliveredAt && <Text type="secondary">Delivered: {formatDate(detailOrder.deliveredAt)}</Text>}
                {detailOrder.cancelledAt && <Text type="secondary">Cancelled: {formatDate(detailOrder.cancelledAt)}</Text>}
              </Space>
            </div>
          </Space>
        ) : null}
      </Drawer>
    </div>
  );
};

export default AdminOrdersPage;

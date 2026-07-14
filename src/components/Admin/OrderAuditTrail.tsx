"use client";

import { Empty, Space, Tag, Timeline, Typography } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import { useOrderStatusHistory } from "@/hooks/useOrders";

const { Text } = Typography;

const OrderAuditTrail = ({ orderId }: { orderId?: string }) => {
  const query = useOrderStatusHistory(orderId || "");
  const rows = query.data?.data || [];

  if (!orderId) return null;
  if (!query.isLoading && rows.length === 0) return <Empty description="No audit trail yet." />;

  return (
    <Timeline
      items={rows.map((item) => ({
        dot: <ClockCircleOutlined />,
        children: (
          <Space direction="vertical" size={4}>
            <Space wrap>
              <Tag>Order: {item.previousOrderStatus || "-"} to {item.orderStatus || "-"}</Tag>
              <Tag>Payment: {item.previousPaymentStatus || "-"} to {item.paymentStatus || "-"}</Tag>
            </Space>
            <Text type="secondary">
              {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"} by {item.changedByName || "Admin"}
            </Text>
            {item.note && <Text type="secondary">Note: {item.note}</Text>}
          </Space>
        ),
      }))}
    />
  );
};

export default OrderAuditTrail;

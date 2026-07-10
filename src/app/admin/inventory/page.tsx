"use client";

import { useState } from "react";
import { Card, Empty, InputNumber, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useLowStockProducts } from "@/hooks/useInventory";
import type { LowStockProduct } from "@/services/inventory.service";

const { Title, Text } = Typography;

const columns: ColumnsType<LowStockProduct> = [
  { title: "Product", dataIndex: "title", key: "title", render: (value, row) => <div><strong>{value || "Product"}</strong><br /><Text type="secondary">{row.sku || "-"}</Text></div> },
  { title: "Stock", dataIndex: "stock", key: "stock", width: 120, render: (value) => <Tag color={Number(value || 0) <= 2 ? "red" : "gold"}>{Number(value || 0)}</Tag> },
  { title: "Slug", dataIndex: "slug", key: "slug", render: (value) => <Text type="secondary">{value || "-"}</Text> },
  { title: "Updated", dataIndex: "updatedAt", key: "updatedAt", render: (value) => value ? new Date(value).toLocaleString() : "-" },
];

const InventoryPage = () => {
  const [threshold, setThreshold] = useState(5);
  const query = useLowStockProducts(threshold);
  const rows = query.data?.data || [];

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ color: "var(--adm-warn)", fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 7 }}>Inventory</div>
        <Title level={2} style={{ margin: 0, color: "var(--adm-text)" }}>Low Stock Watch</Title>
        <Text type="secondary">Products at or below the selected stock threshold.</Text>
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
          <Text type="secondary">Low stock threshold</Text>
          <InputNumber min={0} max={999} value={threshold} onChange={(value) => setThreshold(Number(value || 0))} />
        </div>
        <Table rowKey="_id" columns={columns} dataSource={rows} loading={query.isLoading} pagination={{ pageSize: 10 }} locale={{ emptyText: <Empty description="No low stock products." /> }} />
      </Card>
    </div>
  );
};

export default InventoryPage;

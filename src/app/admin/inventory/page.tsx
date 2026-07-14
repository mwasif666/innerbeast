"use client";

import { Card, Empty, Statistic, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useInventoryProducts } from "@/hooks/useInventory";
import type { InventoryProduct } from "@/services/inventory.service";

const { Title, Text } = Typography;

const statusTag = (status?: string) => {
  if (status === "out") return <Tag color="red">Out of stock</Tag>;
  if (status === "low") return <Tag color="gold">Low stock</Tag>;
  return <Tag color="green">In stock</Tag>;
};

const columns: ColumnsType<InventoryProduct> = [
  { title: "Product", dataIndex: "title", key: "title", render: (value, row) => <div><strong>{value || "Product"}</strong><br /><Text type="secondary">SKU: {row.sku || "-"}</Text></div> },
  { title: "Sold", dataIndex: "sold", key: "sold", width: 120, sorter: (a, b) => Number(a.sold || 0) - Number(b.sold || 0), render: (value) => <strong>{Number(value || 0)}</strong> },
  { title: "Remaining", dataIndex: "remaining", key: "remaining", width: 140, sorter: (a, b) => Number(a.remaining || 0) - Number(b.remaining || 0), render: (value) => <Tag color={Number(value || 0) <= 0 ? "red" : Number(value || 0) <= 5 ? "gold" : "green"}>{Number(value || 0)}</Tag> },
  { title: "Total", dataIndex: "totalHandled", key: "totalHandled", width: 120, render: (value) => Number(value || 0) },
  { title: "Status", dataIndex: "stockStatus", key: "stockStatus", width: 140, render: statusTag },
  { title: "Active", dataIndex: "isActive", key: "isActive", width: 110, render: (value) => <Tag color={value === false ? "default" : "blue"}>{value === false ? "Inactive" : "Active"}</Tag> },
  { title: "Updated", dataIndex: "updatedAt", key: "updatedAt", render: (value) => value ? new Date(value).toLocaleString() : "-" },
];

const InventoryPage = () => {
  const query = useInventoryProducts();
  const rows = query.data?.data || [];
  const totalSold = rows.reduce((sum, item) => sum + Number(item.sold || 0), 0);
  const totalRemaining = rows.reduce((sum, item) => sum + Number(item.remaining || 0), 0);
  const lowStock = rows.filter((item) => item.stockStatus === "low" || item.stockStatus === "out").length;

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ color: "var(--adm-warn)", fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 7 }}>Inventory</div>
        <Title level={2} style={{ margin: 0, color: "var(--adm-text)" }}>Inventory Overview</Title>
        <Text type="secondary">All products with sold quantity, remaining stock and stock status.</Text>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 18 }}>
        <Card><Statistic title="Products" value={rows.length} /></Card>
        <Card><Statistic title="Total Sold" value={totalSold} /></Card>
        <Card><Statistic title="Remaining Stock" value={totalRemaining} /></Card>
        <Card><Statistic title="Low / Out Stock" value={lowStock} /></Card>
      </div>

      <Card>
        <Table rowKey="_id" columns={columns} dataSource={rows} loading={query.isLoading} pagination={{ pageSize: 20 }} locale={{ emptyText: <Empty description="No products found." /> }} />
      </Card>
    </div>
  );
};

export default InventoryPage;

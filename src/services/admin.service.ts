import api from "./api";

export type AdminOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type AdminStatsTotals = {
  revenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  orders: number;
  customers: number;
  products: number;
  categories: number;
  lowStock: number;
};

export type AdminRecentOrder = {
  _id: string;
  orderNumber?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  orderStatus?: AdminOrderStatus | string;
  paymentStatus?: string;
  paymentMethod?: string;
  grandTotal?: number;
  totalItems?: number;
  createdAt?: string;
};

export type AdminLowStockProduct = {
  _id: string;
  title: string;
  slug?: string;
  sku?: string;
  stock?: number;
};

export type AdminStats = {
  totals: AdminStatsTotals;
  ordersByStatus: Record<string, number>;
  recentOrders: AdminRecentOrder[];
  lowStockProducts: AdminLowStockProduct[];
  meta?: {
    lowStockThreshold?: number;
    generatedAt?: string;
  };
};

export type AdminStatsResponse = {
  success: boolean;
  data: AdminStats;
};

export const getAdminStats = () => {
  return api<AdminStatsResponse>("/admin/stats");
};

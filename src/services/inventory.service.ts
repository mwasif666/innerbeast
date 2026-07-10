import api from "./api";

export type InventoryProduct = {
  _id: string;
  title?: string;
  slug?: string;
  sku?: string;
  stock?: number;
  remaining?: number;
  sold?: number;
  totalHandled?: number;
  stockStatus?: "out" | "low" | "ok" | string;
  isActive?: boolean;
  images?: Array<{ url?: string } | string>;
  updatedAt?: string;
};

export type LowStockProduct = InventoryProduct;

export type LowStockResponse = { success: boolean; count: number; threshold: number; data: LowStockProduct[] };
export type InventoryResponse = { success: boolean; count: number; data: InventoryProduct[] };

export const getLowStockProducts = async (threshold = 5) => api<LowStockResponse>(`/admin/low-stock?threshold=${threshold}`);
export const getInventoryProducts = async () => api<InventoryResponse>("/admin/inventory");

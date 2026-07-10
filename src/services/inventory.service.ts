import api from "./api";

export type LowStockProduct = {
  _id: string;
  title?: string;
  slug?: string;
  sku?: string;
  stock?: number;
  images?: Array<{ url?: string } | string>;
  updatedAt?: string;
};

export type LowStockResponse = {
  success: boolean;
  count: number;
  threshold: number;
  data: LowStockProduct[];
};

export const getLowStockProducts = async (threshold = 5) => {
  return api<LowStockResponse>(`/admin/low-stock?threshold=${threshold}`);
};

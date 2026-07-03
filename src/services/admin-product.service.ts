import api from "./api";

export type ProductImage = {
  url: string;
  publicId?: string;
  alt?: string;
};

export type ProductCategory = {
  _id: string;
  name: string;
  slug: string;
};

export type ProductColor = {
  name: string;
  hex?: string;
};

export type ProductVariant = {
  size: "XS" | "S" | "M" | "L" | "XL" | "XXL" | "XXXL";
  color: string;
  sku: string;
  stock: number;
  price?: number;
};

export type Product = {
  _id: string;
  title: string;
  slug: string;
  sku: string;
  description: string;
  category: ProductCategory;
  price: number;
  discountPrice?: number;
  stock: number;
  images: ProductImage[];
  sizes?: string[];
  colors?: ProductColor[];
  variants?: ProductVariant[];
  fitType?: "Oversized" | "Regular" | "Slim" | "Compression" | "Relaxed";
  gender?: "Men" | "Women" | "Unisex";
  material?: string;
  tags?: string[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductPayload = {
  title: string;
  slug?: string;
  sku: string;
  description: string;
  category: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: ProductImage[];
  sizes?: string[];
  colors?: ProductColor[];
  variants?: ProductVariant[];
  fitType?: string;
  gender?: string;
  material?: string;
  tags?: string[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isActive?: boolean;
};

export type ProductsResponse = {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: Product[];
};

export type ProductResponse = {
  success: boolean;
  message?: string;
  data: Product;
};

const buildQuery = (
  params: Record<string, string | number | boolean | undefined> = {},
) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });

  const queryString = query.toString();

  return queryString ? `?${queryString}` : "";
};

export const getAdminProducts = async (
  filters: Record<string, string | number | boolean | undefined> = {},
) => {
  return await api<ProductsResponse>(
    `/products${buildQuery({
      limit: 100,
      sort: "newest",
      ...filters,
    })}`,
  );
};

export const createProduct = async (payload: ProductPayload) => {
  return await api<ProductResponse>("/products", {
    method: "POST",
    body: payload,
  });
};

export const updateProduct = async (id: string, payload: ProductPayload) => {
  return await api<ProductResponse>(`/products/${id}`, {
    method: "PATCH",
    body: payload,
  });
};

export const deleteProduct = async (id: string) => {
  return await api<{ success: boolean; message?: string }>(`/products/${id}`, {
    method: "DELETE",
  });
};

import api from "./api";
import { ProductType } from "@/type/ProductType";

export type AppliedCoupon = {
  code: string;
  discountAmount: number;
  subtotal?: number;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  type?: "percentage" | "fixed";
  value?: number;
};

export type CartApiItem = {
  product: ProductType & { _id?: string };
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  price?: number;
  lineTotal?: number;
  addedAt?: string;
};

export type CartData = {
  _id?: string;
  items: CartApiItem[];
  count?: number;
  totalItems?: number;
  subtotal?: number;
  discountTotal?: number;
  appliedCoupon?: AppliedCoupon | null;
  couponError?: string;
  grandTotal?: number;
};

export type CartResponse = {
  success: boolean;
  message?: string;
  data: CartData;
};

export type CartSyncItem = {
  id?: string;
  product?: string;
  productId?: string;
  _id?: string;
  quantity?: number;
  quantityPurchase?: number;
  selectedSize?: string;
  selectedColor?: string;
  size?: string;
  color?: string | { name?: string };
};

export const getRemoteCart = () => api<CartResponse>("/cart");

export const syncRemoteCart = (payload: {
  items: CartSyncItem[];
  couponCode?: string;
}) =>
  api<CartResponse>("/cart/sync", {
    method: "PUT",
    body: payload,
  });

export const addRemoteCartItem = (payload: {
  productId: string;
  quantity?: number;
  selectedSize?: string;
  selectedColor?: string;
}) =>
  api<CartResponse>("/cart/items", {
    method: "POST",
    body: payload,
  });

export const updateRemoteCartItem = (
  productId: string,
  payload: {
    quantity?: number;
    selectedSize?: string;
    selectedColor?: string;
  },
) =>
  api<CartResponse>(`/cart/items/${productId}`, {
    method: "PATCH",
    body: payload,
  });

export const removeRemoteCartItem = (productId: string) =>
  api<CartResponse>(`/cart/items/${productId}`, {
    method: "DELETE",
  });

export const clearRemoteCart = () =>
  api<CartResponse>("/cart", {
    method: "DELETE",
  });

export const applyRemoteCartCoupon = (code: string) =>
  api<CartResponse>("/cart/coupon", {
    method: "POST",
    body: { code },
  });

export const removeRemoteCartCoupon = () =>
  api<CartResponse>("/cart/coupon", {
    method: "DELETE",
  });

export const mapRemoteCartItems = (response?: CartResponse): ProductType[] => {
  const items = response?.data?.items || [];

  return items
    .filter((item) => item.product)
    .map((item) => ({
      ...item.product,
      id: item.product.id || item.product._id || "",
      quantity: item.quantity,
      quantityPurchase: item.quantity,
      selectedSize: item.selectedSize || "",
      selectedColor: item.selectedColor || "",
    })) as ProductType[];
};

export const getRemoteAppliedCoupon = (
  response?: CartResponse,
): AppliedCoupon | null => {
  const coupon = response?.data?.appliedCoupon;

  if (!coupon?.code) return null;

  return {
    code: coupon.code,
    discountAmount: Number(coupon.discountAmount || 0),
    subtotal: response?.data?.subtotal || 0,
    discountType: coupon.discountType || coupon.type,
    discountValue: Number(coupon.discountValue ?? coupon.value ?? 0),
    type: coupon.type,
    value: coupon.value,
  };
};

import api from "./api";

export type CouponDiscountType = "percentage" | "fixed";

export type Coupon = {
  _id: string;
  code: string;
  description?: string;
  discountType?: CouponDiscountType;
  type?: CouponDiscountType;
  value?: number;
  discountValue?: number;
  minOrderAmount?: number;
  minimumOrderAmount?: number;
  maxDiscountAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  usedCount?: number;
  expiresAt?: string;
  expiryDate?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CouponPayload = {
  code: string;
  description?: string;
  discountType: CouponDiscountType;
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  expiresAt?: string;
  isActive: boolean;
};

export type CouponsResponse = {
  success: boolean;
  count?: number;
  data: Coupon[] | { coupons?: Coupon[]; count?: number };
};

export type CouponResponse = {
  success: boolean;
  message?: string;
  data: Coupon;
};

export type ApplyCouponPayload = {
  code: string;
  items: Array<{ product: string; productId: string; id: string; quantity: number }>;
};

export type ApplyCouponResponse = {
  success: boolean;
  message?: string;
  discountAmount?: number;
  discount?: number;
  finalTotal?: number;
  data?: {
    code?: string;
    coupon?: Coupon;
    discountAmount?: number;
    discount?: number;
    finalTotal?: number;
    total?: number;
  };
};

const toApiPayload = (payload: CouponPayload) => ({
  ...payload,
  code: payload.code.trim().toUpperCase(),
  type: payload.discountType,
  discountValue: payload.value,
  minimumOrderAmount: payload.minOrderAmount,
  maximumDiscountAmount: payload.maxDiscountAmount,
  expiryDate: payload.expiresAt,
});

export const extractCoupons = (response?: CouponsResponse) => {
  if (!response) return [];
  return Array.isArray(response.data) ? response.data : response.data?.coupons || [];
};

export const getCouponType = (coupon: Coupon): CouponDiscountType =>
  coupon.discountType || coupon.type || "percentage";

export const getCouponValue = (coupon: Coupon) =>
  Number(coupon.value ?? coupon.discountValue ?? 0);

export const getCouponMinimum = (coupon: Coupon) =>
  Number(coupon.minOrderAmount ?? coupon.minimumOrderAmount ?? 0);

export const getCouponMaximum = (coupon: Coupon) =>
  Number(coupon.maxDiscountAmount ?? coupon.maximumDiscountAmount ?? 0);

export const getCouponExpiry = (coupon: Coupon) =>
  coupon.expiresAt || coupon.expiryDate || "";

export const getAppliedDiscount = (response: ApplyCouponResponse) =>
  Math.max(
    0,
    Number(
      response.data?.discountAmount ??
        response.data?.discount ??
        response.discountAmount ??
        response.discount ??
        0,
    ),
  );

export const applyCoupon = (payload: ApplyCouponPayload) =>
  api<ApplyCouponResponse>("/coupons/apply", {
    method: "POST",
    body: { ...payload, code: payload.code.trim().toUpperCase() },
  });

export const getCoupons = () => api<CouponsResponse>("/coupons");

export const getCoupon = (id: string) => api<CouponResponse>(`/coupons/${id}`);

export const createCoupon = (payload: CouponPayload) =>
  api<CouponResponse>("/coupons", { method: "POST", body: toApiPayload(payload) });

export const updateCoupon = (id: string, payload: CouponPayload) =>
  api<CouponResponse>(`/coupons/${id}`, {
    method: "PATCH",
    body: toApiPayload(payload),
  });

export const deleteCoupon = (id: string) =>
  api<{ success: boolean; message?: string }>(`/coupons/${id}`, {
    method: "DELETE",
  });

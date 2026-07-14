import api from "./api";

export type ShippingRule = {
  _id: string;
  name: string;
  country?: string;
  city?: string;
  rate: number;
  freeShippingThreshold?: number;
  isDefault?: boolean;
  isActive?: boolean;
  priority?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ShippingRulePayload = {
  name: string;
  country?: string;
  city?: string;
  rate: number;
  freeShippingThreshold?: number;
  isDefault?: boolean;
  isActive?: boolean;
  priority?: number;
  notes?: string;
};

export type ShippingRulesResponse = {
  success: boolean;
  count?: number;
  data: ShippingRule[];
};

export type ShippingRuleResponse = {
  success: boolean;
  message?: string;
  data: ShippingRule;
};

export type CalculateShippingPayload = {
  country: string;
  city: string;
  subtotal: number;
};

export type ShippingQuote = {
  country?: string;
  city?: string;
  subtotal?: number;
  shippingFee: number;
  freeShippingApplied?: boolean;
  matchedBy?: "city" | "country" | "default" | "fallback" | string;
  rule?: ShippingRule | null;
};

export type CalculateShippingResponse = {
  success: boolean;
  message?: string;
  data: ShippingQuote;
};

export const getShippingRules = (params?: {
  search?: string;
  status?: "all" | "active" | "inactive";
  country?: string;
}) => {
  const query = new URLSearchParams();

  if (params?.search) query.set("search", params.search);
  if (params?.status && params.status !== "all")
    query.set("status", params.status);
  if (params?.country) query.set("country", params.country);

  const queryString = query.toString();

  return api<ShippingRulesResponse>(
    `/shipping/rules${queryString ? `?${queryString}` : ""}`,
  );
};

export const createShippingRule = (payload: ShippingRulePayload) =>
  api<ShippingRuleResponse>("/shipping/rules", {
    method: "POST",
    body: payload,
  });

export const updateShippingRule = (id: string, payload: ShippingRulePayload) =>
  api<ShippingRuleResponse>(`/shipping/rules/${id}`, {
    method: "PATCH",
    body: payload,
  });

export const deleteShippingRule = (id: string) =>
  api<{ success: boolean; message?: string }>(`/shipping/rules/${id}`, {
    method: "DELETE",
  });

export const calculateShipping = (payload: CalculateShippingPayload) =>
  api<CalculateShippingResponse>("/shipping/calculate", {
    method: "POST",
    body: payload,
  });

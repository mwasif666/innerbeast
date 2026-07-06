import api from "./api";

export type OrderItemPayload = {
  id: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
};

export type CheckoutAddress = {
  fullName: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

export type CreateOrderPayload = {
  items: OrderItemPayload[];
  shippingAddress: CheckoutAddress;
  billingAddress?: CheckoutAddress;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  paymentMethod?: "COD" | "CARD" | "BANK_TRANSFER" | "ONLINE";
  couponCode?: string;
  notes?: string;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned"
  | string;

export type OrderProduct = {
  _id?: string;
  title?: string;
  name?: string;
  images?: Array<{ url?: string } | string>;
};

export type OrderItem = {
  product?: string | OrderProduct;
  title?: string;
  name?: string;
  slug?: string;
  sku?: string;
  image?: { url?: string; publicId?: string; alt?: string } | string;
  quantity: number;
  price?: number;
  originalPrice?: number;
  lineTotal?: number;
  selectedSize?: string;
  selectedColor?: string | { name?: string; hex?: string };
  size?: string;
  color?: string | { name?: string; hex?: string };
};

export type Order = {
  _id: string;
  orderNumber?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  user?: { _id?: string; name?: string; email?: string } | string;
  items: OrderItem[];
  shippingAddress?: CheckoutAddress;
  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus?: OrderStatus;
  status?: OrderStatus;
  subtotal?: number;
  discount?: number;
  discountTotal?: number;
  coupon?: {
    code?: string;
    discountAmount?: number;
  };
  couponCode?: string;
  appliedCoupon?: {
    code?: string;
    discountAmount?: number;
  };
  shippingFee?: number;
  shipping?: number;
  taxTotal?: number;
  grandTotal?: number;
  total?: number;
  totalAmount?: number;
  totalItems?: number;
  notes?: string;
  adminNotes?: string;
  cancellationReason?: string;
  cancelReason?: string;
  placedAt?: string;
  confirmedAt?: string;
  processingAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  returnedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type OrderResponse = {
  success: boolean;
  message?: string;
  data: Order;
};

export type OrdersResponse = {
  success: boolean;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
  data: Order[] | { orders?: Order[]; count?: number; total?: number };
};

export type UpdateOrderPayload = {
  orderStatus?: OrderStatus;
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
  adminNotes?: string;
};

export type TrackOrderPayload = {
  orderNumber: string;
  email?: string;
  phone?: string;
};

export type CancelOrderPayload = {
  reason: string;
};

export const createOrder = async (payload: CreateOrderPayload) => {
  return api<OrderResponse>("/orders", {
    method: "POST",
    body: payload,
  });
};

export const trackOrder = async (payload: TrackOrderPayload) => {
  try {
    return await api<OrderResponse>("/orders/track", {
      method: "POST",
      body: payload,
    });
  } catch (trackError) {
    try {
      const myOrders = await api<OrdersResponse>("/orders/my");
      const normalizedOrderNumber = payload.orderNumber.toLowerCase();
      const order = extractOrders(myOrders).find(
        (item) => item.orderNumber?.toLowerCase() === normalizedOrderNumber,
      );

      if (order) {
        return {
          success: true,
          data: order,
        };
      }
    } catch {
      // Preserve the public tracking error for guests and unrelated orders.
    }

    throw trackError;
  }
};

export const cancelOrder = async (
  id: string,
  payload: CancelOrderPayload,
) => {
  return api<OrderResponse>(`/orders/${id}/cancel`, {
    method: "PATCH",
    body: payload,
  });
};

export const getMyOrders = async () => {
  return api<OrdersResponse>("/orders/my");
};

export const getAdminOrders = async () => {
  return api<OrdersResponse>("/orders?limit=100");
};

export const getOrderById = async (id: string) => {
  return api<OrderResponse>(`/orders/${id}`);
};

export const updateOrderStatus = async (
  id: string,
  payload: UpdateOrderPayload,
) => {
  return api<OrderResponse>(`/orders/${id}/status`, {
    method: "PATCH",
    body: payload,
  });
};

export const extractOrders = (response?: OrdersResponse): Order[] => {
  if (!response) return [];
  if (Array.isArray(response.data)) return response.data;

  return response.data?.orders || [];
};

export const getOrdersCount = (response?: OrdersResponse) => {
  if (!response) return 0;
  if (typeof response.count === "number") return response.count;
  if (typeof response.total === "number") return response.total;

  if (!Array.isArray(response.data)) {
    if (typeof response.data?.count === "number") return response.data.count;
    if (typeof response.data?.total === "number") return response.data.total;
  }

  return extractOrders(response).length;
};

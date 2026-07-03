"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOrder,
  getAdminOrders,
  getOrderById,
  getMyOrders,
  updateOrderStatus,
  CreateOrderPayload,
  UpdateOrderPayload,
} from "@/services/order.service";

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useMyOrders = () =>
  useQuery({
    queryKey: ["orders", "mine"],
    queryFn: getMyOrders,
    retry: false,
  });

export const useAdminOrders = () =>
  useQuery({
    queryKey: ["orders", "admin"],
    queryFn: getAdminOrders,
    retry: false,
  });

export const useAdminOrder = (id: string) =>
  useQuery({
    queryKey: ["orders", "admin", id],
    queryFn: () => getOrderById(id),
    enabled: Boolean(id),
    retry: false,
  });

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOrderPayload }) =>
      updateOrderStatus(id, payload),
    onSuccess: (response) => {
      queryClient.setQueryData(
        ["orders", "admin", response.data._id],
        response,
      );
      queryClient.invalidateQueries({ queryKey: ["orders", "admin"] });
    },
  });
};

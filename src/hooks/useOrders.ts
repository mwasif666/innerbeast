"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelOrder,
  createOrder,
  getAdminOrders,
  getOrderById,
  getMyOrders,
  trackOrder,
  updateOrderStatus,
  CancelOrderPayload,
  CreateOrderPayload,
  TrackOrderPayload,
  UpdateOrderPayload,
} from "@/services/order.service";

const refreshOrderData = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["orders"] });
  queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
  queryClient.invalidateQueries({ queryKey: ["products"] });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: () => refreshOrderData(queryClient),
  });
};

export const useTrackOrder = () => {
  return useMutation({
    mutationFn: (payload: TrackOrderPayload) => trackOrder(payload),
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CancelOrderPayload }) =>
      cancelOrder(id, payload),
    onSuccess: () => refreshOrderData(queryClient),
  });
};

export const useMyOrders = (enabled = true) => {
  return useQuery({
    queryKey: ["orders", "mine"],
    queryFn: getMyOrders,
    retry: false,
    enabled,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useAdminOrders = () => {
  return useQuery({
    queryKey: ["orders", "admin"],
    queryFn: getAdminOrders,
    retry: false,
    staleTime: 20 * 1000,
    refetchInterval: 30 * 1000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useAdminOrder = (id: string) => {
  return useQuery({
    queryKey: ["orders", "admin", id],
    queryFn: () => getOrderById(id),
    enabled: Boolean(id),
    retry: false,
    staleTime: 20 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOrderPayload }) =>
      updateOrderStatus(id, payload),
    onSuccess: (response) => {
      queryClient.setQueryData(["orders", "admin", response.data._id], response);
      refreshOrderData(queryClient);
    },
  });
};

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteCustomer,
  getCustomers,
  updateCustomerRole,
  updateCustomerStatus,
} from "@/services/user.service";

export const useCustomers = () => {
  return useQuery({
    queryKey: ["users", "customers"],
    queryFn: getCustomers,
    retry: false,
  });
};

export const useUpdateCustomerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateCustomerStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users", "customers"],
      });
    },
  });
};

export const useUpdateCustomerRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: "user" | "admin" }) =>
      updateCustomerRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users", "customers"],
      });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users", "customers"],
      });
    },
  });
};

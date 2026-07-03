"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ProductPayload,
  createProduct,
  deleteProduct,
  getAdminProducts,
  updateProduct,
} from "@/services/admin-product.service";

export const useAdminProducts = (
  filters: Record<string, string | number | boolean | undefined> = {},
) => {
  return useQuery({
    queryKey: ["admin-products", filters],
    queryFn: () => getAdminProducts(filters),
    retry: false,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductPayload) => createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-products"],
      });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductPayload }) =>
      updateProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-products"],
      });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-products"],
      });
    },
  });
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  calculateShipping,
  createShippingRule,
  deleteShippingRule,
  getShippingRules,
  ShippingRulePayload,
  updateShippingRule,
} from "@/services/shipping.service";

export const shippingKeys = {
  all: ["shipping"] as const,
  rules: (params?: unknown) => [...shippingKeys.all, "rules", params] as const,
};

export const useShippingRules = (params?: {
  search?: string;
  status?: "all" | "active" | "inactive";
  country?: string;
}) =>
  useQuery({
    queryKey: shippingKeys.rules(params),
    queryFn: () => getShippingRules(params),
  });

export const useCreateShippingRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createShippingRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shippingKeys.all });
    },
  });
};

export const useUpdateShippingRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ShippingRulePayload;
    }) => updateShippingRule(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shippingKeys.all });
    },
  });
};

export const useDeleteShippingRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteShippingRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shippingKeys.all });
    },
  });
};

export const useCalculateShipping = () =>
  useMutation({
    mutationFn: calculateShipping,
  });

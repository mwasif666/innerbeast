"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  applyCoupon,
  ApplyCouponPayload,
  createCoupon,
  CouponPayload,
  deleteCoupon,
  getCoupons,
  updateCoupon,
} from "@/services/coupon.service";

export const useApplyCoupon = () =>
  useMutation({ mutationFn: (payload: ApplyCouponPayload) => applyCoupon(payload) });

export const useCoupons = () =>
  useQuery({ queryKey: ["coupons"], queryFn: getCoupons, retry: false });

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CouponPayload) => createCoupon(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["coupons"] }),
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CouponPayload }) =>
      updateCoupon(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["coupons"] }),
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCoupon(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["coupons"] }),
  });
};

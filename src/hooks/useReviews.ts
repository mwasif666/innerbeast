"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createProductReview,
  deleteAdminReview,
  getAdminReviews,
  getProductReviews,
  getReviewEligibility,
  getReviewSettings,
  updateAdminReview,
  updateReviewSettings,
  ReviewSettings,
  ReviewStatus,
} from "@/services/review.service";

export const useProductReviews = (productId?: string) => {
  return useQuery({
    queryKey: ["reviews", "product", productId],
    queryFn: () => getProductReviews(productId || ""),
    enabled: Boolean(productId),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
  });
};

export const useReviewEligibility = (productId?: string, enabled = true) => {
  return useQuery({
    queryKey: ["reviews", "eligibility", productId],
    queryFn: () => getReviewEligibility(productId || ""),
    enabled: Boolean(productId) && enabled,
    retry: false,
    staleTime: 60 * 1000,
  });
};

export const useCreateProductReview = (productId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { rating: number; title?: string; comment: string }) =>
      createProductReview(productId || "", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useAdminReviews = (status = "all") => {
  return useQuery({
    queryKey: ["reviews", "admin", status],
    queryFn: () => getAdminReviews(status),
    placeholderData: (previousData) => previousData,
    staleTime: 20 * 1000,
    refetchInterval: 30 * 1000,
  });
};

export const useUpdateAdminReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { status?: ReviewStatus; rating?: number; title?: string; comment?: string };
    }) => updateAdminReview(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
};

export const useDeleteAdminReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
};

export const useReviewSettings = () => {
  return useQuery({
    queryKey: ["reviews", "settings"],
    queryFn: getReviewSettings,
    staleTime: 60 * 1000,
  });
};

export const useUpdateReviewSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReviewSettings) => updateReviewSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", "settings"] });
    },
  });
};

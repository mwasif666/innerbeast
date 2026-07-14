import api from './api'

export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export type ProductReview = {
  _id: string
  product: string | { _id: string; title?: string; slug?: string; sku?: string }
  user: string | { _id: string; name?: string; email?: string }
  order?: string
  customerName?: string
  rating: number
  title?: string
  comment: string
  status: ReviewStatus
  isVerifiedPurchase?: boolean
  createdAt?: string
  updatedAt?: string
}

export type ReviewSettings = {
  requireApproval: boolean
}

type ListResponse<T> = { success: boolean; count?: number; data: T[] }
type OneResponse<T> = { success: boolean; message?: string; data: T }

export type ReviewEligibility = {
  eligible: boolean
  hasDeliveredOrder: boolean
  alreadyReviewed: boolean
  status?: ReviewStatus | null
  review?: ProductReview | null
}

export const getProductReviews = async (productId: string) => {
  return (await api(`/reviews/product/${productId}`)) as ListResponse<ProductReview>
}

export const getReviewEligibility = async (productId: string) => {
  return (await api(`/reviews/product/${productId}/eligibility`)) as OneResponse<ReviewEligibility>
}

export const createProductReview = async (
  productId: string,
  payload: { rating: number; title?: string; comment: string },
) => {
  return (await api(`/reviews/product/${productId}`, {
    method: 'POST',
    body: payload,
  })) as OneResponse<ProductReview>
}

export const getAdminReviews = async (status = 'all') => {
  return (await api(`/reviews/admin?status=${encodeURIComponent(status)}`)) as ListResponse<ProductReview>
}

export const updateAdminReview = async (
  id: string,
  payload: { status?: ReviewStatus; rating?: number; title?: string; comment?: string },
) => {
  return (await api(`/reviews/admin/${id}`, {
    method: 'PATCH',
    body: payload,
  })) as OneResponse<ProductReview>
}

export const deleteAdminReview = async (id: string) => {
  return (await api(`/reviews/admin/${id}`, { method: 'DELETE' })) as { success: boolean; message?: string }
}

export const getReviewSettings = async () => {
  return (await api('/reviews/admin/settings')) as OneResponse<ReviewSettings>
}

export const updateReviewSettings = async (payload: ReviewSettings) => {
  return (await api('/reviews/admin/settings', {
    method: 'PATCH',
    body: payload,
  })) as OneResponse<ReviewSettings>
}

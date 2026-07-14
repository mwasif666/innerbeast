import api from "./api";

export type NewsPost = {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  body: string;
  imageUrl?: string;
  imagePublicId?: string;
  authorName?: string;
  isPublished?: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type NewsPostPayload = {
  title: string;
  slug?: string;
  summary?: string;
  body: string;
  imageUrl?: string;
  imagePublicId?: string;
  authorName?: string;
  isPublished?: boolean;
  publishedAt?: string;
};

export const getNewsPosts = () => api<{ success: boolean; count?: number; data: NewsPost[] }>("/articles");
export const getNewsPost = (slug: string) => api<{ success: boolean; data: NewsPost }>(`/articles/${slug}`);
export const getAdminNewsPosts = () => api<{ success: boolean; count?: number; data: NewsPost[] }>("/articles/admin/all");
export const createNewsPost = (payload: NewsPostPayload) => api<{ success: boolean; data: NewsPost; message?: string }>("/articles/admin", { method: "POST", body: payload });
export const updateNewsPost = (id: string, payload: NewsPostPayload) => api<{ success: boolean; data: NewsPost; message?: string }>(`/articles/admin/${id}`, { method: "PATCH", body: payload });
export const deleteNewsPost = (id: string) => api<{ success: boolean; message?: string }>(`/articles/admin/${id}`, { method: "DELETE" });

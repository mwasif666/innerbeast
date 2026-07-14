import api from "./api";

export type CategoryImage = {
  url?: string;
  publicId?: string;
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: CategoryImage;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CategoryPayload = {
  name: string;
  slug?: string;
  description?: string;
  image?: CategoryImage;
  isActive?: boolean;
  sortOrder?: number;
};

export type CategoriesResponse = {
  success: boolean;
  count: number;
  data: Category[];
};

export type CategoryResponse = {
  success: boolean;
  message?: string;
  data: Category;
};

export const getCategories = async () => {
  return await api<CategoriesResponse>("/categories");
};

export const createCategory = async (payload: CategoryPayload) => {
  return await api<CategoryResponse>("/categories", {
    method: "POST",
    body: payload,
  });
};

export const updateCategory = async (id: string, payload: CategoryPayload) => {
  return await api<CategoryResponse>(`/categories/${id}`, {
    method: "PATCH",
    body: payload,
  });
};

export const deleteCategory = async (id: string) => {
  return await api<{ success: boolean; message?: string }>(
    `/categories/${id}`,
    {
      method: "DELETE",
    },
  );
};

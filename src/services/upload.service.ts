import api from "./api";

export type UploadedImage = {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
};

export type UploadImageResponse = {
  success: boolean;
  message?: string;
  data: UploadedImage;
};

export type UploadImagesResponse = {
  success: boolean;
  message?: string;
  count: number;
  data: UploadedImage[];
};

export const uploadSingleImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  return await api<UploadImageResponse>("/uploads/product", {
    method: "POST",
    body: formData,
  });
};

export const uploadMultipleImages = async (files: File[]) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("images", file);
  });

  return await api<UploadImagesResponse>("/uploads/products", {
    method: "POST",
    body: formData,
  });
};

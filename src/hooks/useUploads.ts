"use client";

import { useMutation } from "@tanstack/react-query";

import {
  uploadMultipleImages,
  uploadSingleImage,
} from "@/services/upload.service";

export const useUploadSingleImage = () => {
  return useMutation({
    mutationFn: (file: File) => uploadSingleImage(file),
  });
};

export const useUploadMultipleImages = () => {
  return useMutation({
    mutationFn: (files: File[]) => uploadMultipleImages(files),
  });
};

"use client";

import { useMutation } from "@tanstack/react-query";
import { uploadSingleImage } from "@/services/upload.service";

export const useUploadSingleImage = () => {
  return useMutation({
    mutationFn: (file: File) => uploadSingleImage(file),
  });
};

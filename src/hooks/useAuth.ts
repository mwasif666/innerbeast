"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminCheck,
  getMe,
  loginUser,
  logoutUser,
  registerUser,
  updateMe,
  changePassword,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "../services/auth.service";

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    retry: false,
  });
};

export const useAdminCheck = () => {
  return useQuery({
    queryKey: ["auth", "admin-check"],
    queryFn: adminCheck,
    retry: false,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["auth", "me"],
      });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["auth", "me"],
      });
    },
  });
};

export const useUpdateMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateMe(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["auth", "me"],
      });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPassword(payload),
  });
};

export const useVerifyResetToken = (token: string, enabled = true) => {
  return useQuery({
    queryKey: ["auth", "reset-token", token],
    queryFn: () => verifyResetToken(token),
    enabled: Boolean(token) && enabled,
    retry: false,
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({
      token,
      payload,
    }: {
      token: string;
      payload: ResetPasswordPayload;
    }) => resetPassword(token, payload),
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.invalidateQueries({
        queryKey: ["auth", "me"],
      });
    },
  });
};

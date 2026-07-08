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
  User,
  UpdateProfilePayload,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "../services/auth.service";

const authQueryOptions = {
  staleTime: 0,
  retry: false,
  refetchOnMount: "always" as const,
  refetchOnWindowFocus: "always" as const,
  refetchOnReconnect: "always" as const,
};

const getAuthUser = (response: { data?: User | null; user?: User }) =>
  response.data || response.user || null;

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    ...authQueryOptions,
  });
};

export const useAdminCheck = () => {
  return useQuery({
    queryKey: ["auth", "admin-check"],
    queryFn: adminCheck,
    ...authQueryOptions,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginUser(payload),
    onSuccess: async (response) => {
      const user = getAuthUser(response);

      if (user) {
        queryClient.setQueryData(["auth", "me"], {
          success: true,
          data: user,
        });
      }

      await queryClient.invalidateQueries({
        queryKey: ["auth"],
      });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerUser(payload),
    onSuccess: async (response) => {
      const user = getAuthUser(response);

      if (user) {
        queryClient.setQueryData(["auth", "me"], {
          success: true,
          data: user,
        });
      }

      await queryClient.invalidateQueries({
        queryKey: ["auth"],
      });
    },
  });
};

export const useUpdateMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateMe(payload),
    onSuccess: async (response) => {
      const user = getAuthUser(response);

      if (user) {
        queryClient.setQueryData(["auth", "me"], {
          success: true,
          data: user,
        });
      }

      await queryClient.invalidateQueries({
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
      queryClient.removeQueries({
        queryKey: ["auth", "admin-check"],
      });
    },
  });
};

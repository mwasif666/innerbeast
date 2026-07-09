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
import { clearAuthSession, saveAuthSession } from "../services/auth-storage";

const AUTH_QUERY_STALE_TIME = 5 * 60 * 1000;

const authQueryOptions = {
  staleTime: AUTH_QUERY_STALE_TIME,
  gcTime: 30 * 60 * 1000,
  retry: false,
  refetchOnMount: true,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
};

const getAuthUser = (response: { data?: User | null; user?: User }) =>
  response.data || response.user || null;

const cacheAuthUser = (
  queryClient: ReturnType<typeof useQueryClient>,
  user: User,
) => {
  queryClient.setQueryData(["auth", "me"], {
    success: true,
    data: user,
  });

  if (user.role === "admin" || user.role === "superAdmin") {
    queryClient.setQueryData(["auth", "admin-check"], {
      success: true,
      data: user,
      user,
    });
  } else {
    queryClient.removeQueries({
      queryKey: ["auth", "admin-check"],
    });
  }
};

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
    onSuccess: (response) => {
      const user = getAuthUser(response);

      if (user) {
        saveAuthSession(response.token, user);
        cacheAuthUser(queryClient, user);
      }
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerUser(payload),
    onSuccess: (response) => {
      const user = getAuthUser(response);

      if (user) {
        saveAuthSession(response.token, user);
        cacheAuthUser(queryClient, user);
      }
    },
  });
};

export const useUpdateMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateMe(payload),
    onSuccess: (response) => {
      const user = getAuthUser(response);

      if (user) {
        saveAuthSession(response.token, user);
        cacheAuthUser(queryClient, user);
      }
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
    refetchOnWindowFocus: false,
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
      clearAuthSession();
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.removeQueries({
        queryKey: ["auth", "admin-check"],
      });
    },
  });
};

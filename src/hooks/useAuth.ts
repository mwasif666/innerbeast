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

const AUTH_QUERY_STALE_TIME = 5 * 60 * 1000;
const AUTH_TOKEN_KEY = "innerbeast-auth-token";

const saveAuthToken = (token?: string) => {
  if (typeof window === "undefined" || !token) return;

  try {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    // Storage can be unavailable in private/restricted browser modes.
  }
};

const clearAuthToken = () => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // Storage can be unavailable in private/restricted browser modes.
  }
};

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
      saveAuthToken(response.token);
      const user = getAuthUser(response);

      if (user) {
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
      }
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerUser(payload),
    onSuccess: (response) => {
      saveAuthToken(response.token);
      const user = getAuthUser(response);

      if (user) {
        queryClient.setQueryData(["auth", "me"], {
          success: true,
          data: user,
        });
        queryClient.removeQueries({
          queryKey: ["auth", "admin-check"],
        });
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
        queryClient.setQueryData(["auth", "me"], {
          success: true,
          data: user,
        });
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
      clearAuthToken();
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.removeQueries({
        queryKey: ["auth", "admin-check"],
      });
    },
  });
};

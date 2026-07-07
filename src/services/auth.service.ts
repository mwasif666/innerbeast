import api from "./api";

export type UserRole = "user" | "admin" | "superAdmin";

export type UserAddress = {
  _id?: string;
  label?: string;
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
};

export type User = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive?: boolean;
  addresses?: UserAddress[];
  createdAt?: string;
  updatedAt?: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type UpdateProfilePayload = {
  name?: string;
  email?: string;
  phone?: string;
  addresses?: UserAddress[];
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ForgotPasswordResponse = {
  success: boolean;
  message?: string;
  emailSkipped?: boolean;
  devResetToken?: string;
};

export type ResetPasswordPayload = {
  password: string;
  confirmPassword: string;
};

export type AuthResponse = {
  success: boolean;
  message?: string;
  data?: User;
  user?: User;
};

export type MeResponse = {
  success: boolean;
  data: User | null;
};

export type BasicResponse = {
  success: boolean;
  message?: string;
};

export const registerUser = async (payload: RegisterPayload) => {
  return await api<AuthResponse>("/auth/register", {
    method: "POST",
    body: payload,
  });
};

export const loginUser = async (payload: LoginPayload) => {
  return await api<AuthResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
};

export const logoutUser = async () => {
  return await api<BasicResponse>("/auth/logout", {
    method: "POST",
  });
};

export const getMe = async () => {
  return await api<MeResponse>("/auth/me");
};

export const updateMe = async (payload: UpdateProfilePayload) => {
  return await api<AuthResponse>("/auth/me", {
    method: "PATCH",
    body: payload,
  });
};

export const changePassword = async (payload: ChangePasswordPayload) => {
  return await api<BasicResponse>("/auth/change-password", {
    method: "PATCH",
    body: payload,
  });
};

export const forgotPassword = async (payload: ForgotPasswordPayload) => {
  return await api<ForgotPasswordResponse>("/auth/forgot-password", {
    method: "POST",
    body: payload,
  });
};

export const verifyResetToken = async (token: string) => {
  return await api<BasicResponse>(
    `/auth/reset-password/${encodeURIComponent(token)}`,
  );
};

export const resetPassword = async (
  token: string,
  payload: ResetPasswordPayload,
) => {
  return await api<BasicResponse>(
    `/auth/reset-password/${encodeURIComponent(token)}`,
    {
      method: "POST",
      body: payload,
    },
  );
};

export const adminCheck = async () => {
  return await api<AuthResponse>("/auth/admin-check");
};

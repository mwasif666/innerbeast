import api from "./api";
import {
  clearAuthSession,
  getStoredAuthUser,
  isStoredAuthTokenValid,
} from "./auth-storage";

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

export type UserAvatar = { url?: string; publicId?: string };

export type User = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: UserAvatar;
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
  avatar?: UserAvatar;
};

export type LoginPayload = { email: string; password: string };

export type UpdateProfilePayload = {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: UserAvatar;
  addresses?: UserAddress[];
};

export type ChangePasswordPayload = { currentPassword: string; newPassword: string };
export type ForgotPasswordPayload = { email: string };
export type ForgotPasswordResponse = { success: boolean; message?: string; emailSkipped?: boolean; devResetToken?: string };
export type ResetPasswordPayload = { password: string; confirmPassword: string };
export type AuthResponse = { success: boolean; message?: string; data?: User; user?: User; token?: string };
export type MeResponse = { success: boolean; data: User | null };
export type BasicResponse = { success: boolean; message?: string };

const storedMeResponse = (): MeResponse | null => {
  if (!isStoredAuthTokenValid()) {
    clearAuthSession();
    return null;
  }
  const storedUser = getStoredAuthUser();
  return storedUser ? { success: true, data: storedUser } : null;
};

export const registerUser = async (payload: RegisterPayload) => await api<AuthResponse>("/auth/register", { method: "POST", body: payload });
export const loginUser = async (payload: LoginPayload) => await api<AuthResponse>("/auth/login", { method: "POST", body: payload });
export const logoutUser = async () => await api<BasicResponse>("/auth/logout", { method: "POST" });

export const getMe = async () => {
  try {
    const response = await api<MeResponse>("/auth/me");
    if (response.data) return response;
    return storedMeResponse() || response;
  } catch (error) {
    const storedResponse = storedMeResponse();
    if (storedResponse) return storedResponse;
    throw error;
  }
};

export const updateMe = async (payload: UpdateProfilePayload) => await api<AuthResponse>("/auth/me", { method: "PATCH", body: payload });
export const changePassword = async (payload: ChangePasswordPayload) => await api<BasicResponse>("/auth/change-password", { method: "PATCH", body: payload });
export const forgotPassword = async (payload: ForgotPasswordPayload) => await api<ForgotPasswordResponse>("/auth/forgot-password", { method: "POST", body: payload });
export const verifyResetToken = async (token: string) => await api<BasicResponse>(`/auth/reset-password/${encodeURIComponent(token)}`);
export const resetPassword = async (token: string, payload: ResetPasswordPayload) => await api<BasicResponse>(`/auth/reset-password/${encodeURIComponent(token)}`, { method: "POST", body: payload });
export const adminCheck = async () => await api<AuthResponse>("/auth/admin-check");

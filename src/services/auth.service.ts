import api from "./api";

export type UserRole = "user" | "admin" | "superAdmin";

export type User = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  success: boolean;
  message?: string;
  data?: User;
  user?: User;
};

export type MeResponse = {
  success: boolean;
  data: User;
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
  return await api<{ success: boolean; message?: string }>("/auth/logout", {
    method: "POST",
  });
};

export const getMe = async () => {
  return await api<MeResponse>("/auth/me");
};

export const adminCheck = async () => {
  return await api<AuthResponse>("/auth/admin-check");
};

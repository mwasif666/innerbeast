import type { User } from "./auth.service";

const AUTH_TOKEN_KEY = "innerbeast-auth-token";
const AUTH_USER_KEY = "innerbeast-auth-user";

const safeStorage = () => {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const getCookieValue = (name: string) => {
  if (typeof document === "undefined") return "";

  const encodedName = `${encodeURIComponent(name)}=`;
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(encodedName));

  return cookie ? decodeURIComponent(cookie.slice(encodedName.length)) : "";
};

const setCookieValue = (name: string, value: string, maxAgeSeconds: number) => {
  if (typeof document === "undefined") return;

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value,
  )}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
};

const decodeJwtPayload = (token: string) => {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      "=",
    );

    return JSON.parse(window.atob(paddedPayload)) as { exp?: number };
  } catch {
    return null;
  }
};

export const getStoredAuthToken = () =>
  safeStorage()?.getItem(AUTH_TOKEN_KEY) || getCookieValue(AUTH_TOKEN_KEY) || "";

export const isStoredAuthTokenValid = () => {
  const token = getStoredAuthToken();
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;

  return payload.exp * 1000 > Date.now();
};

export const getStoredAuthUser = (): User | null => {
  const storage = safeStorage();
  if (!storage || !isStoredAuthTokenValid()) return null;

  try {
    const rawUser = storage.getItem(AUTH_USER_KEY);
    return rawUser ? (JSON.parse(rawUser) as User) : null;
  } catch {
    return null;
  }
};

export const saveAuthSession = (token?: string, user?: User | null) => {
  const storage = safeStorage();

  if (token) {
    storage?.setItem(AUTH_TOKEN_KEY, token);
    setCookieValue(AUTH_TOKEN_KEY, token, 7 * 24 * 60 * 60);
  }

  if (user) {
    storage?.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
};

export const clearAuthSession = () => {
  const storage = safeStorage();

  storage?.removeItem(AUTH_TOKEN_KEY);
  storage?.removeItem(AUTH_USER_KEY);
  setCookieValue(AUTH_TOKEN_KEY, "", 0);
};

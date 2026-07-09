import { getApiUrl } from "@/config/site";

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown | FormData;
};

type ApiError = Error & {
  status?: number;
  data?: unknown;
};

const CONFIGURED_BASE_URL = getApiUrl();
const USE_SAME_ORIGIN_PROXY = process.env.NEXT_PUBLIC_USE_API_PROXY === "true";
const SAME_ORIGIN_PROXY_BASE_URL = "/api";
const AUTH_TOKEN_KEY = "innerbeast-auth-token";

const getStoredToken = () => {
  if (typeof window === "undefined") return "";

  try {
    return window.localStorage.getItem(AUTH_TOKEN_KEY) || "";
  } catch {
    return "";
  }
};

const getBaseUrl = () => {
  // Hostinger static export has no Next.js server, so /api proxy routes cannot
  // exist there. Keep proxy usage opt-in for server deployments only.
  if (USE_SAME_ORIGIN_PROXY) {
    return SAME_ORIGIN_PROXY_BASE_URL;
  }

  return CONFIGURED_BASE_URL;
};

const buildUrl = (endpoint: string) => {
  const baseUrl = getBaseUrl().replace(/\/+$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  return `${baseUrl}${cleanEndpoint}`;
};

const parseResponse = async (response: Response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const saveAuthToken = (token?: string) => {
  if (typeof window === "undefined" || !token) return;

  try {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    // Browser storage can be unavailable in private/restricted modes.
  }
};

export const clearAuthToken = () => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // Browser storage can be unavailable in private/restricted modes.
  }
};

const api = async <T = unknown>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> => {
  const { method = "GET", body, headers = {}, ...customOptions } = options;

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  const token = getStoredToken();

  const response = await fetch(buildUrl(endpoint), {
    method,
    credentials: "include",
    headers: isFormData
      ? {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        }
      : {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    ...customOptions,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthToken();
    }

    const error = new Error(
      data?.message || "Something went wrong",
    ) as ApiError;

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data as T;
};

export default api;

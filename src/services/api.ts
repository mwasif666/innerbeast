import { getApiUrl } from "@/config/site";
import { clearAuthSession, getStoredAuthToken } from "./auth-storage";

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown | FormData;
};

type ApiError = Error & {
  status?: number;
  data?: unknown;
};

const CONFIGURED_BASE_URL = getApiUrl();
const PROXY_SETTING = process.env.NEXT_PUBLIC_USE_API_PROXY;
const SAME_ORIGIN_PROXY_BASE_URL = "/api";

const shouldUseSameOriginProxy = () => {
  if (PROXY_SETTING === "true") return true;
  if (PROXY_SETTING === "false") return false;
  if (typeof window === "undefined") return false;

  return window.location.hostname.endsWith(".vercel.app");
};

const getBaseUrl = () => {
  if (shouldUseSameOriginProxy()) {
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

const api = async <T = unknown>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> => {
  const { method = "GET", body, headers = {}, ...customOptions } = options;

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  const token = getStoredAuthToken();

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
      clearAuthSession();
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

import { DEFAULT_API_URL } from "@/config/site";

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown | FormData;
};

type ApiError = Error & {
  status?: number;
  data?: unknown;
};

const CONFIGURED_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/+$/, "");
const SAME_ORIGIN_PROXY_BASE_URL = "/api";

const getBaseUrl = () => {
  if (!CONFIGURED_BASE_URL) {
    return SAME_ORIGIN_PROXY_BASE_URL;
  }

  if (typeof window === "undefined") {
    return CONFIGURED_BASE_URL;
  }

  try {
    const configuredOrigin = new URL(
      CONFIGURED_BASE_URL,
      window.location.origin,
    ).origin;

    // Chrome can block or drop third-party auth cookies when the frontend and
    // backend are on different domains. For browser requests, always use the
    // same-origin Next.js API proxy when NEXT_PUBLIC_API_URL is cross-origin.
    if (configuredOrigin !== window.location.origin) {
      return SAME_ORIGIN_PROXY_BASE_URL;
    }
  } catch {
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

  const response = await fetch(buildUrl(endpoint), {
    method,
    credentials: "include",
    headers: isFormData
      ? headers
      : {
          "Content-Type": "application/json",
          ...headers,
        },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    ...customOptions,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
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

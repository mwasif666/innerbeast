type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown | FormData;
};

type ApiError = Error & {
  status?: number;
  data?: unknown;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is missing");
  }

  const { method = "GET", body, headers = {}, ...customOptions } = options;

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
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

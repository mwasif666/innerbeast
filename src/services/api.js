const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const parseResponse = async (response) => {
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

const api = async (endpoint, options = {}) => {
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
    throw {
      message: data?.message || "Something went wrong",
      status: response.status,
      data,
    };
  }

  return data;
};

export default api;

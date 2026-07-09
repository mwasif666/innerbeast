export const DEFAULT_SITE_URL = "https://innerbeast.co.uk";
export const DEFAULT_API_URL = "https://backend.himalayanessenceltd.com/api";
export const DEFAULT_SOCKET_URL = "https://backend.himalayanessenceltd.com";

export const getSiteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");

export const getApiUrl = () =>
  (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/$/, "");

export const getSocketUrl = () =>
  (process.env.NEXT_PUBLIC_SOCKET_URL || DEFAULT_SOCKET_URL).replace(/\/$/, "");

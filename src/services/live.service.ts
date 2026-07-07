let source: EventSource | null = null;

const getBaseUrl = () => {
  const explicitUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (explicitUrl) return explicitUrl.replace(/\/$/, "");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  return apiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
};

export const getLiveSource = () => {
  if (source) return source;

  source = new EventSource(`${getBaseUrl()}/api/realtime/stream`, {
    withCredentials: true,
  });

  return source;
};

export const closeLiveSource = () => {
  if (!source) return;
  source.close();
  source = null;
};

import { getSocketUrl } from "@/config/site";

let source: EventSource | null = null;

const getBaseUrl = () => {
  return getSocketUrl();
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

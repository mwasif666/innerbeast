type AnalyticsPayload = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: AnalyticsPayload[];
    fbq?: (...args: unknown[]) => void;
  }
}

export const trackPageView = (url: string) => {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "page_view", page_path: url });
  window.fbq?.("track", "PageView");
};

export const trackEcommerceEvent = (event: string, payload: AnalyticsPayload = {}) => {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });
  if (event === "purchase") window.fbq?.("track", "Purchase", payload);
  if (event === "add_to_cart") window.fbq?.("track", "AddToCart", payload);
  if (event === "view_item") window.fbq?.("track", "ViewContent", payload);
};

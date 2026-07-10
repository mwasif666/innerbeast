import api from "./api";

export type CurrencyPosition = "before" | "after";
export type StoreCurrency = { code: string; symbol: string; position: CurrencyPosition };
export type StoreTax = { enabled: boolean; label: string; rate: number; pricesIncludeTax: boolean };
export type StoreShippingDefaults = { country: string; city?: string; fallbackRate: number; freeShippingThreshold: number };
export type StoreSocialLinks = { facebook?: string; instagram?: string; tiktok?: string; youtube?: string; x?: string; threads?: string; linkedin?: string };
export type StoreSeo = { metaTitle?: string; metaDescription?: string; siteIconUrl?: string; siteIconPublicId?: string };
export type StoreAnnouncement = { enabled: boolean; text?: string };
export type StorePopupBanner = { enabled: boolean; imageUrl?: string; imagePublicId?: string; altText?: string };

export type StoreSettings = {
  _id?: string;
  key?: string;
  storeName: string;
  storeTagline?: string;
  supportEmail?: string;
  supportPhone?: string;
  whatsappPhone?: string;
  address?: string;
  currency: StoreCurrency;
  tax: StoreTax;
  shippingDefaults: StoreShippingDefaults;
  socialLinks: StoreSocialLinks;
  seo: StoreSeo;
  announcement: StoreAnnouncement;
  popupBanner?: StorePopupBanner;
  updatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type StoreSettingsPayload = {
  storeName: string;
  storeTagline?: string;
  supportEmail?: string;
  supportPhone?: string;
  whatsappPhone?: string;
  address?: string;
  currency: StoreCurrency;
  tax: StoreTax;
  shippingDefaults: StoreShippingDefaults;
  socialLinks: StoreSocialLinks;
  seo: StoreSeo;
  announcement: StoreAnnouncement;
  popupBanner?: StorePopupBanner;
};

export type StoreSettingsResponse = { success: boolean; message?: string; data: StoreSettings };

export const getPublicSettings = () => api<StoreSettingsResponse>("/settings", { cache: "no-store" });
export const getAdminSettings = () => api<StoreSettingsResponse>("/settings/admin");
export const updateStoreSettings = (payload: StoreSettingsPayload) => api<StoreSettingsResponse>("/settings/admin", { method: "PATCH", body: payload });

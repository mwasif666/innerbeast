import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import { cache, Suspense } from "react";
import "@/styles/styles.scss";

import GlobalProvider from "./GlobalProvider";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import GlobalScrollbar from "@/components/GlobalScrollbar";
import SupportWidget from "@/components/Support/SupportWidget";
import PageViewTracker from "@/components/Analytics/PageViewTracker";
import ModalCart from "@/components/Modal/ModalCart";
import ModalWishlist from "@/components/Modal/ModalWishlist";
import ModalSearch from "@/components/Modal/ModalSearch";
import ModalQuickview from "@/components/Modal/ModalQuickview";
import ModalCompare from "@/components/Modal/ModalCompare";
import CountdownTimeType from "@/type/CountdownType";
import { countdownTime } from "@/store/countdownTime";
import type { StoreSettingsResponse } from "@/services/settings.service";
import { getApiUrl } from "@/config/site";

const serverTimeLeft: CountdownTimeType = countdownTime();
const instrument = Instrument_Sans({ subsets: ["latin"], adjustFontFallback: false });

const getServerSettings = cache(async (): Promise<StoreSettingsResponse | undefined> => {
  try {
    const response = await fetch(`${getApiUrl()}/settings`, { cache: "force-cache" });
    if (!response.ok) return undefined;
    return await response.json() as StoreSettingsResponse;
  } catch { return undefined; }
});

export async function generateMetadata(): Promise<Metadata> {
  const fallback: Metadata = { title: "Inner Beast", description: "Inner Beast Store" };
  try {
    const settings = await getServerSettings();
    if (!settings) return fallback;
    const seo = settings.data?.seo;
    const metadata: Metadata = {
      title: seo?.metaTitle || settings.data?.storeName || "Inner Beast",
      description: seo?.metaDescription || "Inner Beast Store",
    };
    if (seo?.siteIconUrl) metadata.icons = { icon: seo.siteIconUrl, shortcut: seo.siteIconUrl, apple: seo.siteIconUrl };
    return metadata;
  } catch { return fallback; }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialSettings = await getServerSettings();

  return (
    <html lang="en">
      <body className={instrument.className}>
        <GlobalScrollbar />
        <Suspense fallback={null}><PageViewTracker /></Suspense>
        <ReactQueryProvider initialSettings={initialSettings}>
          <GlobalProvider>
            {children}
            <ModalCart serverTimeLeft={serverTimeLeft} />
            <ModalWishlist />
            <ModalSearch />
            <ModalQuickview />
            <ModalCompare />
            <SupportWidget />
          </GlobalProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}

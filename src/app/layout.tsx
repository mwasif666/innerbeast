import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import { cache } from "react";
import "@/styles/styles.scss";

import GlobalProvider from "./GlobalProvider";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import GlobalScrollbar from "@/components/GlobalScrollbar";
import SupportWidget from "@/components/Support/SupportWidget";

import ModalCart from "@/components/Modal/ModalCart";
import ModalWishlist from "@/components/Modal/ModalWishlist";
import ModalSearch from "@/components/Modal/ModalSearch";
import ModalQuickview from "@/components/Modal/ModalQuickview";
import ModalCompare from "@/components/Modal/ModalCompare";

import CountdownTimeType from "@/type/CountdownType";
import { countdownTime } from "@/store/countdownTime";
import type { StoreSettingsResponse } from "@/services/settings.service";

const serverTimeLeft: CountdownTimeType = countdownTime();

const instrument = Instrument_Sans({
  subsets: ["latin"],
  // Next 14.0.3 has no fallback metrics for Instrument Sans.
  // Disable only the fallback size adjustment; the font still loads normally.
  adjustFontFallback: false,
});

const getServerSettings = cache(async (): Promise<StoreSettingsResponse | undefined> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return undefined;

  try {
    const response = await fetch(`${apiUrl}/settings`, { cache: "no-store" });
    if (!response.ok) return undefined;

    return await response.json() as StoreSettingsResponse;
  } catch {
    return undefined;
  }
});

export async function generateMetadata(): Promise<Metadata> {
  const fallback: Metadata = {
    title: "Inner Beast",
    description: "Inner Beast Store",
  };

  try {
    const settings = await getServerSettings();
    if (!settings) return fallback;
    const seo = settings.data?.seo;

    return {
      title: seo?.metaTitle || settings.data?.storeName || "Inner Beast",
      description: seo?.metaDescription || "Inner Beast Store",
    };
  } catch {
    return fallback;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialSettings = await getServerSettings();

  return (
    <html lang="en">
      <body className={instrument.className}>
        <GlobalScrollbar />
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

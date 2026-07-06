import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "@/styles/styles.scss";

import GlobalProvider from "./GlobalProvider";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import GlobalScrollbar from "@/components/GlobalScrollbar";

import ModalCart from "@/components/Modal/ModalCart";
import ModalWishlist from "@/components/Modal/ModalWishlist";
import ModalSearch from "@/components/Modal/ModalSearch";
import ModalQuickview from "@/components/Modal/ModalQuickview";
import ModalCompare from "@/components/Modal/ModalCompare";

import CountdownTimeType from "@/type/CountdownType";
import { countdownTime } from "@/store/countdownTime";

const serverTimeLeft: CountdownTimeType = countdownTime();

const instrument = Instrument_Sans({
  subsets: ["latin"],
  // Next 14.0.3 has no fallback metrics for Instrument Sans.
  // Disable only the fallback size adjustment; the font still loads normally.
  adjustFontFallback: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const fallback: Metadata = {
    title: "Inner Beast",
    description: "Inner Beast Store",
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return fallback;

  try {
    const response = await fetch(`${apiUrl}/settings`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return fallback;

    const json = await response.json();
    const seo = json?.data?.seo;

    return {
      title: seo?.metaTitle || json?.data?.storeName || "Inner Beast",
      description: seo?.metaDescription || "Inner Beast Store",
    };
  } catch {
    return fallback;
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={instrument.className}>
        <GlobalScrollbar />
        <ReactQueryProvider>
          <GlobalProvider>
            {children}

            <ModalCart serverTimeLeft={serverTimeLeft} />
            <ModalWishlist />
            <ModalSearch />
            <ModalQuickview />
            <ModalCompare />
          </GlobalProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}

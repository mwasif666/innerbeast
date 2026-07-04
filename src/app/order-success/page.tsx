"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import * as Icon from "@phosphor-icons/react/dist/ssr";

import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";

const OrderSuccessContent = () => {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "Confirmed";

  return (
    <>
      <TopNavOne
        props="style-one bg-black"
        slogan="New customers save 10% with the code GET10"
      />

      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Order Confirmed" subHeading="Order Confirmed" />
      </div>

      <main className="md:py-20 py-10 bg-[#090b0b] text-white min-h-[620px]">
        <div className="container">
          <section className="max-w-2xl mx-auto text-center border border-[#292e2e] bg-[#111414] rounded-3xl md:p-12 p-7">
            <Icon.CheckCircle
              size={72}
              weight="fill"
              className="mx-auto text-green"
            />

            <div className="mt-6 text-sm tracking-[0.18em] uppercase text-red">
              Order placed
            </div>

            <h1 className="heading3 mt-3 text-white">
              Your order has been received
            </h1>

            <p className="mt-4 text-secondary">
              Your order reference is{" "}
              <strong className="text-white">{orderNumber}</strong>. Please save
              this number for tracking.
            </p>

            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              <Link href="/track-order" className="button-main">
                Track Order
              </Link>

              <Link
                href="/shop"
                className="h-12 px-6 rounded-lg border border-white text-white flex items-center justify-center font-semibold"
              >
                Continue Shopping
              </Link>
            </div>

            <Link
              href="/my-account"
              className="inline-flex mt-6 text-red font-semibold underline underline-offset-4"
            >
              View my account
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
};

const OrderSuccessPage = () => (
  <Suspense fallback={null}>
    <OrderSuccessContent />
  </Suspense>
);

export default OrderSuccessPage;

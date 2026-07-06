"use client";

import { useState } from "react";
import Link from "next/link";
import * as Icon from "@phosphor-icons/react/dist/ssr";

import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import { useTrackOrder } from "@/hooks/useOrders";
import { Order, OrderItem } from "@/services/order.service";
import { formatMoney } from "@/utils/currency";

const money = (value?: number) => formatMoney(value);

const date = (value?: string) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const getItemName = (item: OrderItem) => {
  if (item.title) return item.title;
  if (item.name) return item.name;

  if (typeof item.product === "object") {
    return item.product.title || item.product.name || "Product";
  }

  return "Product";
};

const getItemImage = (item: OrderItem) => {
  if (typeof item.image === "string") return item.image;
  if (item.image?.url) return item.image.url;

  if (typeof item.product === "object") {
    const image = item.product.images?.[0];

    if (typeof image === "string") return image;
    if (image?.url) return image.url;
  }

  return "";
};

const statusSteps = [
  { key: "pending", label: "Pending", icon: Icon.Hourglass },
  { key: "confirmed", label: "Confirmed", icon: Icon.SealCheck },
  { key: "processing", label: "Processing", icon: Icon.Gear },
  { key: "shipped", label: "Shipped", icon: Icon.Truck },
  { key: "delivered", label: "Delivered", icon: Icon.Package },
];

const TrackOrderPage = () => {
  const trackMutation = useTrackOrder();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  const handleTrack = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setOrder(null);

    const formData = new FormData(event.currentTarget);
    const orderNumber = String(formData.get("orderNumber") || "").trim();
    const contact = String(formData.get("contact") || "").trim();
    const isEmail = contact.includes("@");

    try {
      const response = await trackMutation.mutateAsync({
        orderNumber,
        ...(isEmail
          ? { email: contact.toLowerCase() }
          : { phone: contact }),
      });

      setOrder(response.data);
    } catch (trackError) {
      setError((trackError as Error).message || "Order not found.");
    }
  };

  const currentStatus = String(order?.orderStatus || "pending");
  const activeIndex = Math.max(
    statusSteps.findIndex((step) => step.key === currentStatus),
    0,
  );

  return (
    <>
      <TopNavOne
        props="style-one bg-black"
        slogan="New customers save 10% with the code GET10"
      />

      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Track Order" subHeading="Track Order" />
      </div>

      <main className="md:py-20 py-10 bg-[#090b0b] text-white min-h-[720px]">
        <div className="container">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-[420px_1fr] gap-8">
            <section className="border border-[#292e2e] bg-[#111414] rounded-3xl md:p-8 p-6 h-fit">
              <div className="text-sm tracking-[0.18em] uppercase text-red">
                Order lookup
              </div>

              <h1 className="heading4 mt-3 text-white">Track your order</h1>

              <p className="mt-3 text-secondary">
                Enter your order number and the email or phone number used at
                checkout.
              </p>

              <form className="grid gap-5 mt-7" onSubmit={handleTrack}>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold">Order number</span>
                  <input
                    name="orderNumber"
                    className="h-12 rounded-lg bg-[#191c1c] border border-[#373d3d] px-4 text-white"
                    placeholder="IB-89322677-79QO"
                    required
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold">Email or phone</span>
                  <input
                    name="contact"
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="h-12 rounded-lg bg-[#191c1c] border border-[#373d3d] px-4 text-white"
                    placeholder="you@example.com or +44 7700 900000"
                    required
                  />
                </label>

                {error && (
                  <div className="rounded-lg border border-red/30 bg-red/10 text-red px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                <button
                  className="button-main disabled:opacity-60"
                  disabled={trackMutation.isPending}
                >
                  {trackMutation.isPending ? "Checking..." : "Track Order"}
                </button>
              </form>
            </section>

            <section className="border border-[#292e2e] bg-[#111414] rounded-3xl md:p-8 p-6">
              {!order ? (
                <div className="min-h-[360px] flex flex-col items-center justify-center text-center text-secondary">
                  <Icon.Package size={58} />
                  <h2 className="heading5 text-white mt-4">
                    Order details will appear here
                  </h2>
                  <p className="mt-2">
                    Use your order reference to view the latest status.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap justify-between gap-4">
                    <div>
                      <div className="text-sm tracking-[0.18em] uppercase text-red">
                        Order
                      </div>

                      <h2 className="heading4 text-white mt-2">
                        {order.orderNumber}
                      </h2>

                      <p className="text-secondary mt-1">
                        Placed on {date(order.createdAt || order.placedAt)}
                      </p>
                    </div>

                    <span className="h-fit rounded-full px-4 py-2 bg-red/10 text-red capitalize text-sm font-bold">
                      {order.orderStatus || "pending"}
                    </span>
                  </div>

                  <div className="mt-10 rounded-2xl border border-[#292e2e] bg-[#0d1010] md:px-6 px-3 md:py-7 py-5">
                    <div className="relative">
                      <div className="absolute left-[10%] right-[10%] md:top-[22px] top-[18px] h-[3px] -translate-y-1/2 rounded-full bg-[#292e2e]" />

                      <div
                        className="absolute left-[10%] md:top-[22px] top-[18px] h-[3px] -translate-y-1/2 rounded-full bg-red transition-all duration-700"
                        style={{
                          width: `${
                            (activeIndex / (statusSteps.length - 1)) * 80
                          }%`,
                        }}
                      />

                      <div className="relative grid grid-cols-5">
                        {statusSteps.map((step, index) => {
                          const isDone = index < activeIndex;
                          const isCurrent = index === activeIndex;
                          const StepIcon = step.icon;

                          return (
                            <div
                              key={step.key}
                              className="flex flex-col items-center gap-2.5"
                            >
                              <div
                                className={`flex md:h-11 md:w-11 h-9 w-9 items-center justify-center rounded-full border-2 transition-colors duration-500 ${
                                  isDone
                                    ? "border-red bg-red text-white"
                                    : isCurrent
                                      ? "border-red bg-[#111414] text-red shadow-[0_0_0_6px_rgba(219,68,68,0.15)]"
                                      : "border-[#2f3535] bg-[#161a1a] text-[#5c6363]"
                                }`}
                              >
                                {isDone ? (
                                  <Icon.Check size={18} weight="bold" />
                                ) : (
                                  <StepIcon
                                    size={18}
                                    weight={isCurrent ? "fill" : "regular"}
                                  />
                                )}
                              </div>

                              <span
                                className={`text-center text-[11px] sm:text-sm font-semibold ${
                                  isCurrent
                                    ? "text-white"
                                    : isDone
                                      ? "text-white/70"
                                      : "text-[#5c6363]"
                                }`}
                              >
                                {step.label}
                              </span>

                              {isCurrent && (
                                <span className="hidden sm:block text-[11px] uppercase tracking-[0.14em] text-red -mt-1">
                                  Current
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-[#292e2e] pt-6">
                    <h3 className="heading5 text-white">Items</h3>

                    <div className="grid gap-4 mt-4">
                      {order.items.map((item, index) => {
                        const image = getItemImage(item);

                        return (
                          <div
                            key={`${item.sku || index}`}
                            className="grid grid-cols-[64px_1fr_auto] gap-4 items-center"
                          >
                            <div
                              className="w-16 h-16 rounded-lg bg-[#1c2020] border border-[#303535] bg-center bg-cover"
                              style={
                                image
                                  ? {
                                      backgroundImage: `url("${image.replace(
                                        /"/g,
                                        "%22",
                                      )}")`,
                                    }
                                  : undefined
                              }
                            />

                            <div>
                              <div className="font-semibold text-white">
                                {getItemName(item)}
                              </div>

                              <p className="text-secondary text-sm mt-1">
                                Qty {item.quantity}
                                {item.size ? ` · Size ${item.size}` : ""}
                              </p>
                            </div>

                            <strong className="text-white">
                              {money(
                                item.lineTotal ||
                                  Number(item.price) * item.quantity,
                              )}
                            </strong>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-8 border-t border-[#292e2e] pt-6 grid gap-3">
                    <div className="flex justify-between">
                      <span className="text-secondary">Subtotal</span>
                      <strong>{money(order.subtotal)}</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-secondary">Shipping</span>
                      <strong>{money(order.shippingFee)}</strong>
                    </div>

                    <div className="flex justify-between text-xl border-t border-[#292e2e] pt-4">
                      <span>Total</span>
                      <strong>{money(order.grandTotal || order.total)}</strong>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link href="/shop" className="button-main">
                      Continue Shopping
                    </Link>

                    <Link
                      href="/my-account"
                      className="h-12 px-6 rounded-lg border border-white text-white flex items-center justify-center font-semibold"
                    >
                      My Account
                    </Link>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default TrackOrderPage;

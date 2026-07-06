"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Icon from "@phosphor-icons/react/dist/ssr";

import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import { useChangePassword, useCurrentUser, useLogout, useUpdateMe } from "@/hooks/useAuth";
import { useCancelOrder, useMyOrders } from "@/hooks/useOrders";
import { extractOrders, getOrderById, OrderItem, Order } from "@/services/order.service";
import { formatMoney } from "@/utils/currency";
import styles from "./account.module.scss";

type Tab = "dashboard" | "orders" | "address" | "settings";

const CANCELLABLE_STATUSES = ["pending", "confirmed", "processing"];

const money = (value?: number) => formatMoney(value);
const date = (value?: string) => value ? new Intl.DateTimeFormat("en-PK", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)) : "-";
const itemName = (item: OrderItem) => item.title || item.name || (typeof item.product === "object" ? item.product.title || item.product.name : "") || "Product";
const itemImage = (item: OrderItem) => typeof item.image === "string" ? item.image : item.image?.url || (typeof item.product === "object" ? (typeof item.product.images?.[0] === "string" ? item.product.images[0] : item.product.images?.[0]?.url) : "") || "";
const itemColor = (item: OrderItem) => { const color = item.color || item.selectedColor; return typeof color === "object" ? color.name : color || ""; };
const canCancelOrder = (order: Order) => CANCELLABLE_STATUSES.includes(String(order.orderStatus || "pending"));
const labelize = (value?: string) => String(value || "Not available").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const firstNumber = (...values: Array<number | undefined>) => values.find((value) => typeof value === "number") || 0;
const orderSubtotal = (order: Order) => firstNumber(order.subtotal, order.items.reduce((sum, item) => sum + firstNumber(item.lineTotal, Number(item.price || 0) * Number(item.quantity || 0)), 0));
const orderDiscount = (order: Order) => firstNumber(order.discountTotal, order.discount, order.coupon?.discountAmount, order.appliedCoupon?.discountAmount);
const orderShipping = (order: Order) => firstNumber(order.shippingFee, order.shipping);
const orderTotal = (order: Order) => firstNumber(order.grandTotal, order.totalAmount, order.total, orderSubtotal(order) - orderDiscount(order) + orderShipping(order));
const couponCode = (order: Order) => order.coupon?.code || order.appliedCoupon?.code || order.couponCode || "";

const MyAccount = () => {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [orderDetails, setOrderDetails] = useState<Record<string, Order>>({});
  const [detailLoading, setDetailLoading] = useState<Record<string, boolean>>({});
  const [detailErrors, setDetailErrors] = useState<Record<string, string>>({});
  const [openOrders, setOpenOrders] = useState<Record<string, boolean>>({});
  const userQuery = useCurrentUser();
  const user = userQuery.data?.data;
  const ordersQuery = useMyOrders(Boolean(user));
  const updateMutation = useUpdateMe();
  const passwordMutation = useChangePassword();
  const logoutMutation = useLogout();
  const cancelMutation = useCancelOrder();
  const orders = useMemo(() => extractOrders(ordersQuery.data), [ordersQuery.data]);

  useEffect(() => { if (userQuery.isError) router.replace("/login?redirect=/my-account"); }, [router, userQuery.isError]);

  const latestAddress = user?.addresses?.find((item) => item.isDefault) || user?.addresses?.[0] || orders[0]?.shippingAddress;
  const initials = (user?.name || "IB").split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  const pending = orders.filter((order) => !["delivered", "cancelled", "returned"].includes(String(order.orderStatus))).length;
  const delivered = orders.filter((order) => order.orderStatus === "delivered").length;

  const showNotice = (text: string, error = false) => { setNotice({ text, error }); window.scrollTo({ top: 250, behavior: "smooth" }); };

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    try { await updateMutation.mutateAsync({ name: String(form.get("name") || ""), email: String(form.get("email") || ""), phone: String(form.get("phone") || "") }); showNotice("Profile updated successfully."); }
    catch (error) { showNotice((error as Error).message || "Profile update failed.", true); }
  };

  const saveAddress = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const address = { label: "Default", fullName: String(form.get("fullName") || ""), phone: String(form.get("phone") || ""), addressLine1: String(form.get("addressLine1") || ""), addressLine2: String(form.get("addressLine2") || ""), city: String(form.get("city") || ""), state: String(form.get("state") || ""), postalCode: String(form.get("postalCode") || ""), country: String(form.get("country") || "United Kingdom"), isDefault: true };
    try { await updateMutation.mutateAsync({ addresses: [address, ...(user?.addresses || []).filter((_, index) => index > 0)] }); showNotice("Delivery address saved."); }
    catch (error) { showNotice((error as Error).message || "Address update failed.", true); }
  };

  const changePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement); const next = String(form.get("newPassword") || "");
    if (next !== String(form.get("confirmPassword") || "")) return showNotice("New passwords do not match.", true);
    try { await passwordMutation.mutateAsync({ currentPassword: String(form.get("currentPassword") || ""), newPassword: next }); formElement.reset(); showNotice("Password changed successfully."); }
    catch (error) { showNotice((error as Error).message || "Password change failed.", true); }
  };

  const cancelCustomerOrder = async () => {
    if (!cancelTarget?._id) return;
    const targetId = cancelTarget._id;
    if (cancelReason.trim().length < 5) {
      showNotice("Please enter a cancellation reason.", true);
      return;
    }

    try {
      const response = await cancelMutation.mutateAsync({
        id: targetId,
        payload: { reason: cancelReason.trim() },
      });
      setOrderDetails((current) => ({
        ...current,
        [targetId]: response.data,
      }));
      setCancelTarget(null);
      setCancelReason("");
      showNotice("Order cancelled successfully.");
    } catch (error) {
      setCancelTarget(null);
      setCancelReason("");
      showNotice((error as Error).message || "Order cancellation failed.", true);
    }
  };

  useEffect(() => {
    if (!cancelTarget) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !cancelMutation.isPending) {
        setCancelTarget(null);
        setCancelReason("");
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cancelTarget, cancelMutation.isPending]);

  const logout = async () => { await logoutMutation.mutateAsync(); router.replace("/login"); };

  const loadOrderDetails = async (order: Order) => {
    if (orderDetails[order._id] || detailLoading[order._id]) return;
    setDetailLoading((current) => ({ ...current, [order._id]: true }));
    setDetailErrors((current) => ({ ...current, [order._id]: "" }));
    try {
      const response = await getOrderById(order._id);
      setOrderDetails((current) => ({ ...current, [order._id]: response.data }));
    } catch (error) {
      setDetailErrors((current) => ({ ...current, [order._id]: (error as Error).message || "Complete order details could not be loaded." }));
    } finally {
      setDetailLoading((current) => ({ ...current, [order._id]: false }));
    }
  };

  const toggleOrder = (order: Order) => {
    const willOpen = !openOrders[order._id];
    setOpenOrders((current) => ({ ...current, [order._id]: willOpen }));
    if (willOpen) void loadOrderDetails(order);
  };

  if (userQuery.isLoading || (!user && !userQuery.isError)) return <><TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" /><div className={styles.page}><div className={styles.loading}>Loading your account...</div></div></>;
  if (!user) return null;

  const OrderList = ({ limit }: { limit?: number }) => {
    const visible = limit ? orders.slice(0, limit) : orders;
    if (ordersQuery.isLoading) return <div className={styles.empty}>Loading orders...</div>;
    if (!visible.length) return <div className={styles.empty}><Icon.Package size={34} /><div>No orders found yet.</div><Link href="/shop">Start shopping</Link></div>;
    return <div className={styles.orders}>{visible.map((summaryOrder) => {
      const order = orderDetails[summaryOrder._id] || summaryOrder;
      const address = order.shippingAddress;
      const timeline = [
        ["Placed", order.placedAt || order.createdAt],
        ["Confirmed", order.confirmedAt],
        ["Processing", order.processingAt],
        ["Shipped", order.shippedAt],
        ["Delivered", order.deliveredAt],
        ["Cancelled", order.cancelledAt],
        ["Returned", order.returnedAt],
      ].filter((entry): entry is [string, string] => Boolean(entry[1]));
      const discount = orderDiscount(order);
      const code = couponCode(order);

      return <details className={styles.order} key={order._id} open={Boolean(openOrders[order._id])}>
      <summary onClick={(event) => { event.preventDefault(); toggleOrder(summaryOrder); }}><div><div className={styles.orderNumber}>{order.orderNumber || `#${order._id.slice(-8)}`}</div><div className={styles.muted}>{date(order.createdAt || order.placedAt)}</div></div><div>{order.totalItems || order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)} items</div><span className={styles.status} data-status={order.orderStatus}>{order.orderStatus || "pending"}</span><strong>{money(orderTotal(order))}</strong></summary>
      <div className={styles.orderBody}>{order.items.map((item, index) => { const image = itemImage(item); return <div className={styles.product} key={`${item.sku || index}`}><div className={styles.thumb} style={image ? { backgroundImage: `url("${image.replace(/"/g, "%22")}")` } : undefined} /><div><h3>{itemName(item)}</h3><p>Qty {item.quantity}{item.size || item.selectedSize ? ` · Size ${item.size || item.selectedSize}` : ""}{itemColor(item) ? ` · ${itemColor(item)}` : ""}</p></div><strong>{money(firstNumber(item.lineTotal, Number(item.price || 0) * item.quantity))}</strong></div>; })}</div>

      <div className={styles.detailArea}>
        {detailLoading[order._id] && <div className={styles.detailLoading}>Loading complete order details...</div>}
        {detailErrors[order._id] && <div className={styles.detailError}>{detailErrors[order._id]}</div>}
        <div className={styles.detailGrid}>
          <section className={styles.detailCard}>
            <div className={styles.detailTitle}><Icon.MapPin size={18} /> Delivery address</div>
            {address ? <address>
              <strong>{address.fullName}</strong>
              <span>{address.addressLine1}</span>
              {address.addressLine2 && <span>{address.addressLine2}</span>}
              <span>{[address.city, address.state, address.postalCode].filter(Boolean).join(", ")}</span>
              {address.country && <span>{address.country}</span>}
              <span>{address.phone}</span>
              {address.email && <span>{address.email}</span>}
            </address> : <p className={styles.unavailable}>Delivery address not available.</p>}
          </section>

          <section className={styles.detailCard}>
            <div className={styles.detailTitle}><Icon.CreditCard size={18} /> Payment</div>
            <dl className={styles.metaList}>
              <div><dt>Method</dt><dd>{labelize(order.paymentMethod)}</dd></div>
              <div><dt>Status</dt><dd><span className={styles.paymentStatus} data-status={order.paymentStatus}>{labelize(order.paymentStatus)}</span></dd></div>
            </dl>
          </section>

          <section className={styles.detailCard}>
            <div className={styles.detailTitle}><Icon.ClockCounterClockwise size={18} /> Order timeline</div>
            <ol className={styles.timeline}>{timeline.map(([label, value]) => <li key={label}><span /><div><strong>{label}</strong><small>{date(value)}</small></div></li>)}</ol>
          </section>

          <section className={styles.detailCard}>
            <div className={styles.detailTitle}><Icon.Receipt size={18} /> Order summary</div>
            {code && <div className={styles.coupon}><span>Coupon</span><strong>{code}</strong><em>−{money(discount)}</em></div>}
            <dl className={styles.totals}>
              <div><dt>Subtotal</dt><dd>{money(orderSubtotal(order))}</dd></div>
              <div className={styles.saving}><dt>Discount{code ? ` (${code})` : ""}</dt><dd>−{money(discount)}</dd></div>
              <div><dt>Shipping fee</dt><dd>{orderShipping(order) === 0 ? "Free" : money(orderShipping(order))}</dd></div>
              <div className={styles.grandTotal}><dt>Total</dt><dd>{money(orderTotal(order))}</dd></div>
            </dl>
          </section>
        </div>
      </div>

      {canCancelOrder(order) && (
        <div className="mx-5 mb-5 pt-4 border-t border-[#292e2e] flex justify-end">
          <button
            type="button"
            onClick={() => { setCancelReason(""); setCancelTarget(order); }}
            disabled={cancelMutation.isPending}
            className="h-11 px-5 rounded-lg border border-red/40 text-red font-semibold hover:bg-red/10 disabled:opacity-60"
          >
            {cancelMutation.isPending ? "Cancelling..." : "Cancel order"}
          </button>
        </div>
      )}
    </details>})}</div>;
  };

  return <>
    <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
    <div id="header" className="relative w-full"><MenuOne props="bg-transparent" /><Breadcrumb heading="My Account" subHeading="My Account" /></div>
    <main className={styles.page}><div className={styles.container}><div className={styles.layout}>
      <aside className={styles.sidebar}><div className={styles.identity}><div className={styles.avatar}>{initials}</div><h2>{user.name}</h2><p>{user.email}</p></div><nav className={styles.nav}>
        {([['dashboard', Icon.HouseLine, 'Dashboard'], ['orders', Icon.Package, 'My orders'], ['address', Icon.MapPin, 'Address'], ['settings', Icon.GearSix, 'Settings']] as const).map(([key, Glyph, label]) => <button type="button" key={key} className={tab === key ? styles.active : ''} onClick={() => { setTab(key); setNotice(null); }}><Glyph size={20} /><span>{label}</span></button>)}
      </nav><button type="button" className={styles.logout} onClick={logout} disabled={logoutMutation.isPending}><Icon.SignOut size={18} />{logoutMutation.isPending ? "Signing out..." : "Sign out"}</button></aside>

      <section className={styles.content}>{notice && <div className={`${styles.notice} ${notice.error ? styles.error : ''}`}>{notice.text}</div>}
        {tab === 'dashboard' && <><header className={styles.heading}><div className={styles.eyebrow}>ACCOUNT OVERVIEW</div><h1>Welcome back, {user.name.split(' ')[0]}</h1><p>Manage your orders and account information.</p></header><div className={styles.stats}><div className={styles.stat}><span>Total orders</span><strong>{orders.length}</strong></div><div className={styles.stat}><span>In progress</span><strong>{pending}</strong></div><div className={styles.stat}><span>Delivered</span><strong>{delivered}</strong></div></div><div className={styles.panel}><div className={styles.panelHeader}><h2>Recent orders</h2><button onClick={() => setTab('orders')}>View all</button></div><OrderList limit={3} /></div></>}
        {tab === 'orders' && <><header className={styles.heading}><div className={styles.eyebrow}>ORDER HISTORY</div><h1>My orders</h1><p>Open an order to view its products and status.</p></header><div className={styles.panel}><OrderList /></div></>}
        {tab === 'address' && <><header className={styles.heading}><div className={styles.eyebrow}>DELIVERY DETAILS</div><h1>My address</h1><p>Keep your default delivery information up to date.</p></header><div className={styles.panel}><form onSubmit={saveAddress}><div className={styles.formGrid}><label className={styles.field}><span>Full name</span><input name="fullName" placeholder="e.g. James Smith" defaultValue={latestAddress?.fullName || user.name} required /></label><label className={styles.field}><span>Phone</span><input name="phone" placeholder="+44 7700 900000" defaultValue={latestAddress?.phone || user.phone || ''} required /></label><label className={`${styles.field} ${styles.full}`}><span>Address</span><input name="addressLine1" placeholder="10 Downing Street" defaultValue={latestAddress?.addressLine1 || ''} required /></label><label className={`${styles.field} ${styles.full}`}><span>Flat / building</span><input name="addressLine2" placeholder="Flat, building or landmark" defaultValue={latestAddress?.addressLine2 || ''} /></label><label className={styles.field}><span>Town / city</span><input name="city" placeholder="London" defaultValue={latestAddress?.city || ''} required /></label><label className={styles.field}><span>County</span><input name="state" placeholder="Greater London" defaultValue={latestAddress?.state || ''} /></label><label className={styles.field}><span>Postcode</span><input name="postalCode" placeholder="SW1A 1AA" defaultValue={latestAddress?.postalCode || ''} /></label><label className={styles.field}><span>Country</span><input name="country" defaultValue={latestAddress?.country || 'United Kingdom'} required /></label></div><button className={styles.submit} disabled={updateMutation.isPending}>Save address</button></form></div></>}
        {tab === 'settings' && <><header className={styles.heading}><div className={styles.eyebrow}>ACCOUNT SETTINGS</div><h1>Profile & security</h1><p>Update your personal details or password.</p></header><div className={styles.panel}><div className={styles.panelHeader}><h2>Profile information</h2></div><form onSubmit={saveProfile}><div className={styles.formGrid}><label className={styles.field}><span>Full name</span><input name="name" defaultValue={user.name} required /></label><label className={styles.field}><span>Phone</span><input name="phone" defaultValue={user.phone || ''} /></label><label className={`${styles.field} ${styles.full}`}><span>Email</span><input name="email" type="email" defaultValue={user.email} required /></label></div><button className={styles.submit} disabled={updateMutation.isPending}>Save profile</button></form></div><div className={styles.panel}><div className={styles.panelHeader}><h2>Change password</h2></div><form onSubmit={changePassword}><div className={styles.formGrid}><label className={`${styles.field} ${styles.full}`}><span>Current password</span><input name="currentPassword" type="password" required /></label><label className={styles.field}><span>New password</span><input name="newPassword" type="password" minLength={6} required /></label><label className={styles.field}><span>Confirm new password</span><input name="confirmPassword" type="password" minLength={6} required /></label></div><button className={styles.submit} disabled={passwordMutation.isPending}>Update password</button></form></div></>}
      </section>
    </div></div></main>

    {cancelTarget && (
      <div
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
        onClick={() => { if (!cancelMutation.isPending) { setCancelTarget(null); setCancelReason(""); } }}
      >
        <div
          className="w-full max-w-md rounded-2xl border border-[#292e2e] bg-[#111414] md:p-8 p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-order-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red/10 text-red">
            <Icon.WarningCircle size={30} weight="fill" />
          </div>

          <h3 id="cancel-order-title" className="heading5 mt-5">
            Cancel this order?
          </h3>

          <p className="mt-2 text-secondary leading-relaxed">
            Order{" "}
            <span className="font-semibold text-white">
              {cancelTarget.orderNumber || `#${cancelTarget._id.slice(-8)}`}
            </span>{" "}
            will be cancelled and the reserved stock will be restored. This
            action can&apos;t be undone.
          </p>

          <label className="block mt-5">
            <span className="block text-sm font-semibold text-white mb-2">
              Reason for cancellation
            </span>
            <textarea
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              rows={4}
              required
              minLength={5}
              placeholder="Please tell us why you want to cancel this order..."
              className="w-full rounded-lg border border-[#373d3d] bg-[#191c1c] px-4 py-3 text-white outline-none focus:border-red"
            />
          </label>

          <div className="mt-7 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setCancelTarget(null); setCancelReason(""); }}
              disabled={cancelMutation.isPending}
              className="h-12 rounded-lg border border-[#373d3d] font-semibold hover:bg-white/5 disabled:opacity-60"
            >
              Keep order
            </button>

            <button
              type="button"
              onClick={cancelCustomerOrder}
              disabled={cancelMutation.isPending || cancelReason.trim().length < 5}
              className="h-12 rounded-lg bg-red font-semibold text-white hover:bg-red/85 disabled:opacity-60"
            >
              {cancelMutation.isPending ? "Cancelling..." : "Yes, cancel"}
            </button>
          </div>
        </div>
      </div>
    )}

    <Footer />
  </>;
};

export default MyAccount;

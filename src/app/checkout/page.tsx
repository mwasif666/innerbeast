'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import * as Icon from '@phosphor-icons/react/dist/ssr'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import { useCart } from '@/context/CartContext'
import styles from './checkout.module.scss'

type PaymentMethod = 'credit-card' | 'cash-delivery' | 'paypal'

const Checkout = () => {
    const searchParams = useSearchParams()
    const { cartState } = useCart()
    const [activePayment, setActivePayment] = useState<PaymentMethod>('credit-card')
    const [showLogin, setShowLogin] = useState(false)

    const discount = Math.max(0, Number(searchParams.get('discount')) || 0)
    const shipping = Math.max(0, Number(searchParams.get('ship')) || 0)
    const subtotal = useMemo(
        () => cartState.cartArray.reduce((total, item) => total + item.price * item.quantity, 0),
        [cartState.cartArray]
    )
    const total = Math.max(0, subtotal - discount + shipping)
    const formatPrice = (value: number) => `Rs. ${value.toLocaleString('en-PK')}`

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className="relative w-full">
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading="Checkout" subHeading="Checkout" />
            </div>

            <main className={styles.checkoutPage}>
                <div className={styles.container}>
                    <div className={styles.pageIntro}>
                        <span className={styles.eyebrow}>SECURE CHECKOUT</span>
                        <h1>Complete your order</h1>
                        <p>Enter your delivery details and choose how you would like to pay.</p>
                    </div>

                    <div className={styles.layout}>
                        <div className={styles.mainColumn}>
                            <section className={styles.loginSection}>
                                <button
                                    type="button"
                                    className={styles.loginToggle}
                                    onClick={() => setShowLogin((current) => !current)}
                                    aria-expanded={showLogin}
                                >
                                    <span className={styles.loginText}>
                                        <Icon.UserCircle size={22} />
                                        <span><small>Already have an account?</small> Log in for a faster checkout</span>
                                    </span>
                                    <Icon.CaretDown size={18} className={showLogin ? styles.rotate : ''} />
                                </button>
                                {showLogin && (
                                    <form className={styles.loginForm} onSubmit={(event) => event.preventDefault()}>
                                        <label>
                                            <span>Email address</span>
                                            <input type="email" placeholder="you@example.com" autoComplete="email" required />
                                        </label>
                                        <label>
                                            <span>Password</span>
                                            <input type="password" placeholder="Enter your password" autoComplete="current-password" required />
                                        </label>
                                        <button type="submit" className={styles.secondaryButton}>Log in</button>
                                    </form>
                                )}
                            </section>

                            <form className={styles.checkoutForm} onSubmit={(event) => event.preventDefault()}>
                                <section className={styles.card}>
                                    <div className={styles.sectionHeading}>
                                        <span className={styles.step}>1</span>
                                        <div><h2>Contact & delivery</h2><p>We will use these details to deliver your order.</p></div>
                                    </div>
                                    <div className={styles.formGrid}>
                                        <label><span>First name *</span><input id="firstName" type="text" placeholder="Enter first name" autoComplete="given-name" required /></label>
                                        <label><span>Last name *</span><input id="lastName" type="text" placeholder="Enter last name" autoComplete="family-name" required /></label>
                                        <label><span>Email address *</span><input id="email" type="email" placeholder="you@example.com" autoComplete="email" required /></label>
                                        <label><span>Phone number *</span><input id="phoneNumber" type="tel" placeholder="+92 300 0000000" autoComplete="tel" required /></label>
                                        <label className={styles.fullWidth}><span>Country / region *</span><select id="region" defaultValue="Pakistan" autoComplete="country-name"><option>Pakistan</option><option>United Arab Emirates</option><option>United Kingdom</option><option>United States</option></select></label>
                                        <label><span>Town / city *</span><input id="city" type="text" placeholder="e.g. Lahore" autoComplete="address-level2" required /></label>
                                        <label><span>State / province *</span><input id="state" type="text" placeholder="e.g. Punjab" autoComplete="address-level1" required /></label>
                                        <label className={styles.fullWidth}><span>Street address *</span><input id="street" type="text" placeholder="House number and street name" autoComplete="street-address" required /></label>
                                        <label><span>Apartment (optional)</span><input id="apartment" type="text" placeholder="Apartment, suite, unit" /></label>
                                        <label><span>Postal code *</span><input id="postal" type="text" placeholder="Postal code" autoComplete="postal-code" required /></label>
                                        <label className={styles.fullWidth}><span>Order note (optional)</span><textarea id="note" rows={4} placeholder="Delivery instructions or a note about your order" /></label>
                                    </div>
                                </section>

                                <section className={styles.card}>
                                    <div className={styles.sectionHeading}>
                                        <span className={styles.step}>2</span>
                                        <div><h2>Payment method</h2><p>All transactions are secure and encrypted.</p></div>
                                    </div>
                                    <div className={styles.paymentList}>
                                        <PaymentOption id="credit-card" label="Credit / debit card" description="Visa, Mastercard and supported bank cards" icon={<Icon.CreditCard size={24} />} active={activePayment} onSelect={setActivePayment}>
                                            <div className={styles.cardFields}>
                                                <label className={styles.fullWidth}><span>Card number</span><input type="text" inputMode="numeric" placeholder="1234 5678 9012 3456" autoComplete="cc-number" /></label>
                                                <label><span>Expiry date</span><input type="text" inputMode="numeric" placeholder="MM / YY" autoComplete="cc-exp" /></label>
                                                <label><span>Security code</span><input type="text" inputMode="numeric" placeholder="CVV" autoComplete="cc-csc" /></label>
                                            </div>
                                        </PaymentOption>
                                        <PaymentOption id="cash-delivery" label="Cash on delivery" description="Pay in cash when your order arrives" icon={<Icon.Money size={24} />} active={activePayment} onSelect={setActivePayment} />
                                        <PaymentOption id="paypal" label="PayPal" description="Continue securely with your PayPal account" icon={<Icon.PaypalLogo size={24} />} active={activePayment} onSelect={setActivePayment} />
                                    </div>
                                </section>

                                <button type="submit" className={styles.placeOrder} disabled={cartState.cartArray.length === 0}>
                                    <Icon.LockKey size={19} weight="bold" />
                                    {cartState.cartArray.length === 0 ? 'Your cart is empty' : `Place order · ${formatPrice(total)}`}
                                </button>
                                <p className={styles.privacy}><Icon.ShieldCheck size={18} /> Your personal and payment information is protected.</p>
                            </form>
                        </div>

                        <aside className={styles.summary}>
                            <div className={styles.summaryTitle}><h2>Your order</h2><span>{cartState.cartArray.length} {cartState.cartArray.length === 1 ? 'item' : 'items'}</span></div>
                            <div className={styles.productList}>
                                {cartState.cartArray.length === 0 ? (
                                    <div className={styles.emptyCart}><Icon.ShoppingBagOpen size={36} /><p>Your cart is empty</p><a href="/shop/sidebar-list">Continue shopping</a></div>
                                ) : cartState.cartArray.map((product) => (
                                    <div className={styles.product} key={`${product.id}-${product.selectedSize}-${product.selectedColor}`}>
                                        <div className={styles.productImage}>
                                            <Image src={product.thumbImage[0]} width={88} height={88} alt={product.name} />
                                            <span>{product.quantity}</span>
                                        </div>
                                        <div className={styles.productInfo}>
                                            <h3>{product.name}</h3>
                                            <p>{product.selectedSize || product.sizes?.[0]}{(product.selectedColor || product.variation?.[0]?.color) && ' · '}{product.selectedColor || product.variation?.[0]?.color}</p>
                                        </div>
                                        <strong>{formatPrice(product.price * product.quantity)}</strong>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.totals}>
                                <div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
                                <div><span>Discount</span><strong className={discount > 0 ? styles.saving : ''}>{discount > 0 ? `−${formatPrice(discount)}` : formatPrice(0)}</strong></div>
                                <div><span>Shipping</span><strong>{shipping === 0 ? 'Free' : formatPrice(shipping)}</strong></div>
                                <div className={styles.grandTotal}><span>Total</span><strong>{formatPrice(total)}</strong></div>
                            </div>
                            <div className={styles.summaryNote}><Icon.Truck size={22} /><div><strong>Fast, tracked delivery</strong><span>We will send tracking details after dispatch.</span></div></div>
                        </aside>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}

type PaymentOptionProps = {
    id: PaymentMethod
    label: string
    description: string
    icon: React.ReactNode
    active: PaymentMethod
    onSelect: (method: PaymentMethod) => void
    children?: React.ReactNode
}

const PaymentOption = ({ id, label, description, icon, active, onSelect, children }: PaymentOptionProps) => {
    const selected = active === id
    return (
        <div className={`${styles.paymentOption} ${selected ? styles.selectedPayment : ''}`}>
            <label className={styles.paymentHeader} htmlFor={id}>
                <input id={id} type="radio" name="payment" checked={selected} onChange={() => onSelect(id)} />
                <span className={styles.paymentIcon}>{icon}</span>
                <span><strong>{label}</strong><small>{description}</small></span>
                <span className={styles.radioMark} />
            </label>
            {selected && children && <div className={styles.paymentDetails}>{children}</div>}
        </div>
    )
}

export default Checkout

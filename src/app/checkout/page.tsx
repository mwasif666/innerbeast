'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import * as Icon from '@phosphor-icons/react/dist/ssr'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import { useCart } from '@/context/CartContext'
import { useCurrentUser } from '@/hooks/useAuth'
import { useCreateOrder } from '@/hooks/useOrders'
import { useApplyCoupon } from '@/hooks/useCoupons'
import { useCalculateShipping } from '@/hooks/useShipping'
import { getAppliedDiscount } from '@/services/coupon.service'
import { CreateOrderPayload } from '@/services/order.service'
import { COUNTRIES } from '@/data/countries'
import styles from './checkout.module.scss'

type PaymentMethod = 'credit-card' | 'cash-delivery' | 'paypal'

const CheckoutContent = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { cartState, clearCart } = useCart()
    const currentUserQuery = useCurrentUser()
    const currentUser = currentUserQuery.data?.data
    const createOrderMutation = useCreateOrder()
    const calculateShippingMutation = useCalculateShipping()
    const [activePayment, setActivePayment] = useState<PaymentMethod>('credit-card')
    const [orderError, setOrderError] = useState('')
    const applyCouponMutation = useApplyCoupon()
    const [couponInput, setCouponInput] = useState('')
    const [appliedCouponCode, setAppliedCouponCode] = useState('')
    const [appliedCouponDiscount, setAppliedCouponDiscount] = useState(0)
    const [couponError, setCouponError] = useState('')
    const [couponSuccess, setCouponSuccess] = useState('')
    const [shipping, setShipping] = useState<number | null>(null)
    const [shippingError, setShippingError] = useState('')
    const [placedOrderNumber, setPlacedOrderNumber] = useState('')
    const syncedAccount = useRef('')
    const shippingRequest = useRef(0)
    const [checkoutDetails, setCheckoutDetails] = useState({
        firstName: '', lastName: '', email: '', phone: '', country: 'United Kingdom',
        city: '', state: '', street: '', apartment: '', postal: '',
    })

    const queryDiscount = Math.max(0, Number(searchParams.get('discount')) || 0)
    const queryCouponCode = String(searchParams.get('coupon') || '').trim().toUpperCase()
    const discount = Math.max(queryDiscount, appliedCouponDiscount)
    const couponCode = appliedCouponCode || queryCouponCode
    const subtotal = useMemo(
        () => cartState.cartArray.reduce((total, item) => total + item.price * item.quantity, 0),
        [cartState.cartArray]
    )
    const total = Math.max(0, subtotal - discount + (shipping || 0))
    const formatPrice = (value: number) => new Intl.NumberFormat('en-GB', {
        style: 'currency', currency: 'GBP', minimumFractionDigits: 2,
    }).format(value)

    useEffect(() => {
        if (!currentUser) return

        const accountKey = currentUser._id || currentUser.id || currentUser.email
        if (syncedAccount.current === accountKey) return

        const address = currentUser.addresses?.find((item) => item.isDefault) || currentUser.addresses?.[0]
        const nameParts = (address?.fullName || currentUser.name || '').trim().split(/\s+/)
        setCheckoutDetails({
            firstName: nameParts.shift() || '',
            lastName: nameParts.join(' '),
            email: currentUser.email || '',
            phone: address?.phone || currentUser.phone || '',
            country: address?.country || 'United Kingdom',
            city: address?.city || '',
            state: address?.state || '',
            street: address?.addressLine1 || '',
            apartment: address?.addressLine2 || '',
            postal: address?.postalCode || '',
        })
        syncedAccount.current = accountKey
    }, [currentUser])

    useEffect(() => {
        const country = checkoutDetails.country.trim()
        const city = checkoutDetails.city.trim()
        const requestId = ++shippingRequest.current

        setShippingError('')

        if (!country || !city || subtotal <= 0) {
            setShipping(null)
            return
        }

        setShipping(null)
        const timer = window.setTimeout(async () => {
            try {
                const response = await calculateShippingMutation.mutateAsync({
                    country,
                    city,
                    subtotal,
                })

                if (shippingRequest.current !== requestId) return
                setShipping(Math.max(0, Number(response.data.shippingFee) || 0))
            } catch (error) {
                if (shippingRequest.current !== requestId) return
                setShipping(null)
                setShippingError(
                    (error as Error).message || 'Shipping is not available for this location.',
                )
            }
        }, 450)

        return () => window.clearTimeout(timer)
        // mutateAsync is stable; address and cart values are the quote inputs.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checkoutDetails.country, checkoutDetails.city, subtotal])

    const updateCheckoutDetail = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target
        setCheckoutDetails((current) => ({ ...current, [name]: value }))
    }

    const couponItems = useMemo(
        () =>
            cartState.cartArray.map((item) => ({
                product: item.id,
                productId: item.id,
                id: item.id,
                quantity: item.quantity,
            })),
        [cartState.cartArray],
    )

    const handleApplyCoupon = async () => {
        setCouponError('')
        setCouponSuccess('')

        if (cartState.cartArray.length === 0) {
            setCouponError('Your cart is empty.')
            return
        }

        const code = couponInput.trim().toUpperCase()

        if (!code) {
            setCouponError('Please enter a coupon code.')
            return
        }

        try {
            const response = await applyCouponMutation.mutateAsync({
                code,
                items: couponItems,
            })

            const discountAmount = getAppliedDiscount(response)

            if (discountAmount <= 0) {
                setCouponError('This coupon did not apply any discount.')
                setAppliedCouponCode('')
                setAppliedCouponDiscount(0)
                return
            }

            setAppliedCouponCode(code)
            setAppliedCouponDiscount(discountAmount)
            setCouponInput(code)
            setCouponSuccess(`${code} applied. You saved ${formatPrice(discountAmount)}.`)
        } catch (error) {
            setAppliedCouponCode('')
            setAppliedCouponDiscount(0)
            setCouponError((error as Error).message || 'Coupon could not be applied.')
        }
    }

    const handleRemoveCoupon = () => {
        setCouponInput('')
        setAppliedCouponCode('')
        setAppliedCouponDiscount(0)
        setCouponError('')
        setCouponSuccess('')
    }

    const handlePlaceOrder = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setOrderError('')

        if (cartState.cartArray.length === 0) {
            setOrderError('Your cart is empty. Add a product before placing an order.')
            return
        }

        const formData = new FormData(event.currentTarget)
        const value = (name: string) => String(formData.get(name) || '').trim()
        const firstName = value('firstName')
        const lastName = value('lastName')
        const fullName = `${firstName} ${lastName}`.trim()
        const email = value('email')
        const phone = value('phone')

        const paymentMethods: Record<PaymentMethod, CreateOrderPayload['paymentMethod']> = {
            'credit-card': 'CARD',
            'cash-delivery': 'COD',
            paypal: 'ONLINE',
        }

        const payload: CreateOrderPayload = {
            items: cartState.cartArray.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                selectedSize: item.selectedSize || item.sizes?.[0] || undefined,
                selectedColor: item.selectedColor || item.variation?.[0]?.color || undefined,
            })),
            shippingAddress: {
                fullName,
                phone,
                email,
                addressLine1: value('street'),
                addressLine2: value('apartment') || undefined,
                city: value('city'),
                state: value('state') || undefined,
                postalCode: value('postal') || undefined,
                country: value('country') || 'United Kingdom',
            },
            customer: { name: fullName, email, phone },
            paymentMethod: paymentMethods[activePayment],
            couponCode: couponCode || undefined,
            notes: [
                value('note'),
                couponCode ? `Coupon applied: ${couponCode}. Discount: ${formatPrice(discount)}.` : '',
            ].filter(Boolean).join('\n') || undefined,
        }

        try {
            const response = await createOrderMutation.mutateAsync(payload)
            const orderNumber = response.data?.orderNumber || response.data?._id || 'Confirmed'
            clearCart()
            router.replace(`/order-success?order=${encodeURIComponent(orderNumber)}`)
        } catch (error) {
            const apiError = error as Error & { status?: number }
            setOrderError(
                apiError.status === 401
                    ? 'Please log in to your account before placing the order.'
                    : apiError.message || 'We could not place your order. Please try again.',
            )
        }
    }

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

                    {placedOrderNumber ? (
                        <section className={styles.orderSuccess}>
                            <Icon.CheckCircle size={58} weight="fill" />
                            <h2>Order placed successfully</h2>
                            <p>Your reference is <strong>{placedOrderNumber}</strong>. We will contact you with the next update.</p>
                            <Link href="/shop">Continue shopping</Link>
                        </section>
                    ) : (
                    <div className={styles.layout}>
                        <div className={styles.mainColumn}>
                            <section className={styles.loginSection}>
                                {currentUser ? (
                                    <div className={styles.accountSynced}>
                                        <span className={styles.loginText}>
                                            <Icon.CheckCircle size={22} weight="fill" />
                                            <span><small>Signed in as {currentUser.email}</small> Delivery details synced from your account</span>
                                        </span>
                                        <Link href="/my-account">Manage account</Link>
                                    </div>
                                ) : (
                                <Link
                                    className={styles.loginToggle}
                                    href={`/login?redirect=${encodeURIComponent(`/checkout${searchParams.toString() ? `?${searchParams.toString()}` : ''}`)}`}
                                >
                                    <span className={styles.loginText}>
                                        <Icon.UserCircle size={22} />
                                        <span><small>Already have an account?</small> Log in for a faster checkout</span>
                                    </span>
                                    <Icon.ArrowRight size={18} />
                                </Link>
                                )}
                            </section>

                            <form className={styles.checkoutForm} onSubmit={handlePlaceOrder}>
                                <section className={styles.card}>
                                    <div className={styles.sectionHeading}>
                                        <span className={styles.step}>1</span>
                                        <div><h2>Contact & delivery</h2><p>We will use these details to deliver your order.</p></div>
                                    </div>
                                    <div className={styles.formGrid}>
                                        <label><span>First name *</span><input id="firstName" name="firstName" value={checkoutDetails.firstName} onChange={updateCheckoutDetail} type="text" placeholder="Enter first name" autoComplete="given-name" required /></label>
                                        <label><span>Last name *</span><input id="lastName" name="lastName" value={checkoutDetails.lastName} onChange={updateCheckoutDetail} type="text" placeholder="Enter last name" autoComplete="family-name" required /></label>
                                        <label><span>Email address *</span><input id="email" name="email" value={checkoutDetails.email} onChange={updateCheckoutDetail} type="email" placeholder="you@example.com" autoComplete="email" required /></label>
                                        <label><span>Phone number *</span><input id="phoneNumber" name="phone" value={checkoutDetails.phone} onChange={updateCheckoutDetail} type="tel" placeholder="+44 7700 900000" autoComplete="tel" required /></label>
                                        <label className={styles.fullWidth}><span>Country / region *</span><select id="region" name="country" value={checkoutDetails.country} onChange={updateCheckoutDetail} autoComplete="country-name" required>{COUNTRIES.map((country) => <option key={country.code} value={country.name}>{country.name}</option>)}</select></label>
                                        <label><span>Town / city *</span><input id="city" name="city" value={checkoutDetails.city} onChange={updateCheckoutDetail} type="text" placeholder="e.g. London" autoComplete="address-level2" required /></label>
                                        <label><span>County *</span><input id="state" name="state" value={checkoutDetails.state} onChange={updateCheckoutDetail} type="text" placeholder="e.g. Greater London" autoComplete="address-level1" required /></label>
                                        <label className={styles.fullWidth}><span>Street address *</span><input id="street" name="street" value={checkoutDetails.street} onChange={updateCheckoutDetail} type="text" placeholder="House number and street name" autoComplete="street-address" required /></label>
                                        <label><span>Apartment (optional)</span><input id="apartment" name="apartment" value={checkoutDetails.apartment} onChange={updateCheckoutDetail} type="text" placeholder="Apartment, suite, unit" /></label>
                                        <label><span>Postcode *</span><input id="postal" name="postal" value={checkoutDetails.postal} onChange={updateCheckoutDetail} type="text" placeholder="e.g. SW1A 1AA" autoComplete="postal-code" required /></label>
                                        <label className={styles.fullWidth}><span>Order note (optional)</span><textarea id="note" name="note" rows={4} placeholder="Delivery instructions or a note about your order" /></label>
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

                                {orderError && <div className={styles.orderError} role="alert">{orderError}</div>}
                                <button type="submit" className={styles.placeOrder} disabled={cartState.cartArray.length === 0 || createOrderMutation.isPending || calculateShippingMutation.isPending || shipping === null}>
                                    <Icon.LockKey size={19} weight="bold" />
                                    {cartState.cartArray.length === 0
                                        ? 'Your cart is empty'
                                        : createOrderMutation.isPending
                                            ? 'Placing order...'
                                            : calculateShippingMutation.isPending
                                                ? 'Calculating shipping...'
                                                : `Place order · ${formatPrice(total)}`}
                                </button>
                                <p className={styles.privacy}><Icon.ShieldCheck size={18} /> Your personal and payment information is protected.</p>
                            </form>
                        </div>

                        <aside className={styles.summary}>
                            <div className={styles.summaryTitle}><h2>Your order</h2><span>{cartState.cartArray.length} {cartState.cartArray.length === 1 ? 'item' : 'items'}</span></div>
                            <div className={styles.productList}>
                                {cartState.cartArray.length === 0 ? (
                                    <div className={styles.emptyCart}><Icon.ShoppingBagOpen size={36} /><p>Your cart is empty</p><a href="/shop">Continue shopping</a></div>
                                ) : cartState.cartArray.map((product) => (
                                    <div className={styles.product} key={`${product.id}-${product.selectedSize}-${product.selectedColor}`}>
                                        <div className={styles.productImage}>
                                            <Image
                                                src={product.thumbImage?.[0] || product.images?.[0] || '/images/product/pf-1.jpg'}
                                                width={88}
                                                height={88}
                                                alt={product.name || 'Product image'}
                                            />
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
                            <div className={styles.couponBox}>
                                <label htmlFor="couponInput">Coupon code</label>

                                <div className={styles.couponInputRow}>
                                    <input
                                        id="couponInput"
                                        type="text"
                                        value={couponInput}
                                        onChange={(event) => {
                                            setCouponInput(event.target.value)
                                            setCouponError('')
                                            setCouponSuccess('')
                                        }}
                                        placeholder="Enter coupon code"
                                        disabled={applyCouponMutation.isPending || Boolean(appliedCouponCode)}
                                    />

                                    {appliedCouponCode ? (
                                        <button type="button" onClick={handleRemoveCoupon}>
                                            Remove
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            disabled={applyCouponMutation.isPending}
                                        >
                                            {applyCouponMutation.isPending ? 'Checking...' : 'Apply'}
                                        </button>
                                    )}
                                </div>

                                {couponSuccess && <p className={styles.couponSuccess}>{couponSuccess}</p>}
                                {couponError && <p className={styles.couponError}>{couponError}</p>}
                            </div>
                            <div className={styles.totals}>
                                <div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
                                <div><span>{couponCode ? `Coupon (${couponCode})` : 'Discount'}</span><strong className={discount > 0 ? styles.saving : ''}>{discount > 0 ? `−${formatPrice(discount)}` : formatPrice(0)}</strong></div>
                                <div><span>Shipping</span><strong>{calculateShippingMutation.isPending ? 'Calculating...' : shippingError ? 'Unavailable' : shipping === null ? 'Enter city' : shipping === 0 ? 'Free' : formatPrice(shipping)}</strong></div>
                                {shippingError && <p className={styles.shippingError}>{shippingError}</p>}
                                <div className={styles.grandTotal}><span>Total</span><strong>{formatPrice(total)}</strong></div>
                            </div>
                            <div className={styles.summaryNote}><Icon.Truck size={22} /><div><strong>Fast, tracked delivery</strong><span>We will send tracking details after dispatch.</span></div></div>
                        </aside>
                    </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    )
}

const Checkout = () => (
    <Suspense
        fallback={<main className={styles.checkoutPage}><div className={styles.container}>Loading checkout...</div></main>}
    >
        <CheckoutContent />
    </Suspense>
)

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

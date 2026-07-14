'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { ProductType } from '@/type/ProductType';
import { useModalCartContext } from '@/context/ModalCartContext'
import { useCart } from '@/context/CartContext'
import { useProducts } from '@/hooks/useProducts'
import { toStorefrontProduct } from '@/utils/productAdapter'
import { countdownTime } from '@/store/countdownTime'
import CountdownTimeType from '@/type/CountdownType';
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { usePublicSettings } from '@/hooks/useSettings'

const ModalCart = ({ serverTimeLeft }: { serverTimeLeft: CountdownTimeType }) => {
    const [timeLeft, setTimeLeft] = useState(serverTimeLeft);
    const { format: formatPrice } = useStoreCurrency()

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(countdownTime());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const [activeTab, setActiveTab] = useState<string | undefined>('')
    const { isModalOpen, closeModalCart } = useModalCartContext();
    const { cartState, addToCart, removeFromCart, updateCart, appliedCoupon, applyCouponToCart } = useCart()
    const [couponCode, setCouponCode] = useState('')
    const [couponError, setCouponError] = useState('')
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

    useEffect(() => {
        setCouponCode(appliedCoupon?.code || '')
    }, [appliedCoupon?.code])

    const productsQuery = useProducts({ limit: 12, sort: 'newest', isActive: true })

    const suggestedProducts = useMemo(() => {
        const cartIds = new Set(cartState.cartArray.map((item) => item.id))
        return (productsQuery.data?.data?.map(toStorefrontProduct) || [])
            .filter((product) => !cartIds.has(product.id))
            .slice(0, 4)
    }, [productsQuery.data, cartState.cartArray])

    const handleAddToCart = (productItem: ProductType) => {
        if (!cartState.cartArray.find(item => item.id === productItem.id)) {
            addToCart({ ...productItem });
            updateCart(productItem.id, productItem.quantityPurchase, '', '')
        } else {
            updateCart(productItem.id, productItem.quantityPurchase, '', '')
        }
    };

    const handleActiveTab = (tab: string) => {
        setActiveTab(tab)
    }

    const { data: settingsData } = usePublicSettings()
    const moneyForFreeship = Number(settingsData?.data?.shippingDefaults?.freeShippingThreshold || 0)
    let [totalCart, setTotalCart] = useState<number>(0)
    let [discountCart, setDiscountCart] = useState<number>(0)

    cartState.cartArray.map(item => totalCart += item.price * item.quantity)

    const modalDiscount = Number(appliedCoupon?.discountAmount || 0)

    const handleApplyCoupon = async () => {
        setCouponError('')
        if (!cartState.cartArray.length) return setCouponError('Your cart is empty.')

        const code = couponCode.trim().toUpperCase()
        if (!code) return setCouponError('Enter a coupon code.')

        setIsApplyingCoupon(true)
        try {
            const coupon = await applyCouponToCart(code)
            const discountAmount = Number(coupon?.discountAmount || 0)
            if (discountAmount <= 0) throw new Error('This coupon did not return a discount.')
            setCouponCode(code)
            setActiveTab('')
        } catch (error) {
            setCouponError((error as Error).message || 'Coupon could not be applied.')
        } finally {
            setIsApplyingCoupon(false)
        }
    }

    return (
        <>
            <div className={`modal-cart-block`} onClick={closeModalCart}>
                <div
                    className={`modal-cart-main flex ${isModalOpen ? 'open' : ''}`}
                    onClick={(e) => { e.stopPropagation() }}
                >
                    <div className="left w-1/2 border-r border-line py-6 max-md:hidden">
                        <div className="heading5 px-6 pb-3">You May Also Like</div>
                        <div className="list px-6">
                            {suggestedProducts.map((product, index) => (
                                <div key={`${product.id}-${index}`} className='item py-5 flex items-center justify-between gap-3 border-b border-line'>
                                    <div className="infor flex items-center gap-5">
                                        <div className="bg-img">
                                            <Image
                                                src={product.images[0]}
                                                width={300}
                                                height={300}
                                                alt={product.name}
                                                className='w-[100px] aspect-square flex-shrink-0 rounded-lg object-cover'
                                            />
                                        </div>
                                        <div className=''>
                                            <div className="name text-button">{product.name}</div>
                                            <div className="flex items-center gap-2 mt-2">
                                            <div className="product-price text-title">{formatPrice(product.price)}</div>
                                            <div className="product-origin-price text-title text-secondary2"><del>{formatPrice(product.originPrice)}</del></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className="text-xl bg-white w-10 h-10 rounded-xl border border-black flex items-center justify-center duration-300 cursor-pointer hover:bg-black hover:text-white"
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleAddToCart(product)
                                        }}
                                    >
                                        <Icon.Handbag />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="right cart-block md:w-1/2 w-full py-6 relative overflow-hidden">
                        <div className="heading px-6 pb-3 flex items-center justify-between relative">
                            <div className="heading5">Shopping Cart</div>
                            <div
                                className="close-btn absolute right-6 top-0 w-6 h-6 rounded-full bg-surface flex items-center justify-center duration-300 cursor-pointer hover:bg-black hover:text-white"
                                onClick={closeModalCart}
                            >
                                <Icon.X size={14} />
                            </div>
                        </div>
                        <div className="time px-6">
                            <div className=" flex items-center gap-3 px-5 py-3 bg-green rounded-lg">
                                <p className='text-3xl'>🔥</p>
                                <div className="caption1">Your cart will expire in <span className='text-red caption1 font-semibold'>{timeLeft.minutes}:
                                    {timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds}</span> minutes!<br />
                                    Please checkout now before your items sell out!</div>
                            </div>
                        </div>
                        {moneyForFreeship > 0 && (
                            <div className="heading banner mt-3 px-6">
                                <div className="text">Buy <span className="text-button text-red"> {formatPrice(Math.max(0, moneyForFreeship - totalCart))} </span>
                                    <span>more to get </span>
                                    <span className="text-button">freeship</span></div>
                                <div className="tow-bar-block mt-3">
                                    <div
                                        className="progress-line"
                                        style={{ width: totalCart <= moneyForFreeship ? `${(totalCart / moneyForFreeship) * 100}%` : `100%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                        <div className="list-product px-6">
                            {cartState.cartArray.map((product, index) => (
                                <div key={`${product.id}-${product.selectedSize || ''}-${product.selectedColor || ''}-${index}`} className='item py-5 flex items-center justify-between gap-3 border-b border-line'>
                                    <div className="infor flex items-center gap-3 w-full">
                                        <div className="bg-img w-[100px] aspect-square flex-shrink-0 rounded-lg overflow-hidden">
                                            <Image
                                                src={product.images[0]}
                                                width={300}
                                                height={300}
                                                alt={product.name}
                                                className='w-full h-full object-cover'
                                            />
                                        </div>
                                        <div className='w-full'>
                                            <div className="flex items-center justify-between w-full">
                                                <div className="name text-button">{product.name}</div>
                                                <div
                                                    className="remove-cart-btn caption1 font-semibold text-red underline cursor-pointer"
                                                    onClick={() => removeFromCart(product.id)}
                                                >
                                                    Remove
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between gap-2 mt-3 w-full">
                                                <div className="flex items-center text-secondary2 capitalize">
                                                    {product.selectedSize || product.sizes?.[0] || ''}
                                                    {(product.selectedColor || product.variation?.[0]?.color) ? ' / ' : ''}
                                                    {product.selectedColor || product.variation?.[0]?.color || ''}
                                                </div>
                                                <div className="product-price text-title">{formatPrice(product.price)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="footer-modal bg-white absolute bottom-0 left-0 w-full">
                            <div className="flex items-center justify-center lg:gap-14 gap-8 px-6 py-4 border-b border-line">
                                <div
                                    className="item flex items-center gap-3 cursor-pointer"
                                    onClick={() => handleActiveTab('note')}
                                >
                                    <Icon.NotePencil className='text-xl' />
                                    <div className="caption1">Note</div>
                                </div>
                                <div
                                    className="item flex items-center gap-3 cursor-pointer"
                                    onClick={() => handleActiveTab('shipping')}
                                >
                                    <Icon.Truck className='text-xl' />
                                    <div className="caption1">Shipping</div>
                                </div>
                                <div
                                    className="item flex items-center gap-3 cursor-pointer"
                                    onClick={() => handleActiveTab('coupon')}
                                >
                                    <Icon.Tag className='text-xl' />
                                    <div className="caption1">Coupon</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-6 px-6">
                                <div className="heading5">Subtotal</div>
                                <div className="heading5">{formatPrice(totalCart)}</div>
                            </div>
                            {modalDiscount > 0 && <div className="flex items-center justify-between pt-2 px-6 text-[#e57112]"><div>Coupon ({appliedCoupon?.code}){appliedCoupon?.discountType === 'percentage' && appliedCoupon.discountValue ? ` · ${appliedCoupon.discountValue}% off` : ''}</div><div>−{formatPrice(modalDiscount)} saved</div></div>}
                            <div className="block-button text-center p-6">
                                <div className="flex items-center gap-4">
                                    <Link
                                        href={'/cart'}
                                        className='button-main basis-1/2 bg-white border border-black text-black text-center uppercase'
                                        onClick={closeModalCart}
                                    >
                                        View cart
                                    </Link>
                                    <Link
                                        href="/checkout"
                                        className='button-main basis-1/2 text-center uppercase'
                                        onClick={closeModalCart}
                                    >
                                        Check Out
                                    </Link>
                                </div>
                                <div onClick={closeModalCart} className="text-button-uppercase mt-4 text-center has-line-before cursor-pointer inline-block">Or continue shopping</div>
                            </div>
                            <div className={`tab-item note-block ${activeTab === 'note' ? 'active' : ''}`}>
                                <div className="px-6 py-4 border-b border-line">
                                    <div className="item flex items-center gap-3 cursor-pointer">
                                        <Icon.NotePencil className='text-xl' />
                                        <div className="caption1">Note</div>
                                    </div>
                                </div>
                                <div className="form pt-4 px-6">
                                    <textarea name="form-note" id="form-note" rows={4} placeholder='Add special instructions for your order...' className='caption1 py-3 px-4 bg-surface border-line rounded-md w-full'></textarea>
                                </div>
                                <div className="block-button text-center pt-4 px-6 pb-6">
                                    <div className='button-main w-full text-center' onClick={() => setActiveTab('')}>Save</div>
                                    <div onClick={() => setActiveTab('')} className="text-button-uppercase mt-4 text-center has-line-before cursor-pointer inline-block">Cancel</div>
                                </div>
                            </div>
                            <div className={`tab-item note-block ${activeTab === 'shipping' ? 'active' : ''}`}>
                                <div className="px-6 py-4 border-b border-line">
                                    <div className="item flex items-center gap-3 cursor-pointer">
                                        <Icon.Truck className='text-xl' />
                                        <div className="caption1">Estimate shipping rates</div>
                                    </div>
                                </div>
                                <div className="form pt-4 px-6">
                                    <div className="">
                                        <label htmlFor='select-country' className="caption1 text-secondary">Country/region</label>
                                        <div className="select-block relative mt-2">
                                            <select
                                                id="select-country"
                                                name="select-country"
                                                className='w-full py-3 pl-5 rounded-xl bg-white border border-line'
                                                defaultValue={'Country/region'}
                                            >
                                                <option value="Country/region" disabled>Country/region</option>
                                                <option value="France">France</option>
                                                <option value="Spain">Spain</option>
                                                <option value="UK">UK</option>
                                                <option value="USA">USA</option>
                                            </select>
                                            <Icon.CaretDown size={12} className='absolute top-1/2 -translate-y-1/2 md:right-5 right-2' />
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <label htmlFor='select-state' className="caption1 text-secondary">State</label>
                                        <div className="select-block relative mt-2">
                                            <select
                                                id="select-state"
                                                name="select-state"
                                                className='w-full py-3 pl-5 rounded-xl bg-white border border-line'
                                                defaultValue={'State'}
                                            >
                                                <option value="State" disabled>State</option>
                                                <option value="Paris">Paris</option>
                                                <option value="Madrid">Madrid</option>
                                                <option value="London">London</option>
                                                <option value="New York">New York</option>
                                            </select>
                                            <Icon.CaretDown size={12} className='absolute top-1/2 -translate-y-1/2 md:right-5 right-2' />
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <label htmlFor='select-code' className="caption1 text-secondary">Postal/Zip Code</label>
                                        <input className="border-line px-5 py-3 w-full rounded-xl mt-3" id="select-code" type="text" placeholder="Postal/Zip Code" />
                                    </div>
                                </div>
                                <div className="block-button text-center pt-4 px-6 pb-6">
                                    <div className='button-main w-full text-center' onClick={() => setActiveTab('')}>Calculator</div>
                                    <div onClick={() => setActiveTab('')} className="text-button-uppercase mt-4 text-center has-line-before cursor-pointer inline-block">Cancel</div>
                                </div>
                            </div>
                            <div className={`tab-item note-block ${activeTab === 'coupon' ? 'active' : ''}`}>
                                <div className="px-6 py-4 border-b border-line">
                                    <div className="item flex items-center gap-3 cursor-pointer">
                                        <Icon.Tag className='text-xl' />
                                        <div className="caption1">Add A Coupon Code</div>
                                    </div>
                                </div>
                                <div className="form pt-4 px-6">
                                    <div className="">
                                        <label htmlFor='select-discount' className="caption1 text-secondary">Enter Code</label>
                                        <input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} className="border-line px-5 py-3 w-full rounded-xl mt-3 uppercase" id="select-discount" type="text" placeholder="Discount code" />
                                        {couponError && <div className="text-red caption1 mt-2">{couponError}</div>}
                                    </div>
                                </div>
                                <div className="block-button text-center pt-4 px-6 pb-6">
                                    <button type="button" disabled={isApplyingCoupon || !couponCode.trim()} className='button-main bg-[#e57112] w-full text-center disabled:opacity-60' onClick={handleApplyCoupon}>{isApplyingCoupon ? 'Applying...' : 'Apply'}</button>
                                    <div onClick={() => setActiveTab('')} className="text-button-uppercase mt-4 text-center has-line-before cursor-pointer inline-block">Cancel</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ModalCart

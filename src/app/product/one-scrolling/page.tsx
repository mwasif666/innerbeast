'use client'

import React, { Suspense, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import * as Icon from '@phosphor-icons/react/dist/ssr'

import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Footer from '@/components/Footer/Footer'
import { useSingleProduct } from '@/hooks/useProducts'
import { toStorefrontProduct } from '@/utils/productAdapter'
import { useCart } from '@/context/CartContext'
import { useModalCartContext } from '@/context/ModalCartContext'
import { useWishlist } from '@/context/WishlistContext'

const ProductOneScrollingContent = () => {
    const searchParams = useSearchParams()
    const params = useParams<{ slug?: string }>()
    const productId = searchParams.get('id')?.trim() || params.slug?.trim() || ''
    const productQuery = useSingleProduct(productId)
    const { cartState, addToCart, updateCart } = useCart()
    const { openModalCart } = useModalCartContext()
    const { wishlistState, addToWishlist, removeFromWishlist } = useWishlist()

    const product = useMemo(
        () => productQuery.data?.data
            ? toStorefrontProduct(productQuery.data.data)
            : null,
        [productQuery.data],
    )
    const rawProduct = productQuery.data?.data
    const [activeImage, setActiveImage] = useState('')
    const [activeColor, setActiveColor] = useState('')
    const [activeSize, setActiveSize] = useState('')
    const [quantity, setQuantity] = useState(1)

    useEffect(() => {
        if (!product) return
        setActiveImage(product.images[0] || '')
        setActiveColor(product.variation[0]?.color || '')
        setActiveSize(product.sizes[0] || '')
        setQuantity(1)
    }, [product])

    const handleColor = (color: string, image: string) => {
        setActiveColor(color)
        setActiveImage(image)
    }

    const handleAddToCart = () => {
        if (!product || product.quantity <= 0) return

        const cartProduct = { ...product, quantityPurchase: quantity }
        if (!cartState.cartArray.some((item) => item.id === product.id)) {
            addToCart(cartProduct)
        }
        updateCart(product.id, quantity, activeSize, activeColor)
        openModalCart()
    }

    const handleWishlist = () => {
        if (!product) return
        if (wishlistState.wishlistArray.some((item) => item.id === product.id)) {
            removeFromWishlist(product.id)
        } else {
            addToWishlist(product)
        }
    }

    const isWishlisted = product
        ? wishlistState.wishlistArray.some((item) => item.id === product.id)
        : false
    const salePercent = product?.sale
        ? Math.round(100 - (product.price / product.originPrice) * 100)
        : 0

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className="relative w-full">
                <MenuOne props="bg-white text-black" />
            </div>

            <main className="bg-[#101212] text-white min-h-[600px]">
                <div className="container lg:py-16 py-10">
                    {!productId ? (
                        <div className="max-w-xl mx-auto py-20 text-center">
                            <Icon.WarningCircle size={52} className="mx-auto text-white/50" />
                            <div className="heading4 mt-5">No product selected</div>
                            <p className="text-secondary mt-2">
                                Choose a product from the shop to view its details.
                            </p>
                            <Link
                                href="/shop"
                                className="inline-block mt-6 px-7 py-3 rounded-xl bg-white text-black font-semibold"
                            >
                                Browse Products
                            </Link>
                        </div>
                    ) : productQuery.isPending ? (
                        <div className="min-h-[480px] flex items-center justify-center text-white/60">
                            Loading product...
                        </div>
                    ) : productQuery.isError || !product ? (
                        <div className="max-w-xl mx-auto py-20 text-center">
                            <Icon.WarningCircle size={52} className="mx-auto text-white/50" />
                            <div className="heading4 mt-5">Product not found</div>
                            <p className="text-secondary mt-2">
                                This product may have been removed or is unavailable.
                            </p>
                            <Link
                                href="/shop"
                                className="inline-block mt-6 px-7 py-3 rounded-xl bg-white text-black font-semibold"
                            >
                                Back to Shop
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 caption1 text-white/60 pt-6 mb-8">
                                <Link href="/">Home</Link>
                                <Icon.CaretRight size={14} />
                                <Link href="/shop">Shop</Link>
                                <Icon.CaretRight size={14} />
                                <span className="text-white truncate">{product.name}</span>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-10 xl:gap-16 items-start">
                                <div className="flex max-sm:flex-col-reverse gap-4">
                                    {product.images.length > 1 && (
                                        <div className="sm:w-24 flex sm:flex-col gap-3 overflow-auto">
                                            {product.images.map((image, index) => (
                                                <button
                                                    type="button"
                                                    key={`${image}-${index}`}
                                                    onClick={() => setActiveImage(image)}
                                                    className={`relative shrink-0 w-20 sm:w-24 aspect-[3/4] overflow-hidden rounded-xl border-2 ${activeImage === image ? 'border-white' : 'border-white/10'}`}
                                                >
                                                    <Image
                                                        src={image}
                                                        fill
                                                        sizes="96px"
                                                        alt={`${product.name} ${index + 1}`}
                                                        className="object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="relative flex-1 aspect-[4/5] max-h-[720px] overflow-hidden rounded-2xl bg-white">
                                        <Image
                                            src={activeImage || product.images[0]}
                                            fill
                                            priority
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                            alt={product.name}
                                            className="object-cover"
                                        />
                                        {product.new && (
                                            <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-green text-black text-button-uppercase">
                                                New
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="lg:sticky lg:top-8">
                                    <div className="text-button-uppercase text-green">
                                        {rawProduct?.category?.name || 'Inner Beast'}
                                    </div>
                                    <h1 className="heading2 mt-2">{product.name}</h1>

                                    <div className="flex items-center gap-3 mt-5">
                                        <span className="heading5">£{product.price.toLocaleString("en-GB")}</span>
                                        {product.sale && (
                                            <>
                                                <del className="text-secondary2">
                                                    £{product.originPrice.toLocaleString("en-GB")}
                                                </del>
                                                <span className="caption1 bg-green text-black px-3 py-1 rounded-full">
                                                    -{salePercent}%
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    <p className="text-secondary mt-6 leading-7">
                                        {product.description}
                                    </p>

                                    {product.variation.length > 0 && (
                                        <div className="mt-8">
                                            <div className="text-title">Color: {activeColor}</div>
                                            <div className="flex flex-wrap gap-3 mt-3">
                                                {product.variation.map((variation) => (
                                                    <button
                                                        type="button"
                                                        key={variation.color}
                                                        title={variation.color}
                                                        aria-label={`Select ${variation.color}`}
                                                        onClick={() => handleColor(variation.color, variation.image)}
                                                        className={`w-10 h-10 p-1 rounded-full border-2 ${activeColor === variation.color ? 'border-white' : 'border-white/20'}`}
                                                    >
                                                        <span
                                                            className="block w-full h-full rounded-full border border-white/20"
                                                            style={{ backgroundColor: variation.colorCode }}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {product.sizes.length > 0 && (
                                        <div className="mt-8">
                                            <div className="text-title">Size: {activeSize}</div>
                                            <div className="flex flex-wrap gap-3 mt-3">
                                                {product.sizes.map((size) => (
                                                    <button
                                                        type="button"
                                                        key={size}
                                                        onClick={() => setActiveSize(size)}
                                                        className={`min-w-12 h-11 px-3 rounded-xl border ${activeSize === size ? 'bg-white text-black border-white' : 'border-white/20 hover:border-white'}`}
                                                    >
                                                        {size}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap items-center gap-3 mt-9">
                                        <div className="h-12 flex items-center rounded-xl border border-white/20 overflow-hidden">
                                            <button
                                                type="button"
                                                aria-label="Decrease quantity"
                                                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                                                className="w-12 h-full hover:bg-white/10"
                                            >
                                                <Icon.Minus size={18} className="mx-auto" />
                                            </button>
                                            <span className="w-12 text-center text-title">{quantity}</span>
                                            <button
                                                type="button"
                                                aria-label="Increase quantity"
                                                onClick={() => setQuantity((current) => Math.min(product.quantity, current + 1))}
                                                className="w-12 h-full hover:bg-white/10"
                                            >
                                                <Icon.Plus size={18} className="mx-auto" />
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={product.quantity <= 0}
                                            onClick={handleAddToCart}
                                            className="h-12 flex-1 min-w-[200px] px-7 rounded-xl bg-white text-black font-semibold disabled:opacity-50"
                                        >
                                            {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                                        </button>

                                        <button
                                            type="button"
                                            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                                            onClick={handleWishlist}
                                            className={`w-12 h-12 flex items-center justify-center rounded-xl border ${isWishlisted ? 'bg-white text-red border-white' : 'border-white/20 hover:border-white'}`}
                                        >
                                            <Icon.Heart size={23} weight={isWishlisted ? 'fill' : 'regular'} />
                                        </button>
                                    </div>

                                    <div className="caption1 mt-4 text-secondary">
                                        {product.quantity > 0
                                            ? `${product.quantity} items available`
                                            : 'Currently unavailable'}
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mt-9 pt-7 border-t border-white/10">
                                        {rawProduct?.sku && <div><span className="text-secondary">SKU:</span> {rawProduct.sku}</div>}
                                        {rawProduct?.material && <div><span className="text-secondary">Material:</span> {rawProduct.material}</div>}
                                        {rawProduct?.fitType && <div><span className="text-secondary">Fit:</span> {rawProduct.fitType}</div>}
                                        {rawProduct?.gender && <div><span className="text-secondary">Gender:</span> {rawProduct.gender}</div>}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </>
    )
}

const ProductOneScrolling = () => (
    <Suspense
        fallback={(
            <main className="bg-[#101212] text-white min-h-screen flex items-center justify-center">
                <div className="text-white/60">Loading product...</div>
            </main>
        )}
    >
        <ProductOneScrollingContent />
    </Suspense>
)

export default ProductOneScrolling

'use client'

// Quickview.tsx
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useModalQuickviewContext } from '@/context/ModalQuickviewContext';
import { useCart } from '@/context/CartContext';
import { useModalCartContext } from '@/context/ModalCartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useModalWishlistContext } from '@/context/ModalWishlistContext';
import { useCompare } from '@/context/CompareContext'
import { useModalCompareContext } from '@/context/ModalCompareContext'
import Rate from '../Other/Rate';
import ModalSizeguide from './ModalSizeguide';
import { useStoreCurrency } from '@/hooks/useStoreCurrency';

const ModalQuickview = () => {
    const [photoIndex, setPhotoIndex] = useState(0)
    const { format: formatPrice } = useStoreCurrency()
    const [openSizeGuide, setOpenSizeGuide] = useState<boolean>(false)
    const { selectedProduct, closeQuickview } = useModalQuickviewContext()
    const [activeColor, setActiveColor] = useState<string>('')
    const [activeSize, setActiveSize] = useState<string>('')
    const { addToCart, updateCart, cartState } = useCart()
    const { openModalCart } = useModalCartContext()
    const { addToWishlist, removeFromWishlist, wishlistState } = useWishlist()
    const { openModalWishlist } = useModalWishlistContext()
    const { addToCompare, removeFromCompare, compareState } = useCompare();
    const { openModalCompare } = useModalCompareContext()
    const percentSale = selectedProduct && Math.floor(100 - ((selectedProduct.price / selectedProduct.originPrice) * 100))
    const selectedVariationImage = selectedProduct?.variation.find((item) => item.color === activeColor)?.image
    const productImages = selectedVariationImage
        ? [selectedVariationImage, ...(selectedProduct?.images ?? []).filter((image) => image !== selectedVariationImage)]
        : (selectedProduct?.images ?? [])

    useEffect(() => {
        setPhotoIndex(0)
        setActiveColor('')
        setActiveSize('')
    }, [selectedProduct?.id])

    useEffect(() => {
        setPhotoIndex(0)
    }, [activeColor])

    const showPreviousImage = () => {
        if (productImages.length > 1) {
            setPhotoIndex((current) => (current - 1 + productImages.length) % productImages.length)
        }
    }

    const showNextImage = () => {
        if (productImages.length > 1) {
            setPhotoIndex((current) => (current + 1) % productImages.length)
        }
    }

    const handleOpenSizeGuide = () => {
        setOpenSizeGuide(true);
    };

    const handleCloseSizeGuide = () => {
        setOpenSizeGuide(false);
    };

    const handleActiveColor = (item: string) => {
        setActiveColor(item)
    }

    const handleActiveSize = (item: string) => {
        setActiveSize(item)
    }

    const handleIncreaseQuantity = () => {
        if (selectedProduct) {
            selectedProduct.quantityPurchase += 1
            updateCart(selectedProduct.id, selectedProduct.quantityPurchase + 1, activeSize, activeColor);
        }
    };

    const handleDecreaseQuantity = () => {
        if (selectedProduct && selectedProduct.quantityPurchase > 1) {
            selectedProduct.quantityPurchase -= 1
            updateCart(selectedProduct.id, selectedProduct.quantityPurchase - 1, activeSize, activeColor);
        }
    };

    const handleAddToCart = () => {
        if (selectedProduct) {
            if (!cartState.cartArray.find(item => item.id === selectedProduct.id)) {
                addToCart({ ...selectedProduct });
                updateCart(selectedProduct.id, selectedProduct.quantityPurchase, activeSize, activeColor)
            } else {
                updateCart(selectedProduct.id, selectedProduct.quantityPurchase, activeSize, activeColor)
            }
            openModalCart()
            closeQuickview()
        }
    };

    const handleAddToWishlist = () => {
        // if product existed in wishlit, remove from wishlist and set state to false
        if (selectedProduct) {
            if (wishlistState.wishlistArray.some(item => item.id === selectedProduct.id)) {
                removeFromWishlist(selectedProduct.id);
            } else {
                // else, add to wishlist and set state to true
                addToWishlist(selectedProduct);
            }
        }
        openModalWishlist();
    };

    const handleAddToCompare = () => {
        // if product existed in wishlit, remove from wishlist and set state to false
        if (selectedProduct) {
            if (compareState.compareArray.length < 3) {
                if (compareState.compareArray.some(item => item.id === selectedProduct.id)) {
                    removeFromCompare(selectedProduct.id);
                } else {
                    // else, add to wishlist and set state to true
                    addToCompare(selectedProduct);
                }
            } else {
                alert('Compare up to 3 products')
            }
        }
        openModalCompare();
    };

    return (
        <>
            <div className={`modal-quickview-block`} onClick={closeQuickview}>
                <div
                    className={`modal-quickview-main py-6 ${selectedProduct !== null ? 'open' : ''}`}
                    onClick={(e) => { e.stopPropagation() }}
                >
                    <div className="flex h-full max-md:flex-col gap-y-6">
                        <div className="left lg:w-[430px] md:w-[340px] flex-shrink-0 px-6">
                            <div className="quickview-carousel">
                                {productImages.length > 0 && (
                                    <div className="quickview-carousel-main relative w-full aspect-[3/4] rounded-[20px] overflow-hidden bg-surface">
                                        <Image
                                            src={productImages[photoIndex]}
                                            width={1500}
                                            height={2000}
                                            alt={`${selectedProduct?.name ?? 'Product'} image ${photoIndex + 1}`}
                                            priority={true}
                                            className='w-full h-full object-cover'
                                        />
                                        {productImages.length > 1 && (
                                            <>
                                                <button type="button" className="quickview-carousel-arrow prev" onClick={showPreviousImage} aria-label="Previous product image">
                                                    <Icon.CaretLeft size={20} weight="bold" />
                                                </button>
                                                <button type="button" className="quickview-carousel-arrow next" onClick={showNextImage} aria-label="Next product image">
                                                    <Icon.CaretRight size={20} weight="bold" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                                {productImages.length > 1 && (
                                    <div className="quickview-carousel-thumbs mt-3 flex gap-2 overflow-x-auto">
                                        {productImages.map((item, index) => (
                                            <button
                                                type="button"
                                                className={`quickview-carousel-thumb ${photoIndex === index ? 'active' : ''}`}
                                                onClick={() => setPhotoIndex(index)}
                                                aria-label={`Show product image ${index + 1}`}
                                                key={item}
                                            >
                                                <Image src={item} width={160} height={160} alt="" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="right w-full px-4">
                            <div className="heading pb-6 px-4 flex items-center justify-between relative">
                                <div className="heading5">Quick View</div>
                                <div
                                    className="close-btn absolute right-0 top-0 w-6 h-6 rounded-full bg-surface flex items-center justify-center duration-300 cursor-pointer hover:bg-black hover:text-white"
                                    onClick={closeQuickview}
                                >
                                    <Icon.X size={14} />
                                </div>
                            </div>
                            <div className="product-infor px-4">
                                <div className="flex justify-between">
                                    <div>
                                        <div className="caption2 text-secondary font-semibold uppercase">{selectedProduct?.type}</div>
                                        <div className="heading4 mt-1">{selectedProduct?.name}</div>
                                    </div>
                                    <div
                                        className={`add-wishlist-btn w-10 h-10 flex items-center justify-center border border-line cursor-pointer rounded-lg duration-300 flex-shrink-0 hover:bg-black hover:text-white ${wishlistState.wishlistArray.some(item => item.id === selectedProduct?.id) ? 'active' : ''}`}
                                        onClick={handleAddToWishlist}
                                    >
                                        {wishlistState.wishlistArray.some(item => item.id === selectedProduct?.id) ? (
                                            <>
                                                <Icon.Heart size={20} weight='fill' className='text-red' />
                                            </>
                                        ) : (
                                            <>
                                                <Icon.Heart size={20} />
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center mt-3">
                                    <Rate currentRate={selectedProduct?.rate} size={14} />
                                    <span className='caption1 text-secondary'>(1.234 reviews)</span>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap mt-5 pb-6 border-b border-line">
                                    <div className="product-price heading5">{formatPrice(selectedProduct?.price)}</div>
                                    <div className='w-px h-4 bg-line'></div>
                                    <div className="product-origin-price font-normal text-secondary2"><del>{formatPrice(selectedProduct?.originPrice)}</del></div>
                                    {selectedProduct?.originPrice && (
                                        <div className="product-sale caption2 font-semibold bg-green px-3 py-0.5 inline-block rounded-full">
                                            -{percentSale}%
                                        </div>
                                    )}
                                    <div className='desc text-secondary mt-3'>{selectedProduct?.description}</div>
                                </div>
                                <div className="list-action mt-6">
                                    <div className="choose-color">
                                        <div className="text-title">Colors: <span className='text-title color'>{activeColor}</span></div>
                                        <div className="list-color flex items-center gap-2 flex-wrap mt-3">
                                            {selectedProduct?.variation.map((item, index) => (
                                                <div
                                                    className={`color-item w-12 h-12 rounded-xl duration-300 relative ${activeColor === item.color ? 'active' : ''}`}
                                                    key={index}
                                                    datatype={item.image}
                                                    onClick={() => {
                                                        handleActiveColor(item.color)
                                                    }}
                                                >
                                                    <span
                                                        className="block w-full h-full rounded-[10px] ring-1 ring-black/10"
                                                        style={{ backgroundColor: item.colorCode }}
                                                        aria-label={item.color}
                                                        title={item.color}
                                                    />
                                                    <div className="tag-action bg-black text-white caption2 capitalize px-1.5 py-0.5 rounded-sm">
                                                        {item.color}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="choose-size mt-5">
                                        <div className="heading flex items-center justify-between">
                                            <div className="text-title">Size: <span className='text-title size'>{activeSize}</span></div>
                                            <div
                                                className="caption1 size-guide text-red underline cursor-pointer"
                                                onClick={handleOpenSizeGuide}
                                            >
                                                Size Guide
                                            </div>
                                            <ModalSizeguide data={selectedProduct} isOpen={openSizeGuide} onClose={handleCloseSizeGuide} />
                                        </div>
                                        <div className="list-size flex items-center gap-2 flex-wrap mt-3">
                                            {selectedProduct?.sizes.map((item, index) => (
                                                <div
                                                    className={`size-item ${item === 'freesize' ? 'px-3 py-2' : 'w-12 h-12'} flex items-center justify-center text-button rounded-full bg-white border border-line ${activeSize === item ? 'active' : ''}`}
                                                    key={index}
                                                    onClick={() => handleActiveSize(item)}
                                                >
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-title mt-5">Quantity:</div>
                                    <div className="choose-quantity flex items-center max-xl:flex-wrap lg:justify-between gap-5 mt-3">
                                        <div className="quantity-block md:p-3 max-md:py-1.5 max-md:px-3 flex items-center justify-between rounded-lg border border-line sm:w-[180px] w-[120px] flex-shrink-0">
                                            <Icon.Minus
                                                onClick={handleDecreaseQuantity}
                                                className={`${selectedProduct?.quantityPurchase === 1 ? 'disabled' : ''} cursor-pointer body1`}
                                            />
                                            <div className="body1 font-semibold">{selectedProduct?.quantityPurchase}</div>
                                            <Icon.Plus
                                                onClick={handleIncreaseQuantity}
                                                className='cursor-pointer body1'
                                            />
                                        </div>
                                        <div onClick={handleAddToCart} className="button-main w-full text-center bg-white text-black border border-black">Add To Cart</div>
                                    </div>
                                    <div className="button-block mt-5">
                                        <div className="button-main w-full text-center">Buy It Now</div>
                                    </div>
                                    <div className="flex items-center flex-wrap lg:gap-20 gap-8 gap-y-4 mt-5">
                                        <div className="compare flex items-center gap-3 cursor-pointer" onClick={handleAddToCompare}>
                                            <div
                                                className="compare-btn md:w-12 md:h-12 w-10 h-10 flex items-center justify-center border border-line cursor-pointer rounded-xl duration-300 hover:bg-black hover:text-white"
                                            >
                                                <Icon.ArrowsCounterClockwise className='heading6' />
                                            </div>
                                            <span>Compare</span>
                                        </div>
                                        <div className="share flex items-center gap-3 cursor-pointer">
                                            <div className="share-btn md:w-12 md:h-12 w-10 h-10 flex items-center justify-center border border-line cursor-pointer rounded-xl duration-300 hover:bg-black hover:text-white">
                                                <Icon.ShareNetwork weight='fill' className='heading6' />
                                            </div>
                                            <span>Share Products</span>
                                        </div>
                                    </div>
                                    <div className="more-infor mt-6">
                                        <div className="flex items-center gap-4 flex-wrap">
                                            <div className="flex items-center gap-1">
                                                <Icon.ArrowClockwise className='body1' />
                                                <div className="text-title">Delivery & Return</div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Icon.Question className='body1' />
                                                <div className="text-title">Ask A Question</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center flex-wrap gap-1 mt-3">
                                            <Icon.Timer className='body1' />
                                            <span className="text-title">Estimated Delivery:</span>
                                            <span className="text-secondary">14 January - 18 January</span>
                                        </div>
                                        <div className="flex items-center flex-wrap gap-1 mt-3">
                                            <Icon.Eye className='body1' />
                                            <span className="text-title">38</span>
                                            <span className="text-secondary">people viewing this product right now!</span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-3">
                                            <div className="text-title">SKU:</div>
                                            <div className="text-secondary">53453412</div>
                                        </div>
                                        <div className="flex items-center gap-1 mt-3">
                                            <div className="text-title">Categories:</div>
                                            <div className="text-secondary">{selectedProduct?.category}, {selectedProduct?.gender}</div>
                                        </div>
                                        <div className="flex items-center gap-1 mt-3">
                                            <div className="text-title">Tag:</div>
                                            <div className="text-secondary">{selectedProduct?.type}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};

export default ModalQuickview;

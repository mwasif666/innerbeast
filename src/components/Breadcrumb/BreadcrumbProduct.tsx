'use client'

import React from 'react'
import Link from 'next/link'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { ProductType } from '@/type/ProductType'
import { useRouter } from 'next/navigation'

interface Props {
    data: Array<ProductType>
    productPage: string | null
    productId: string | number | null
}

const BreadcrumbProduct: React.FC<Props> = ({ data, productPage, productId }) => {
    const productMain = data.filter(product => product.id === productId)
    const router = useRouter()

    const handleDetailProduct = (productId: string | number | null) => {
        // Chuyển hướng đến trang shop với category được chọn
        router.push(`/product/${productPage}?id=${productId}`);
    };

    return (
        <>
            <div className="breadcrumb-product">
                <div className="main bg-[#242626] text-white md:pt-[88px] pt-[70px] pb-[14px]">
                    <div className="container flex items-center justify-between flex-wrap gap-3">
                        <div className="left flex items-center gap-1">
                            <Link href={'/'} className='caption1 text-white/70 hover:underline'>Homepage</Link>
                            <Icon.CaretRight size={12} className='text-white/70' />
                            <div className='caption1 text-white/70'>Product</div>
                            <Icon.CaretRight size={12} className='text-white/70' />
                            <div className='caption1 capitalize'>{`Product ${productPage}`}</div>
                        </div>
                        <div className="right flex items-center gap-3">
                            {productId !== null && Number(productId) >= 2 ? (
                                <>
                                    <div onClick={() => handleDetailProduct(Number(productId) - 1)} className='flex items-center cursor-pointer text-white/70 hover:text-white border-r border-white/20 pr-3'>
                                        <Icon.CaretCircleLeft className='text-2xl text-white' />
                                        <span className='caption1 pl-1'>Previous Product</span>
                                    </div>
                                    <div onClick={() => handleDetailProduct(Number(productId) + 1)} className='flex items-center cursor-pointer text-white/70 hover:text-white'>
                                        <span className='caption1 pr-1'>Next Product</span>
                                        <Icon.CaretCircleRight className='text-2xl text-white' />
                                    </div>
                                </>
                            ) : (
                                <>
                                    {productId !== null && Number(productId) === 1 && (
                                        <div onClick={() => handleDetailProduct(Number(productId) + 1)} className='flex items-center cursor-pointer text-white/70 hover:text-white'>
                                            <span className='caption1 pr-1'>Next Product</span>
                                            <Icon.CaretCircleRight className='text-2xl text-white' />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default BreadcrumbProduct

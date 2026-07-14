'use client'

import React, { Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation';
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import ShopSidebarList from '@/components/Shop/ShopSidebarList'
import Footer from '@/components/Footer/Footer'
import { useProducts } from '@/hooks/useProducts'
import { toStorefrontProduct } from '@/utils/productAdapter'

function SidebarListContent() {
    const searchParams = useSearchParams()
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const productsQuery = useProducts({
        limit: 100,
        sort: 'newest',
        isActive: true,
    })
    const products = useMemo(
        () => productsQuery.data?.data?.map(toStorefrontProduct) || [],
        [productsQuery.data],
    )

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-white text-black" />
            </div>
            {productsQuery.isPending ? (
                <div className="min-h-[420px] bg-[#101212] text-white flex items-center justify-center">
                    Loading products...
                </div>
            ) : productsQuery.isError ? (
                <div className="min-h-[420px] bg-[#101212] text-red flex items-center justify-center">
                    Unable to load products. Please try again.
                </div>
            ) : (
                <ShopSidebarList
                    data={products}
                    productPerPage={6}
                    dataType={type || category}
                />
            )}
            <Footer />
        </>
    )
}

export default function SidebarList() {
    return (
        <Suspense fallback={null}>
            <SidebarListContent />
        </Suspense>
    )
}

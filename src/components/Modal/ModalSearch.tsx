'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useModalSearchContext } from '@/context/ModalSearchContext'
import { useProducts } from '@/hooks/useProducts'
import { toStorefrontProduct } from '@/utils/productAdapter'
import { ProductType } from '@/type/ProductType'

const FEATURE_KEYWORDS = ['t-shirt', 'shorts', 'joggers', 'duffle bag', 'accessories']
const MAX_RESULTS = 6

const ModalSearch = () => {
    const { isModalOpen, closeModalSearch } = useModalSearchContext();
    const [searchKeyword, setSearchKeyword] = useState('');
    const router = useRouter()

    const productsQuery = useProducts({ limit: 100, sort: 'newest', isActive: true })

    const allProducts = useMemo<ProductType[]>(
        () => productsQuery.data?.data?.map(toStorefrontProduct) || [],
        [productsQuery.data],
    )

    const keyword = searchKeyword.trim().toLowerCase()

    const results = useMemo(() => {
        if (!keyword) return []
        return allProducts.filter((product) =>
            product.name.toLowerCase().includes(keyword) ||
            product.type.toLowerCase().includes(keyword) ||
            product.brand.toLowerCase().includes(keyword)
        )
    }, [allProducts, keyword])

    // When there's no query yet, showcase the latest products
    const popularProducts = useMemo(() => allProducts.slice(0, MAX_RESULTS), [allProducts])

    const visibleProducts = keyword ? results.slice(0, MAX_RESULTS) : popularProducts

    const goToSearchResults = (value: string) => {
        const trimmed = value.trim()
        if (!trimmed) return
        router.push(`/search-result?query=${encodeURIComponent(trimmed)}`)
        closeModalSearch()
        setSearchKeyword('')
    }

    const openProduct = (id: string) => {
        router.push(`/product/one-scrolling?id=${id}`)
        closeModalSearch()
        setSearchKeyword('')
    }

    return (
        <div className={`modal-search-block`} onClick={closeModalSearch}>
            <div
                className={`modal-search-main md:p-10 p-6 rounded-[32px] ${isModalOpen ? 'open' : ''}`}
                onClick={(e) => { e.stopPropagation() }}
            >
                {/* Search field */}
                <div className="form-search relative">
                    <Icon.MagnifyingGlass
                        size={20}
                        className='absolute left-5 top-1/2 -translate-y-1/2 text-secondary'
                    />
                    <input
                        type="text"
                        autoFocus
                        placeholder='Search for products...'
                        className='text-button-lg h-14 rounded-2xl border border-line w-full pl-14 pr-24 text-black'
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && goToSearchResults(searchKeyword)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {searchKeyword && (
                            <button
                                type="button"
                                aria-label="Clear search"
                                className='w-8 h-8 rounded-full bg-surface flex items-center justify-center text-black duration-300 hover:bg-black hover:text-white'
                                onClick={() => setSearchKeyword('')}
                            >
                                <Icon.X size={14} />
                            </button>
                        )}
                        <button
                            type="button"
                            aria-label="Search"
                            className='w-9 h-9 rounded-full bg-black flex items-center justify-center text-white duration-300 hover:bg-green hover:text-black'
                            onClick={() => goToSearchResults(searchKeyword)}
                        >
                            <Icon.MagnifyingGlass size={16} />
                        </button>
                    </div>
                </div>

                {/* Feature keywords */}
                <div className="keyword mt-6">
                    <div className="text-button text-secondary">Trending searches</div>
                    <div className="list-keyword flex items-center flex-wrap gap-2.5 mt-3">
                        {FEATURE_KEYWORDS.map((item) => (
                            <div
                                key={item}
                                className="item capitalize px-4 py-1.5 border border-line text-black rounded-full cursor-pointer duration-300 hover:bg-black hover:text-white"
                                onClick={() => setSearchKeyword(item)}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Results */}
                <div className="list-recent mt-7">
                    <div className="flex items-center justify-between">
                        <div className="heading6 text-black">
                            {keyword ? `Results for "${searchKeyword.trim()}"` : 'Popular right now'}
                        </div>
                        {keyword && results.length > 0 && (
                            <button
                                type="button"
                                className='text-button-uppercase text-secondary hover:text-black duration-300'
                                onClick={() => goToSearchResults(searchKeyword)}
                            >
                                View all ({results.length})
                            </button>
                        )}
                    </div>

                    {productsQuery.isPending ? (
                        <div className="py-10 text-center text-secondary">Loading products...</div>
                    ) : keyword && results.length === 0 ? (
                        <div className="py-10 text-center">
                            <div className="text-button text-black">No products found</div>
                            <div className="caption1 text-secondary mt-1">Try a different keyword or browse trending searches above.</div>
                        </div>
                    ) : (
                        <div className="grid mt-4 gap-2">
                            {visibleProducts.map((product) => {
                                const currency = product.currency ?? '$'
                                const onSale = product.price < product.originPrice
                                return (
                                    <div
                                        key={product.id}
                                        className="search-result-item flex items-center gap-4 p-2 rounded-2xl cursor-pointer duration-300 hover:bg-surface"
                                        onClick={() => openProduct(product.id)}
                                    >
                                        <div className="bg-img w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-surface">
                                            <Image
                                                src={product.thumbImage[0] || product.images[0]}
                                                width={200}
                                                height={200}
                                                alt={product.name}
                                                className='w-full h-full object-cover'
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-button text-black truncate">{product.name}</div>
                                            <div className="caption1 text-secondary capitalize">{product.type}</div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-title text-black">{currency}{product.price}</div>
                                            {onSale && (
                                                <div className="caption1 text-secondary line-through">{currency}{product.originPrice}</div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ModalSearch

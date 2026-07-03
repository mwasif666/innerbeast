'use client'
import React, { Suspense, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import { ProductType } from '@/type/ProductType'
import Product from '@/components/Product/Product'
import HandlePagination from '@/components/Other/HandlePagination'
import { useProducts } from '@/hooks/useProducts'
import { toStorefrontProduct } from '@/utils/productAdapter'

const SearchResultContent = () => {
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(0);
    const productsPerPage = 8;
    const offset = currentPage * productsPerPage;

    const router = useRouter()
    const searchParams = useSearchParams()
    const query = (searchParams.get('query') || '').trim()

    const productsQuery = useProducts({ limit: 100, sort: 'newest', isActive: true })

    const allProducts = useMemo<ProductType[]>(
        () => productsQuery.data?.data?.map(toStorefrontProduct) || [],
        [productsQuery.data],
    )

    const filteredData = useMemo(() => {
        const keyword = query.toLowerCase()
        if (!keyword) return allProducts
        return allProducts.filter((product) =>
            product.name.toLowerCase().includes(keyword) ||
            product.type.toLowerCase().includes(keyword) ||
            product.brand.toLowerCase().includes(keyword)
        )
    }, [allProducts, query])

    const handleSearch = (value: string) => {
        const trimmed = value.trim()
        if (!trimmed) return
        setCurrentPage(0)
        router.push(`/search-result?query=${encodeURIComponent(trimmed)}`)
        setSearchKeyword('')
    }

    const pageCount = Math.ceil(filteredData.length / productsPerPage);
    const currentProducts = filteredData.slice(offset, offset + productsPerPage);

    const handlePageChange = (selected: number) => {
        setCurrentPage(selected);
    };

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Search Result' subHeading='Search Result' />
            </div>
            <div className="shop-product breadcrumb1 lg:py-20 md:py-14 py-10">
                <div className="container">
                    <div className="heading flex flex-col items-center">
                        <div className="heading4 text-center">
                            Found {filteredData.length} results for {String.raw`"`}{query}{String.raw`"`}
                        </div>
                        <div className="input-block lg:w-1/2 sm:w-3/5 w-full md:h-[52px] h-[44px] sm:mt-8 mt-5">
                            <div className='w-full h-full relative'>
                                <input
                                    type="text"
                                    placeholder='Search...'
                                    className='caption1 w-full h-full pl-4 md:pr-[150px] pr-32 rounded-xl border border-line text-black'
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchKeyword)}
                                />
                                <button
                                    className='button-main absolute top-1 bottom-1 right-1 flex items-center justify-center'
                                    onClick={() => handleSearch(searchKeyword)}
                                >
                                    search
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="list-product-block relative md:pt-10 pt-6">
                        <div className="heading6">Product Search: {query}</div>
                        {productsQuery.isPending ? (
                            <div className="py-16 text-center text-secondary">Loading products...</div>
                        ) : currentProducts.length === 0 ? (
                            <div className="no-data-product py-16 text-center">No products match the selected criteria.</div>
                        ) : (
                            <div className={`list-product hide-product-sold grid lg:grid-cols-4 sm:grid-cols-3 grid-cols-2 sm:gap-[30px] gap-[20px] mt-5`}>
                                {currentProducts.map((item) => (
                                    <Product key={item.id} data={item} type='grid' />
                                ))}
                            </div>
                        )}

                        {pageCount > 1 && (
                            <div className="list-pagination flex items-center justify-center md:mt-10 mt-7">
                                <HandlePagination pageCount={pageCount} onPageChange={handlePageChange} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

const SearchResult = () => {
    return (
        <Suspense fallback={null}>
            <SearchResultContent />
        </Suspense>
    )
}

export default SearchResult

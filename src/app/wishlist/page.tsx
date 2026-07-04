'use client'
import React, { useEffect, useMemo, useState } from 'react'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import { ProductType } from '@/type/ProductType'
import Product from '@/components/Product/Product'
import { useWishlist } from '@/context/WishlistContext'
import HandlePagination from '@/components/Other/HandlePagination'
import * as Icon from "@phosphor-icons/react/dist/ssr";


const Wishlist = () => {
    const { wishlistState } = useWishlist();
    const [sortOption, setSortOption] = useState('');
    const [layoutCol, setLayoutCol] = useState<number | null>(4)
    const [type, setType] = useState<string | undefined>()
    const [currentPage, setCurrentPage] = useState(0);
    const productsPerPage = 12;
    const offset = currentPage * productsPerPage;

    const handleLayoutCol = (col: number) => {
        setLayoutCol(col)
    }

    const handleType = (type: string) => {
        setType((prevType) => (prevType === type ? undefined : type))
    }

    const handleSortChange = (option: string) => {
        setSortOption(option);
    };

    const typeOptions = useMemo(
        () => Array.from(new Set(wishlistState.wishlistArray.map((product) => product.type))).sort(),
        [wishlistState.wishlistArray],
    )
    let filteredData = wishlistState.wishlistArray.filter(
        (product) => !type || product.type === type,
    )

    const totalProducts = filteredData.length
    const selectedType = type

    // Tạo một bản sao của mảng đã lọc để sắp xếp
    let sortedData = [...filteredData];

    if (sortOption === 'soldQuantityHighToLow') {
        filteredData = sortedData.sort((a, b) => b.sold - a.sold)
    }

    if (sortOption === 'discountHighToLow') {
        filteredData = sortedData
            .sort((a, b) => (
                (Math.floor(100 - ((b.price / b.originPrice) * 100))) - (Math.floor(100 - ((a.price / a.originPrice) * 100)))
            ))
    }

    if (sortOption === 'priceHighToLow') {
        filteredData = sortedData.sort((a, b) => b.price - a.price)
    }

    if (sortOption === 'priceLowToHigh') {
        filteredData = sortedData.sort((a, b) => a.price - b.price)
    }


    const pageCount = Math.ceil(filteredData.length / productsPerPage)
    const currentProducts: ProductType[] = filteredData.slice(
        offset,
        offset + productsPerPage,
    )

    useEffect(() => {
        if (pageCount > 0 && currentPage >= pageCount) setCurrentPage(0)
    }, [currentPage, pageCount])

    const gridClass =
        layoutCol === 3
            ? 'lg:grid-cols-3'
            : layoutCol === 5
              ? 'lg:grid-cols-5'
              : 'lg:grid-cols-4'

    const handlePageChange = (selected: number) => {
        setCurrentPage(selected);
    };


    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-white text-black" />
                <Breadcrumb heading='Wish list' subHeading='Wish list' />
            </div>
            <div className="shop-product breadcrumb1 lg:py-20 md:py-14 py-10 bg-[#101212] text-white min-h-[480px]">
                <div className="container">
                    <div className="list-product-block relative">
                        {wishlistState.wishlistArray.length > 0 && (
                            <>
                        <div className="filter-heading flex items-center justify-between gap-5 flex-wrap">
                            <div className="left flex has-line items-center flex-wrap gap-5">
                                <div className="choose-layout flex items-center gap-2">
                                    <div
                                        className={`item three-col p-2 border rounded flex items-center justify-center cursor-pointer ${layoutCol === 3 ? 'active border-white bg-[#252828]' : 'border-white/20'}`}
                                        onClick={() => handleLayoutCol(3)}
                                    >
                                        <div className='flex items-center gap-0.5'>
                                            <span className='w-[3px] h-4 bg-secondary2 rounded-sm'></span>
                                            <span className='w-[3px] h-4 bg-secondary2 rounded-sm'></span>
                                            <span className='w-[3px] h-4 bg-secondary2 rounded-sm'></span>
                                        </div>
                                    </div>
                                    <div
                                        className={`item four-col p-2 border rounded flex items-center justify-center cursor-pointer ${layoutCol === 4 ? 'active border-white bg-[#252828]' : 'border-white/20'}`}
                                        onClick={() => handleLayoutCol(4)}
                                    >
                                        <div className='flex items-center gap-0.5'>
                                            <span className='w-[3px] h-4 bg-secondary2 rounded-sm'></span>
                                            <span className='w-[3px] h-4 bg-secondary2 rounded-sm'></span>
                                            <span className='w-[3px] h-4 bg-secondary2 rounded-sm'></span>
                                            <span className='w-[3px] h-4 bg-secondary2 rounded-sm'></span>
                                        </div>
                                    </div>
                                    <div
                                        className={`item five-col p-2 border rounded flex items-center justify-center cursor-pointer ${layoutCol === 5 ? 'active border-white bg-[#252828]' : 'border-white/20'}`}
                                        onClick={() => handleLayoutCol(5)}
                                    >
                                        <div className='flex items-center gap-0.5'>
                                            <span className='w-[3px] h-4 bg-secondary2 rounded-sm'></span>
                                            <span className='w-[3px] h-4 bg-secondary2 rounded-sm'></span>
                                            <span className='w-[3px] h-4 bg-secondary2 rounded-sm'></span>
                                            <span className='w-[3px] h-4 bg-secondary2 rounded-sm'></span>
                                            <span className='w-[3px] h-4 bg-secondary2 rounded-sm'></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="right flex items-center gap-3">
                                <div className="select-block filter-type relative">
                                    <select
                                        className='caption1 py-2 pl-3 md:pr-12 pr-8 rounded-lg border border-white/20 bg-[#1b1d1d] text-white capitalize'
                                        name="select-type"
                                        id="select-type"
                                        onChange={(e) => handleType(e.target.value)}
                                        value={type === undefined ? 'Type' : type}
                                    >
                                        <option value="Type" disabled>Type</option>
                                        {typeOptions.map((item) => (
                                            <option
                                                key={item}
                                                value={item}
                                                className={`item cursor-pointer ${type === item ? 'active' : ''}`}
                                            >
                                                {item}
                                            </option>
                                        ))}
                                    </select>
                                    <Icon.CaretDown size={12} className='absolute top-1/2 -translate-y-1/2 md:right-4 right-2' />
                                </div>
                                <div className="select-block relative">
                                    <select
                                        id="select-filter"
                                        name="select-filter"
                                        className='caption1 py-2 pl-3 md:pr-20 pr-10 rounded-lg border border-white/20 bg-[#1b1d1d] text-white'
                                        onChange={(e) => { handleSortChange(e.target.value) }}
                                        defaultValue={'Sorting'}
                                    >
                                        <option value="Sorting" disabled>Sorting</option>
                                        <option value="soldQuantityHighToLow">Best Selling</option>
                                        <option value="discountHighToLow">Best Discount</option>
                                        <option value="priceHighToLow">Price High To Low</option>
                                        <option value="priceLowToHigh">Price Low To High</option>
                                    </select>
                                    <Icon.CaretDown size={12} className='absolute top-1/2 -translate-y-1/2 md:right-4 right-2' />
                                </div>
                            </div>
                        </div>

                        <div className="list-filtered flex items-center flex-wrap gap-3 mt-4">
                            <div className="total-product">
                                {totalProducts}
                                <span className='text-secondary pl-1'>Products Found</span>
                            </div>
                            {
                                (selectedType) && (
                                    <>
                                        <div className="list flex items-center gap-3">
                                            <div className='w-px h-4 bg-line'></div>
                                            {selectedType && (
                                                <div className="item flex items-center px-2 py-1 gap-1 bg-[#252828] text-white border border-white/15 rounded-full capitalize" onClick={() => { setType(undefined) }}>
                                                    <Icon.X className='cursor-pointer' />
                                                    <span>{selectedType}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div
                                            className="clear-btn flex items-center px-2 py-1 gap-1 rounded-full border border-red cursor-pointer"
                                            onClick={() => {
                                                setType(undefined);
                                            }}
                                        >
                                            <Icon.X color='rgb(219, 68, 68)' className='cursor-pointer' />
                                            <span className='text-button-uppercase text-red'>Clear All</span>
                                        </div>
                                    </>
                                )
                            }
                        </div>
                            </>
                        )}

                        {currentProducts.length > 0 ? (
                            <div className={`list-product hide-product-sold grid ${gridClass} sm:grid-cols-3 grid-cols-2 sm:gap-[30px] gap-[20px] mt-7`}>
                                {currentProducts.map((item) => (
                                    <Product key={item.id} data={item} type='grid' />
                                ))}
                            </div>
                        ) : (
                            <div className="max-w-xl mx-auto py-16 px-6 text-center border border-white/10 bg-white/[0.02] rounded-2xl">
                                <Icon.HeartBreak size={52} className="mx-auto text-white/50" />
                                <div className="heading5 mt-5">
                                    {wishlistState.wishlistArray.length === 0
                                        ? 'Your wishlist is empty'
                                        : 'No wishlist products match this filter'}
                                </div>
                                <p className="text-secondary mt-2">
                                    {wishlistState.wishlistArray.length === 0
                                        ? 'Save products you love and they will appear here.'
                                        : 'Clear the selected type to see your saved products.'}
                                </p>
                                <div className="flex items-center justify-center gap-3 mt-6">
                                    {wishlistState.wishlistArray.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setType(undefined)}
                                            className="px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10"
                                        >
                                            Clear Filter
                                        </button>
                                    )}
                                    <a
                                        href="/shop"
                                        className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-green"
                                    >
                                        Explore Products
                                    </a>
                                </div>
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

export default Wishlist

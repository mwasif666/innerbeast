'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { ProductType } from '@/type/ProductType'
import Product from '../Product/Product';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css'
import HandlePagination from '../Other/HandlePagination';

interface Props {
    data: Array<ProductType>;
    productPerPage: number
    dataType: string | null
}

const ShopSidebarList: React.FC<Props> = ({ data, productPerPage, dataType }) => {
    const [type, setType] = useState<string | null>(dataType)
    const [showOnlySale, setShowOnlySale] = useState(false)
    const [sortOption, setSortOption] = useState('')
    const [size, setSize] = useState<string | null>(null)
    const [color, setColor] = useState<string | null>(null)
    const [brand, setBrand] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
    const maxPrice = useMemo(() => {
        const highestPrice = Math.max(...data.map((product) => product.price), 0)
        return Math.max(500, Math.ceil(highestPrice / 500) * 500)
    }, [data])
    const [priceRange, setPriceRange] = useState<{ min: number; max: number }>(() => ({
        min: 0,
        max: Math.max(500, Math.ceil(Math.max(...data.map((product) => product.price), 0) / 500) * 500),
    }))
    const [currentPage, setCurrentPage] = useState(0)
    const offset = currentPage * productPerPage

    useEffect(() => {
        setType(dataType)
        setCurrentPage(0)
    }, [dataType])

    useEffect(() => {
        setPriceRange((current) => ({
            min: Math.min(current.min, maxPrice),
            max: current.max === 0 || current.max > maxPrice ? maxPrice : current.max,
        }))
    }, [maxPrice])

    const typeOptions = useMemo(
        () => Array.from(new Set(data.map((product) => product.type))).sort(),
        [data],
    )
    const sizeOptions = useMemo(() => {
        const preferredOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'FREESIZE']
        return Array.from(new Set(data.flatMap((product) => product.sizes)))
            .sort((first, second) => {
                const firstIndex = preferredOrder.indexOf(first.toUpperCase())
                const secondIndex = preferredOrder.indexOf(second.toUpperCase())
                return (firstIndex < 0 ? 99 : firstIndex) - (secondIndex < 0 ? 99 : secondIndex)
            })
    }, [data])
    const colorOptions = useMemo(() => {
        const colors = new Map<string, { name: string; code: string }>()
        data.forEach((product) => {
            product.variation.forEach((variation) => {
                const key = (variation.colorCode || variation.color).toLowerCase()
                if (!colors.has(key)) {
                    colors.set(key, {
                        name: variation.color,
                        code: variation.colorCode || '#1f1f1f',
                    })
                }
            })
        })
        return Array.from(colors.values()).sort((first, second) =>
            first.name.localeCompare(second.name),
        )
    }, [data])
    const brandOptions = useMemo(
        () => Array.from(new Set(data.map((product) => product.brand))).sort(),
        [data],
    )

    const handleType = (type: string) => {
        setType((prevType) => (prevType === type ? null : type))
        setCurrentPage(0);
    }

    const handleShowOnlySale = () => {
        setShowOnlySale(toggleSelect => !toggleSelect)
        setCurrentPage(0);
    }

    const handleSortChange = (option: string) => {
        setSortOption(option)
        setCurrentPage(0)
    }

    const handleSize = (size: string) => {
        setSize((prevSize) => (prevSize === size ? null : size))
        setCurrentPage(0);
    }

    const handlePriceChange = (values: number | number[]) => {
        if (Array.isArray(values)) {
            setPriceRange({ min: values[0], max: values[1] });
            setCurrentPage(0);
        }
    };

    const handleColor = (color: string) => {
        setColor((prevColor) => (prevColor === color ? null : color))
        setCurrentPage(0);
    }

    const handleBrand = (brand: string) => {
        setBrand((prevBrand) => (prevBrand === brand ? null : brand));
        setCurrentPage(0);
    }


    const filteredData = useMemo(() => {
        const searchValue = search.trim().toLowerCase()
        const result = data.filter((product) => {
            const matchesSearch = !searchValue || [
                product.name,
                product.slug,
                product.description,
                product.type,
                product.brand,
                ...product.sizes,
                ...product.variation.map((variation) => variation.color),
            ].some((value) => value.toLowerCase().includes(searchValue))
            const matchesType = !type || product.type === type
            const matchesSale = !showOnlySale || product.sale
            const matchesSize = !size || product.sizes.some(
                (productSize) => productSize.toLowerCase() === size.toLowerCase(),
            )
            const matchesColor = !color || product.variation.some(
                (variation) => variation.color.toLowerCase() === color.toLowerCase(),
            )
            const matchesBrand = !brand || product.brand.toLowerCase() === brand.toLowerCase()
            const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max

            return matchesSearch && matchesType && matchesSale && matchesSize &&
                matchesColor && matchesBrand && matchesPrice
        })

        if (sortOption === 'soldQuantityHighToLow') {
            return result.sort((first, second) => second.sold - first.sold)
        }
        if (sortOption === 'discountHighToLow') {
            return result.sort((first, second) =>
                (100 - (second.price / second.originPrice) * 100) -
                (100 - (first.price / first.originPrice) * 100),
            )
        }
        if (sortOption === 'priceHighToLow') {
            return result.sort((first, second) => second.price - first.price)
        }
        if (sortOption === 'priceLowToHigh') {
            return result.sort((first, second) => first.price - second.price)
        }

        return result
    }, [brand, color, data, priceRange, search, showOnlySale, size, sortOption, type])

    const totalProducts = filteredData.length
    const selectedType = type
    const selectedSize = size
    const selectedColor = color
    const selectedBrand = brand


    const pageCount = Math.ceil(filteredData.length / productPerPage)
    const currentProducts = filteredData.slice(offset, offset + productPerPage)

    useEffect(() => {
        if (pageCount > 0 && currentPage >= pageCount) setCurrentPage(0)
    }, [currentPage, pageCount])

    const handlePageChange = (selected: number) => {
        setCurrentPage(selected);
    };

    const handleClearAll = () => {
        setType(null)
        setSize(null)
        setColor(null)
        setBrand(null)
        setSearch('')
        setShowOnlySale(false)
        setPriceRange({ min: 0, max: maxPrice })
        setCurrentPage(0)
    }

    return (
        <>
            <div className="breadcrumb-block style-img text-white">
                <div className="breadcrumb-main bg-[#242626] overflow-hidden">
                    <div className="container lg:pt-[134px] pt-24 pb-10 relative">
                        <div className="main-content w-full h-full flex flex-col items-center justify-center relative z-[1]">
                            <div className="text-content">
                                <div className="heading2 text-center capitalize">{type || 'Shop'}</div>
                                <div className="link flex items-center justify-center gap-1 caption1 mt-3">
                                    <Link href={'/'}>Homepage</Link>
                                    <Icon.CaretRight size={14} className='text-white/70' />
                                    <div className='text-white/70 capitalize'>{type || 'Shop'}</div>
                                </div>
                            </div>
                            <div className="list-tab flex flex-wrap items-center justify-center gap-y-5 gap-8 lg:mt-[70px] mt-12 overflow-hidden">
                                {typeOptions.slice(0, 6).map((item) => (
                                    <div
                                        key={item}
                                        className={`tab-item text-button-uppercase cursor-pointer has-line-before line-2px ${type === item ? 'active' : ''}`}
                                        onClick={() => handleType(item)}
                                    >
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="shop-product breadcrumb1 lg:py-20 md:py-14 py-10 bg-[#101212] text-white">
                <div className="container">
                    <div className="flex max-md:flex-wrap max-md:flex-col gap-y-8">
                        <div className="sidebar lg:w-1/4 md:w-1/3 w-full md:pr-12">
                            <div className="filter-type pb-8 border-b border-line">
                                <div className="heading6">Products Type</div>
                                <div className="list-type mt-4">
                                    {typeOptions.map((item) => (
                                        <div
                                            key={item}
                                            className={`item group flex items-center justify-between cursor-pointer ${type === item ? 'active' : ''}`}
                                            onClick={() => handleType(item)}
                                        >
                                            <div className={`text-secondary has-line-before group-hover:!text-white capitalize ${type === item ? '!text-white' : ''}`}>{item}</div>
                                            <div className={`text-secondary2 group-hover:!text-white ${type === item ? '!text-white' : ''}`}>
                                                ({data.filter((product) => product.type === item).length})
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="filter-size pb-8 border-b border-line mt-8">
                                <div className="heading6">Size</div>
                                <div className="list-size flex items-center flex-wrap gap-3 gap-y-4 mt-4">
                                    {
                                        sizeOptions.map((item) => (
                                            <div
                                                key={item}
                                                className={`size-item text-button w-[44px] h-[44px] flex items-center justify-center rounded-full border border-line ${size === item ? 'active' : ''}`}
                                                onClick={() => handleSize(item)}
                                            >
                                                {item}
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                            <div className="filter-price pb-8 border-b border-line mt-8">
                                <div className="heading6">Price Range</div>
                                <Slider
                                    range
                                    value={[priceRange.min, priceRange.max]}
                                    min={0}
                                    max={maxPrice}
                                    step={100}
                                    onChange={handlePriceChange}
                                    className='shop-price-slider mt-5'
                                />
                                <div className="price-block flex flex-col items-start gap-1 mt-4">
                                    <div className="min flex items-center gap-1">
                                        <div>Min price:</div>
                                        <div className='price-min'>Rs. 
                                            <span>{priceRange.min.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="min flex items-center gap-1">
                                        <div>Max price:</div>
                                        <div className='price-max'>Rs. 
                                            <span>{priceRange.max.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="filter-color pb-8 border-b border-line mt-8">
                                <div className="heading6">colors</div>
                                <div className="list-color flex items-center flex-wrap gap-3 mt-4">
                                    {colorOptions.map((item) => (
                                        <button
                                            type="button"
                                            key={item.name}
                                            title={item.name}
                                            aria-label={`Filter by ${item.name}`}
                                            className={`color-item w-8 h-8 p-1 flex items-center justify-center rounded-full border duration-200 ${color?.toLowerCase() === item.name.toLowerCase() ? 'active border-white ring-2 ring-white/40' : 'border-white/30 hover:border-white'}`}
                                            onClick={() => handleColor(item.name)}
                                        >
                                            <div
                                                className="color w-full h-full rounded-full border border-white/20"
                                                style={{ backgroundColor: item.code }}
                                            ></div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="filter-brand mt-8">
                                <div className="heading6">Brands</div>
                                <div className="list-brand mt-4">
                                    {brandOptions.map((item) => (
                                        <div key={item} className="brand-item flex items-center justify-between">
                                            <div className="left flex items-center cursor-pointer">
                                                <div className="block-input">
                                                    <input
                                                        type="checkbox"
                                                        name={item}
                                                        id={item}
                                                        checked={brand === item}
                                                        onChange={() => handleBrand(item)} />
                                                    <Icon.CheckSquare size={20} weight='fill' className='icon-checkbox' />
                                                </div>
                                                <label htmlFor={item} className="brand-name capitalize pl-2 cursor-pointer">{item}</label>
                                            </div>
                                            <div className='text-secondary2'>
                                                ({data.filter((product) => product.brand === item).length})
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="list-product-block lg:w-3/4 md:w-2/3 w-full md:pl-3">
                            <div className="relative mb-6">
                                <Icon.MagnifyingGlass
                                    size={20}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
                                />
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) => {
                                        setSearch(event.target.value)
                                        setCurrentPage(0)
                                    }}
                                    placeholder="Search products, categories, colors or sizes..."
                                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-white/15 bg-[#1b1d1d] text-white placeholder:text-white/40 focus:border-white/40"
                                />
                            </div>
                            <div className="filter-heading flex items-center justify-between gap-5 flex-wrap">
                                <div className="left flex has-line items-center flex-wrap gap-5">
                                    <div className="choose-layout flex items-center gap-2">
                                        <button
                                            type="button"
                                            aria-label="Grid view"
                                            onClick={() => {
                                                setViewMode('grid')
                                                setCurrentPage(0)
                                            }}
                                            className={`item three-col w-8 h-8 border rounded flex items-center justify-center cursor-pointer ${viewMode === 'grid' ? 'active border-white bg-[#252828]' : 'border-line'}`}
                                        >
                                            <div className='flex items-center gap-0.5'>
                                                <span className={`w-[3px] h-4 rounded-sm ${viewMode === 'grid' ? 'bg-white' : 'bg-secondary2'}`}></span>
                                                <span className={`w-[3px] h-4 rounded-sm ${viewMode === 'grid' ? 'bg-white' : 'bg-secondary2'}`}></span>
                                                <span className={`w-[3px] h-4 rounded-sm ${viewMode === 'grid' ? 'bg-white' : 'bg-secondary2'}`}></span>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            aria-label="List view"
                                            onClick={() => {
                                                setViewMode('list')
                                                setCurrentPage(0)
                                            }}
                                            className={`item row w-8 h-8 border rounded flex items-center justify-center cursor-pointer ${viewMode === 'list' ? 'active border-white bg-[#252828]' : 'border-line'}`}
                                        >
                                            <div className='flex flex-col items-center gap-0.5'>
                                                <span className={`w-4 h-[3px] rounded-sm ${viewMode === 'list' ? 'bg-white' : 'bg-secondary2'}`}></span>
                                                <span className={`w-4 h-[3px] rounded-sm ${viewMode === 'list' ? 'bg-white' : 'bg-secondary2'}`}></span>
                                                <span className={`w-4 h-[3px] rounded-sm ${viewMode === 'list' ? 'bg-white' : 'bg-secondary2'}`}></span>
                                            </div>
                                        </button>
                                    </div>
                                    <div className="check-sale flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="filterSale"
                                            id="filter-sale"
                                            className='border-line'
                                            checked={showOnlySale}
                                            onChange={handleShowOnlySale}
                                        />
                                        <label htmlFor="filter-sale" className='cation1 cursor-pointer'>Show only products on sale</label>
                                    </div>
                                </div>
                                <div className="right flex items-center gap-3">
                                    <label htmlFor='select-filter' className="caption1 capitalize">Sort by</label>
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
                                    (selectedType || selectedSize || selectedColor || selectedBrand || search || showOnlySale || priceRange.min > 0 || priceRange.max < maxPrice) && (
                                        <>
                                            <div className="list flex items-center gap-3">
                                                <div className='w-px h-4 bg-line'></div>
                                                {selectedType && (
                                                    <div className="item flex items-center px-2 py-1 gap-1 bg-[#252828] text-white border border-white/15 rounded-full capitalize" onClick={() => { setType(null) }}>
                                                        <Icon.X className='cursor-pointer' />
                                                        <span>{selectedType}</span>
                                                    </div>
                                                )}
                                                {selectedSize && (
                                                    <div className="item flex items-center px-2 py-1 gap-1 bg-[#252828] text-white border border-white/15 rounded-full capitalize" onClick={() => { setSize(null) }}>
                                                        <Icon.X className='cursor-pointer' />
                                                        <span>{selectedSize}</span>
                                                    </div>
                                                )}
                                                {selectedColor && (
                                                    <div className="item flex items-center px-2 py-1 gap-1 bg-[#252828] text-white border border-white/15 rounded-full capitalize" onClick={() => { setColor(null) }}>
                                                        <Icon.X className='cursor-pointer' />
                                                        <span>{selectedColor}</span>
                                                    </div>
                                                )}
                                                {selectedBrand && (
                                                    <div className="item flex items-center px-2 py-1 gap-1 bg-[#252828] text-white border border-white/15 rounded-full capitalize" onClick={() => { setBrand(null) }}>
                                                        <Icon.X className='cursor-pointer' />
                                                        <span>{selectedBrand}</span>
                                                    </div>
                                                )}
                                                {search && (
                                                    <div className="item flex items-center px-2 py-1 gap-1 bg-[#252828] text-white border border-white/15 rounded-full" onClick={() => setSearch('')}>
                                                        <Icon.X className='cursor-pointer' />
                                                        <span>{search}</span>
                                                    </div>
                                                )}
                                                {showOnlySale && (
                                                    <div className="item flex items-center px-2 py-1 gap-1 bg-[#252828] text-white border border-white/15 rounded-full" onClick={() => setShowOnlySale(false)}>
                                                        <Icon.X className='cursor-pointer' />
                                                        <span>On sale</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div
                                                className="clear-btn flex items-center px-2 py-1 gap-1 rounded-full border border-red cursor-pointer"
                                                onClick={handleClearAll}
                                            >
                                                <Icon.X color='rgb(219, 68, 68)' className='cursor-pointer' />
                                                <span className='text-button-uppercase text-red'>Clear All</span>
                                            </div>
                                        </>
                                    )
                                }
                            </div>

                            <div className={`list-product hide-product-sold mt-7 ${viewMode === 'grid' ? 'grid xl:grid-cols-3 lg:grid-cols-2 sm:grid-cols-2 grid-cols-2 sm:gap-[30px] gap-5' : 'flex flex-col gap-8'}`}>
                                {currentProducts.length > 0 ? (
                                    currentProducts.map((item) => (
                                        <Product key={item.id} data={item} type={viewMode} />
                                    ))
                                ) : (
                                    <div className="no-data-product py-16 text-center text-white/60 border border-white/10 rounded-2xl">
                                        No products match the selected criteria.
                                    </div>
                                )}
                            </div>

                            {pageCount > 1 && (
                                <div className="list-pagination flex items-center md:mt-10 mt-7">
                                    <HandlePagination pageCount={pageCount} onPageChange={handlePageChange} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}

export default ShopSidebarList

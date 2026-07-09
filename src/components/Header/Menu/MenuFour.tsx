'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { usePathname } from 'next/navigation';
import Product from '@/components/Product/Product';
import productData from '@/data/Product.json'
import useLoginPopup from '@/store/useLoginPopup';
import useMenuMobile from '@/store/useMenuMobile';
import { useModalCartContext } from '@/context/ModalCartContext';
import { useModalWishlistContext } from '@/context/ModalWishlistContext';
import { useModalSearchContext } from '@/context/ModalSearchContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation'

interface Props {
    props: string
}

const MenuFour: React.FC<Props> = ({ props }) => {
    const pathname = usePathname()
    const { openLoginPopup, handleLoginPopup } = useLoginPopup()
    const { openMenuMobile, handleMenuMobile } = useMenuMobile()
    const [openSubNavMobile, setOpenSubNavMobile] = useState<number | null>(null)
    const { openModalCart } = useModalCartContext()
    const { cartState } = useCart()
    const { openModalWishlist } = useModalWishlistContext()
    const { openModalSearch } = useModalSearchContext()
    const [searchKeyword, setSearchKeyword] = useState('');
    const router = useRouter()

    const handleSearch = (value: string) => {
        router.push(`/search-result?query=${value}`)
        setSearchKeyword('')
    }

    const handleOpenSubNavMobile = (index: number) => {
        setOpenSubNavMobile(openSubNavMobile === index ? null : index)
    }

    const [fixedHeader, setFixedHeader] = useState(false)
    const [lastScrollPosition, setLastScrollPosition] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setFixedHeader(scrollPosition > 0 && scrollPosition < lastScrollPosition);
            setLastScrollPosition(scrollPosition);
        };

        // Gắn sự kiện cuộn khi component được mount
        window.addEventListener('scroll', handleScroll);

        // Hủy sự kiện khi component bị unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollPosition]);

    const handleGenderClick = (gender: string) => {
        router.push(`/shop/breadcrumb1?gender=${gender}`);
    };

    const handleCategoryClick = (category: string) => {
        router.push(`/shop/breadcrumb1?category=${category}`);
    };

    const handleTypeClick = (type: string) => {
        router.push(`/shop/breadcrumb1?type=${type}`);
    };

    return (
        <>
            <div className={`header-menu style-one ${fixedHeader ? ' fixed' : 'relative'} w-full md:h-[74px] h-[56px] ${props}`}>
                <div className="container mx-auto h-full">
                    <div className="header-main flex items-center justify-between h-full">
                        <div className="menu-mobile-icon lg:hidden flex items-center" onClick={handleMenuMobile}>
                            <i className="icon-category text-2xl"></i>
                        </div>
                        <Link href={'/'} className='flex items-center lg:hidden'>
                            <div className="heading4">Anvogue</div>
                        </Link>
                        <div className="form-search relative max-lg:hidden z-[1]">
                            <Icon.MagnifyingGlass
                                size={16}
                                className='absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer'
                                onClick={() => {
                                    handleSearch(searchKeyword)
                                }}
                            />
                            <input
                                type="text"
                                placeholder='What are you looking for?'
                                className=' h-10 rounded-lg border border-line caption2 w-full pl-9 pr-4'
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchKeyword)}
                            />
                        </div>
                        <div className="menu-main h-full xl:w-full flex items-center justify-center max-lg:hidden xl:absolute xl:top-1/2 xl:left-1/2 xl:-translate-x-1/2 xl:-translate-y-1/2">
                            <ul className='flex items-center gap-8 h-full'>
                                <li className='h-full'>
                                    <Link href="#!" className='text-button-uppercase duration-300 h-full flex items-center justify-center'>
                                        Shop
                                    </Link>
                                    <div className="mega-menu absolute top-[74px] left-0 bg-white w-screen">
                                        <div className="container">
                                            <div className="flex justify-between py-8">
                                                <div className="nav-link basis-2/3 flex justify-between pr-12">
                                                    <div className="nav-item">
                                                        <div className="text-button-uppercase pb-2">Shop Features</div>
                                                        <ul>
                                                            <li>
                                                                <Link
                                                                    href={'/shop/breadcrumb-img'}
                                                                    className={`link text-secondary duration-300 ${pathname === '/shop/breadcrumb-img' ? 'active' : ''}`}
                                                                >
                                                                    Shop Breadcrumb IMG
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href={'/shop/breadcrumb1'}
                                                                    className={`link text-secondary duration-300 ${pathname === '/shop/breadcrumb1' ? 'active' : ''}`}
                                                                >
                                                                    Shop Breadcrumb 1
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href={'/shop/breadcrumb2'}
                                                                    className={`link text-secondary duration-300 ${pathname === '/shop/breadcrumb2' ? 'active' : ''}`}
                                                                >
                                                                    Shop Breadcrumb 2
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href={'/shop/collection'}
                                                                    className={`link text-secondary duration-300 ${pathname === '/shop/collection' ? 'active' : ''}`}
                                                                >
                                                                    Shop Collection
                                                                </Link>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                    <div className="nav-item">
                                                        <div className="text-button-uppercase pb-2">Shop Features</div>
                                                        <ul>
                                                            <li>
                                                                <Link
                                                                    href={'/shop/filter-canvas'}
                                                                    className={`link text-secondary duration-300 ${pathname === '/shop/filter-canvas' ? 'active' : ''}`}
                                                                >
                                                                    Shop Filter Canvas
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href={'/shop/filter-options'}
                                                                    className={`link text-secondary duration-300 ${pathname === '/shop/filter-options' ? 'active' : ''}`}
                                                                >
                                                                    Shop Filter Options
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href={'/shop/filter-dropdown'}
                                                                    className={`link text-secondary duration-300 ${pathname === '/shop/filter-dropdown' ? 'active' : ''}`}
                                                                >
                                                                    Shop Filter Dropdown
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href={'/shop/sidebar-list'}
                                                                    className={`link text-secondary duration-300 ${pathname === '/shop/sidebar-list' ? 'active' : ''}`}
                                                                >
                                                                    Shop Sidebar List
                                                                </Link>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                    <div className="nav-item">
                                                        <div className="text-button-uppercase pb-2">Shop Layout</div>
                                                        <ul>
                                                            <li>
                                                                <Link
                                                                    href={'/shop/default'}
                                                                    className={`link text-secondary duration-300 cursor-pointer ${pathname === '/shop/default' ? 'active' : ''}`}
                                                                >
                                                                    Shop Default
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href={'/shop/default-grid'}
                                                                    className={`link text-secondary duration-300 cursor-pointer ${pathname === '/shop/default-grid' ? 'active' : ''}`}
                                                                >
                                                                    Shop Default Grid
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href={'/shop/default-list'}
                                                                    className={`link text-secondary duration-300 cursor-pointer ${pathname === '/shop/default-list' ? 'active' : ''}`}
                                                                >
                                                                    Shop Default List
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href={'/shop/fullwidth'}
                                                                    className={`link text-secondary duration-300 cursor-pointer ${pathname === '/shop/fullwidth' ? 'active' : ''}`}
                                                                >
                                                                    Shop Full Width
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href={'/shop/square'}
                                                                    className={`link text-secondary duration-300 ${pathname === '/shop/square' ? 'active' : ''}`}
                                                                >
                                                                    Shop Square
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href={'/checkout'}
                                                                    className={`link text-secondary duration-300 ${pathname === '/checkout' ? 'active' : ''}`}
                                                                >
                                                                    Checkout
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href={'/checkout2'}
                                                                    className={`link text-secondary duration-300 ${pathname === '/checkout2' ? 'active' : ''}`}
                                                                >
                                                                    Checkout Style 2
                                                                </Link>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                    <div className="nav-item">
                                                        <div className="text-button-uppercase pb-2">Products Pages</div>
                                                        <ul>
                                                            <li>
                                                                <Link
                                                                    href={'/wishlist'}
                                                                    className={`link text-secondary duration-300 ${pathname === '/wishlist' ? 'active' : ''}`}
                                                                >
                                                                    Wish List
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href={'/search-result'}
                                                                    className={`link text-secondary duration-300 ${pathname === '/search-result' ? 'active' : ''}`}
                                                                >
                                                                    Search Result
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href={'/cart'}
                                                                    className={`link text-secondary duration-300 ${pathname === '/cart' ? 'active' : ''}`}
                                                                >
                                                                    Shopping Cart
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href={'/login'}
                                                                    className={`link text-secondary duration-300 ${pathname === '/login' ? 'active' : ''}`}
                                                                >
                                                                    Login/Register
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href={'/forgot-password'}
                                                                    className={`link text-secondary duration-300 ${pathname === '/forgot-password' ? 'active' : ''}`}
                                                                >
                                                                    Forgot Password
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href={'/track-order'}
                                                                    className={`link text-secondary duration-300 ${pathname === '/track-order' ? 'active' : ''}`}
                                                                >
                                                                    Order Tracking
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href={'/my-account'}
                                                                    className={`link text-secondary duration-300 ${pathname === '/my-account' ? 'active' : ''}`}
                                                                >
                                                                    My Account
                                                                </Link>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                                <div className="recent-product pl-2.5 basis-1/3">
                                                    <div className="text-button-uppercase pb-2">Recent Products</div>
                                                    <div className="list-product hide-product-sold  grid grid-cols-2 gap-5 mt-3">
                                                        {productData.filter(item => item.action === 'add to cart').slice(0, 2).map((prd, index) => (
                                                            <Product key={index} data={prd} type='grid' style='style-1' />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                <li className='h-full flex items-center justify-center logo'>
                                    <Link href={'/'} className='heading4'>
                                        Anvogue
                                    </Link>
                                </li>
                                <li className='h-full relative'>
                                    <Link href="#!" className='text-button-uppercase duration-300 h-full flex items-center justify-center'>
                                        Blog
                                    </Link>
                                    <div className="sub-menu py-3 px-5 -left-10 absolute bg-white rounded-b-xl">
                                        <ul className='w-full'>
                                            <li>
                                                <Link href="/blog/default" className={`text-secondary duration-300 ${pathname === '/blog/default' ? 'active' : ''}`}>
                                                    Blog Default
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/blog/list" className={`text-secondary duration-300 ${pathname === '/blog/list' ? 'active' : ''}`}>
                                                    Blog List
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/blog/grid" className={`text-secondary duration-300 ${pathname === '/blog/grid' ? 'active' : ''}`}>
                                                    Blog Grid
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/blog/detail1" className={`text-secondary duration-300 ${pathname === '/blog/detail1' ? 'active' : ''}`}>
                                                    Blog Detail 1
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/blog/detail2" className={`text-secondary duration-300 ${pathname === '/blog/detail2' ? 'active' : ''}`}>
                                                    Blog Detail 2
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </li>
                                <li className='h-full relative'>
                                    <Link href="#!" className='text-button-uppercase duration-300 h-full flex items-center justify-center'>
                                        Pages
                                    </Link>
                                    <div className="sub-menu py-3 px-5 -left-10 absolute bg-white rounded-b-xl">
                                        <ul className='w-full'>
                                            <li>
                                                <Link href="/pages/about" className={`text-secondary duration-300 ${pathname === '/pages/about' ? 'active' : ''}`}>
                                                    About Us
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/pages/contact" className={`text-secondary duration-300 ${pathname === '/pages/contact' ? 'active' : ''}`}>
                                                    Contact Us
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/pages/store-list" className={`text-secondary duration-300 ${pathname === '/pages/store-list' ? 'active' : ''}`}>
                                                    Store List
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/pages/page-not-found" className={`text-secondary duration-300 ${pathname === '/pages/page-not-found' ? 'active' : ''}`}>
                                                    404
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/pages/faqs" className={`text-secondary duration-300 ${pathname === '/pages/faqs' ? 'active' : ''}`}>
                                                    FAQs
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/pages/coming-soon" className={`text-secondary duration-300 ${pathname === '/pages/coming-soon' ? 'active' : ''}`}>
                                                    Coming Soon
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/pages/customer-feedbacks" className={`text-secondary duration-300 ${pathname === '/pages/customer-feedbacks' ? 'active' : ''}`}>
                                                    Customer Feedbacks
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="right flex gap-12 z-[1]">
                            <div className="list-action flex items-center gap-4">
                                <div className="user-icon flex items-center justify-center cursor-pointer">
                                    <Icon.User size={24} color='black' onClick={handleLoginPopup} />
                                    <div
                                        className={`login-popup absolute top-[74px] w-[320px] p-7 rounded-xl bg-white box-shadow-sm 
                                            ${openLoginPopup ? 'open' : ''}`}
                                    >
                                        <Link href={'/login'} className="button-main w-full text-center">Login</Link>
                                        <div className="text-secondary text-center mt-3 pb-4">Don’t have an account?
                                            <Link href={'/register'} className='text-black pl-1 hover:underline'>Register</Link>
                                        </div>
                                        <Link href={'/my-account'} className="button-main bg-white text-black border border-black w-full text-center">Dashboard</Link>
                                        <div className="bottom mt-4 pt-4 border-t border-line"></div>
                                        <Link href={'#!'} className='body1 hover:underline'>Support</Link>
                                    </div>
                                </div>
                                <div className="max-md:hidden wishlist-icon flex items-center cursor-pointer" onClick={openModalWishlist}>
                                    <Icon.Heart size={24} color='black' />
                                </div>
                                <div className="cart-icon flex items-center relative cursor-pointer" onClick={openModalCart}>
                                    <Icon.Handbag size={24} color='black' />
                                    <span className="quantity cart-quantity absolute -right-1.5 -top-1.5 text-xs text-white bg-black w-4 h-4 flex items-center justify-center rounded-full">{cartState.cartArray.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="menu-mobile" className={`${openMenuMobile ? 'open' : ''}`}>
                <div className="menu-container bg-white h-full">
                    <div className="container h-full">
                        <div className="menu-main h-full overflow-hidden">
                            <div className="heading py-2 relative flex items-center justify-center">
                                <div
                                    className="close-menu-mobile-btn absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface flex items-center justify-center"
                                    onClick={handleMenuMobile}
                                >
                                    <Icon.X size={14} />
                                </div>
                                <Link href={'/'} className='logo text-3xl font-semibold text-center'>Anvogue</Link>
                            </div>
                            <div className="form-search relative mt-2">
                                <Icon.MagnifyingGlass size={20} className='absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer' />
                                <input type="text" placeholder='What are you looking for?' className=' h-12 rounded-lg border border-line text-sm w-full pl-10 pr-4' />
                            </div>
                            <div className="list-nav mt-6">
                                <ul>
                                    <li
                                        className={`${openSubNavMobile === 3 ? 'open' : ''}`}
                                        onClick={() => handleOpenSubNavMobile(3)}
                                    >
                                        <a href={'#!'} className='text-xl font-semibold flex items-center justify-between mt-5'>Shop
                                            <span className='text-right'>
                                                <Icon.CaretRight size={20} />
                                            </span>
                                        </a>
                                        <div className="sub-nav-mobile">
                                            <div
                                                className="back-btn flex items-center gap-3"
                                                onClick={() => handleOpenSubNavMobile(3)}
                                            >
                                                <Icon.CaretLeft />
                                                Back
                                            </div>
                                            <div className="list-nav-item w-full pt-3 pb-12">
                                                <div className="">
                                                    <div className="nav-link grid grid-cols-2 gap-5 gap-y-6 justify-between">
                                                        <div className="nav-item">
                                                            <div className="text-button-uppercase pb-1">Shop Features</div>
                                                            <ul>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/breadcrumb-img'}
                                                                        className={`text-secondary duration-300 ${pathname === '/shop/breadcrumb-img' ? 'active' : ''}`}
                                                                    >
                                                                        Shop Breadcrumb IMG
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/breadcrumb1'}
                                                                        className={`text-secondary duration-300 ${pathname === '/shop/breadcrumb1' ? 'active' : ''}`}
                                                                    >
                                                                        Shop Breadcrumb 1
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/breadcrumb2'}
                                                                        className={`text-secondary duration-300 ${pathname === '/shop/breadcrumb2' ? 'active' : ''}`}
                                                                    >
                                                                        Shop Breadcrumb 2
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/collection'}
                                                                        className={`text-secondary duration-300 ${pathname === '/shop/collection' ? 'active' : ''}`}
                                                                    >
                                                                        Shop Collection
                                                                    </Link>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <div className="nav-item">
                                                            <div className="text-button-uppercase pb-1">Shop Features</div>
                                                            <ul>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/filter-canvas'}
                                                                        className={`text-secondary duration-300 ${pathname === '/shop/filter-canvas' ? 'active' : ''}`}
                                                                    >
                                                                        Shop Filter Canvas
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/filter-options'}
                                                                        className={`text-secondary duration-300 ${pathname === '/shop/filter-options' ? 'active' : ''}`}
                                                                    >
                                                                        Shop Filter Options
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/filter-dropdown'}
                                                                        className={`text-secondary duration-300 ${pathname === '/shop/filter-dropdown' ? 'active' : ''}`}
                                                                    >
                                                                        Shop Filter Dropdown
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/sidebar-list'}
                                                                        className={`text-secondary duration-300 ${pathname === '/shop/sidebar-list' ? 'active' : ''}`}
                                                                    >
                                                                        Shop Sidebar List
                                                                    </Link>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <div className="nav-item">
                                                            <div className="text-button-uppercase pb-1">Shop Layout</div>
                                                            <ul>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/default'}
                                                                        className={`link text-secondary duration-300 cursor-pointer ${pathname === '/shop/default' ? 'active' : ''}`}
                                                                    >
                                                                        Shop Default
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/default-grid'}
                                                                        className={`link text-secondary duration-300 cursor-pointer ${pathname === '/shop/default-grid' ? 'active' : ''}`}
                                                                    >
                                                                        Shop Default Grid
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/default-list'}
                                                                        className={`link text-secondary duration-300 cursor-pointer ${pathname === '/shop/default-list' ? 'active' : ''}`}
                                                                    >
                                                                        Shop Default List
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/fullwidth'}
                                                                        className={`link text-secondary duration-300 cursor-pointer ${pathname === '/shop/fullwidth' ? 'active' : ''}`}
                                                                    >
                                                                        Shop Full Width
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/square'}
                                                                        className={`link text-secondary duration-300 ${pathname === '/shop/square' ? 'active' : ''}`}
                                                                    >
                                                                        Shop Square
                                                                    </Link>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <div className="nav-item">
                                                            <div className="text-button-uppercase pb-1">Products Pages</div>
                                                            <ul>
                                                                <li>
                                                                    <Link
                                                                        href={'/wishlist'}
                                                                        className={`text-secondary duration-300 ${pathname === '/wishlist' ? 'active' : ''}`}
                                                                    >
                                                                        Wish List
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/search-result'}
                                                                        className={`text-secondary duration-300 ${pathname === '/search-result' ? 'active' : ''}`}
                                                                    >
                                                                        Search Result
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/cart'}
                                                                        className={`text-secondary duration-300 ${pathname === '/cart' ? 'active' : ''}`}
                                                                    >
                                                                        Shopping Cart
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/login'}
                                                                        className={`text-secondary duration-300 ${pathname === '/login' ? 'active' : ''}`}
                                                                    >
                                                                        Login/Register
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/forgot-password'}
                                                                        className={`text-secondary duration-300 ${pathname === '/forgot-password' ? 'active' : ''}`}
                                                                    >
                                                                        Forgot Password
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/track-order'}
                                                                        className={`text-secondary duration-300 ${pathname === '/track-order' ? 'active' : ''}`}
                                                                    >
                                                                        Order Tracking
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/my-account'}
                                                                        className={`text-secondary duration-300 ${pathname === '/my-account' ? 'active' : ''}`}
                                                                    >
                                                                        My Account
                                                                    </Link>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <div className="recent-product pt-3">
                                                        <div className="text-button-uppercase pb-1">Recent Products</div>
                                                        <div className="list-product hide-product-sold  grid grid-cols-2 gap-5 mt-3">
                                                            {productData.slice(0, 2).map((prd, index) => (
                                                                <Product key={index} data={prd} type='grid' style='style-1' />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li
                                        className={`${openSubNavMobile === 5 ? 'open' : ''}`}
                                        onClick={() => handleOpenSubNavMobile(5)}
                                    >
                                        <a href={'#!'} className='text-xl font-semibold flex items-center justify-between mt-5'>Blog
                                            <span className='text-right'>
                                                <Icon.CaretRight size={20} />
                                            </span>
                                        </a>
                                        <div className="sub-nav-mobile">
                                            <div
                                                className="back-btn flex items-center gap-3"
                                                onClick={() => handleOpenSubNavMobile(5)}
                                            >
                                                <Icon.CaretLeft />
                                                Back
                                            </div>
                                            <div className="list-nav-item w-full pt-2 pb-6">
                                                <ul className='w-full'>
                                                    <li>
                                                        <Link href="/blog/default" className={`text-secondary duration-300 ${pathname === '/blog/default' ? 'active' : ''}`}>
                                                            Blog Default
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/blog/list" className={`text-secondary duration-300 ${pathname === '/blog/list' ? 'active' : ''}`}>
                                                            Blog List
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/blog/grid" className={`text-secondary duration-300 ${pathname === '/blog/grid' ? 'active' : ''}`}>
                                                            Blog Grid
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/blog/detail1" className={`text-secondary duration-300 ${pathname === '/blog/detail1' ? 'active' : ''}`}>
                                                            Blog Detail 1
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/blog/detail2" className={`text-secondary duration-300 ${pathname === '/blog/detail2' ? 'active' : ''}`}>
                                                            Blog Detail 2
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </li>
                                    <li
                                        className={`${openSubNavMobile === 6 ? 'open' : ''}`}
                                        onClick={() => handleOpenSubNavMobile(6)}
                                    >
                                        <a href={'#!'} className='text-xl font-semibold flex items-center justify-between mt-5'>Pages
                                            <span className='text-right'>
                                                <Icon.CaretRight size={20} />
                                            </span>
                                        </a>
                                        <div className="sub-nav-mobile">
                                            <div
                                                className="back-btn flex items-center gap-3"
                                                onClick={() => handleOpenSubNavMobile(6)}
                                            >
                                                <Icon.CaretLeft />
                                                Back
                                            </div>
                                            <div className="list-nav-item w-full pt-2 pb-6">
                                                <ul className='w-full'>
                                                    <li>
                                                        <Link href="/pages/about" className={`text-secondary duration-300 ${pathname === '/pages/about' ? 'active' : ''}`}>
                                                            About Us
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/pages/contact" className={`text-secondary duration-300 ${pathname === '/pages/contact' ? 'active' : ''}`}>
                                                            Contact Us
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/pages/store-list" className={`text-secondary duration-300 ${pathname === '/pages/store-list' ? 'active' : ''}`}>
                                                            Store List
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/pages/page-not-found" className={`text-secondary duration-300 ${pathname === '/pages/page-not-found' ? 'active' : ''}`}>
                                                            404
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/pages/faqs" className={`text-secondary duration-300 ${pathname === '/pages/faqs' ? 'active' : ''}`}>
                                                            FAQs
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/pages/coming-soon" className={`text-secondary duration-300 ${pathname === '/pages/coming-soon' ? 'active' : ''}`}>
                                                            Coming Soon
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/pages/customer-feedbacks" className={`text-secondary duration-300 ${pathname === '/pages/customer-feedbacks' ? 'active' : ''}`}>
                                                            Customer Feedbacks
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default MenuFour
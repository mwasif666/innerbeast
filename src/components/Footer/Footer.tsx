import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import * as Icon from "@phosphor-icons/react/dist/ssr";

const Footer = () => {
    return (
        <>
            <div id="footer" className='footer'>
                <div className="footer-main bg-[#0e0e0e] text-white relative overflow-hidden">
                    {/* soft glows */}
                    <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.05] blur-[120px]"></div>
                    <div className="pointer-events-none absolute bottom-0 -right-32 w-96 h-96 rounded-full bg-white/[0.03] blur-3xl"></div>

                    <div className="container relative z-[1]">
                        {/* ===== Newsletter CTA band ===== */}
                        <div className="footer-cta py-12 border-b border-white/10 flex items-center justify-between gap-8 flex-wrap">
                            <div className="cta-text max-md:basis-full">
                                <h2 className="heading4 text-white">Join the Innerbeast pack</h2>
                                <div className="caption1 text-white/55 mt-2">Sign up for our newsletter and get 10% off your first purchase.</div>
                            </div>
                            <form className='cta-form relative w-full max-w-[440px] h-[54px]' action="post">
                                <input type="email" placeholder='Enter your e-mail' className='caption1 w-full h-full pl-5 pr-16 rounded-full bg-white/5 border border-white/15 text-white placeholder:text-white/40 focus:border-white/50 outline-none duration-300' required />
                                <button className='w-[46px] h-[46px] bg-white hover:bg-white/90 flex items-center justify-center rounded-full absolute top-1 right-1 duration-300'>
                                    <Icon.ArrowRight size={22} color='#000' />
                                </button>
                            </form>
                        </div>

                        {/* ===== Main grid ===== */}
                        <div className="content-footer py-[60px] grid grid-cols-12 gap-y-10 gap-x-8 max-lg:gap-x-6">
                            {/* Brand column */}
                            <div className="company-infor col-span-4 max-lg:col-span-12 pr-7 max-lg:pr-0">
                                <Link href={'/'} className="logo inline-block">
                                    <Image
                                        src={'/footer-logo.png'}
                                        width={180}
                                        height={52}
                                        alt='Innerbeast'
                                        className='w-auto h-12 object-contain'
                                    />
                                </Link>
                                <div className="caption1 text-white/55 mt-5 max-w-[320px]">
                                    Premium essentials built to move with you. Unleash your inner beast.
                                </div>
                                <div className='flex flex-col gap-3 mt-6'>
                                    <div className="flex items-center gap-3 text-white/80">
                                        <Icon.Envelope size={18} className='text-white/40' />
                                        <span>hi.avitex@gmail.com</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/80">
                                        <Icon.Phone size={18} className='text-white/40' />
                                        <span>1-333-345-6868</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/80">
                                        <Icon.MapPin size={18} className='text-white/40' />
                                        <span>549 Oak St. Crystal Lake, IL 60014</span>
                                    </div>
                                </div>
                            </div>

                            {/* Link columns */}
                            <div className="item flex flex-col col-span-2 max-md:col-span-6">
                                <div className="text-button-uppercase pb-4 text-white">Infomation</div>
                                <Link className='caption1 text-white/55 hover:text-white hover:translate-x-1 duration-300 w-fit' href={'/pages/contact'}>Contact us</Link>
                                <Link className='caption1 text-white/55 hover:text-white hover:translate-x-1 duration-300 w-fit pt-2.5' href={'#!'}>Career</Link>
                                <Link className='caption1 text-white/55 hover:text-white hover:translate-x-1 duration-300 w-fit pt-2.5' href={'/my-account'}>My Account</Link>
                                <Link className='caption1 text-white/55 hover:text-white hover:translate-x-1 duration-300 w-fit pt-2.5' href={'/order-tracking'}>Order &amp; Returns</Link>
                                <Link className='caption1 text-white/55 hover:text-white hover:translate-x-1 duration-300 w-fit pt-2.5' href={'/pages/faqs'}>FAQs</Link>
                            </div>
                            <div className="item flex flex-col col-span-2 max-md:col-span-6">
                                <div className="text-button-uppercase pb-4 text-white">Quick Shop</div>
                                <Link className='caption1 text-white/55 hover:text-white hover:translate-x-1 duration-300 w-fit' href={'/shop/breadcrumb1'}>Women</Link>
                                <Link className='caption1 text-white/55 hover:text-white hover:translate-x-1 duration-300 w-fit pt-2.5' href={'/shop/breadcrumb1'}>Men</Link>
                                <Link className='caption1 text-white/55 hover:text-white hover:translate-x-1 duration-300 w-fit pt-2.5' href={'/shop/breadcrumb1'}>Clothes</Link>
                                <Link className='caption1 text-white/55 hover:text-white hover:translate-x-1 duration-300 w-fit pt-2.5' href={'/shop/breadcrumb1'}>Accessories</Link>
                                <Link className='caption1 text-white/55 hover:text-white hover:translate-x-1 duration-300 w-fit pt-2.5' href={'/blog'}>Blog</Link>
                            </div>
                            <div className="item flex flex-col col-span-2 max-md:col-span-6">
                                <div className="text-button-uppercase pb-4 text-white">Services</div>
                                <Link className='caption1 text-white/55 hover:text-white hover:translate-x-1 duration-300 w-fit' href={'/pages/faqs'}>Orders FAQs</Link>
                                <Link className='caption1 text-white/55 hover:text-white hover:translate-x-1 duration-300 w-fit pt-2.5' href={'/pages/faqs'}>Shipping</Link>
                                <Link className='caption1 text-white/55 hover:text-white hover:translate-x-1 duration-300 w-fit pt-2.5' href={'/pages/faqs'}>Privacy Policy</Link>
                                <Link className='caption1 text-white/55 hover:text-white hover:translate-x-1 duration-300 w-fit pt-2.5' href={'/order-tracking'}>Return &amp; Refund</Link>
                            </div>

                            {/* Socials column */}
                            <div className="item flex flex-col col-span-2 max-md:col-span-6">
                                <div className="text-button-uppercase pb-4 text-white">Follow us</div>
                                <div className="list-social flex flex-wrap items-center gap-3">
                                    <Link href={'https://www.facebook.com/'} target='_blank' className='w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black duration-300'>
                                        <div className="icon-facebook text-xl"></div>
                                    </Link>
                                    <Link href={'https://www.instagram.com/'} target='_blank' className='w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black duration-300'>
                                        <div className="icon-instagram text-xl"></div>
                                    </Link>
                                    <Link href={'https://www.twitter.com/'} target='_blank' className='w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black duration-300'>
                                        <div className="icon-twitter text-xl"></div>
                                    </Link>
                                    <Link href={'https://www.youtube.com/'} target='_blank' className='w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black duration-300'>
                                        <div className="icon-youtube text-xl"></div>
                                    </Link>
                                    <Link href={'https://www.pinterest.com/'} target='_blank' className='w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black duration-300'>
                                        <div className="icon-pinterest text-xl"></div>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* ===== Bottom bar ===== */}
                        <div className="footer-bottom py-6 flex items-center justify-between gap-5 max-lg:justify-center max-lg:flex-col border-t border-white/10">
                            <div className="left flex items-center gap-8 max-md:flex-col max-md:gap-3">
                                <div className="copyright caption1 text-white/50">©2026 Innerbeast. All Rights Reserved.</div>
                                <div className="select-block flex items-center gap-5 max-md:hidden">
                                    <div className="choose-language flex items-center gap-1.5">
                                        <select name="language" id="chooseLanguageFooter" className='caption2 bg-transparent text-white/70 [&>option]:text-black'>
                                            <option value="English">English</option>
                                            <option value="Espana">Espana</option>
                                            <option value="France">France</option>
                                        </select>
                                        <Icon.CaretDown size={12} color='#ffffff' />
                                    </div>
                                    <div className="choose-currency flex items-center gap-1.5">
                                        <select name="currency" id="chooseCurrencyFooter" className='caption2 bg-transparent text-white/70 [&>option]:text-black'>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                        </select>
                                        <Icon.CaretDown size={12} color='#ffffff' />
                                    </div>
                                </div>
                            </div>
                            <div className="right flex items-center gap-2">
                                <div className="caption1 text-white/50">Payment:</div>
                                {[0, 1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="payment-img bg-white rounded p-0.5">
                                        <Image
                                            src={`/images/payment/Frame-${i}.png`}
                                            width={500}
                                            height={500}
                                            alt={'payment'}
                                            className='w-9'
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Footer

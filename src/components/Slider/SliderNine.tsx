'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import * as Icon from '@phosphor-icons/react/dist/ssr'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css/bundle'

const slides = [
    {
        lineOne: 'Unleash The',
        lineTwo: 'Inner',
        accent: 'Beast.',
        description: 'Premium gymwear crafted for those who refuse to be average.',
    },
    {
        lineOne: 'Train Beyond',
        lineTwo: 'Your',
        accent: 'Limits.',
        description: 'Performance essentials engineered to move when you do.',
    },
    {
        lineOne: 'Own The',
        lineTwo: 'New',
        accent: 'Season.',
        description: 'Built for the work. Designed for everything after it.',
    },
]

const benefits = [
    { icon: Icon.Truck, title: 'Free Shipping', text: 'On orders over $75' },
    { icon: Icon.ShieldCheck, title: 'Secure Payment', text: '100% secure checkout' },
    { icon: Icon.ArrowClockwise, title: 'Easy Returns', text: '30 day return policy' },
    { icon: Icon.Headphones, title: '24/7 Support', text: "We're here to help" },
]

const SliderNine = () => {
    return (
        <section className="hero-beast w-full bg-[#090a0a] text-white">
            <div className="hero-stage relative overflow-hidden xl:h-[600px] lg:h-[540px] md:h-[500px] h-[570px]">
                <Image
                    src="/images/banner/banner.png"
                    fill
                    priority
                    alt="A powerful lion emerging through smoke"
                    className="object-cover object-[66%_center] md:object-center select-none pointer-events-none"
                />
                <div className="hero-overlay absolute inset-0" />

                <Swiper
                    loop
                    navigation
                    pagination={{
                        clickable: true,
                        renderBullet: (index, className) => `<span class="${className}">0${index + 1}</span>`,
                    }}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    modules={[Autoplay, Navigation, Pagination]}
                    className="hero-slider relative z-[1] h-full"
                >
                    {slides.map((slide) => (
                        <SwiperSlide key={slide.accent}>
                            <div className="flex h-full w-full items-center px-[7.5%]">
                                <div className="hero-copy max-w-[510px]">
                                    <h1 className="hero-title" aria-label={`${slide.lineOne} ${slide.lineTwo} ${slide.accent}`}>
                                        <span>{slide.lineOne}</span>
                                        <span>
                                            {slide.lineTwo}{' '}
                                            <span className="text-[var(--orange)]">{slide.accent}</span>
                                        </span>
                                    </h1>
                                    <p className="hero-description mt-3 max-w-[285px] text-sm leading-5 text-white/80 md:text-base md:leading-6">
                                        {slide.description}
                                    </p>
                                    <div className="mt-6 flex flex-wrap gap-3 md:mt-7">
                                        <Link href="/shop/breadcrumb-img" className="hero-btn hero-btn-primary">Shop Now</Link>
                                        <Link href="/shop/collection" className="hero-btn hero-btn-outline">New Collection</Link>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                <div className="hero-kicker absolute bottom-8 right-[6%] z-[2] hidden text-right uppercase md:block">
                    <span className="block text-sm font-bold tracking-[0.14em] text-white/80">Discipline. Strength.</span>
                    <span className="block text-sm font-extrabold tracking-[0.16em] text-[var(--orange)]">Focus. Results.</span>
                </div>
            </div>

            <div className="hero-benefits border-t border-white/20 bg-[#090a0a]">
                <div className="container mx-auto grid grid-cols-2 lg:grid-cols-4">
                    {benefits.map(({ icon: BenefitIcon, title, text }) => (
                        <div key={title} className="hero-benefit flex min-h-[86px] items-center gap-4 px-3 py-4 md:px-6">
                            <BenefitIcon size={32} weight="light" className="shrink-0 text-white" />
                            <div>
                                <div className="text-xs font-bold uppercase tracking-[0.08em] text-white md:text-sm">{title}</div>
                                <div className="mt-0.5 text-[11px] leading-4 text-white/60 md:text-xs">{text}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default SliderNine

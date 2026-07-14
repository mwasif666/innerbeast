'use client'

import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css/bundle';

const brands = [
    'NIKE',
    'ADIDAS',
    'PUMA',
    'REEBOK',
    'UNDER ARMOUR',
    'NEW BALANCE',
    'CHAMPION',
    'FILA',
]

const Brand = () => {
    return (
        <>
            <div className="brand-block md:py-[60px] py-[32px] border-y border-line">
                <div className="container">
                    <div className="text-center text-button-uppercase text-secondary pb-8 tracking-[0.25em]">
                        Trusted by leading brands
                    </div>
                    <div className="list-brand">
                        <Swiper
                            spaceBetween={12}
                            slidesPerView={2}
                            loop={true}
                            modules={[Autoplay]}
                            autoplay={{
                                delay: 2500,
                                disableOnInteraction: false,
                            }}
                            speed={900}
                            breakpoints={{
                                500: {
                                    slidesPerView: 3,
                                    spaceBetween: 16,
                                },
                                680: {
                                    slidesPerView: 4,
                                    spaceBetween: 16,
                                },
                                992: {
                                    slidesPerView: 5,
                                    spaceBetween: 16,
                                },
                                1200: {
                                    slidesPerView: 6,
                                    spaceBetween: 16,
                                },
                            }}
                        >
                            {brands.map((brand) => (
                                <SwiperSlide key={brand}>
                                    <div className="brand-item flex items-center justify-center h-[44px]">
                                        <span className="text-xl md:text-2xl font-bold tracking-wider text-secondary/60 hover:text-black duration-300 whitespace-nowrap select-none">
                                            {brand}
                                        </span>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Brand

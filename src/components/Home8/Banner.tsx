import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Banner = () => {
    return (
        <>
            <div className="banner-block style-one md:pt-20 pt-10">
                <div className="container grid sm:grid-cols-2 gap-5">
                    <Link href={'/shop/sidebar-list'} className="banner-item relative block overflow-hidden rounded-2xl duration-500 aspect-[3/2]">
                        <Image
                            src={'/images/banner/8.png'}
                            fill
                            sizes="(max-width: 640px) 100vw, 50vw"
                            alt='banner1'
                            className='object-cover object-center duration-1000 hover:scale-105'
                        />
                        <div className="absolute inset-0 bg-black/30"></div>
                        <div className="banner-content absolute inset-0 flex flex-col items-center justify-center">
                            <div className="heading4 text-white text-center">Women{String.raw`'s`} Activewear <br />Collection</div>
                            <div className="text-button text-white relative inline-block pb-1 border-b-2 border-white duration-500 mt-2">Shop Now</div>
                        </div>
                    </Link>
                    <Link href={'/shop/sidebar-list'} className="banner-item relative block overflow-hidden rounded-2xl duration-500 aspect-[3/2]">
                        <Image
                            src={'/images/banner/9.png'}
                            fill
                            sizes="(max-width: 640px) 100vw, 50vw"
                            alt='banner2'
                            className='object-cover object-center duration-1000 hover:scale-105'
                        />
                        <div className="absolute inset-0 bg-black/30"></div>
                        <div className="banner-content absolute inset-0 flex flex-col items-center justify-center">
                            <div className="heading4 text-white text-center">Men{String.raw`'s`} Performance <br />Gear</div>
                            <div className="text-button text-white relative inline-block pb-1 border-b-2 border-white duration-500 mt-2">Shop Now</div>
                        </div>
                    </Link>
                </div>
            </div>
        </>
    )
}

export default Banner

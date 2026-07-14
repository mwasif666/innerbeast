'use client'

import React from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation } from 'swiper/modules'
import 'swiper/css/bundle'
import { useRouter } from 'next/navigation'

import { Category } from '@/services/product.service'
import { ProductType } from '@/type/ProductType'

interface Props {
    categories: Category[]
    products: ProductType[]
}

const Collection: React.FC<Props> = ({ categories, products }) => {
    const router = useRouter()

    const handleCategoryClick = (slug: string) => {
        router.push(`/shop?type=${slug}`)
    }

    const getCategoryImage = (category: Category) => {
        if (category.image?.url) return category.image.url

        return products.find((product) => product.type === category.slug)
            ?.thumbImage[0]
    }

    const visibleCategories = categories.filter(
        (category) => category.isActive !== false && getCategoryImage(category),
    )

    if (visibleCategories.length === 0) return null

    return (
        <div className="collection-block md:pt-20 pt-10">
            <div className="container">
                <div className="heading3 text-center">Explore Collections</div>
            </div>

            <div className="list-collection section-swiper-navigation md:mt-10 mt-6 sm:px-5 px-4">
                <Swiper
                    spaceBetween={12}
                    slidesPerView={2}
                    navigation
                    loop={visibleCategories.length > 4}
                    modules={[Navigation, Autoplay]}
                    breakpoints={{
                        576: { slidesPerView: 2, spaceBetween: 12 },
                        768: { slidesPerView: 3, spaceBetween: 20 },
                        1200: { slidesPerView: 4, spaceBetween: 20 },
                    }}
                    className="h-full"
                >
                    {visibleCategories.map((category) => {
                        const imageUrl = getCategoryImage(category)

                        return (
                            <SwiperSlide key={category._id}>
                                <div
                                    className="collection-item block relative rounded-2xl overflow-hidden cursor-pointer"
                                    onClick={() => handleCategoryClick(category.slug)}
                                >
                                    <div className="bg-img">
                                        <Image
                                            src={imageUrl!}
                                            width={1000}
                                            height={600}
                                            alt={category.name}
                                            className="w-full aspect-[5/3] object-cover"
                                        />
                                    </div>
                                    <div
                                        title={category.name}
                                        className="collection-name heading5 text-center sm:bottom-8 bottom-4 lg:w-[220px] md:w-[180px] w-[120px] md:py-3 py-1.5 px-3 bg-white rounded-xl duration-500 truncate"
                                    >
                                        {category.name}
                                    </div>
                                </div>
                            </SwiperSlide>
                        )
                    })}
                </Swiper>
            </div>
        </div>
    )
}

export default Collection

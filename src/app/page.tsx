import React from 'react'
import TopNavThree from '@/components/Header/TopNav/TopNavThree'
import MenuTwo from '@/components/Header/Menu/MenuTwo'
import BannerTop from '@/components/Home3/BannerTop'
import SliderNine from '@/components/Slider/SliderNine'
import WhatNewOne from '@/components/Home1/WhatNewOne'
import Collection from '@/components/Home1/Collection'
import TabFeatures from '@/components/Home1/TabFeatures'
import Banner from '@/components/Home8/Banner'
import Benefit from '@/components/Home1/Benefit'
import testimonialData from '@/data/Testimonial.json'
import Testimonial from '@/components/Home1/Testimonial'
import Instagram from '@/components/Home1/Instagram'
import Brand from '@/components/Home1/Brand'
import Footer from '@/components/Footer/Footer'
import {
  ApiListResponse,
  Category,
  Product as ApiProduct,
} from '@/services/product.service'
import { toStorefrontProduct } from '@/utils/productAdapter'

export const dynamic = 'force-dynamic'

const getHomepageData = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL is missing')

  const [productsResponse, categoriesResponse] = await Promise.all([
    fetch(`${apiUrl}/products?limit=40&sort=newest&isActive=true`, {
      cache: 'no-store',
    }),
    fetch(`${apiUrl}/categories?limit=100`, { cache: 'no-store' }),
  ])

  if (!productsResponse.ok || !categoriesResponse.ok) {
    throw new Error('Unable to load homepage catalogue')
  }

  return {
    products: (await productsResponse.json()) as ApiListResponse<ApiProduct>,
    categories: (await categoriesResponse.json()) as ApiListResponse<Category>,
  }
}

export default async function Home() {
  const homepageData = await getHomepageData()
  const products = homepageData.products.data
    .filter((product) => product.isActive !== false)
    .map(toStorefrontProduct)
  const categories = homepageData.categories.data
    .filter((category) => category.isActive !== false)
    .sort((first, second) =>
      (first.sortOrder || 0) - (second.sortOrder || 0) ||
      first.name.localeCompare(second.name),
    )

  return (
    <>
      <TopNavThree props="style-three bg-white" />
      <div id="header" className='relative w-full style-nine'>
        <MenuTwo />
        <BannerTop props="bg-[#ef4444] py-3" textColor='text-white' bgLine='bg-white' />
        <SliderNine />
      </div>
      <WhatNewOne data={products} start={0} limit={4} />
      <Collection categories={categories} products={products} />
      <TabFeatures data={products} start={0} limit={6} />
      <Banner />
      <Benefit props="md:py-20 py-10" />
      <Testimonial data={testimonialData} limit={6} />
      <Instagram />
      <Brand />
      <Footer />
    </>
  )
}

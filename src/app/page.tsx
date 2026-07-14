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
import SupportWidget from '@/components/Support/SupportWidget'
import HomePopupBanner from '@/components/Marketing/HomePopupBanner'
import { ApiListResponse, Category, Product as ApiProduct } from '@/services/product.service'
import { toStorefrontProduct } from '@/utils/productAdapter'
import { getApiUrl } from '@/config/site'

const emptyList = <T,>(): ApiListResponse<T> => ({ success: false, count: 0, data: [] })

const getHomepageData = async () => {
  const apiUrl = getApiUrl()
  try {
    const [productsResponse, categoriesResponse] = await Promise.all([
      fetch(`${apiUrl}/products?limit=40&sort=newest&isActive=true`, { cache: 'force-cache' }),
      fetch(`${apiUrl}/categories?limit=100`, { cache: 'force-cache' }),
    ])
    return {
      products: productsResponse.ok ? (await productsResponse.json()) as ApiListResponse<ApiProduct> : emptyList<ApiProduct>(),
      categories: categoriesResponse.ok ? (await categoriesResponse.json()) as ApiListResponse<Category> : emptyList<Category>(),
    }
  } catch {
    return { products: emptyList<ApiProduct>(), categories: emptyList<Category>() }
  }
}

export default async function Home() {
  const homepageData = await getHomepageData()
  const products = homepageData.products.data.filter((product) => product.isActive !== false).map(toStorefrontProduct)
  const categories = homepageData.categories.data.filter((category) => category.isActive !== false).sort((first, second) => (first.sortOrder || 0) - (second.sortOrder || 0) || first.name.localeCompare(second.name))

  return (
    <>
      <TopNavThree props="style-three bg-white" />
      <div id="header" className='relative w-full style-nine'>
        <MenuTwo />
        <BannerTop props="bg-[#e57112] py-3" textColor='text-white' bgLine='bg-white' />
        <SliderNine />
      </div>
      <HomePopupBanner />
      <WhatNewOne data={products} start={0} limit={4} />
      <Collection categories={categories} products={products} />
      <TabFeatures data={products} start={0} limit={6} />
      <Banner />
      <Benefit props="md:py-20 py-10" />
      <Testimonial data={testimonialData} limit={6} />
      <Instagram />
      <Brand />
      <Footer />
      <SupportWidget />
    </>
  )
}

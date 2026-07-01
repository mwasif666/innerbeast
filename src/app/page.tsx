import React from 'react'
import TopNavThree from '@/components/Header/TopNav/TopNavThree'
import MenuTwo from '@/components/Header/Menu/MenuTwo'
import BannerTop from '@/components/Home3/BannerTop'
import SliderNine from '@/components/Slider/SliderNine'
import WhatNewOne from '@/components/Home1/WhatNewOne'
import productData from '@/data/Product.json'
import Collection from '@/components/Home1/Collection'
import TabFeatures from '@/components/Home1/TabFeatures'
import Banner from '@/components/Home8/Banner'
import Benefit from '@/components/Home1/Benefit'
import testimonialData from '@/data/Testimonial.json'
import Testimonial from '@/components/Home1/Testimonial'
import Instagram from '@/components/Home1/Instagram'
import Brand from '@/components/Home1/Brand'
import Footer from '@/components/Footer/Footer'

export default function Home() {
  return (
    <>
      <TopNavThree props="style-three bg-white" />
      <div id="header" className='relative w-full style-nine'>
        <MenuTwo />
        <BannerTop props="bg-black py-3" textColor='text-white' bgLine='bg-white' />
        <SliderNine />
      </div>
      <WhatNewOne data={productData} start={0} limit={4} />
      <Collection />
      <TabFeatures data={productData} start={0} limit={6} />
      <Banner />
      <Benefit props="md:py-20 py-10" />
      <Testimonial data={testimonialData} limit={6} />
      <Instagram />
      <Brand />
      <Footer />
    </>
  )
}

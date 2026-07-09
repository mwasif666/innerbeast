'use client'

import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import SupportWidget from '@/components/Support/SupportWidget'

export default function HelpPage() {
  return (
    <>
      <TopNavOne props='style-one bg-black' slogan='New customers save 10% with the code GET10' />
      <div id='header' className='relative w-full'>
        <MenuOne props='bg-transparent' />
        <Breadcrumb heading='Help' subHeading='Help' />
      </div>
      <main className='container py-20 min-h-[420px]'>
        <h1 className='heading3'>Need help?</h1>
        <p className='body1 text-secondary mt-4 max-w-2xl'>Message our team about orders, delivery, products, returns, or account support.</p>
      </main>
      <Footer />
      <SupportWidget />
    </>
  )
}

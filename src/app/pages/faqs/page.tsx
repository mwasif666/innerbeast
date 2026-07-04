import Image from 'next/image'
import * as Icon from '@phosphor-icons/react/dist/ssr'

import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'

const questions = [
    {
        question: 'How long does shipping take?',
        answer: 'Orders are processed within 1–2 business days. Delivery times vary depending on your location and selected shipping method.',
    },
    {
        question: 'Can I track my order?',
        answer: "Yes. Once your order has been dispatched, you'll receive a confirmation email with your tracking information.",
    },
    {
        question: 'What if I order the wrong size?',
        answer: "We recommend checking our Size Guide before placing your order. If you've ordered the wrong size, please contact us as soon as possible and we'll do our best to help.",
    },
    {
        question: 'Can I return my order?',
        answer: 'Yes. We accept returns within 30 days of delivery, provided the item is unworn, unwashed, and returned in its original condition with tags attached.',
    },
    {
        question: 'Do you ship internationally?',
        answer: 'Yes. We ship worldwide. Shipping costs and delivery times are calculated at checkout.',
    },
    {
        question: 'How do I contact customer support?',
        answer: 'You can reach us through our Contact page or email our customer support team. We aim to respond within 24–48 hours.',
    },
]

const Faqs = () => (
    <>
        <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
        <div id="header" className="relative w-full">
            <MenuOne props="bg-transparent" />
            <Breadcrumb heading="FAQs" subHeading="FAQs" />
        </div>

        <main className="bg-[#090b0b] text-white">
            <section className="container md:py-20 py-12">
                <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-10 xl:gap-16 items-start">
                    <div className="lg:sticky lg:top-8">
                        <div className="relative min-h-[360px] md:min-h-[520px] overflow-hidden rounded-[28px] border border-white/10">
                            <Image
                                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=85"
                                fill
                                priority
                                sizes="(max-width: 1024px) 100vw, 42vw"
                                alt="Inner Beast training environment"
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                            <div className="absolute bottom-0 p-7 md:p-9">
                                <div className="text-button-uppercase tracking-[0.16em] text-[#ff6262]">NEED ANSWERS?</div>
                                <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-[-0.04em]">We&apos;ve got you.</h1>
                                <p className="mt-4 text-white/65 leading-7">Everything you need to know about ordering, delivery, sizing and returns.</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="mb-8">
                            <div className="text-button-uppercase tracking-[0.16em] text-[#ff6262]">FREQUENTLY ASKED QUESTIONS</div>
                            <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-[-0.04em]">How can we help?</h2>
                        </div>
                        <div className="grid gap-4">
                            {questions.map((item, index) => (
                                <details key={item.question} open={index === 0} className="group rounded-2xl border border-white/10 bg-white/[0.025] overflow-hidden">
                                    <summary className="list-none cursor-pointer flex items-center justify-between gap-5 px-6 md:px-7 py-6 font-semibold text-lg">
                                        <span>{item.question}</span>
                                        <Icon.Plus size={21} className="shrink-0 transition-transform duration-300 group-open:rotate-45" />
                                    </summary>
                                    <div className="px-6 md:px-7 pb-6 md:pb-7 text-white/60 leading-7 border-t border-white/10 pt-5">
                                        {item.answer}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </main>
        <Footer />
    </>
)

export default Faqs

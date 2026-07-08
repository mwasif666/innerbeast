import Image from 'next/image'
import Link from 'next/link'
import * as Icon from '@phosphor-icons/react/dist/ssr'

import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'

const highlights = [
    { icon: Icon.Truck, label: 'Fast Shipping' },
    { icon: Icon.ArrowsClockwise, label: 'Easy Returns' },
    { icon: Icon.Lock, label: 'Secure Checkout' },
    { icon: Icon.Medal, label: 'Premium Quality' },
]

const values = [
    {
        icon: Icon.Barbell,
        title: 'Discipline',
        text: 'Showing up when motivation runs out. Every rep, every early morning, every choice to keep going.',
    },
    {
        icon: Icon.Lightning,
        title: 'Strength',
        text: 'Not just physical. The mental toughness to push through resistance and outlast the excuses.',
    },
    {
        icon: Icon.Target,
        title: 'Focus',
        text: 'Locked in on the goal. No distractions, no shortcuts, just relentless and deliberate progress.',
    },
    {
        icon: Icon.TrendUp,
        title: 'Results',
        text: 'Earned, never given. Real growth that shows up in the mirror, on the track, and in your mindset.',
    },
]

const journey = [
    {
        step: '01',
        title: 'The Idea',
        text: 'Inner Beast started with a simple frustration. Great activewear was either overpriced or fell apart after a few sessions. We set out to change that.',
    },
    {
        step: '02',
        title: 'The Standard',
        text: 'We obsess over every fabric, seam, and fit so that each piece can survive real training and not just look good on a shelf.',
    },
    {
        step: '03',
        title: 'The Mindset',
        text: 'This is more than gear. It is a reminder that the strength you are chasing has been inside you the whole time.',
    },
    {
        step: '04',
        title: 'The Movement',
        text: 'We are just getting started, and we want you in from day one. Every piece of feedback shapes what Inner Beast becomes.',
    },
]

const promises = [
    {
        icon: Icon.Medal,
        title: 'Premium Materials',
        text: 'Sweat wicking, four way stretch fabrics chosen to move with your body and survive every session.',
    },
    {
        icon: Icon.Ruler,
        title: 'True to Fit',
        text: 'Cuts designed and tested on real bodies so what you order is exactly what you get.',
    },
    {
        icon: Icon.Truck,
        title: 'Fast Shipping',
        text: 'Quick dispatch and reliable delivery so your gear reaches you when you need it.',
    },
    {
        icon: Icon.ArrowsClockwise,
        title: 'Easy Returns',
        text: 'Not the right fit? Send it back with a simple, no stress return process.',
    },
    {
        icon: Icon.ShieldCheck,
        title: 'Built to Last',
        text: 'Reinforced stitching and durable finishes made to handle heavy training day after day.',
    },
    {
        icon: Icon.Heart,
        title: 'Community Driven',
        text: 'Every design is shaped by feedback from the pack, the people who actually train in our gear.',
    },
]

const AboutUs = () => (
    <>
        <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
        <div id="header" className="relative w-full">
            <MenuOne props="bg-transparent" />
            <Breadcrumb heading="About Us" subHeading="About Us" />
        </div>

        <main className="bg-[#090b0b] text-white">
            {/* Hero */}
            <section className="container md:py-20 py-12">
                <div className="grid lg:grid-cols-[1fr_0.95fr] items-center gap-10 xl:gap-16">
                    <div>
                        <div className="text-button-uppercase tracking-[0.18em] text-[#e57112]">Our Mindset</div>
                        <h1 className="mt-4 text-[clamp(2.4rem,6vw,5rem)] leading-[0.98] font-semibold tracking-[-0.045em] max-w-[780px]">
                            Unleash Your <span className="text-[#e57112]">Inner Beast.</span>
                        </h1>
                        <p className="mt-7 text-lg md:text-xl leading-8 text-white/65 max-w-[720px]">
                            At Inner Beast, we believe that greatness isn&apos;t handed to anyone. It is earned through effort,
                            repetition, and the refusal to quit.
                        </p>
                        <div className="mt-9 flex flex-wrap items-center gap-4">
                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-2 rounded-full bg-[#e57112] px-8 py-3.5 font-semibold tracking-wide transition-transform duration-200 hover:-translate-y-0.5"
                            >
                                Shop the Collection
                                <Icon.ArrowRight size={18} weight="bold" />
                            </Link>
                            <Link
                                href="/contact-us"
                                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3.5 font-semibold tracking-wide transition-colors duration-200 hover:bg-white/5"
                            >
                                Get in Touch
                            </Link>
                        </div>
                    </div>
                    <div className="relative min-h-[360px] md:min-h-[520px] overflow-hidden rounded-[28px] border border-white/10 bg-[#151818]">
                        <Image
                            src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1600&q=85"
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 48vw"
                            alt="Athlete training with strength and focus"
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md px-6 py-5">
                            <div className="text-xl md:text-2xl font-semibold tracking-wide">Discipline. Strength. Focus. Results.</div>
                            <div className="mt-1 text-sm text-white/60">The four pillars behind everything we make.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Highlights band */}
            <section className="border-y border-white/10 bg-[#0d1010]">
                <div className="container py-8 md:py-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
                        {highlights.map(({ icon: IconCmp, label }) => (
                            <div key={label} className="flex items-center justify-center gap-3 md:border-r md:last:border-r-0 border-white/10">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e57112]/10 text-[#e57112]">
                                    <IconCmp size={22} weight="bold" />
                                </div>
                                <span className="text-base md:text-lg font-medium tracking-wide">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission */}
            <section className="container md:py-20 py-12">
                <div className="grid lg:grid-cols-[0.85fr_1fr] gap-10 xl:gap-16 items-start">
                    <div>
                        <div className="text-button-uppercase tracking-[0.18em] text-[#e57112]">Our Mission</div>
                        <h2 className="mt-4 text-[clamp(1.9rem,4vw,3rem)] leading-[1.05] font-semibold tracking-[-0.03em]">
                            Push Beyond Your Limits
                        </h2>
                        <p className="mt-5 leading-8 text-white/60">
                            The limit you feel is rarely the limit you have. We exist to help you find out how much more is in
                            the tank.
                        </p>
                    </div>
                    <div className="grid gap-6">
                        <p className="text-lg leading-8 text-white/70">
                            Our mission is to inspire individuals to push beyond their limits, embrace discipline, and unlock the
                            strength that already exists within them. Whether you are in the gym, on the track, or facing everyday
                            challenges, Inner Beast is designed for those who refuse to settle for average.
                        </p>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 md:p-8">
                            <h3 className="text-xl font-semibold">Created to Perform</h3>
                            <p className="mt-3 leading-7 text-white/65">
                                Every product is created with performance, comfort, and style in mind, combining premium materials with
                                modern designs that move with you through every workout and every challenge.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Story */}
            <section className="border-t border-white/10 bg-[#0d1010]">
                <div className="container md:py-20 py-12">
                    <div className="grid lg:grid-cols-[1fr_0.9fr] gap-10 xl:gap-16 items-center">
                        <div className="relative min-h-[320px] md:min-h-[460px] overflow-hidden rounded-[28px] border border-white/10 bg-[#151818] order-last lg:order-first">
                            <Image
                                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=85"
                                fill
                                sizes="(max-width: 1024px) 100vw, 46vw"
                                alt="Focused athlete resting after intense training"
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        </div>
                        <div>
                            <div className="text-button-uppercase tracking-[0.18em] text-[#e57112]">Our Story</div>
                            <h2 className="mt-4 text-[clamp(1.9rem,4vw,3rem)] leading-[1.05] font-semibold tracking-[-0.03em]">
                                Born in the Grind
                            </h2>
                            <p className="mt-5 text-lg leading-8 text-white/70">
                                Inner Beast was not born in a boardroom. It was born in the gym, on the road, and in the quiet hours
                                when nobody is watching and the only thing that counts is whether you show up.
                            </p>
                            <p className="mt-5 leading-8 text-white/65">
                                We were tired of gear that looked the part but broke down under real training. So we built something
                                honest. Clothing made by people who train, for people who train. Every piece carries the same
                                promise. Perform without compromise and never hold you back.
                            </p>
                        </div>
                    </div>

                    {/* Journey steps */}
                    <div className="mt-14 md:mt-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {journey.map((item) => (
                            <article key={item.step} className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                                <div className="text-2xl font-semibold text-[#e57112]">{item.step}</div>
                                <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                                <p className="mt-2 leading-7 text-white/60">{item.text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values grid */}
            <section className="container md:py-20 py-12">
                <div className="max-w-2xl">
                    <div className="text-button-uppercase tracking-[0.18em] text-[#e57112]">What We Stand For</div>
                    <h2 className="mt-4 text-[clamp(1.9rem,4vw,3rem)] leading-[1.05] font-semibold tracking-[-0.03em]">
                        More Than a Clothing Brand
                    </h2>
                    <p className="mt-5 text-lg leading-8 text-white/65">
                        Inner Beast is more than a clothing brand. It is a mindset built on resilience, consistency, and relentless
                        self improvement. These four values guide every decision we make.
                    </p>
                </div>
                <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {values.map(({ icon: IconCmp, title, text }) => (
                        <article
                            key={title}
                            className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition-colors duration-200 hover:border-[#e57112]/50"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e57112]/10 text-[#e57112] transition-colors duration-200 group-hover:bg-[#e57112] group-hover:text-white">
                                <IconCmp size={24} weight="bold" />
                            </div>
                            <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                            <p className="mt-2 leading-7 text-white/60">{text}</p>
                        </article>
                    ))}
                </div>
            </section>

            {/* Promises */}
            <section className="border-t border-white/10 bg-[#0d1010]">
                <div className="container md:py-20 py-12">
                    <div className="max-w-2xl">
                        <div className="text-button-uppercase tracking-[0.18em] text-[#e57112]">Why Choose Us</div>
                        <h2 className="mt-4 text-[clamp(1.9rem,4vw,3rem)] leading-[1.05] font-semibold tracking-[-0.03em]">
                            The Inner Beast Promise
                        </h2>
                        <p className="mt-5 text-lg leading-8 text-white/65">
                            When you wear Inner Beast, you are backed by a set of standards we refuse to lower.
                        </p>
                    </div>
                    <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {promises.map(({ icon: IconCmp, title, text }) => (
                            <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e57112]/10 text-[#e57112]">
                                        <IconCmp size={22} weight="bold" />
                                    </div>
                                    <h3 className="text-lg font-semibold">{title}</h3>
                                </div>
                                <p className="mt-4 leading-7 text-white/60">{text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quote */}
            <section className="container md:py-20 py-12">
                <figure className="max-w-4xl mx-auto text-center">
                    <Icon.Quotes size={40} weight="fill" className="mx-auto text-[#e57112]" />
                    <blockquote className="mt-6 text-[clamp(1.6rem,3.5vw,2.6rem)] leading-[1.25] font-semibold tracking-[-0.02em]">
                        The beast was never outside of you. Training just teaches you how to let it out.
                    </blockquote>
                    <figcaption className="mt-6 text-white/55 tracking-wide">The Inner Beast Team</figcaption>
                </figure>
            </section>

            {/* CTA */}
            <section className="container pb-20 md:pb-24">
                <div className="relative overflow-hidden rounded-[28px] bg-[#e57112] px-6 md:px-16 py-14 md:py-20 text-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent" />
                    <div className="relative">
                        <h2 className="text-[clamp(2rem,4.5vw,3.4rem)] font-semibold tracking-[-0.03em]">Ready to unleash yours?</h2>
                        <p className="mt-4 text-lg text-white/85 max-w-xl mx-auto">
                            Gear built for the ones who refuse to settle. Discipline. Strength. Focus. Results.
                        </p>
                        <Link
                            href="/shop"
                            className="mt-8 inline-flex items-center gap-2 rounded-full bg-black px-9 py-4 font-semibold tracking-wide transition-transform duration-200 hover:-translate-y-0.5"
                        >
                            Explore the Collection
                            <Icon.ArrowRight size={18} weight="bold" />
                        </Link>
                    </div>
                </div>
            </section>
        </main>
        <Footer />
    </>
)

export default AboutUs

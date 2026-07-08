import Image from 'next/image'
import Link from 'next/link'
import * as Icon from '@phosphor-icons/react/dist/ssr'

import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import PolicyToc from '@/components/Content/PolicyToc'

export type PolicySection = {
    title?: string
    paragraphs?: string[]
    bullets?: string[]
}

type PolicyPageProps = {
    breadcrumb: string
    eyebrow: string
    title: string
    intro: string
    image: string
    imageAlt: string
    sections: PolicySection[]
    highlight?: string
    lastUpdated?: string
}

const slugify = (value: string) =>
    value
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

const PolicyPage = ({
    breadcrumb,
    eyebrow,
    title,
    intro,
    image,
    imageAlt,
    sections,
    highlight,
    lastUpdated,
}: PolicyPageProps) => {
    const toc = sections
        .filter((section): section is PolicySection & { title: string } => Boolean(section.title))
        .map((section) => ({ id: slugify(section.title), title: section.title }))

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className="relative w-full">
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading={breadcrumb} subHeading={breadcrumb} />
            </div>

            <main className="relative bg-[#090b0b] text-white">
                {/* Hero */}
                <section className="relative overflow-hidden">
                    {/* Ambient glow */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -top-40 right-[-5%] h-[520px] w-[520px] rounded-full bg-[#e57112]/20 blur-[130px]"
                    />
                    <div className="container relative md:py-20 py-12">
                    <div className="grid lg:grid-cols-[1fr_0.95fr] items-center gap-10 xl:gap-16">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-button-uppercase tracking-[0.18em] text-[#e57112] text-xs">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#e57112]" />
                                {eyebrow}
                            </div>
                            <h1 className="mt-5 text-[clamp(2.4rem,6vw,5rem)] leading-[0.98] font-semibold tracking-[-0.045em] max-w-[780px]">
                                {title}
                            </h1>
                            <p className="mt-7 text-lg md:text-xl leading-8 text-white/65 max-w-[720px]">{intro}</p>
                            {lastUpdated && (
                                <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/60">
                                    <Icon.Clock size={16} weight="bold" className="text-[#e57112]" />
                                    Last updated: {lastUpdated}
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <div className="relative min-h-[340px] md:min-h-[480px] overflow-hidden rounded-[28px] border border-white/10 bg-[#151818] shadow-[0_30px_80px_-30px_rgba(239,68,68,0.35)]">
                                <Image src={image} fill priority sizes="(max-width: 1024px) 100vw, 48vw" alt={imageAlt} className="object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[28px]" />
                            </div>
                        </div>
                    </div>
                    </div>
                </section>

                {/* Content */}
                <section className="relative border-t border-white/10 bg-[#0b0d0d]">
                    <div className="container md:py-20 py-12">
                        <div className="grid lg:grid-cols-[240px_1fr] gap-10 xl:gap-16 items-start">
                            {toc.length > 1 && <PolicyToc items={toc} />}

                            <div className="max-w-3xl grid gap-5">
                                {sections.map((section, index) => (
                                    <article
                                        key={`${section.title || 'section'}-${index}`}
                                        id={section.title ? slugify(section.title) : undefined}
                                        className="group scroll-mt-28 relative rounded-2xl border border-white/10 bg-white/[0.025] md:p-8 p-6 transition-colors duration-300 hover:border-white/20"
                                    >
                                        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e57112]/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                        {section.title && (
                                            <div className="flex items-center gap-4">
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#e57112]/25 to-[#e57112]/5 ring-1 ring-inset ring-[#e57112]/20 text-sm font-semibold text-[#e57112] tabular-nums">
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>
                                                <h2 className="heading5 text-white">{section.title}</h2>
                                            </div>
                                        )}
                                        {section.paragraphs?.map((paragraph) => (
                                            <p key={paragraph} className={`${section.title ? 'mt-4' : ''} body1 leading-7 text-white/65`}>{paragraph}</p>
                                        ))}
                                        {section.bullets && (
                                            <ul className="mt-5 grid gap-3">
                                                {section.bullets.map((bullet) => (
                                                    <li key={bullet} className="flex items-start gap-3 text-white/70 leading-7">
                                                        <Icon.CheckCircle size={20} weight="fill" className="mt-1 shrink-0 text-[#e57112]" />
                                                        <span>{bullet}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </article>
                                ))}

                                {highlight && (
                                    <div className="mt-2 rounded-2xl bg-[#e57112] px-6 md:px-10 py-9 text-center text-xl md:text-2xl font-semibold tracking-wide">
                                        {highlight}
                                    </div>
                                )}

                                {/* Help CTA */}
                                <div className="mt-2 relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] md:p-8 p-6 flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
                                    <div
                                        aria-hidden
                                        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#e57112]/15 blur-3xl"
                                    />
                                    <div className="relative flex items-start gap-4">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e57112]/10 text-[#e57112]">
                                            <Icon.ChatCircleDots size={22} weight="bold" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold">Still have questions?</h3>
                                            <p className="mt-1 leading-7 text-white/60">Our team is happy to help with anything you need.</p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/contact-us"
                                        className="relative shrink-0 inline-flex items-center gap-2 rounded-full bg-[#e57112] px-7 py-3 font-semibold tracking-wide transition-transform duration-200 hover:-translate-y-0.5"
                                    >
                                        Contact Us
                                        <Icon.ArrowRight size={18} weight="bold" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}

export default PolicyPage

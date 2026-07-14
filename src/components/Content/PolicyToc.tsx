'use client'

import { useEffect, useState } from 'react'

type TocItem = {
    id: string
    title: string
}

const PolicyToc = ({ items }: { items: TocItem[] }) => {
    const [active, setActive] = useState<string>(items[0]?.id ?? '')

    useEffect(() => {
        const elements = items
            .map((item) => document.getElementById(item.id))
            .filter((el): el is HTMLElement => Boolean(el))

        if (!elements.length) return

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

                if (visible[0]) {
                    setActive(visible[0].target.id)
                }
            },
            { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
        )

        elements.forEach((el) => observer.observe(el))
        return () => observer.disconnect()
    }, [items])

    return (
        <aside className="hidden lg:block sticky top-28">
            <div className="text-button-uppercase tracking-[0.18em] text-white/40 text-xs">On this page</div>
            <nav className="mt-4 relative">
                <span className="absolute left-0 top-0 bottom-0 w-px bg-white/10" />
                <div className="grid gap-0.5">
                    {items.map((item, order) => {
                        const isActive = active === item.id
                        return (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                className={`group relative flex items-center gap-3 rounded-lg pl-5 pr-3 py-2 text-sm transition-colors duration-200 ${
                                    isActive ? 'text-white' : 'text-white/50 hover:text-white/80'
                                }`}
                            >
                                <span
                                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-px rounded-full bg-[#e57112] transition-all duration-300 ${
                                        isActive ? 'h-6 opacity-100' : 'h-0 opacity-0'
                                    }`}
                                />
                                <span className={`tabular-nums text-xs ${isActive ? 'text-[#e57112]' : 'text-white/30'}`}>
                                    {String(order + 1).padStart(2, '0')}
                                </span>
                                <span>{item.title}</span>
                            </a>
                        )
                    })}
                </div>
            </nav>
        </aside>
    )
}

export default PolicyToc

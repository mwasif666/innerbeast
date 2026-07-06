'use client'

import React from 'react'
import Link from 'next/link'
import * as Icon from "@phosphor-icons/react/dist/ssr";

import { usePublicSettings } from '@/hooks/useSettings'
import type { StoreSocialLinks } from '@/services/settings.service'

const FALLBACK_LINKS: StoreSocialLinks = {
    facebook: 'https://www.facebook.com/',
    instagram: 'https://www.instagram.com/',
    youtube: 'https://www.youtube.com/',
}

const normalizeUrl = (url: string) =>
    /^https?:\/\//i.test(url) ? url : `https://${url}`

type SocialKey = keyof StoreSocialLinks

const SOCIAL_ORDER: SocialKey[] = [
    'facebook',
    'instagram',
    'x',
    'youtube',
    'tiktok',
    'linkedin',
    'threads',
]

const FONT_ICONS: Partial<Record<SocialKey, string>> = {
    facebook: 'icon-facebook',
    instagram: 'icon-instagram',
    x: 'icon-twitter',
    youtube: 'icon-youtube',
}

const PHOSPHOR_ICONS: Partial<Record<SocialKey, React.ElementType>> = {
    tiktok: Icon.TiktokLogo,
    linkedin: Icon.LinkedinLogo,
    threads: Icon.At,
}

interface Props {
    linkClassName?: string
    iconClassName?: string
    iconSize?: number
}

const SocialLinks: React.FC<Props> = ({ linkClassName = '', iconClassName = '', iconSize = 20 }) => {
    const { data, isSuccess } = usePublicSettings()
    const links = isSuccess ? data?.data?.socialLinks || {} : FALLBACK_LINKS

    const items = SOCIAL_ORDER.filter((key) => (links[key] || '').trim())

    if (items.length === 0) return null

    return (
        <>
            {items.map((key) => {
                const fontIcon = FONT_ICONS[key]
                const PhosphorIcon = PHOSPHOR_ICONS[key]

                return (
                    <Link key={key} href={normalizeUrl((links[key] as string).trim())} target='_blank' className={linkClassName}>
                        {fontIcon ? (
                            <i className={`${fontIcon} ${iconClassName}`}></i>
                        ) : PhosphorIcon ? (
                            <PhosphorIcon size={iconSize} />
                        ) : null}
                    </Link>
                )
            })}
        </>
    )
}

export default SocialLinks

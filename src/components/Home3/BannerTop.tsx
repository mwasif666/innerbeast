'use client'

import React from 'react'
import Marquee from 'react-fast-marquee'

import { usePublicSettings } from '@/hooks/useSettings'

interface Props {
    props: string
    textColor: string
    bgLine: string
}

const MARQUEE_REPEAT = 8

const BannerTop: React.FC<Props> = ({ props, textColor, bgLine }) => {
    const { data, isSuccess } = usePublicSettings()
    const announcement = data?.data?.announcement

    if (!isSuccess || !announcement?.enabled || !announcement.text?.trim()) return null

    const text = announcement.text.trim()

    return (
        <>
            <div className={`banner-top ${props}`}>
                <Marquee>
                    {Array.from({ length: MARQUEE_REPEAT }).map((_, index) => (
                        <React.Fragment key={index}>
                            <div className={`text-button-uppercase px-8 ${textColor}`}>{text}</div>
                            <div className={`line w-8 h-px ${bgLine}`}></div>
                        </React.Fragment>
                    ))}
                </Marquee>
            </div>
        </>
    )
}

export default BannerTop

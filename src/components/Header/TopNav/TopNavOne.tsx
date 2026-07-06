'use client'

import React, { useState } from 'react'
import * as Icon from "@phosphor-icons/react/dist/ssr";

import SocialLinks from '@/components/Shared/SocialLinks'
import { usePublicSettings } from '@/hooks/useSettings'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'

interface Props {
    props: string;
    slogan: string;
}

const TopNavOne: React.FC<Props> = ({ props, slogan }) => {
    const [isOpenLanguage, setIsOpenLanguage] = useState(false)
    const [language, setLanguage] = useState('English')
    const { code: currence } = useStoreCurrency()
    const { data, isSuccess } = usePublicSettings()

    const announcement = data?.data?.announcement
    const sloganText = isSuccess
        ? (announcement?.enabled && announcement.text?.trim()) || ''
        : slogan

    return (
        <>
            <div className={`top-nav md:h-[44px] h-[30px] ${props}`}>
                <div className="container mx-auto h-full">
                    <div className="top-nav-main flex justify-between max-md:justify-center h-full">
                        <div className="left-content flex items-center gap-5 max-md:hidden">
                            <div
                                className="choose-type choose-language flex items-center gap-1.5"
                                onClick={() => {
                                    setIsOpenLanguage(!isOpenLanguage)
                                }}
                            >
                                <div className="select relative">
                                    <p className="selected caption2 text-white">{language}</p>
                                    <ul className={`list-option bg-white ${isOpenLanguage ? 'open' : ''}`}>
                                        {
                                            ['English', 'Espana', 'France'].map((item, index) => (
                                                <li key={index} className="caption2" onClick={() => setLanguage(item)}>{item}</li>
                                            ))
                                        }
                                    </ul>
                                </div>
                                <Icon.CaretDown size={12} color='#fff' />
                            </div>
                            <div className="choose-type choose-currency flex items-center gap-1.5">
                                <p className="selected caption2 text-white">{currence}</p>
                            </div>
                        </div>
                        <div className="text-center text-button-uppercase text-white flex items-center">
                            {sloganText}
                        </div>
                        <div className="right-content flex items-center gap-5 max-md:hidden">
                            <SocialLinks iconClassName='text-white' iconSize={16} />
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}

export default TopNavOne

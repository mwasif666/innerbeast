'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

import { useCurrentUser } from '@/hooks/useAuth'

type AccountLinkProps = {
    children: ReactNode
    className?: string
}

const AccountLink = ({ children, className }: AccountLinkProps) => {
    const { data, isPending } = useCurrentUser()
    const user = data?.data
    const isLoggedIn = Boolean(user)
    const firstName = user?.name ? user.name.split(' ')[0] : ''

    return (
        <Link
            href={isLoggedIn ? '/my-account' : '/login'}
            className={className}
            aria-label={isLoggedIn ? 'Open my account' : 'Sign in'}
            title={isLoggedIn ? 'My account' : 'Login'}
        >
            {children}
            {!isPending && (
                <span className='ml-1.5 text-sm font-semibold whitespace-nowrap max-w-[90px] overflow-hidden text-ellipsis'>
                    {isLoggedIn ? firstName || 'Account' : 'Login'}
                </span>
            )}
        </Link>
    )
}

export default AccountLink

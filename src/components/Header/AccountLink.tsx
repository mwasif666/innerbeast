'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

import { useCurrentUser } from '@/hooks/useAuth'

type AccountLinkProps = {
    children: ReactNode
    className?: string
}

const AccountLink = ({ children, className }: AccountLinkProps) => {
    const { data } = useCurrentUser()
    const isLoggedIn = Boolean(data?.data)

    return (
        <Link
            href={isLoggedIn ? '/my-account' : '/login'}
            className={className}
            aria-label={isLoggedIn ? 'Open my account' : 'Sign in'}
            title={isLoggedIn ? 'My account' : 'Login'}
        >
            {children}
        </Link>
    )
}

export default AccountLink

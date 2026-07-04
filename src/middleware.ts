import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
    const productId = request.nextUrl.searchParams.get('id')?.trim()
    const destination = request.nextUrl.clone()

    destination.pathname = productId
        ? `/products/${encodeURIComponent(productId)}`
        : '/shop'
    destination.search = ''

    return NextResponse.redirect(destination, 308)
}

export const config = {
    matcher: '/product/one-scrolling',
}

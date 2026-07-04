/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Keep the dev compiler away from production builds. Running `next build`
    // while the dev server is open must not replace chunks in the browser.
    distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'res.cloudinary.com' },
            { protocol: 'https', hostname: 'static-01.daraz.pk' },
        ],
    },
    async redirects() {
        return [
            { source: '/shop/sidebar-list', destination: '/shop', permanent: true },
            { source: '/pages/about', destination: '/about-us', permanent: true },
            { source: '/pages/contact', destination: '/contact-us', permanent: true },
            { source: '/pages/faqs', destination: '/faqs', permanent: true },
            { source: '/pages/shipping', destination: '/shipping-policy', permanent: true },
            { source: '/pages/returns', destination: '/returns', permanent: true },
            { source: '/pages/privacy-policy', destination: '/privacy-policy', permanent: true },
            { source: '/pages/terms-conditions', destination: '/terms-and-conditions', permanent: true },
        ]
    },
}

module.exports = nextConfig

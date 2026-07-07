/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
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
            { source: '/pages/faqs', destination: '/faq', permanent: true },
            { source: '/pages/shipping', destination: '/ship-policy', permanent: true },
            { source: '/pages/returns', destination: '/returns', permanent: true },
            { source: '/pages/privacy-policy', destination: '/privacy', permanent: true },
            { source: '/pages/terms-conditions', destination: '/terms', permanent: true },
            { source: '/faqs', destination: '/faq', permanent: true },
            { source: '/privacy-policy', destination: '/privacy', permanent: true },
            { source: '/terms-and-conditions', destination: '/terms', permanent: true },
            { source: '/shipping-policy', destination: '/ship-policy', permanent: true },
            { source: '/return-policy', destination: '/returns', permanent: true },
        ]
    },
}

module.exports = nextConfig

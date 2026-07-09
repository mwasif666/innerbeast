/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'export',
    distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    images: {
        unoptimized: true,
        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'res.cloudinary.com' },
            { protocol: 'https', hostname: 'static-01.daraz.pk' },
        ],
    },
}

module.exports = nextConfig

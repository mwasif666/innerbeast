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
}

module.exports = nextConfig

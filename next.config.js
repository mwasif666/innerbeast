/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'export',
    distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    eslint: {
        // Hostinger export build should only generate static files.
        // Run npm run lint separately when needed.
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Avoid Next/Jest worker OOM on Windows during static export.
        // Run npm run type-check separately when needed.
        ignoreBuildErrors: true,
    },
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

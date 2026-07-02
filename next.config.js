/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Keep the dev compiler away from production builds. Running `next build`
    // while the dev server is open must not replace chunks in the browser.
    distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
}

module.exports = nextConfig

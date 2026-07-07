import type { MetadataRoute } from 'next'

const siteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || 'https://innerbeast-chi.vercel.app').replace(/\/$/, '')

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/login', '/register', '/my-account'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}

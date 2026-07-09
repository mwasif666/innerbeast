import type { MetadataRoute } from 'next'
import { getApiUrl, getSiteUrl } from '@/config/site'

type Product = { slug?: string; updatedAt?: string }
type Category = { slug?: string; updatedAt?: string }
type ApiList<T> = { data?: T[] }

const getList = async <T,>(path: string): Promise<T[]> => {
  const baseApi = getApiUrl()
  if (!baseApi) return []

  try {
    const response = await fetch(`${baseApi}${path}`, { next: { revalidate: 3600 } })
    if (!response.ok) return []

    const json = (await response.json()) as ApiList<T>
    return Array.isArray(json.data) ? json.data : []
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl()
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/shop',
    '/about-us',
    '/contact-us',
    '/privacy',
    '/terms',
    '/returns',
    '/ship-policy',
    '/faq',
    '/track-order',
  ].map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency: route === '' || route === '/shop' ? 'daily' : 'monthly',
    priority: route === '' ? 1 : route === '/shop' ? 0.9 : 0.6,
  }))

  const [products, categories] = await Promise.all([
    getList<Product>('/products?limit=500&isActive=true'),
    getList<Category>('/categories'),
  ])

  const productRoutes: MetadataRoute.Sitemap = products
    .filter((product) => product.slug)
    .map((product) => ({
      url: `${base}/products/${encodeURIComponent(product.slug || '')}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter((category) => category.slug)
    .map((category) => ({
      url: `${base}/shop?category=${encodeURIComponent(category.slug || '')}`,
      lastModified: category.updatedAt ? new Date(category.updatedAt) : now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

  return [...staticRoutes, ...productRoutes, ...categoryRoutes]
}

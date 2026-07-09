import type { Metadata } from 'next'
import { getApiUrl, getSiteUrl } from '@/config/site'

type ProductResponse = {
  data?: {
    title?: string
    description?: string
    slug?: string
    images?: { url?: string }[]
    category?: { name?: string }
  }
}

const getProduct = async (slug: string) => {
  const baseApi = getApiUrl()
  if (!baseApi || !slug) return null

  try {
    const response = await fetch(`${baseApi}/products/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    })
    if (!response.ok) return null

    const json = (await response.json()) as ProductResponse
    return json.data || null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug)

  if (!product) {
    return {
      title: 'Product | Inner Beast',
      description: 'Explore Inner Beast products.',
    }
  }

  const title = product.title || 'Product'
  const description = product.description || `Shop ${title} at Inner Beast.`
  const image = product.images?.find((item) => item.url)?.url
  const url = `${getSiteUrl()}/products/${encodeURIComponent(product.slug || params.slug)}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export { default } from '../../product/one-scrolling/page'

import { Product } from '@/services/product.service'
import { ProductType } from '@/type/ProductType'

const FALLBACK_IMAGE = '/images/product/pf-1.jpg'
const ALLOWED_IMAGE_HOSTS = new Set([
  'images.unsplash.com',
  'res.cloudinary.com',
  'static-01.daraz.pk',
])

const isSupportedImageUrl = (url: string) => {
  if (url.startsWith('/')) return true

  try {
    return ALLOWED_IMAGE_HOSTS.has(new URL(url).hostname)
  } catch {
    return false
  }
}

export const toStorefrontProduct = (product: Product): ProductType => {
  const imageUrls =
    product.images
      ?.map((image) => image.url)
      .filter((url): url is string => Boolean(url) && isSupportedImageUrl(url)) || []
  const storefrontImages = imageUrls.length > 0 ? imageUrls : [FALLBACK_IMAGE]
  const salePrice =
    product.discountPrice && product.discountPrice < product.price
      ? product.discountPrice
      : product.price

  return {
    id: product._id,
    category: 'fashion',
    type: product.category?.slug || 'products',
    name: product.title,
    gender: product.gender?.toLowerCase() || 'unisex',
    new: Boolean(product.isNewArrival),
    sale: salePrice < product.price,
    rate: product.ratingsAverage || 0,
    price: salePrice,
    originPrice: product.price,
    currency: '£',
    brand: 'Inner Beast',
    sold: product.ratingsCount || 0,
    quantity: product.stock || 0,
    quantityPurchase: 1,
    sizes: product.sizes || [],
    variation:
      product.colors?.map((color, index) => ({
        color: color.name,
        colorCode: color.hex || '#1f1f1f',
        colorImage: storefrontImages[index] || storefrontImages[0],
        image: storefrontImages[index] || storefrontImages[0],
      })) || [],
    thumbImage: storefrontImages.slice(0, 2),
    images: storefrontImages,
    description: product.description || '',
    action: product.sizes?.length ? 'quick shop' : 'add to cart',
    slug: product.slug,
  }
}

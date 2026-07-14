import api from './api'

export type ProductImage = {
  url: string
  publicId?: string
  alt?: string
}

export type ProductColor = {
  name: string
  hex?: string
}

export type Category = {
  _id: string
  name: string
  slug: string
  description?: string
  image?: ProductImage
  isActive?: boolean
  sortOrder?: number
}

export type Product = {
  _id: string
  title: string
  slug: string
  sku?: string
  description?: string
  price: number
  discountPrice?: number
  stock?: number
  images?: ProductImage[]
  category?: Category
  sizes?: string[]
  colors?: ProductColor[]
  fitType?: string
  gender?: string
  material?: string
  tags?: string[]
  isFeatured?: boolean
  isNewArrival?: boolean
  isActive?: boolean
  ratingsAverage?: number
  ratingsCount?: number
}

export type ApiListResponse<T> = {
  success: boolean
  count?: number
  total?: number
  data: T[]
}

export type ApiSingleResponse<T> = {
  success: boolean
  data: T
}

const buildQuery = (params: Record<string, string | number | boolean | undefined> = {}) => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value))
    }
  })

  const queryString = query.toString()

  return queryString ? `?${queryString}` : ''
}

export const getProducts = async (filters = {}) => {
  return (await api(`/products${buildQuery(filters)}`)) as ApiListResponse<Product>
}

export const getSingleProduct = async (slugOrId: string) => {
  return (await api(`/products/${slugOrId}`)) as ApiSingleResponse<Product>
}

export const getCategories = async () => {
  return (await api('/categories')) as ApiListResponse<Category>
}

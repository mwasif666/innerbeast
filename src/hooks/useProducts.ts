import { useQuery } from '@tanstack/react-query'

import {
  ApiListResponse,
  ApiSingleResponse,
  Category,
  getProducts,
  getSingleProduct,
  getCategories,
  Product,
} from '../services/product.service'

const liveQueryOptions = <T>() => ({
  placeholderData: (previousData: T | undefined) => previousData,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
})

export const useProducts = (filters = {}) => {
  return useQuery<ApiListResponse<Product>>({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
    staleTime: 5 * 60 * 1000,
    ...liveQueryOptions<ApiListResponse<Product>>(),
  })
}

export const useSingleProduct = (slugOrId: string) => {
  return useQuery<ApiSingleResponse<Product>>({
    queryKey: ['product', slugOrId],
    queryFn: () => getSingleProduct(slugOrId),
    enabled: Boolean(slugOrId),
    staleTime: 5 * 60 * 1000,
    ...liveQueryOptions<ApiSingleResponse<Product>>(),
  })
}

export const useCategories = () => {
  return useQuery<ApiListResponse<Category>>({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000,
    ...liveQueryOptions<ApiListResponse<Category>>(),
  })
}

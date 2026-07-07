import { useQuery } from '@tanstack/react-query'

import {
  getProducts,
  getSingleProduct,
  getCategories,
} from '../services/product.service'

const liveQueryOptions = {
  placeholderData: (previousData: unknown) => previousData,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
}

export const useProducts = (filters = {}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
    staleTime: 5 * 60 * 1000,
    ...liveQueryOptions,
  })
}

export const useSingleProduct = (slugOrId: string) => {
  return useQuery({
    queryKey: ['product', slugOrId],
    queryFn: () => getSingleProduct(slugOrId),
    enabled: Boolean(slugOrId),
    staleTime: 5 * 60 * 1000,
    ...liveQueryOptions,
  })
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000,
    ...liveQueryOptions,
  })
}

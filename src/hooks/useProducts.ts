import { useQuery } from '@tanstack/react-query'

import {
  getProducts,
  getSingleProduct,
  getCategories,
} from '../services/product.service'

export const useProducts = (filters = {}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
  })
}

export const useSingleProduct = (slugOrId: string) => {
  return useQuery({
    queryKey: ['product', slugOrId],
    queryFn: () => getSingleProduct(slugOrId),
    enabled: Boolean(slugOrId),
  })
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })
}

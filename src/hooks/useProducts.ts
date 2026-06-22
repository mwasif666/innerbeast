import { getProducts } from '../services/product.service'

export const loadProducts = () => {
  return getProducts()
}

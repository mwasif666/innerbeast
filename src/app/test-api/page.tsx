'use client'

import { useProducts, useCategories } from '../../hooks/useProducts'

const TestApiPage = () => {
  const {
    data: productsData,
    isPending: productsLoading,
    error: productsError,
  } = useProducts()

  const {
    data: categoriesData,
    isPending: categoriesLoading,
    error: categoriesError,
  } = useCategories()

  if (productsLoading || categoriesLoading) {
    return <p style={{ padding: 30 }}>Loading API data...</p>
  }

  if (productsError) {
    return <p style={{ padding: 30 }}>Products Error: {productsError.message}</p>
  }

  if (categoriesError) {
    return <p style={{ padding: 30 }}>Categories Error: {categoriesError.message}</p>
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Inner Beast API Connected</h1>

      <h2>Categories</h2>
      <p>Total Categories: {categoriesData?.count}</p>

      <h2>Products</h2>
      <p>Total Products: {productsData?.count}</p>

      {productsData?.data?.map((product) => (
        <div key={product._id} style={{ marginBottom: 20 }}>
          <h3>{product.title}</h3>
          <p>Price: Rs. {product.price}</p>
          <p>Slug: {product.slug}</p>
        </div>
      ))}
    </div>
  )
}

export default TestApiPage

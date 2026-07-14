'use client'

import { useProducts, useCategories } from '../../hooks/useProducts'

const boxStyle = {
  maxWidth: 900,
  margin: '40px auto',
  padding: 24,
  border: '1px solid #e5e5e5',
  borderRadius: 12,
  fontFamily: 'Arial, sans-serif',
} as const

const cardStyle = {
  padding: 16,
  marginTop: 12,
  border: '1px solid #eeeeee',
  borderRadius: 10,
} as const

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
    return <main style={boxStyle}>Loading API data...</main>
  }

  if (productsError) {
    return <main style={boxStyle}>Products Error: {productsError.message}</main>
  }

  if (categoriesError) {
    return <main style={boxStyle}>Categories Error: {categoriesError.message}</main>
  }

  const products = productsData?.data || []
  const categories = categoriesData?.data || []

  return (
    <main style={boxStyle}>
      <h1 style={{ marginBottom: 8 }}>Inner Beast API Connected</h1>
      <p>This page only tests live backend data.</p>

      <section style={{ marginTop: 24 }}>
        <h2>API Summary</h2>
        <p>Total Categories: {categoriesData?.count || categories.length}</p>
        <p>Total Products: {productsData?.count || products.length}</p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Categories</h2>
        {categories.slice(0, 8).map((category) => (
          <div key={category._id} style={cardStyle}>
            <strong>{category.name}</strong>
            <p>Slug: {category.slug}</p>
          </div>
        ))}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Products</h2>
        {products.slice(0, 10).map((product) => (
          <div key={product._id} style={cardStyle}>
            <strong>{product.title}</strong>
            <p>Price: Rs. {product.price}</p>
            <p>Slug: {product.slug}</p>
          </div>
        ))}
      </section>
    </main>
  )
}

export default TestApiPage

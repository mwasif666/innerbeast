import ProductOneScrolling from '../../product/one-scrolling/page'
import ProductReviewsBySlug from '@/components/Product/ProductReviewsBySlug'

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  return (
    <ProductOneScrolling>
      <ProductReviewsBySlug slug={params.slug} />
    </ProductOneScrolling>
  )
}

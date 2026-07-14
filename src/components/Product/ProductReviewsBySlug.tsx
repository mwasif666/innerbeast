"use client";

import { useSingleProduct } from "@/hooks/useProducts";
import ProductReviews from "./ProductReviews";

const ProductReviewsBySlug = ({ slug }: { slug: string }) => {
  const productQuery = useSingleProduct(slug);
  const productId = productQuery.data?.data?._id;

  if (!productId || productQuery.isError) return null;

  return <ProductReviews productId={productId} />;
};

export default ProductReviewsBySlug;

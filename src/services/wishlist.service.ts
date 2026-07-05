import api from "./api";
import { ProductType } from "@/type/ProductType";

type BackendImage = string | { url?: string; alt?: string };

type BackendProduct = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  slug?: string;
  sku?: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  stock?: number;
  images?: BackendImage[];
  category?: string | { _id?: string; name?: string; slug?: string };
  sizes?: string[];
  colors?: Array<{ name?: string; hex?: string }>;
  fitType?: string;
  gender?: string;
  material?: string;
  tags?: string[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  ratingsAverage?: number;
  ratingsCount?: number;
};

export type WishlistResponse = {
  success: boolean;
  message?: string;
  data: {
    _id?: string;
    products?: BackendProduct[];
    items?: Array<{
      product: BackendProduct;
      addedAt?: string;
    }>;
    count?: number;
  };
};

const imageToUrl = (image: BackendImage) =>
  typeof image === "string" ? image : image?.url || "";

export const backendProductToProductType = (
  product: BackendProduct,
): ProductType => {
  const id = product.id || product._id || "";
  const imageUrls = (product.images || []).map(imageToUrl).filter(Boolean);
  const originalPrice = Number(product.price || 0);
  const activePrice =
    product.discountPrice &&
    product.discountPrice > 0 &&
    product.discountPrice < originalPrice
      ? Number(product.discountPrice)
      : originalPrice;

  const categoryName =
    typeof product.category === "object"
      ? product.category?.name || ""
      : product.category || "";

  return {
    id,
    category: categoryName,
    type: product.fitType || categoryName || "",
    name: product.name || product.title || "",
    gender: product.gender || "Unisex",
    new: product.isNewArrival === true,
    sale: Boolean(product.discountPrice && product.discountPrice > 0),
    rate: Number(product.ratingsAverage || 0),
    price: activePrice,
    originPrice: originalPrice,
    currency: "£",
    brand: "Inner Beast",
    sold: 0,
    quantity: Number(product.stock || 0),
    quantityPurchase: 1,
    sizes: product.sizes || [],
    variation: [],
    thumbImage: imageUrls,
    images: imageUrls,
    description: product.description || "",
    action: "add to cart",
    slug: product.slug || id,
  };
};

export const extractWishlistProducts = (
  response?: WishlistResponse,
): ProductType[] => {
  if (!response?.data) return [];

  const products =
    response.data.products ||
    response.data.items?.map((item) => item.product).filter(Boolean) ||
    [];

  return products.map(backendProductToProductType);
};

export const getRemoteWishlist = () => api<WishlistResponse>("/wishlist");

export const addRemoteWishlistItem = (productId: string) =>
  api<WishlistResponse>(`/wishlist/${productId}`, {
    method: "POST",
  });

export const removeRemoteWishlistItem = (productId: string) =>
  api<WishlistResponse>(`/wishlist/${productId}`, {
    method: "DELETE",
  });

export const clearRemoteWishlist = () =>
  api<WishlistResponse>("/wishlist", {
    method: "DELETE",
  });

export const mergeRemoteWishlist = (productIds: string[]) =>
  api<WishlistResponse>("/wishlist/merge", {
    method: "POST",
    body: { productIds },
  });

// src/types/product.ts

export interface Specification {
  id: number;
  processor?: string;
  graphics?: string;
  memory?: string;
  storage?: string;
  display?: string;
  operatingSystem?: string;
  battery?: string;
  weight?: string;
  connectivity?: string;
  keyFeatures?: string;
}

export interface ProductReview {
  id: number;
  productId: number;
  reviewerName: string;
  rating: number;
  comment: string;
}


export interface ReviewFormData {
  reviewerName: string;
  rating: number;
  comment: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageData?: number[]; 
  imageUrl: string; 
  brandName: string;
  modelName: string;
  category: string;
  manufacturingDate: string;
  deliveryDate: string;
  rating: number;
  specification: Specification;
  reviews: ProductReview[];
  
  originalPrice?: number;
  discount?: number;
  reviewCount?: number;
  features?: string[];
  description?: string;
  warranty?: string;
  delivery?: string;
  inStock?: boolean;
}

export interface SearchResponse {
  products: Product[];
  availableBrands: string[];
}

export interface WishlistItem {
  wishlistItemId: number;
  productId: number;
  productName: string;
  productPrice: number;
  productImageUrl: string; 
  addedAt: string; 
}
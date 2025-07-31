import axios from 'axios';
import { Product, ProductReview, ReviewFormData, SearchResponse } from '@/types/product';

const API_BASE_URL = 'http://localhost:8080/api';


const convertByteArrayToUrl = (byteArray: number[] | undefined): string => {
  if (!byteArray || byteArray.length === 0) {
    
    return '/src/assets/placeholder.png'; 
  }
  const blob = new Blob([new Uint8Array(byteArray)], { type: 'image/jpeg' });
  return URL.createObjectURL(blob);
};

export const searchProducts = async (keyword: string, brands?: string[]): Promise<SearchResponse> => {
    const params = new URLSearchParams({ keyword });
    if (brands) {
        brands.forEach(brand => params.append('brands', brand));
    }
    const response = await axios.get<SearchResponse>(`${API_BASE_URL}/products/search`, { params });

    
    response.data.products = response.data.products.map(p => ({
        ...p,
        imageUrl: convertByteArrayToUrl(p.imageData),
    }));
    return response.data;
};

export const getProductById = async (productId: string): Promise<Product> => {
    const response = await axios.get<Product>(`${API_BASE_URL}/products/${productId}`);
    const product = response.data;
    
    
    product.imageUrl = convertByteArrayToUrl(product.imageData);
    return product;
};

export const getReviewsByProductId = async (productId: string): Promise<ProductReview[]> => {
    const response = await axios.get<ProductReview[]>(`${API_BASE_URL}/products/${productId}/reviews`);
    return response.data;
};

export const createReview = async (productId: string, reviewData: ReviewFormData): Promise<ProductReview> => {
    const response = await axios.post<ProductReview>(`${API_BASE_URL}/products/${productId}/reviews`, reviewData);
    return response.data;
};
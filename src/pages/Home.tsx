import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

// Fallback image


// Interface for Product based on backend Product entity
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  brandName: string;
  modelName: string;
  category: string;
  manufacturingDate: string;
  deliveryDate: string;
  rating: number;
  reviews?: { id: number; reviewerName: string; rating: number; comment: string }[];
}

const Home = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // API client configuration
  const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
    withCredentials: true,
  });

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch products with limit and rating filter
        const response = await api.get<Product[]>("/products", {
          params: {
            limit: 4,
            rating: 4.5, // Filter for high-rated products
          },
        });
        const products = response.data.map((product) => ({
          id: product.id.toString(),
          name: product.name,
          image: product.imageUrl, 
          price: product.price,
          rating: product.rating || 0,
          reviewCount: product.reviews ? product.reviews.length : 0,
          category: product.category,
          brandName: product.brandName,
        }));
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Error fetching featured products:", error);
        setError("Failed to load featured products.");
        toast.error("Failed to load featured products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <CategorySection />

      {/* Featured Products */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Hand-picked deals just for you</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/deals")}
            >
              View All Deals
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <p className="text-muted-foreground">Loading featured products...</p>
            ) : error ? (
              <p className="text-muted-foreground">{error}</p>
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))
            ) : (
              <p className="text-muted-foreground">No featured products available.</p>
            )}
          </div>
        </div>
      </section>

      {/* Trending Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Trending This Week
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 cursor-pointer transition-transform hover:scale-105"
              onClick={() => navigate("/laptops")}
            >
              <div className="text-4xl mb-4">💻</div>
              <h3 className="text-xl font-bold mb-2">Laptops</h3>
              <p className="text-muted-foreground mb-4">Starting from ₹29,999</p>
              <Button variant="outline" size="sm">
                Shop Now
              </Button>
            </div>

            <div
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 cursor-pointer transition-transform hover:scale-105"
              onClick={() => navigate("/phones")}
            >
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-2">Smartphones</h3>
              <p className="text-muted-foreground mb-4">Starting from ₹9,999</p>
              <Button variant="outline" size="sm">
                Shop Now
              </Button>
            </div>

            <div
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 cursor-pointer transition-transform hover:scale-105"
              onClick={() => navigate("/headphones")}
            >
              <div className="text-4xl mb-4">🎧</div>
              <h3 className="text-xl font-bold mb-2">Headphones</h3>
              <p className="text-muted-foreground mb-4">Starting from ₹1,999</p>
              <Button variant="outline" size="sm">
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
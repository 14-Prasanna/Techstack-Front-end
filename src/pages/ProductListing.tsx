import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import Header from "@/components/layout/Header";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";
import { ShoppingCart, Heart } from "lucide-react"; // Added for buttons
import { toast } from "sonner";

// Interface for SearchResponseDTO based on backend
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  brandName: string;
  category: string;
  rating: number;
  modelName: string;
  manufacturingDate: string;
  deliveryDate: string;
}

interface SearchResponse {
  products: Product[];
  availableBrands: string[];
}

// Helper function to convert imageUrl to a displayable image
const convertImageUrl = (imageUrl: string | null): string => {
  if (!imageUrl) return "/src/assets/placeholder.png"; // Fallback placeholder
  return imageUrl; // Backend provides a direct URL or base64 string
};

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword");
  const urlBrands = searchParams.get("brands")?.split(",") || []; // Parse multiple brands from URL (e.g., "Sony,Razer")

  // State for fetched data
  const [products, setProducts] = useState<Product[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters
  const [selectedBrands, setSelectedBrands] = useState<string[]>(urlBrands); // Initialize with URL brands
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  // State for wishlist and cart actions
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false); // For wishlist loading state

  // Effect to fetch data from the API
  useEffect(() => {
    if (!keyword) {
      setLoading(false);
      setProducts([]);
      setAvailableBrands([]);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ keyword });
        selectedBrands.forEach((brand) => params.append("brands", brand));

        const response = await axios.get<SearchResponse>(
          `http://localhost:8080/api/products/search`,
          { params }
        );

        // Map products to include image URL and filter by price and rating
        const productsWithImageUrls = response.data.products
          .map((p) => ({
            ...p,
            image: convertImageUrl(p.imageUrl),
          }))
          .filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])
          .filter((p) => p.rating >= ratingFilter);

        setProducts(productsWithImageUrls);
        setAvailableBrands(response.data.availableBrands);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Could not load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, selectedBrands, priceRange, ratingFilter]);

  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brand]);
    } else {
      setSelectedBrands(selectedBrands.filter((b) => b !== brand));
    }
    // Update URL with selected brands
    const newParams = new URLSearchParams(searchParams);
    if (checked) {
      newParams.set("brands", [...selectedBrands, brand].join(","));
    } else {
      const updatedBrands = selectedBrands.filter((b) => b !== brand);
      newParams.set("brands", updatedBrands.join(",") || "");
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setPriceRange([0, 200000]);
    setRatingFilter(0);
    setSortBy("featured");
    // Clear URL parameters
    const newParams = new URLSearchParams({ keyword: keyword || "" });
    setSearchParams(newParams);
  };

  // Sort products based on sortBy value
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "price-low-high") {
      return a.price - b.price;
    }
    return 0; // Default "featured" sort (no change)
  });

  const pageTitle = keyword
    ? `Results for "${keyword}" (${products.length})`
    : `All Products (${products.length})`;

  // Handler for Add to Cart
  const handleAddToCart = async (productId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      await axios.post(
        `http://localhost:8080/api/cart/add`,
        { productId, quantity: 1 }, // Default quantity to 1
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Added to cart!");
    } catch (error) {
      toast.error("Failed to add to cart. Please try again.");
      console.error("Add to cart error:", error);
    }
  };

  // Handler for Add to Wishlist
  const handleAddToWishlist = async (productId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to add items to your wishlist.");
      navigate("/login");
      return;
    }

    setIsTogglingWishlist(true); // Disable button to prevent multiple clicks

    try {
      const requestBody = { productId };
      await axios.post(
        `http://localhost:8080/api/wishlist`,
        requestBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Note: This assumes the backend doesn't return wishlist status; you might need to fetch it
      toast.success("Added to your wishlist!");
    } catch (error) {
      toast.error("Could not add to wishlist. Please try again.");
      console.error("Add to wishlist error:", error);
    } finally {
      setIsTogglingWishlist(false); // Re-enable button
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div
            className={`w-64 flex-shrink-0 space-y-6 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-primary"
                  >
                    Clear All
                  </Button>
                </div>

                {/* Price Range Filter */}
                <div className="space-y-4 mb-6">
                  <Label className="font-medium">Price Range</Label>
                  <Slider
                    min={0}
                    max={200000}
                    step={1000}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>₹{priceRange[0].toLocaleString()}</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="space-y-4 mb-6">
                  <Label className="font-medium">Minimum Rating</Label>
                  <Select
                    value={ratingFilter.toString()}
                    onValueChange={(value) => setRatingFilter(Number(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any</SelectItem>
                      <SelectItem value="1">1+ Stars</SelectItem>
                      <SelectItem value="2">2+ Stars</SelectItem>
                      <SelectItem value="3">3+ Stars</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="4.5">4.5+ Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Brands Filter */}
                {availableBrands.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <Label className="font-medium">Brands</Label>
                    {availableBrands.map((brand) => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox
                          id={brand}
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={(checked) =>
                            handleBrandChange(brand, checked as boolean)
                          }
                        />
                        <Label htmlFor={brand} className="text-sm font-medium">
                          {brand}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">{pageTitle}</h1>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low-high">
                      Price: Low to High
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Conditional Rendering */}
            {loading ? (
              <div className="text-center py-16">Loading products...</div>
            ) : error ? (
              <div className="text-center py-16 text-red-500">{error}</div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id.toString()}
                    name={product.name}
                    image={product.image}
                    price={product.price}
                    rating={product.rating || 0}
                    reviewCount={0} // Review count not provided in Product entity
                    category={product.category}
                    brandName={product.brandName}
                    onAddToCart={() => handleAddToCart(product.id)}
                    onAddToWishlist={() => handleAddToWishlist(product.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search for another term.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
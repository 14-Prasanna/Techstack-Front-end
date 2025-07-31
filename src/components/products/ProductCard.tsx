import { useState, FC, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import axios from "axios"; // Added to make API calls

// ====================================================================
// Interface for the component's props
// ====================================================================
interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  price: number;
  rating: number;
  reviewCount?: number;
  category: string;
  brandName?: string;
}

// ====================================================================
// Main ProductCard Component
// ====================================================================
const ProductCard: FC<ProductCardProps> = ({
  id,
  name,
  image,
  price,
  rating,
  reviewCount = 0,
  category,
  brandName,
}) => {
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false); // State to prevent multiple clicks on Add to Cart
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false); // State to prevent multiple clicks on Wishlist

  // Internal function to add/remove from wishlist
  const addToWishlist = async (productId: number) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token available");

    const url = `http://localhost:8080/api/wishlist`;
    const method = isWishlisted ? "delete" : "post"; // Assume DELETE to remove, POST to add
    const body = isWishlisted ? undefined : { productId };

    await axios({
      method,
      url,
      data: body,
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  // Internal function to add to cart
  const addToCart = async (productId: number, quantity: number) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token available");

    await axios.post(
      `http://localhost:8080/api/cart/add`,
      { productId, quantity },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const handleWishlistToggle = async (e: MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    if (!localStorage.getItem("token")) {
      toast.error("Please log in to add items to your wishlist.");
      navigate("/login");
      return;
    }

    setIsTogglingWishlist(true); // Disable button to prevent multiple clicks
    try {
      // Optimistic UI update
      setIsWishlisted(!isWishlisted);
      await addToWishlist(Number(id));
      toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist!");
    } catch (error) {
      toast.error("Could not update wishlist. Please try again.");
      setIsWishlisted(!isWishlisted); // Revert UI on error
      console.error("Wishlist error:", error);
    } finally {
      setIsTogglingWishlist(false); // Re-enable button
    }
  };

  const handleAddToCart = async (e: MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    if (!localStorage.getItem("token")) {
      toast.error("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(Number(id), 1);
      toast.success("Product added to your cart!");
    } catch (error) {
      toast.error("Failed to add product to cart.");
      console.error("Add to cart error:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleProductClick = () => {
    navigate(`/product/${id}`);
  };

  return (
    <Card
      className="group flex flex-col h-full cursor-pointer transition-all duration-300 hover:shadow-xl border-0 shadow-md overflow-hidden"
      onClick={handleProductClick}
    >
      <CardContent className="p-0 flex flex-col flex-grow">
        <div className="relative overflow-hidden">
          <img
            src={image || '/src/assets/placeholder.png'}
            alt={name}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <Button
            variant="ghost"
            size="sm"
            className={`absolute top-2 right-2 w-8 h-8 rounded-full p-0 transition-colors shadow-md ${
              isWishlisted
                ? "bg-destructive text-white hover:bg-destructive/90"
                : "bg-white/80 hover:bg-white"
            }`}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            onClick={handleWishlistToggle}
            disabled={isTogglingWishlist} // Disable during API call
          >
            <Heart className={`w-4 h-4 transition-all ${isWishlisted ? "fill-current" : ""}`} />
          </Button>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-semibold text-sm line-clamp-2 mb-2 min-h-[2.5rem] flex-grow">
            {name}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
            {reviewCount > 0 && <span className="text-xs text-muted-foreground">({reviewCount})</span>}
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl font-bold text-primary">
              ₹{price.toLocaleString("en-IN")}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs mb-4">
            {category}
          </Badge>

          <div className="mt-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isAdding ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
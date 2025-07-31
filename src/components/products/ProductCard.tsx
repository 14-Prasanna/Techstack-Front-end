import { Star, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  name: string;
  image: string; // URL or base64 string
  price: number;
  rating: number;
  reviewCount?: number; // Optional since not provided by Product entity
  category: string;
  brandName?: string;
}

const ProductCard = ({
  id,
  name,
  image,
  price,
  rating,
  reviewCount = 0,
  category,
  brandName,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(false);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlisted(!wishlisted);
    // TODO: Implement wishlist API call
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement add to cart API call
  };

  const handleProductClick = () => {
    navigate(`/product/${id}`);
  };

  return (
    <Card
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg border-0 shadow-md overflow-hidden"
      onClick={handleProductClick}
    >
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <Button
            variant="ghost"
            size="sm"
            className={`absolute top-2 right-2 w-8 h-8 rounded-full p-0 transition-colors ${
              wishlisted
                ? "bg-destructive text-white hover:bg-destructive/90"
                : "bg-white/80 hover:bg-white"
            }`}
            onClick={handleWishlistToggle}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? "fill-current" : ""}`} />
          </Button>
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="cart"
              size="sm"
              className="w-full"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
            {name}
          </h3>
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(rating)
                      ? "fill-rating text-rating"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({reviewCount})</span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-price">
              ₹{price.toLocaleString()}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
          {brandName && (
            <p className="text-xs text-muted-foreground">Brand: {brandName}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
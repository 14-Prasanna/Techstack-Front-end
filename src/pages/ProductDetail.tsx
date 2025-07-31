import { useState, useEffect, FC, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

// Type Definitions
interface Specification {
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

interface ProductReview {
  id: number;
  productId: number;
  reviewerName: string;
  rating: number;
  comment: string;
}

interface ReviewFormData {
  reviewerName: string;
  rating: number;
  comment: string;
}

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
  specification: Specification;
  reviews: ProductReview[];
}

// Helper to handle image URL
const convertImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) return "/src/assets/placeholder.png";
  return imageUrl;
};

// Review Form Component
interface ReviewFormProps {
  productId: number;
  onReviewSubmit: (data: ReviewFormData) => void;
}

const ReviewForm: FC<ReviewFormProps> = ({ productId, onReviewSubmit }) => {
  const [open, setOpen] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    onReviewSubmit({ reviewerName, rating, comment });
    setOpen(false);
    setReviewerName("");
    setComment("");
    setRating(0);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Your Review</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Rating</Label>
              <div className="col-span-3 flex items-center">
                {[...Array(5)].map((_, index) => {
                  const starValue = index + 1;
                  return (
                    <Star
                      key={starValue}
                      className={`cursor-pointer w-6 h-6 transition-colors ${
                        starValue <= (hoverRating || rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(starValue)}
                    />
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="comment" className="text-right">
                Comment
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="col-span-3"
                required
                placeholder="Tell us what you think..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Submit Review</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Main Product Detail Component
const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("Product ID is missing.");
      setLoading(false);
      return;
    }

    const fetchProductData = async () => {
      try {
        setLoading(true);
        const response = await axios.get<Product>(
          `http://localhost:8080/api/products/${id}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
          }
        );
        const fetchedProduct = response.data;
        fetchedProduct.imageUrl = convertImageUrl(fetchedProduct.imageUrl);
        setProduct(fetchedProduct);
      } catch (err) {
        setError("Failed to fetch product details. The product may not exist.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleReviewSubmit = async (reviewData: ReviewFormData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    if (!id) return;
    try {
      const response = await axios.post<ProductReview>(
        `http://localhost:8080/api/products/${id}/reviews`,
        reviewData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newReview = response.data;
      setProduct((prevProduct) => {
        if (!prevProduct) return null;
        return {
          ...prevProduct,
          reviews: [...(prevProduct.reviews || []), newReview],
          rating:
            ((prevProduct.rating || 0) * (prevProduct.reviews?.length || 0) +
              newReview.rating) /
            ((prevProduct.reviews?.length || 0) + 1),
        };
      });
      toast.success("Thank you for your review!");
    } catch (error) {
      toast.error("Failed to submit review. Please try again.");
      console.error("Review submission error:", error);
    }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    if (!id || !product) return;
    try {
      await axios.post(
        `http://localhost:8080/api/cart/add`,
        { productId: Number(id), quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Added to cart!");
      // Optionally update cart count in Header (requires context or state management)
    } catch (error) {
      toast.error("Failed to add to cart. Please try again.");
      console.error("Add to cart error:", error);
    }
  };

  const handleAddToWishlist = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setIsWishlisted(true);
    toast.success("Added to wishlist!");
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading product...</div>;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{error || "Product not found"}</h1>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const displayImages = [product.imageUrl, product.imageUrl, product.imageUrl].filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <nav className="text-sm text-muted-foreground mb-6">
          <span className="cursor-pointer hover:text-primary" onClick={() => navigate("/")}>
            Home
          </span>
          {" > "}
          <span
            className="cursor-pointer hover:text-primary"
            onClick={() => navigate(`/products/search?keyword=${product.category}`)}
          >
            {product.category}
          </span>
          {" > "}
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg border">
              <img
                src={displayImages[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {displayImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Badge variant="outline">{product.brandName}</Badge>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">{product.modelName}</p>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(product.rating || 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
                <span className="font-semibold ml-2">{(product.rating || 0).toFixed(1)}</span>
              </div>
              <span className="text-muted-foreground">
                ({(product.reviews || []).length} reviews)
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-3xl font-bold">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  product.stock > 0 ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span
                className={`font-medium ${
                  product.stock > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1"
                  disabled={product.stock === 0}
                  onClick={() => navigate("/checkout")}
                >
                  Buy Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  disabled={product.stock === 0}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
              </div>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleAddToWishlist}
              >
                <Heart
                  className={`w-5 h-5 mr-2 ${isWishlisted ? "fill-red-500" : ""}`}
                />
                {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="specifications" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({(product.reviews || []).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Technical Specifications</h3>
                <div className="grid gap-4">
                  {product.specification &&
                    Object.entries(product.specification).map(([key, value]) =>
                      key !== "id" ? (
                        <div
                          key={key}
                          className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b last:border-b-0"
                        >
                          <dt className="font-medium text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </dt>
                          <dd className="md:col-span-2">{String(value || "N/A")}</dd>
                        </div>
                      ) : null
                    )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6 leading-relaxed">
                A high-performance device from {product.brandName}, the {product.name} offers
                top-tier features for professionals and enthusiasts alike, combining powerful
                performance with a sleek design.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Customer Reviews</h3>
                  <ReviewForm productId={product.id} onReviewSubmit={handleReviewSubmit} />
                </div>
                <div className="space-y-6">
                  {(product.reviews || []).length > 0 ? (
                    product.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-semibold">{review.reviewerName}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-gray-200 text-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No reviews yet. Be the first to write one!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductDetail;
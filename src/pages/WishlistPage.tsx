import { useState, useEffect, FC } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, ArrowRight } from "lucide-react";
import { toast } from "sonner";


interface WishlistItem {
  wishlistItemId: number;
  productId: number;
  productName: string;
  productPrice: number;
  productImageUrl: string; 
  addedAt: string;
}

const API_BASE_URL = 'http://localhost:8080/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
       
        throw new Error("No authentication token found.");
    }
    return { Authorization: `Bearer ${token}` };
};

const getWishlist = async (): Promise<WishlistItem[]> => {
    const response = await axios.get<WishlistItem[]>(`${API_BASE_URL}/wishlist`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

const removeFromWishlist = async (wishlistItemId: number): Promise<WishlistItem[]> => {
    const response = await axios.delete<WishlistItem[]>(`${API_BASE_URL}/wishlist/${wishlistItemId}`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

const addToCart = async (productId: number, quantity: number) => {
    return await axios.post(`${API_BASE_URL}/cart/add`, 
        { productId, quantity },
        { headers: getAuthHeaders() }
    );
};


const WishlistPage: FC = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!localStorage.getItem("token")) {
        toast.error("Please log in to view your wishlist.");
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const data = await getWishlist();
        setWishlistItems(data);
      } catch (err) {
        setError("Failed to fetch your wishlist. Please try again later.");
        console.error("Fetch wishlist error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [navigate]);

  const handleRemoveItem = async (wishlistItemId: number) => {
    try {
      const updatedWishlist = await removeFromWishlist(wishlistItemId);
      setWishlistItems(updatedWishlist); // Update state with the fresh list from the server
      toast.success("Item removed from your wishlist!");
    } catch (error) {
      toast.error("Failed to remove item. Please try again.");
      console.error("Remove from wishlist error:", error);
    }
  };

  const handleAddToCart = async (productId: number) => {
    try {
      await addToCart(productId, 1);
      toast.success("Product has been added to your cart!");
    } catch (error) {
      toast.error("Failed to add product to cart. Please try again.");
      console.error("Add to cart error:", error);
    }
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <p>Loading your wishlist...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Wishlist ({wishlistItems.length})</h1>

        {error && <div className="text-center py-10 text-red-500 bg-red-50 rounded-md">{error}</div>}

        {!error && wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.wishlistItemId} className="overflow-hidden group transition-all duration-300 hover:shadow-xl">
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="relative mb-4">
                    <img
                      src={item.productImageUrl || "/src/assets/placeholder.png"}
                      alt={item.productName}
                      className="aspect-square w-full object-cover rounded-md cursor-pointer transition-transform duration-300 group-hover:scale-105"
                      onClick={() => handleProductClick(item.productId)}
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-9 w-9 rounded-full shadow-md"
                      title="Remove from Wishlist"
                      onClick={() => handleRemoveItem(item.wishlistItemId)}
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </Button>
                  </div>
                  <div className="flex flex-col flex-grow">
                    <h3
                      className="font-semibold text-base leading-tight cursor-pointer hover:underline flex-grow"
                      onClick={() => handleProductClick(item.productId)}
                    >
                      {item.productName}
                    </h3>
                    <p className="text-2xl font-bold my-2 text-primary">
                      ₹{item.productPrice.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Button className="w-full" onClick={() => handleAddToCart(item.productId)}>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => navigate(`/product/${item.productId}`)}>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="text-center py-20 border-2 border-dashed rounded-lg bg-muted/50">
              <div className="text-6xl mb-4">❤️</div>
              <h2 className="text-2xl font-bold mb-2">Your Wishlist is Empty</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You haven’t saved any items yet. Start exploring and add products you love!
              </p>
              <Button onClick={() => navigate("/")}>
                Discover Products <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
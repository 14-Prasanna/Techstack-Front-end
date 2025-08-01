import { useState, useEffect, FC } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface CartItemDTO {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  imageUrl: string; 
}

interface CartResponseDTO {
  id: number;
  userId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  cartItems: CartItemDTO[];
}

const Cart: FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCartData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to view your cart.");
        navigate("/login");
        return;
      }
      try {
        setLoading(true);
       
        const response = await axios.get<CartResponseDTO>(
          `http://localhost:8080/api/cart`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCart(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError("Your cart is empty."); 
        } else {
          setError("Failed to fetch cart details. Please try again.");
        }
        console.error("Fetch cart error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, [navigate]);

  const handleRemoveFromCart = async (cartItemId: number) => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    try {
   
      const response = await axios.delete<CartResponseDTO>(
        `http://localhost:8080/api/cart/items/${cartItemId}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
     
      setCart(response.data);
      toast.success("Item removed from cart!");
    } catch (error) {
      toast.error("Failed to remove item from cart.");
      console.error("Remove from cart error:", error);
    }
  };

  const handleDeleteCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    
   
    if (!window.confirm("Are you sure you want to delete your entire cart? This cannot be undone.")) {
      return;
    }

    try {
    
      await axios.delete(`http://localhost:8080/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(null); 
      toast.success("Cart has been successfully deleted!");
    } catch (error) {
      toast.error("Failed to delete cart.");
      console.error("Delete cart error:", error);
    }
  };

 
  const calculateSubtotal = () => {
    if (!cart?.cartItems) return 0;
    return cart.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading cart...</div>;
  }

  if (error || !cart || cart.cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{error || "Your Cart is Empty"}</h1>
          <Button onClick={() => navigate("/")}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Your Cart ({cart.cartItems.length} items)</h1>
        
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <img
                    src={item.imageUrl || "/src/assets/placeholder.png"}
                    alt={item.productName}
                    className="w-24 h-24 object-cover rounded-md border"
                  />
                  <div className="flex-1">
                    <h3
                      className="font-semibold cursor-pointer hover:underline"
                      // CORRECTED: The route for product detail is /product/:id
                      onClick={() => navigate(`/product/${item.productId}`)}
                    >
                      {item.productName}
                    </h3>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    <p className="font-bold text-lg">
                      ₹{item.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFromCart(item.id)}
                  >
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 sticky top-24">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Order Summary</h2>
                <Separator />
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{calculateSubtotal().toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{calculateSubtotal().toLocaleString("en-IN")}</span>
                </div>
                <Button className="w-full" variant="outline" onClick={handleDeleteCart}>
                  Delete Entire Cart
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
import { useState, useEffect, FC, FormEvent, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// ====================================================================
// 1. TYPE DEFINITIONS
// ====================================================================

// Interface for a single item to be displayed in the order summary
interface CheckoutItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

// Interface for the state passed via react-router's navigate function
interface CheckoutLocationState {
  cartItemIds?: number[];
  directProduct?: CheckoutItem;
}

// Type matching the backend's CheckoutRequestDTO for the POST request
type PaymentMethod = "UPI" | "WALLET" | "CASH_ON_HAND";
interface CheckoutRequestDTO {
  cartItemIds?: number[];
  directProductId?: number;
  directProductQuantity?: number;
  addressLine1: string;
  addressLine2?: string;
  district: string;
  state: string;
  country: string;
  phoneNumber: string;
  alternativePhoneNumber?: string;
  paymentMethod: PaymentMethod;
}

// Type for the successful order response from the backend
interface OrderResponseDTO {
    orderId: number;
}

// Type for a single item coming from the /api/cart backend endpoint
interface BackendCartItem {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    imageUrl: string;
}


// ====================================================================
// 2. MAIN CHECKOUT PAGE COMPONENT
// ====================================================================
const CheckoutPage: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as CheckoutLocationState | null;

  // State for data fetching and UI control
  const [itemsToDisplay, setItemsToDisplay] = useState<CheckoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // State for the form inputs
  const [formData, setFormData] = useState({
    addressLine1: "", addressLine2: "", district: "", state: "",
    country: "India", phoneNumber: "", alternativePhoneNumber: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to proceed to checkout.");
      navigate("/login");
      return;
    }

    const prepareCheckout = async () => {
      // Scenario 1: Direct "Buy Now" from a product page
      if (locationState?.directProduct) {
        setItemsToDisplay([locationState.directProduct]);
        setLoading(false);
      } 
      // Scenario 2: Checkout from the cart page
      else if (locationState?.cartItemIds && locationState.cartItemIds.length > 0) {
        try {
          const response = await axios.get(`http://localhost:8080/api/cart`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const cartItems = response.data.cartItems.filter((item: BackendCartItem) => 
            locationState.cartItemIds!.includes(item.id)
          );
          if (cartItems.length === 0) throw new Error("Selected cart items not found.");
          setItemsToDisplay(cartItems.map((item: BackendCartItem) => ({ ...item, name: item.productName })));
        } catch (err) {
          setError("Failed to load selected cart items. Please try again.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      } 
      // Scenario 3: User navigated here directly without items
      else {
        toast.error("No items selected for checkout.");
        navigate("/cart"); // Redirect to cart page
      }
    };

    prepareCheckout();
  }, [locationState, navigate]);

  // Memoized calculation for the order summary to prevent re-calculating on every render
  const orderSummary = useMemo(() => {
    if (itemsToDisplay.length === 0) return { subtotal: 0, cgst: 0, sgst: 0, total: 0 };
    const subtotal = itemsToDisplay.reduce((total, item) => total + item.price * item.quantity, 0);
    const totalTax = subtotal * 0.05; // 5% total tax
    const total = subtotal + totalTax;
    return { subtotal, cgst: totalTax / 2, sgst: totalTax / 2, total };
  }, [itemsToDisplay]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    if (!paymentMethod) { toast.error("Please select a payment method."); return; }

    setIsPlacingOrder(true);
    const requestBody: Partial<CheckoutRequestDTO> = { ...formData, paymentMethod };

    if (locationState?.directProduct) {
      requestBody.directProductId = locationState.directProduct.productId;
      requestBody.directProductQuantity = locationState.directProduct.quantity;
    } else if (locationState?.cartItemIds) {
      requestBody.cartItemIds = locationState.cartItemIds;
    }

    try {
      const response = await axios.post<OrderResponseDTO>(
        `http://localhost:8080/api/checkout`,
        requestBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Order #${response.data.orderId} placed successfully!`);
      // You can redirect to an order confirmation page here
      navigate(`/`); 
    } catch (err) {
      toast.error("Failed to place order. Please check your details and try again.");
      console.error(err);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Preparing your checkout...</div>;

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{error}</h1>
          <Button onClick={() => navigate("/cart")}>Return to Cart</Button>
        </div>
      </div>
    );
   }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Form for Address and Payment */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>1. Shipping Address</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="addressLine1">Address Line 1</Label>
                  <Input id="addressLine1" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} required placeholder="House No, Building, Street, Area" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                  <Input id="addressLine2" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} placeholder="Apartment, suite, unit, etc." />
                </div>
                <div>
                  <Label htmlFor="district">District / City</Label>
                  <Input id="district" name="district" value={formData.district} onChange={handleInputChange} required placeholder="e.g., Mumbai" />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" value={formData.state} onChange={handleInputChange} required placeholder="e.g., Maharashtra" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" name="country" value={formData.country} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input id="phoneNumber" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleInputChange} required placeholder="10-digit mobile number" />
                </div>
                <div>
                  <Label htmlFor="alternativePhoneNumber">Alternative Phone (Optional)</Label>
                  <Input id="alternativePhoneNumber" name="alternativePhoneNumber" type="tel" value={formData.alternativePhoneNumber} onChange={handleInputChange} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>2. Payment Method</CardTitle></CardHeader>
              <CardContent>
                <RadioGroup onValueChange={(value: PaymentMethod) => setPaymentMethod(value)} className="space-y-2">
                  <Label className="flex items-center gap-3 border p-4 rounded-md cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-colors">
                    <RadioGroupItem value="UPI" id="upi" />
                    <span>UPI</span>
                  </Label>
                  <Label className="flex items-center gap-3 border p-4 rounded-md cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-colors">
                    <RadioGroupItem value="WALLET" id="wallet" />
                    <span>Wallet</span>
                  </Label>
                  <Label className="flex items-center gap-3 border p-4 rounded-md cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-colors">
                    <RadioGroupItem value="CASH_ON_HAND" id="cash" />
                    <span>Cash on Delivery</span>
                  </Label>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1 sticky top-24">
            <Card>
              <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {itemsToDisplay.map(item => (
                  <div key={item.productId} className="flex items-center gap-4 text-sm">
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md border" />
                    <div className="flex-1">
                      <p className="font-semibold line-clamp-1">{item.name}</p>
                      <p className="text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p>₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                ))}
                <Separator />
                <div className="space-y-2">
                    <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>₹{orderSummary.subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>SGST (2.5%)</span><span>₹{orderSummary.sgst.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>CGST (2.5%)</span><span>₹{orderSummary.cgst.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></div>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{orderSummary.total.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={isPlacingOrder}>
                  {isPlacingOrder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
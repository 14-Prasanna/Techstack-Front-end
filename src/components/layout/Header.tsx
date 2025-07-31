import { Search, ShoppingCart, User, Heart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItemCount, setCartItemCount] = useState<number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // API client configuration
  const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
    withCredentials: true,
  });

  // Fetch cart count and authentication status
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch cart item count
        const cartResponse = await api.get("/cart/count");
        setCartItemCount(cartResponse.data.count || 0);

        // Fetch authentication status
        const authResponse = await api.get("/auth/check");
        setIsAuthenticated(authResponse.data.authenticated);
        setUserEmail(authResponse.data.email || null);
      } catch (error) {
        console.error("Failed to fetch header data:", error);
        // Fallback to localStorage for authentication if API fails
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token);
        setUserEmail(token ? localStorage.getItem("userEmail") || null : null);
        setCartItemCount(0); // Fallback to 0 if cart fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setIsAuthenticated(false);
    setUserEmail(null);
    navigate("/");
  };

  if (loading) {
    return (
      <header className="bg-background border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-center items-center h-16">
          Loading...
        </div>
      </header>
    );
  }

  return (
    <header className="bg-background border-b sticky top-0 z-50 shadow-sm">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground py-2">
        <div className="container mx-auto px-4 text-center text-sm">
          Free shipping on orders over ₹500 | Easy 30-day returns
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">
              ElectroMart
            </span>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for laptops, phones, headphones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-3 rounded-lg border-2 focus:border-primary"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Wishlist */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/wishlist")}
              className="hidden sm:flex"
            >
              <Heart className="w-4 h-4" />
              <span className="hidden md:inline">Wishlist</span>
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/cart")}
              className="relative"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartItemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {cartItemCount}
                </Badge>
              )}
              <span className="hidden md:inline">Cart</span>
            </Button>

            {/* Profile or Login/Signup */}
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/profile")}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">
                    {userEmail ? userEmail.split("@")[0] : "Profile"}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">Login</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/signup")}
                >
                  Signup
                </Button>
              </>
            )}

            {/* Mobile Menu */}
            <Button variant="ghost" size="sm" className="sm:hidden">
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-muted/50 border-t">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-8 py-3 overflow-x-auto">
            <button
              className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap"
              onClick={() => navigate("/laptops")}
            >
              Laptops
            </button>
            <button
              className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap"
              onClick={() => navigate("/phones")}
            >
              Smartphones
            </button>
            <button
              className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap"
              onClick={() => navigate("/headphones")}
            >
              Headphones
            </button>
            <button
              className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap"
              onClick={() => navigate("/tablets")}
            >
              Tablets
            </button>
            <button
              className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap"
              onClick={() => navigate("/accessories")}
            >
              Accessories
            </button>
            <button className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap text-destructive">
              Today's Deals
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
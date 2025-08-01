import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, ShoppingCart, User, Heart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItemCount, setCartItemCount] = useState<number>(0);
  
 
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem("token"));
  
  

  useEffect(() => {
    const fetchHeaderData = async () => {
     
      if (isAuthenticated) {
        try {
          const token = localStorage.getItem("token");
          
          const response = await axios.get(
            `http://localhost:8080/api/cart`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setCartItemCount(response.data.cartItems.length);
        } catch (error) {
          console.error("Could not fetch cart count, defaulting to 0.", error);
          setCartItemCount(0);
        }
      } else {
        setCartItemCount(0); 
      }
    };

    fetchHeaderData();
    
    
    const handleCartUpdate = () => fetchHeaderData();
    window.addEventListener('cartUpdated', handleCartUpdate);

   
    return () => {
        window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [isAuthenticated]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products/search?keyword=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setIsAuthenticated(false);
    setCartItemCount(0);
    navigate("/");
   
    window.location.reload();
  };

  const userEmail = localStorage.getItem("userEmail");

  return (
    <header className="bg-background border-b sticky top-0 z-50 shadow-sm">
     
      <div className="bg-primary text-primary-foreground py-2 text-center text-sm">
        Free shipping on orders over ₹500 | Easy 30-day returns
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">
              TechStack
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
              <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-10">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/wishlist")} className="hidden sm:flex">
              <Heart className="w-5 h-5" />
            </Button>

            <Button variant="ghost" size="icon" onClick={() => navigate("/cart")} className="relative">
              <ShoppingCart className="w-5 h-5" />
              {isAuthenticated && cartItemCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            {isAuthenticated ? (
              <>
                {/* --- THIS IS THE CORRECTED BUTTON --- */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/profile")} // <-- ADDED THIS onClick HANDLER
                >
                  <User className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">
                    {userEmail ? userEmail.split("@")[0] : "Profile"}
                  </span>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                  <User className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Login</span>
                </Button>
                <Button size="default" onClick={() => navigate("/signup")}>
                  Signup
                </Button>
              </>
            )}

            <Button variant="ghost" size="icon" className="sm:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-muted/50 border-t">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-8 py-3 overflow-x-auto">
            {['Laptop', 'Mobile', 'Headphones', 'Tab', 'Gaming', 'Camera', 'Accessories'].map(category => (
                <button
                    key={category}
                    className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap"
                    onClick={() => navigate(`/products/search?keyword=${category}`)}
                >
                    {category}s
                </button>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
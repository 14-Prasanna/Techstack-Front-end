import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Zap, text: "Lightning Fast Delivery" },
    { icon: Shield, text: "Secure Payment" },
    { icon: Truck, text: "Free Shipping Over ₹500" },
  ];

  return (
    <section className="relative bg-gradient-to-br from-primary via-primary-hover to-secondary text-white overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Latest Tech
                <span className="block text-secondary">at Best Prices</span>
              </h1>
              <p className="text-lg lg:text-xl text-white/90 max-w-md">
                Discover premium electronics with unbeatable deals. From laptops to smartphones, 
                we have everything you need.
              </p>
            </div>


            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8 py-4"
                onClick={() => navigate("/category/laptops")}
              >
                Shop Laptops
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary"
                onClick={() => navigate("/deals")}
              >
                View Deals
              </Button>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-6 pt-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{feature.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          
          <div className="relative lg:block hidden">
            <div className="relative">
              <div className="w-96 h-96 bg-white/10 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
              <div className="relative z-10 text-center">
                <div className="text-8xl font-bold text-white/20 mb-4">⚡</div>
                <div className="text-2xl font-bold mb-2">Up to 70% OFF</div>
                <div className="text-lg text-white/80">On Premium Electronics</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-secondary/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gradient-to-tr from-primary-hover/30 to-transparent"></div>
    </section>
  );
};

export default HeroSection;
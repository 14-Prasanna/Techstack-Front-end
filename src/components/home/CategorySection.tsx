import { Laptop, Smartphone, Headphones, Tablet, Watch, Monitor, Camera, GamepadIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const categories = [
  { id: "Laptop", name: "Laptops", icon: Laptop, color: "from-blue-500 to-blue-600" },
  { id: "Mobile", name: "Mobiles", icon: Smartphone, color: "from-green-500 to-green-600" },
  { id: "Headphones", name: "Headphones", icon: Headphones, color: "from-purple-500 to-purple-600" },
  { id: "Tab", name: "Tablets", icon: Tablet, color: "from-orange-500 to-orange-600" },
  { id: "Smartwatch", name: "Smartwatches", icon: Watch, color: "from-pink-500 to-pink-600" },
  { id: "Camera", name: "Cameras", icon: Camera, color: "from-yellow-500 to-yellow-600" },
  { id: "Gaming", name: "Gaming", icon: GamepadIcon, color: "from-red-500 to-red-600" },
  { id: "Accessories", name: "Accessories", icon: Monitor, color: "from-indigo-500 to-indigo-600" },
];

const CategorySection = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId) => {
    navigate(`/products/search?keyword=${categoryId}`);
  };

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card
                key={category.id}
                className="group cursor-pointer transition-all duration-300 hover:shadow-lg border-0 shadow-md overflow-hidden"
                onClick={() => handleCategoryClick(category.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-sm font-medium">{category.name}</h3>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
import { useState, useEffect, FC } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, ShoppingBag, Clock } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label"; // <-- THIS IS THE FIX

// ====================================================================
// Type Definitions
// ====================================================================
interface UserProfile {
    id: number;
    name: string;
    email: string;
    memberSince: string;
}

interface OrderItemSummary {
    productName: string;
    productImageUrl: string | null;
}

interface OrderHistory {
    orderId: number;
    orderStatus: string;
    orderDate: string;
    totalAmount: number;
    items: OrderItemSummary[];
}

// ====================================================================
// Reusable Order History Card Component
// ====================================================================
const OrderHistoryCard: FC<{ order: OrderHistory }> = ({ order }) => {
    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'DELIVERED': return 'success';
            case 'SHIPPED': return 'default';
            case 'PROCESSING': return 'secondary';
            case 'CANCELED': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-lg">Order #{order.orderId}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Placed on {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                </div>
                <Badge variant={getStatusBadgeVariant(order.orderStatus)}>{order.orderStatus}</Badge>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 py-4">
                    <div className="flex -space-x-4">
                        {order.items.slice(0, 4).map((item, index) => (
                            <img
                                key={index}
                                src={item.productImageUrl || "/src/assets/placeholder.png"}
                                alt={item.productName}
                                className="w-16 h-16 object-cover rounded-full border-2 border-background"
                            />
                        ))}
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold">{order.items.length} item(s)</p>
                        <p className="text-xl font-bold">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                    </div>
                    <Button variant="outline">View Details</Button>
                </div>
            </CardContent>
        </Card>
    );
};

// ====================================================================
// Main Profile Page Component
// ====================================================================
const ProfilePage: FC = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [orders, setOrders] = useState<OrderHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please log in to view your profile.");
            navigate("/login");
            return;
        }

        const fetchProfileData = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const profilePromise = axios.get<UserProfile>(`http://localhost:8080/api/profile`, { headers });
                const ordersPromise = axios.get<OrderHistory[]>(`http://localhost:8080/api/profile/orders`, { headers });

                const [profileResponse, ordersResponse] = await Promise.all([profilePromise, ordersPromise]);
                
                setProfile(profileResponse.data);
                setOrders(ordersResponse.data);
            } catch (err) {
                toast.error("Failed to load profile data.");
                console.error("Profile fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [navigate]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading Profile...</div>;
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-2xl font-bold mb-4">Could not load profile.</h1>
                    <Button onClick={() => navigate("/")}>Go Home</Button>
                </div>
            </div>
        );
    }
    
    const activeOrders = orders.filter(o => ['PENDING', 'PROCESSING', 'SHIPPED'].includes(o.orderStatus));
    const pastOrders = orders.filter(o => ['DELIVERED', 'CANCELED'].includes(o.orderStatus));

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">My Account</h1>
                    <p className="text-muted-foreground">Manage your orders and personal information.</p>
                </div>

                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" />Profile</TabsTrigger>
                        <TabsTrigger value="active-orders"><ShoppingBag className="w-4 h-4 mr-2" />Active Orders ({activeOrders.length})</TabsTrigger>
                        <TabsTrigger value="past-orders"><Clock className="w-4 h-4 mr-2" />Past Orders ({pastOrders.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col">
                                    <Label className="text-sm text-muted-foreground">Full Name</Label>
                                    <p className="text-lg font-medium">{profile.name}</p>
                                </div>
                                <div className="flex flex-col">
                                    <Label className="text-sm text-muted-foreground">Email Address</Label>
                                    <p className="text-lg font-medium">{profile.email}</p>
                                </div>
                                <div className="flex flex-col">
                                    <Label className="text-sm text-muted-foreground">Member Since</Label>
                                    <p className="text-lg font-medium">{new Date(profile.memberSince).toLocaleDateString()}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="active-orders" className="mt-6">
                        <div className="space-y-4">
                            {activeOrders.length > 0 ? (
                                activeOrders.map(order => <OrderHistoryCard key={order.orderId} order={order} />)
                            ) : (
                                <p className="text-center text-muted-foreground py-10">You have no active orders.</p>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="past-orders" className="mt-6">
                        <div className="space-y-4">
                            {pastOrders.length > 0 ? (
                                pastOrders.map(order => <OrderHistoryCard key={order.orderId} order={order} />)
                            ) : (
                                <p className="text-center text-muted-foreground py-10">You have no past orders.</p>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default ProfilePage;
import { Link, useLocation } from "wouter";
import { 
  Hotel, 
  LayoutDashboard, 
  Bed, 
  Calendar, 
  MessageCircle, 
  Users, 
  BarChart3, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Room Management", href: "/rooms", icon: Bed },
  { name: "Bookings", href: "/bookings", icon: Calendar },
  { name: "WhatsApp Commands", href: "/whatsapp", icon: MessageCircle },
  { name: "Guests", href: "/guests", icon: Users },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-lg flex-shrink-0 border-r border-gray-200">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Hotel className="text-white text-lg" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">HotelManager</h1>
            <p className="text-sm text-gray-500">Pro Dashboard</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-8">
        <div className="px-6">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={cn(
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className="mr-3" size={16} />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </aside>
  );
}

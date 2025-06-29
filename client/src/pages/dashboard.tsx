import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import Sidebar from "@/components/sidebar";
import StatsCards from "@/components/stats-cards";
import RoomStatusGrid from "@/components/room-status-grid";
import WhatsappCommands from "@/components/whatsapp-commands";
import RecentBookings from "@/components/recent-bookings";
import QuickActions from "@/components/quick-actions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { DashboardStats } from "@/lib/api";
import type { RoomWithCurrentBooking, BookingWithGuest, WhatsappCommand } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: api.getDashboardStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: rooms = [], isLoading: roomsLoading } = useQuery<RoomWithCurrentBooking[]>({
    queryKey: ["/api/rooms"],
    queryFn: api.getRooms,
    refetchInterval: 30000,
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<BookingWithGuest[]>({
    queryKey: ["/api/bookings"],
    queryFn: api.getBookings,
    refetchInterval: 30000,
  });

  const { data: whatsappCommands = [], isLoading: commandsLoading } = useQuery<WhatsappCommand[]>({
    queryKey: ["/api/whatsapp/commands"],
    queryFn: api.getWhatsappCommands,
    refetchInterval: 10000, // More frequent updates for WhatsApp commands
  });

  const handleRoomClick = (room: RoomWithCurrentBooking) => {
    toast({
      title: `Room ${room.number}`,
      description: `Status: ${room.status.charAt(0).toUpperCase() + room.status.slice(1)} | Type: ${room.type}`,
    });
  };

  const handleQuickAction = (action: string) => {
    toast({
      title: "Quick Action",
      description: `${action} functionality will be implemented soon.`,
    });
  };

  if (statsLoading || roomsLoading || bookingsLoading || commandsLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-gray-500">Loading dashboard...</div>
          </div>
        </main>
      </div>
    );
  }

  const defaultStats = {
    totalRooms: 0,
    occupiedRooms: 0,
    checkinsToday: 0,
    revenueToday: 0,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                <p className="text-gray-600">Welcome back! Here's what's happening at your hotel today.</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Button variant="ghost" size="icon" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {whatsappCommands.filter(cmd => cmd.status === 'pending').length}
                    </span>
                  </Button>
                </div>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">John Doe</p>
                    <p className="text-xs text-gray-500">Hotel Manager</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          <StatsCards stats={stats || defaultStats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Room Status Grid */}
            <div className="lg:col-span-2">
              <RoomStatusGrid rooms={rooms} onRoomClick={handleRoomClick} />
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <WhatsappCommands commands={whatsappCommands} />
              
              <QuickActions
                onBlockRoom={() => handleQuickAction("Block Room")}
                onNewBooking={() => handleQuickAction("New Booking")}
                onCheckIn={() => handleQuickAction("Check In Guest")}
                onGenerateReport={() => handleQuickAction("Generate Report")}
              />
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="mt-8">
            <RecentBookings bookings={bookings} />
          </div>
        </div>
      </main>
    </div>
  );
}

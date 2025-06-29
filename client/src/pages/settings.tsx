import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar,
  Download,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { DashboardStats } from "@/lib/api";
import type { RoomWithCurrentBooking, BookingWithGuest } from "@shared/schema";

export default function Reports() {
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: api.getDashboardStats,
  });

  const { data: rooms = [], isLoading: roomsLoading } = useQuery<RoomWithCurrentBooking[]>({
    queryKey: ["/api/rooms"],
    queryFn: api.getRooms,
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<BookingWithGuest[]>({
    queryKey: ["/api/bookings"],
    queryFn: api.getBookings,
  });

  const handleExportReport = (reportType: string) => {
    toast({
      title: "Export Started",
      description: `${reportType} report export has been initiated. You'll receive a download link shortly.`,
    });
  };

  if (statsLoading || roomsLoading || bookingsLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-gray-500">Loading reports...</div>
          </div>
        </main>
      </div>
    );
  }

  const occupancyRate = stats && stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0;
  
  // Calculate room type distribution
  const roomTypeDistribution = rooms.reduce((acc, room) => {
    acc[room.type] = (acc[room.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate booking status distribution
  const bookingStatusDistribution = bookings.reduce((acc, booking) => {
    acc[booking.status] = (acc[booking.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate average booking value
  const averageBookingValue = bookings.length > 0 
    ? bookings.reduce((sum, booking) => sum + parseFloat(booking.totalAmount), 0) / bookings.length 
    : 0;

  // Calculate revenue by room type
  const revenueByRoomType = bookings.reduce((acc, booking) => {
    const roomType = booking.room.type;
    acc[roomType] = (acc[roomType] || 0) + parseFloat(booking.totalAmount);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BarChart3 className="text-blue-600" size={28} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
                  <p className="text-gray-600">Comprehensive hotel performance insights</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Select defaultValue="30days">
                  <SelectTrigger className="w-40">
                    <Filter size={16} className="mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="1year">Last year</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => handleExportReport("Full")}>
                  <Download size={16} className="mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{occupancyRate}%</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-blue-600" size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="text-green-600 mr-1" size={16} />
                  <span className="text-green-600 text-sm font-medium">
                    {occupancyRate > 70 ? "+5% from last month" : "Below target"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                    <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <Calendar className="text-green-600" size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-gray-600 text-sm">
                    Active reservations
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Booking Value</p>
                    <p className="text-3xl font-bold text-gray-900">
                      ${averageBookingValue.toFixed(0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-orange-600" size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-gray-600 text-sm">
                    Per reservation
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue Today</p>
                    <p className="text-3xl font-bold text-gray-900">
                      ${stats?.revenueToday.toFixed(0) || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-green-600" size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="text-green-600 mr-1" size={16} />
                  <span className="text-green-600 text-sm font-medium">
                    Daily performance
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Room Type Distribution */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle>Room Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(roomTypeDistribution).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-blue-600 rounded"></div>
                        <span className="capitalize font-medium">{type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold">{count}</span>
                        <Badge variant="secondary">
                          {((count / rooms.length) * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue by Room Type */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle>Revenue by Room Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(revenueByRoomType)
                    .sort(([,a], [,b]) => b - a)
                    .map(([type, revenue]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-green-600 rounded"></div>
                        <span className="capitalize font-medium">{type}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${revenue.toFixed(0)}</div>
                        <div className="text-sm text-gray-500">
                          {Object.values(revenueByRoomType).reduce((a, b) => a + b, 0) > 0 
                            ? ((revenue / Object.values(revenueByRoomType).reduce((a, b) => a + b, 0)) * 100).toFixed(0)
                            : 0}% of total
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Status Overview */}
          <Card className="border border-gray-200 mb-8">
            <CardHeader>
              <CardTitle>Booking Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Object.entries(bookingStatusDistribution).map(([status, count]) => (
                  <div key={status} className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-700">{count}</span>
                    </div>
                    <h3 className="font-medium capitalize text-gray-900">{status.replace('_', ' ')}</h3>
                    <p className="text-sm text-gray-500">
                      {((count / bookings.length) * 100).toFixed(0)}% of bookings
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Key Highlights</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <TrendingUp className="text-green-600" size={20} />
                      <div>
                        <p className="font-medium text-green-900">Strong Occupancy</p>
                        <p className="text-sm text-green-700">
                          {occupancyRate}% occupancy rate {occupancyRate > 70 ? "exceeds" : "below"} industry average
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Users className="text-blue-600" size={20} />
                      <div>
                        <p className="font-medium text-blue-900">Active Bookings</p>
                        <p className="text-sm text-blue-700">
                          {bookings.filter(b => b.status === 'confirmed' || b.status === 'checked_in').length} active reservations
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                      <DollarSign className="text-orange-600" size={20} />
                      <div>
                        <p className="font-medium text-orange-900">Revenue Performance</p>
                        <p className="text-sm text-orange-700">
                          Average booking value: ${averageBookingValue.toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Recommendations</h4>
                  <div className="space-y-3">
                    {occupancyRate < 70 && (
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="font-medium text-yellow-900">Increase Marketing</p>
                        <p className="text-sm text-yellow-700">
                          Consider promotional campaigns to boost occupancy rates
                        </p>
                      </div>
                    )}
                    
                    {rooms.filter(r => r.status === 'maintenance').length > 0 && (
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="font-medium text-red-900">Maintenance Priority</p>
                        <p className="text-sm text-red-700">
                          {rooms.filter(r => r.status === 'maintenance').length} rooms need maintenance attention
                        </p>
                      </div>
                    )}

                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="font-medium text-blue-900">WhatsApp Integration</p>
                      <p className="text-sm text-blue-700">
                        Streamline operations with automated command processing
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

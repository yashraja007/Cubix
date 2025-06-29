import { Hotel, Users, CalendarCheck, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  stats: {
    totalRooms: number;
    occupiedRooms: number;
    checkinsToday: number;
    revenueToday: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const occupancyRate = stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rooms</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalRooms}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Hotel className="text-blue-600 text-xl" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-600 text-sm font-medium">
              {stats.totalRooms > 20 ? "+2 this month" : "All rooms active"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Occupied</p>
              <p className="text-3xl font-bold text-gray-900">{stats.occupiedRooms}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Users className="text-green-600 text-xl" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-600 text-sm font-medium">
              {occupancyRate}% occupancy
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Check-ins Today</p>
              <p className="text-3xl font-bold text-gray-900">{stats.checkinsToday}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <CalendarCheck className="text-orange-600 text-xl" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-orange-600 text-sm font-medium">
              {stats.checkinsToday > 0 ? "On schedule" : "No check-ins"}
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
                ${stats.revenueToday.toFixed(0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign className="text-green-600 text-xl" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-600 text-sm font-medium">
              {stats.revenueToday > 0 ? "+12% vs yesterday" : "No revenue yet"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

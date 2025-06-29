import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RoomWithCurrentBooking } from "@shared/schema";

interface RoomStatusGridProps {
  rooms: RoomWithCurrentBooking[];
  onRoomClick?: (room: RoomWithCurrentBooking) => void;
}

export default function RoomStatusGrid({ rooms, onRoomClick }: RoomStatusGridProps) {
  const getRoomStatusClass = (status: string) => {
    switch (status) {
      case "occupied":
        return "room-occupied";
      case "available":
        return "room-available";
      case "maintenance":
        return "room-maintenance";
      case "blocked":
        return "room-blocked";
      default:
        return "room-available";
    }
  };

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case "occupied":
        return "bg-green-600 text-white";
      case "available":
        return "bg-gray-200 text-gray-700";
      case "maintenance":
        return "bg-orange-500 text-white";
      case "blocked":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Room Status Overview
          </CardTitle>
          <Button variant="link" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All Rooms
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-6 gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center font-semibold cursor-pointer hover:opacity-80 transition-all duration-200",
                getRoomStatusColor(room.status)
              )}
              onClick={() => onRoomClick?.(room)}
              title={`Room ${room.number} - ${room.status.charAt(0).toUpperCase() + room.status.slice(1)}`}
            >
              {room.number}
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span className="text-gray-600">Occupied</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-600">Maintenance</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">Blocked</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

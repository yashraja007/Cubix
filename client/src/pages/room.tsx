import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { RoomWithCurrentBooking } from "@shared/schema";

export default function Rooms() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRoom, setSelectedRoom] = useState<RoomWithCurrentBooking | null>(null);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockUntil, setBlockUntil] = useState("");
  const [blockReason, setBlockReason] = useState("");

  const { data: rooms = [], isLoading } = useQuery<RoomWithCurrentBooking[]>({
    queryKey: ["/api/rooms"],
    queryFn: api.getRooms,
    refetchInterval: 30000,
  });

  const blockRoomMutation = useMutation({
    mutationFn: ({ roomNumber, until, reason }: { roomNumber: string; until: string; reason: string }) =>
      api.blockRoom(roomNumber, until, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      toast({
        title: "Success",
        description: "Room has been blocked successfully.",
      });
      setBlockModalOpen(false);
      setBlockUntil("");
      setBlockReason("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to block room. Please try again.",
        variant: "destructive",
      });
    },
  });

  const unblockRoomMutation = useMutation({
    mutationFn: (roomNumber: string) => api.unblockRoom(roomNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      toast({
        title: "Success",
        description: "Room has been unblocked successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to unblock room. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  const handleBlockRoom = () => {
    if (!selectedRoom || !blockUntil || !blockReason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    blockRoomMutation.mutate({
      roomNumber: selectedRoom.number,
      until: blockUntil,
      reason: blockReason,
    });
  };

  const handleUnblockRoom = (room: RoomWithCurrentBooking) => {
    if (room.status !== "blocked") return;
    unblockRoomMutation.mutate(room.number);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-gray-500">Loading rooms...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-8 py-4">
            <h2 className="text-2xl font-bold text-gray-900">Room Management</h2>
            <p className="text-gray-600">Manage room status, availability, and maintenance</p>
          </div>
        </header>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map((room) => (
              <Card key={room.id} className="border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">
                      Room {room.number}
                    </CardTitle>
                    <Badge className={getRoomStatusColor(room.status)}>
                      {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 capitalize">
                    {room.type} • Floor {room.floor}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Max Occupancy:</span>
                      <span className="font-medium">{room.maxOccupancy}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price/Night:</span>
                      <span className="font-medium">${parseFloat(room.pricePerNight).toFixed(0)}</span>
                    </div>
                    
                    {room.currentBooking && (
                      <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">
                          Current Guest
                        </p>
                        <p className="text-sm text-blue-700">
                          {room.currentBooking.guest.name}
                        </p>
                        <p className="text-xs text-blue-600">
                          Until {new Date(room.currentBooking.checkOutDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {room.status === "blocked" && room.blockedUntil && (
                      <div className="mt-3 p-2 bg-red-50 rounded-lg">
                        <p className="text-sm font-medium text-red-900">Blocked</p>
                        <p className="text-sm text-red-700">{room.blockReason}</p>
                        <p className="text-xs text-red-600">Until {room.blockedUntil}</p>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      {room.status === "blocked" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleUnblockRoom(room)}
                          disabled={unblockRoomMutation.isPending}
                        >
                          Unblock
                        </Button>
                      ) : (
                        <Dialog open={blockModalOpen} onOpenChange={setBlockModalOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => setSelectedRoom(room)}
                            >
                              Block Room
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Block Room {selectedRoom?.number}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="blockUntil">Block Until</Label>
                                <Input
                                  id="blockUntil"
                                  type="date"
                                  value={blockUntil}
                                  onChange={(e) => setBlockUntil(e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor="blockReason">Reason</Label>
                                <Textarea
                                  id="blockReason"
                                  placeholder="Enter reason for blocking..."
                                  value={blockReason}
                                  onChange={(e) => setBlockReason(e.target.value)}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={handleBlockRoom}
                                  disabled={blockRoomMutation.isPending}
                                  className="flex-1"
                                >
                                  {blockRoomMutation.isPending ? "Blocking..." : "Block Room"}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setBlockModalOpen(false)}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

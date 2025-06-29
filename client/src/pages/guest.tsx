import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Phone, CreditCard } from "lucide-react";
import { api } from "@/lib/api";
import type { Guest } from "@shared/schema";

export default function Guests() {
  const { data: guests = [], isLoading } = useQuery<Guest[]>({
    queryKey: ["/api/guests"],
    queryFn: api.getGuests,
    refetchInterval: 30000,
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-gray-500">Loading guests...</div>
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
            <div className="flex items-center space-x-3">
              <Users className="text-blue-600" size={28} />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Guest Management</h2>
                <p className="text-gray-600">Manage guest information and profiles</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Guests</p>
                    <p className="text-3xl font-bold text-gray-900">{guests.length}</p>
                  </div>
                  <Users className="text-blue-600" size={24} />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">With Email</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {guests.filter(guest => guest.email).length}
                    </p>
                  </div>
                  <Mail className="text-green-600" size={24} />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">With Phone</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {guests.filter(guest => guest.phone).length}
                    </p>
                  </div>
                  <Phone className="text-orange-500" size={24} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guests List */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle>All Guests</CardTitle>
            </CardHeader>
            <CardContent>
              {guests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Guests</h3>
                  <p>Guest profiles will appear here when bookings are created</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {guests.map((guest) => (
                    <Card key={guest.id} className="border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-blue-600 text-white text-lg font-medium">
                              {getInitials(guest.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {guest.name}
                            </h3>
                            
                            <div className="space-y-2">
                              {guest.email && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Mail className="mr-2 flex-shrink-0" size={14} />
                                  <span className="truncate">{guest.email}</span>
                                </div>
                              )}
                              
                              {guest.phone && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="mr-2 flex-shrink-0" size={14} />
                                  <span>{guest.phone}</span>
                                </div>
                              )}
                              
                              {guest.idNumber && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <CreditCard className="mr-2 flex-shrink-0" size={14} />
                                  <span>{guest.idNumber}</span>
                                </div>
                              )}
                            </div>

                            {guest.address && (
                              <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">{guest.address}</p>
                              </div>
                            )}

                            <div className="mt-4 flex items-center justify-between">
                              <div className="text-xs text-gray-500">
                                Registered: {formatDate(new Date(guest.createdAt))}
                              </div>
                              <Badge variant="secondary">
                                Active
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

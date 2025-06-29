import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, User, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import type { WhatsappCommand } from "@shared/schema";

export default function WhatsApp() {
  const { data: commands = [], isLoading } = useQuery<WhatsappCommand[]>({
    queryKey: ["/api/whatsapp/commands"],
    queryFn: api.getWhatsappCommands,
    refetchInterval: 5000, // More frequent updates for WhatsApp commands
  });

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="status-completed">Completed</Badge>;
      case "processed":
        return <Badge className="status-processed">Processed</Badge>;
      case "processing":
        return <Badge className="status-processing">Processing</Badge>;
      case "pending":
        return <Badge className="status-processing">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSenderName = (sender: string) => {
    // Extract a friendly name from phone number or return simplified version
    if (sender.includes("Manager")) return "Manager";
    if (sender.includes("Reception")) return "Reception";
    if (sender.includes("Housekeeping")) return "Housekeeping";
    return sender.startsWith("+") ? `Phone ${sender.slice(-4)}` : sender;
  };

  const getParsedAction = (parsedActionString: string | null) => {
    if (!parsedActionString) return null;
    try {
      return JSON.parse(parsedActionString);
    } catch {
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-gray-500">Loading WhatsApp commands...</div>
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
              <MessageCircle className="text-green-500" size={28} />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">WhatsApp Commands</h2>
                <p className="text-gray-600">Monitor and manage commands received via WhatsApp</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Commands</p>
                    <p className="text-3xl font-bold text-gray-900">{commands.length}</p>
                  </div>
                  <MessageCircle className="text-blue-600" size={24} />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {commands.filter(cmd => cmd.status === 'pending').length}
                    </p>
                  </div>
                  <AlertCircle className="text-orange-500" size={24} />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {commands.filter(cmd => cmd.status === 'completed').length}
                    </p>
                  </div>
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Failed</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {commands.filter(cmd => cmd.status === 'failed').length}
                    </p>
                  </div>
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Commands List */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="text-green-500" size={20} />
                <span>All WhatsApp Commands</span>
                <Badge className="bg-green-600 text-white">Live</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {commands.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageCircle className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No WhatsApp Commands</h3>
                  <p>Commands sent via WhatsApp will appear here</p>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg text-left max-w-md mx-auto">
                    <h4 className="font-medium text-blue-900">Webhook URL:</h4>
                    <p className="text-sm text-blue-700 font-mono mt-1">
                      {window.location.origin}/api/whatsapp/webhook
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      Configure this URL in your Twilio WhatsApp sandbox
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {commands.map((command) => {
                    const parsedAction = getParsedAction(command.parsedAction);
                    return (
                      <div key={command.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="text-white" size={16} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {getSenderName(command.sender)}
                              </p>
                              <p className="text-sm text-gray-500">{command.sender}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(command.status)}
                            <span className="text-sm text-gray-500">
                              {formatTime(new Date(command.createdAt))}
                            </span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Original Message:</p>
                          <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                            "{command.message}"
                          </p>
                        </div>

                        {parsedAction && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Parsed Action:</p>
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="font-medium text-blue-900">Action:</span>
                                  <span className="ml-2 text-blue-700">{parsedAction.action || 'N/A'}</span>
                                </div>
                                {parsedAction.room && (
                                  <div>
                                    <span className="font-medium text-blue-900">Room:</span>
                                    <span className="ml-2 text-blue-700">{parsedAction.room}</span>
                                  </div>
                                )}
                                {parsedAction.guest_name && (
                                  <div>
                                    <span className="font-medium text-blue-900">Guest:</span>
                                    <span className="ml-2 text-blue-700">{parsedAction.guest_name}</span>
                                  </div>
                                )}
                                {parsedAction.start_date && (
                                  <div>
                                    <span className="font-medium text-blue-900">Start Date:</span>
                                    <span className="ml-2 text-blue-700">{parsedAction.start_date}</span>
                                  </div>
                                )}
                                {parsedAction.end_date && (
                                  <div>
                                    <span className="font-medium text-blue-900">End Date:</span>
                                    <span className="ml-2 text-blue-700">{parsedAction.end_date}</span>
                                  </div>
                                )}
                                {parsedAction.details && (
                                  <div className="col-span-2">
                                    <span className="font-medium text-blue-900">Details:</span>
                                    <span className="ml-2 text-blue-700">{parsedAction.details}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {command.processedAt && (
                          <div className="text-xs text-gray-500">
                            Processed at: {formatTime(new Date(command.processedAt))}
                          </div>
                        )}

                        {command.errorMessage && (
                          <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                            <p className="text-sm font-medium text-red-800">Error:</p>
                            <p className="text-sm text-red-700">{command.errorMessage}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

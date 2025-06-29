import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WhatsappCommand } from "@shared/schema";

interface WhatsappCommandsProps {
  commands: WhatsappCommand[];
}

export default function WhatsappCommands({ commands }: WhatsappCommandsProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hr ago`;
    return `${Math.floor(diffInMinutes / 1440)} day ago`;
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
    return sender.startsWith("+") ? sender.slice(-4) : sender;
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <MessageCircle className="text-green-500 mr-2" size={20} />
            Recent Commands
          </CardTitle>
          <Badge className="bg-green-600 text-white text-xs px-2 py-1">Live</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {commands.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No WhatsApp commands yet</p>
              <p className="text-sm">Commands will appear here when received</p>
            </div>
          ) : (
            commands.slice(0, 5).map((command) => (
              <div key={command.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="text-white text-xs" size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {getSenderName(command.sender)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">"{command.message}"</p>
                  <div className="mt-2 flex items-center space-x-2">
                    {getStatusBadge(command.status)}
                    <span className="text-xs text-gray-500">
                      {formatTime(new Date(command.createdAt))}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {commands.length > 0 && (
          <Button variant="link" className="w-full mt-4 text-center text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All Commands
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

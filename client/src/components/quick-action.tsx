import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Ban, 
  Plus, 
  LogIn, 
  TrendingUp, 
  ChevronRight 
} from "lucide-react";

interface QuickActionsProps {
  onBlockRoom?: () => void;
  onNewBooking?: () => void;
  onCheckIn?: () => void;
  onGenerateReport?: () => void;
}

export default function QuickActions({ 
  onBlockRoom, 
  onNewBooking, 
  onCheckIn, 
  onGenerateReport 
}: QuickActionsProps) {
  const actions = [
    {
      name: "Block Room",
      icon: Ban,
      iconColor: "text-red-500",
      onClick: onBlockRoom,
    },
    {
      name: "New Booking",
      icon: Plus,
      iconColor: "text-green-600",
      onClick: onNewBooking,
    },
    {
      name: "Check In Guest",
      icon: LogIn,
      iconColor: "text-blue-600",
      onClick: onCheckIn,
    },
    {
      name: "Generate Report",
      icon: TrendingUp,
      iconColor: "text-orange-500",
      onClick: onGenerateReport,
    },
  ];

  return (
    <Card className="border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {actions.map((action) => (
            <Button
              key={action.name}
              variant="ghost"
              className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors h-auto"
              onClick={action.onClick}
            >
              <div className="flex items-center">
                <action.icon className={`${action.iconColor} mr-3`} size={16} />
                <span className="font-medium text-gray-900">{action.name}</span>
              </div>
              <ChevronRight className="text-gray-400" size={16} />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

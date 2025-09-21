import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export interface ServiceStatus {
  id: string;
  name: string;
  status: 'active' | 'issue' | 'outage' | 'maintenance';
  lastUpdate: string;
  description: string;
  predictedNext?: string;
  reportsCount: number;
  icon: React.ComponentType<any>;
}

interface ServiceCardProps {
  service: ServiceStatus;
  onReport: (serviceId: string, type: 'confirm' | 'issue') => void;
}

export function ServiceCard({ service, onReport }: ServiceCardProps) {
  const getStatusIcon = () => {
    switch (service.status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'issue':
        return <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
      case 'outage':
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'maintenance':
        return <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (service.status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'issue':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
      case 'outage':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'maintenance':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const StatusIcon = service.icon;

  return (
    <Card className="h-full glass-effect shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
      <CardHeader className="pb-2 sm:pb-3 rounded-[5px] rounded-[5px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <StatusIcon className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
            <CardTitle className="text-base sm:text-lg text-foreground">{service.name}</CardTitle>
          </div>
          {getStatusIcon()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className={`px-2 sm:px-3 py-2 rounded-md border backdrop-blur-sm ${getStatusColor()}`}>
          <p className="text-xs sm:text-sm">{service.description}</p>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
          <span className="truncate">Last: {service.lastUpdate}</span>
          <Badge variant="secondary" className="text-xs gradient-card-solid border-card-border">{service.reportsCount} reports</Badge>
        </div>

        {service.predictedNext && (
          <div className="gradient-card-solid px-2 sm:px-3 py-2 rounded-md border border-card-border">
            <p className="text-xs sm:text-sm text-foreground">Predicted: {service.predictedNext}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onReport(service.id, 'confirm')}
            className="flex-1 text-xs sm:text-sm glass-effect hover:bg-green-500/20 hover:text-green-300 hover:border-green-400/50 transition-all duration-200"
          >
            Confirm Status
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onReport(service.id, 'issue')}
            className="flex-1 text-xs sm:text-sm glass-effect hover:bg-red-500/20 hover:text-red-300 hover:border-red-400/50 transition-all duration-200"
          >
            Report Issue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
import { Zap, Droplets, Trash2, Shield, Wrench } from "lucide-react";
import { ServiceCard, ServiceStatus } from "./ServiceCard";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../utils/api";

interface DashboardProps {
  onReport: (serviceId: string, type: 'confirm' | 'issue') => void;
}

const iconMap = {
  'Zap': Zap,
  'Droplets': Droplets,
  'Trash2': Trash2,
  'Shield': Shield,
  'Wrench': Wrench
};

export function Dashboard({ onReport }: DashboardProps) {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchServices = async () => {
      if (!isMounted) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await api.getServices();
        
        if (isMounted) {
          const formattedServices = response.services.map((service: any) => ({
            ...service,
            icon: iconMap[service.icon as keyof typeof iconMap] || Wrench
          }));
          setServices(formattedServices);
        }
      } catch (err) {
        console.error('Error fetching services:', err);
        if (isMounted) {
          setError('Failed to load services');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchServices();
    
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">{error}</AlertDescription>
      </Alert>
    );
  }

  // Separate function for refreshing services data
  const refreshServices = async () => {
    try {
      const response = await api.getServices();
      const formattedServices = response.services.map((service: any) => ({
        ...service,
        icon: iconMap[service.icon as keyof typeof iconMap] || Wrench
      }));
      setServices(formattedServices);
    } catch (err) {
      console.error('Error refreshing services:', err);
    }
  };

  const handleServiceReport = async (serviceId: string, type: 'confirm' | 'issue') => {
    try {
      await api.reportServiceIssue(serviceId, type);
      await refreshServices(); // Refresh the data
      onReport(serviceId, type);
    } catch (err) {
      console.error('Error reporting service status:', err);
    }
  };

  const activeIssues = services.filter(service => 
    service.status === 'issue' || service.status === 'outage'
  );

  return (
    <div className="space-y-6">
      {activeIssues.length > 0 && (
        <Alert className="glass-effect border-orange-300/30 text-foreground">
          <AlertTriangle className="h-4 w-4 text-orange-400" />
          <AlertDescription>
            {activeIssues.length} active issue{activeIssues.length > 1 ? 's' : ''} requiring attention. 
            Check the affected services below.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {services.map((service) => (
          <ServiceCard 
            key={service.id} 
            service={service} 
            onReport={handleServiceReport}
          />
        ))}
      </div>

      <div className="gradient-card p-3 sm:p-4 rounded-lg">
        <h3 className="mb-2 text-sm sm:text-base text-foreground">Quick Tips</h3>
        <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
          <li>• Report issues promptly to help your neighbors stay informed</li>
          <li>• Confirm status only if you've personally verified the service</li>
          <li>• Check predictions to plan ahead for scheduled disruptions</li>
        </ul>
      </div>
    </div>
  );
}
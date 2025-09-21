import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { ComplaintSystem } from "./components/ComplaintSystem";
import { CommunityInsights } from "./components/CommunityInsights";
import { NotificationPanel } from "./components/NotificationPanel";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import { api } from "./utils/api";
import darkBackground from 'figma:asset/f0a743817e040d3b16ed724f191d59dcce3fe6c0.png';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  
  // Helper function to manually refresh notification count
  const refreshNotificationCount = async () => {
    try {
      const response = await api.getNotifications();
      const unreadCount = response.notifications.filter((n: any) => !n.read).length;
      setNotificationCount(unreadCount);
    } catch (err) {
      console.error('Error refreshing notification count:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    // Load notification count on startup
    const fetchNotificationCount = async () => {
      if (!isMounted) return;
      
      try {
        const response = await api.getNotifications();
        if (isMounted) {
          const unreadCount = response.notifications.filter((n: any) => !n.read).length;
          setNotificationCount(unreadCount);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching notification count:', err);
        }
      }

      // Schedule next poll only if component is still mounted
      if (isMounted) {
        timeoutId = setTimeout(fetchNotificationCount, 60000); // Reduced to 60 seconds
      }
    };

    // Initial fetch
    fetchNotificationCount();
    
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const handleServiceReport = (serviceId: string, type: 'confirm' | 'issue') => {
    if (type === 'confirm') {
      toast.success(`Thank you for confirming the status of ${serviceId}`);
    } else {
      toast.success(`Issue reported for ${serviceId}. Management has been notified.`);
    }
  };

  const handleComplaintSubmit = (complaint: any) => {
    toast.success('Complaint submitted successfully. You will receive updates on its status.');
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
    setActiveView('notifications');
  };

  const handleNotificationClose = () => {
    setShowNotifications(false);
    setNotificationCount(0);
    setActiveView('dashboard');
    // Notification count will be refreshed by the polling mechanism
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onReport={handleServiceReport} />;
      case 'complaints':
        return <ComplaintSystem onSubmitComplaint={handleComplaintSubmit} />;
      case 'insights':
        return <CommunityInsights />;
      default:
        return <Dashboard onReport={handleServiceReport} />;
    }
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="semita-ui-theme">
      <div 
        className="min-h-screen transition-all duration-300 dark:bg-cover dark:bg-center dark:bg-no-repeat" 
        style={{ 
          background: 'var(--background)',
          backgroundImage: `var(--dark-mode-bg, none)`
        }}
      >
        <Header 
          activeView={activeView} 
          setActiveView={(view) => {
            if (view === 'notifications') {
              handleNotificationClick();
            } else {
              setActiveView(view);
              setShowNotifications(false);
            }
          }}
          notificationCount={notificationCount}
        />
        
        <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="space-y-6">
            {renderActiveView()}
          </div>
        </main>

        {showNotifications && (
          <NotificationPanel onClose={handleNotificationClose} />
        )}
        
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
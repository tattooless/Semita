import { useState } from "react";
import { Menu, X, Home, FileText, BarChart3, Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle, SheetDescription } from "./ui/sheet";
import { Badge } from "./ui/badge";

interface MobileNavProps {
  activeView: string;
  setActiveView: (view: string) => void;
  notificationCount: number;
}

export function MobileNav({ activeView, setActiveView, notificationCount }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'complaints', label: 'Complaints', icon: FileText },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: notificationCount },
  ];

  const handleNavClick = (viewId: string) => {
    setActiveView(viewId);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden h-9 w-9 px-0">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-64 p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SheetDescription className="sr-only">
          Navigate to different sections of the application
        </SheetDescription>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold">Navigation</h2>
            <SheetClose asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-300 transform ${
                      activeView === item.id
                        ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                        : 'hover:bg-accent hover:text-accent-foreground text-dark-title hover:shadow-lg hover:-translate-y-1'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && item.badge > 0 && (
                      <Badge variant="destructive" className="h-5 min-w-5 text-xs px-1.5">
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
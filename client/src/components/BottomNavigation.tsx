import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Users, ClipboardCheck, BarChart3, Brain } from "lucide-react";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navigationItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/students", icon: Users, label: "Students" },
    { path: "/sessions", icon: ClipboardCheck, label: "Sessions" },
    { path: "/reports", icon: BarChart3, label: "Reports" },
  ];

  return (
    <>
      {/* Floating AI Assistant Button */}
      <Button
        onClick={() => setLocation("/ai-assistant")}
        className="floating-action bg-secondary hover:bg-secondary/90 text-white w-14 h-14 rounded-full shadow-lg"
      >
        <Brain className="w-6 h-6" />
      </Button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-30">
        <div className="grid grid-cols-4 py-2">
          {navigationItems.map((item) => {
            const isActive = location === item.path;
            const IconComponent = item.icon;
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center py-2 h-auto ${
                  isActive 
                    ? "text-primary" 
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <IconComponent className="w-5 h-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

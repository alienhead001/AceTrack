import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import BottomNavigation from "./BottomNavigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Moon, Bell, LogOut } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LayoutProps {
  children: ReactNode;
  onToggleDarkMode: () => void;
}

export default function Layout({ children, onToggleDarkMode }: LayoutProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Top Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M9 9l6 6" stroke="currentColor" strokeWidth="2"/>
                <path d="M15 9l-6 6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">TennisCoach AI</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.academyName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400"
            >
              <Moon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400"
            >
              <Bell className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400"
            >
              <LogOut className="w-4 h-4" />
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face" />
              <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

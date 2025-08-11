import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { User, Crown, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (role: "coach" | "admin") => {
    setIsLoading(true);
    try {
      const credentials = role === "coach" 
        ? { username: "coach@academy.com", password: "password123" }
        : { username: "admin@academy.com", password: "admin123" };

      await apiRequest("POST", "/api/auth/login", credentials);
      
      // Invalidate auth query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${role}!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await apiRequest("POST", "/api/auth/login", { username, password });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 lg:px-8 bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/5 dark:to-secondary/5">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M9 9l6 6" stroke="currentColor" strokeWidth="2"/>
              <path d="M15 9l-6 6" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">TennisCoach AI</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Smart coaching for tennis academies</p>
        </div>
        
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="block text-sm font-medium">Email</Label>
                <div className="mt-2">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="coach@academy.com"
                    className="text-base"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="password" className="block text-sm font-medium">Password</Label>
                <div className="mt-2">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="text-base"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember-me" />
                  <Label htmlFor="remember-me" className="text-sm">Remember me</Label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-primary hover:text-primary/80">
                    Forgot password?
                  </a>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={() => handleLogin("coach")}
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-3"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <User className="w-4 h-4 mr-2" />
                  )}
                  Sign in as Coach
                </Button>
                
                <Button
                  type="button"
                  onClick={() => handleLogin("admin")}
                  disabled={isLoading}
                  className="w-full bg-secondary hover:bg-secondary/90 text-white py-3"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Crown className="w-4 h-4 mr-2" />
                  )}
                  Sign in as Admin
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

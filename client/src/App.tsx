import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import StudentsPage from "@/pages/StudentsPage";
import SessionsPage from "@/pages/SessionsPage";
import AIAssistantPage from "@/pages/AIAssistantPage";
import ReportsPage from "@/pages/ReportsPage";
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={LoginPage} />
      ) : (
        <Layout onToggleDarkMode={toggleDarkMode}>
          <Route path="/" component={Dashboard} />
          <Route path="/students" component={StudentsPage} />
          <Route path="/sessions" component={SessionsPage} />
          <Route path="/ai-assistant" component={AIAssistantPage} />
          <Route path="/reports" component={ReportsPage} />
        </Layout>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

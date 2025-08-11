import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Users, Brain, ClipboardCheck, BarChart3, CheckCircle, UserPlus, AlertTriangle } from "lucide-react";

interface DashboardStats {
  sessionsToday: number;
  activeStudents: number;
  totalStudents: number;
  atRiskStudents: number;
  averageImprovement: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: atRiskStudents, isLoading: atRiskLoading } = useQuery({
    queryKey: ["/api/students/at-risk"],
  });

  if (statsLoading || atRiskLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse">
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="p-4 space-y-4">
      {/* Today's Overview */}
      <Card className="custom-shadow">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats?.sessionsToday || 0}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Sessions Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{stats?.activeStudents || 0}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Students Active</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => setLocation("/students")}
          className="bg-primary hover:bg-primary/90 text-white p-4 rounded-xl text-left h-auto flex flex-col items-start"
        >
          <Users className="w-5 h-5 mb-2" />
          <div className="font-medium">Manage Students</div>
          <div className="text-xs opacity-90">View & edit profiles</div>
        </Button>
        
        <Button
          onClick={() => setLocation("/ai-assistant")}
          className="bg-secondary hover:bg-secondary/90 text-white p-4 rounded-xl text-left h-auto flex flex-col items-start"
        >
          <Brain className="w-5 h-5 mb-2" />
          <div className="font-medium">AI Assistant</div>
          <div className="text-xs opacity-90">Get drill suggestions</div>
        </Button>
        
        <Button
          onClick={() => setLocation("/sessions")}
          className="bg-accent hover:bg-accent/90 text-white p-4 rounded-xl text-left h-auto flex flex-col items-start"
        >
          <ClipboardCheck className="w-5 h-5 mb-2" />
          <div className="font-medium">Track Session</div>
          <div className="text-xs opacity-90">Mark attendance</div>
        </Button>
        
        <Button
          onClick={() => setLocation("/reports")}
          className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl text-left h-auto flex flex-col items-start"
        >
          <BarChart3 className="w-5 h-5 mb-2" />
          <div className="font-medium">View Reports</div>
          <div className="text-xs opacity-90">Progress insights</div>
        </Button>
      </div>

      {/* Recent Activity */}
      <Card className="custom-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            <Button variant="ghost" size="sm" className="text-primary">View All</Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Training plan generated for Aanya Sharma</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">New student added to Junior Batch</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">15 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Rahul Kumar flagged at risk of dropout</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Needing Attention */}
      {atRiskStudents && atRiskStudents.length > 0 && (
        <Card className="custom-shadow">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Students Needing Attention</h3>
            <div className="space-y-3">
              {atRiskStudents.map((student: any) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center space-x-3">
                    <img
                      src={student.profileImageUrl || "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=400&fit=crop&crop=face"}
                      alt={student.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                      <p className="text-xs text-red-600 dark:text-red-400">Needs attention</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                    Action
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

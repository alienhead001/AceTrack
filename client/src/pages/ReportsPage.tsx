import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AlertTriangle, TrendingUp, Users, Award } from "lucide-react";

interface DashboardStats {
  sessionsToday: number;
  activeStudents: number;
  totalStudents: number;
  atRiskStudents: number;
  averageImprovement: string;
}

export default function ReportsPage() {
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: atRiskStudents, isLoading: atRiskLoading } = useQuery({
    queryKey: ["/api/students/at-risk"],
  });

  const { data: allStudents } = useQuery({
    queryKey: ["/api/students"],
  });

  const analyzeDropoutRiskMutation = useMutation({
    mutationFn: async (studentId: number) => {
      return apiRequest("POST", `/api/students/${studentId}/analyze-dropout-risk`, {});
    },
    onSuccess: (data: any) => {
      toast({
        title: "Risk analysis complete",
        description: "AI has analyzed the dropout risk factors.",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  if (statsLoading || atRiskLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const attendanceRate = 85; // This would be calculated from actual data
  const skillImprovement = 72; // This would be calculated from actual data

  return (
    <section className="p-4 space-y-4">
      {/* Header */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Progress Reports</h2>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="custom-shadow text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{stats?.totalStudents || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Students</div>
          </CardContent>
        </Card>
        <Card className="custom-shadow text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-secondary">
              {stats?.averageImprovement || "+1.2"}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Improvement</div>
          </CardContent>
        </Card>
      </div>

      {/* Academy Performance Overview */}
      <Card className="custom-shadow">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Academy Performance</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Students</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {stats?.activeStudents}/{stats?.totalStudents}
                </span>
              </div>
              <Progress 
                value={stats ? (stats.activeStudents / stats.totalStudents) * 100 : 0} 
                className="h-2" 
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">At Risk Students</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {stats?.atRiskStudents || 0}
                </span>
              </div>
              <Progress 
                value={stats ? (stats.atRiskStudents / stats.totalStudents) * 100 : 0} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students At Risk */}
      <Card className="custom-shadow">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
            Students At Risk
          </h3>
          {atRiskStudents && atRiskStudents.length > 0 ? (
            <div className="space-y-3">
              {atRiskStudents.map((student: any) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center space-x-3">
                    <img
                      src={student.profileImageUrl || "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop&crop=face"}
                      alt={student.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {student.batch?.name} • Needs attention
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => analyzeDropoutRiskMutation.mutate(student.id)}
                    disabled={analyzeDropoutRiskMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    AI Action Plan
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No students currently at risk</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Great job maintaining student engagement!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Performance Trends */}
      <Card className="custom-shadow">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
            Weekly Performance Trends
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Average Attendance</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${attendanceRate}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{attendanceRate}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Skill Improvement</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${skillImprovement}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{skillImprovement}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card className="custom-shadow">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-500" />
            Top Performers This Week
          </h3>
          <div className="space-y-3">
            {allStudents?.slice(0, 3).map((student: any, index: number) => (
              <div key={student.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <img
                    src={student.profileImageUrl || "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&crop=face"}
                    alt={student.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{student.batch?.name}</p>
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                  Excellent
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Batch Performance Comparison */}
      <Card className="custom-shadow">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-500" />
            Batch Performance Comparison
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Junior Batch</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average improvement: +1.5</p>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                Excellent
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Senior Batch</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average improvement: +1.0</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                Good
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Beginner Batch</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average improvement: +0.8</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                Improving
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

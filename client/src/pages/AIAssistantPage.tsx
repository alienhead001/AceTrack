import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Search, Brain, Loader2, Clock, Target, Users } from "lucide-react";
import TrainingPlanModal from "@/components/TrainingPlanModal";

interface Drill {
  name: string;
  description: string;
  duration: string;
  difficulty: string;
  equipment: string[];
  steps: string[];
}

interface TrainingPlan {
  id: number;
  week: number;
  focusAreas: string[];
  status: string;
  createdAt: string;
  student?: {
    id: number;
    name: string;
  };
}

interface ProgressSummary {
  id: number;
  summary: string;
  improvements: string[];
  concerns: string[];
  recommendations: string[];
  createdAt: string;
  studentId: number;
}

export default function AIAssistantPage() {
  const [drillQuery, setDrillQuery] = useState("");
  const [drillResults, setDrillResults] = useState<Drill[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showTrainingPlan, setShowTrainingPlan] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const { toast } = useToast();

  const { data: trainingPlans, isLoading: plansLoading } = useQuery<TrainingPlan[]>({
    queryKey: ["/api/training-plans"],
  });

  const { data: students } = useQuery({
    queryKey: ["/api/students"],
  });

  const searchDrillsMutation = useMutation({
    mutationFn: async (query: string) => {
      setIsSearching(true);
      const response = await apiRequest("POST", "/api/drill-recommendations", {
        query,
        ageGroup: "12-16",
        skillLevel: "intermediate"
      });
      return response;
    },
    onSuccess: (data: any) => {
      console.log("API Drill Response:", data);
      const drills = data?.drills || [];
      setDrillResults(drills);
      queryClient.invalidateQueries({ queryKey: ["/api/drill-recommendations"] });
      toast({
        title: "Drills found",
        description: `Found ${data.drills?.length || 0} relevant drills.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSearching(false);
    }
  });

  const generateTrainingPlanMutation = useMutation({
    mutationFn: async (studentId: number) => {
      return apiRequest("POST", "/api/training-plans/generate", {
        studentId,
        focusAreas: ["serve consistency", "footwork patterns"]
      });
    },
    onSuccess: () => {
      toast({
        title: "Training plan generated",
        description: "AI has created a new training plan successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/training-plans"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate plan",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const generateProgressSummaryMutation = useMutation({
    mutationFn: async (studentId: number) => {
      return apiRequest("POST", "/api/progress-summaries/generate", { studentId });
    },
    onSuccess: () => {
      toast({
        title: "Progress summary generated",
        description: "AI has analyzed student progress successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate summary",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSearchDrills = () => {
    if (!drillQuery.trim()) {
      toast({
        title: "Enter search query",
        description: "Please enter a drill search query.",
        variant: "destructive",
      });
      return;
    }
    searchDrillsMutation.mutate(drillQuery);
  };

  const handleGenerateTrainingPlan = (studentId: number) => {
    setSelectedStudentId(studentId);
    setShowTrainingPlan(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  return (
    <section className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Assistant</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">AI Online</span>
        </div>
      </div>

      {/* Quick Drill Search */}
      <Card className="custom-shadow">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Drill Search</h3>
          <div className="relative">
            <Input
              placeholder="e.g., 'Drills for weak serve, age 12'"
              value={drillQuery}
              onChange={(e) => setDrillQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearchDrills()}
              className="pr-12"
            />
            <Button
              onClick={handleSearchDrills}
              disabled={isSearching}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-white p-2 h-8 w-8"
            >
              {isSearching ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Search className="w-3 h-3" />
              )}
            </Button>
          </div>

          {/* AI Loading State */}
          {isSearching && (
            <div className="mt-4 flex items-center space-x-2">
              <div className="loading-spinner w-4 h-4"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">AI is thinking...</span>
            </div>
          )}

          {/* Drill Suggestions */}
          {drillResults.length > 0 && (
            <div className="mt-4 space-y-3">
              {drillResults.map((drill, index) => (
                <div key={index} className="border-l-4 border-primary pl-4 py-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{drill.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{drill.description}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <Badge className={`text-xs ${getDifficultyColor(drill.difficulty)}`}>
                      {drill.difficulty}
                    </Badge>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {drill.duration}
                    </span>
                  </div>
                  {drill.steps.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Steps:</p>
                      <ol className="text-xs text-gray-600 dark:text-gray-400 mt-1 list-decimal list-inside">
                        {drill.steps.slice(0, 3).map((step, stepIndex) => (
                          <li key={stepIndex}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions for Students */}
      <Card className="custom-shadow">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">AI Actions for Students</h3>
          <div className="space-y-3">
            {students?.slice(0, 5).map((student: any) => (
              <div key={student.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img
                    src={student.profileImageUrl || "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&crop=face"}
                    alt={student.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-medium text-gray-900 dark:text-white">{student.name}</span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateTrainingPlan(student.id)}
                    disabled={generateTrainingPlanMutation.isPending}
                    className="text-primary border-primary"
                  >
                    <Target className="w-3 h-3 mr-1" />
                    Plan
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateProgressSummaryMutation.mutate(student.id)}
                    disabled={generateProgressSummaryMutation.isPending}
                    className="text-secondary border-secondary"
                  >
                    <Brain className="w-3 h-3 mr-1" />
                    Analyze
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generated Training Plans */}
      <Card className="custom-shadow">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Recent AI Training Plans</h3>
          {plansLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : trainingPlans && trainingPlans.length > 0 ? (
            <div className="space-y-3">
              {trainingPlans.slice(0, 5).map((plan) => (
                <div key={plan.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {plan.student?.name} - Week {plan.week}
                    </h4>
                    <Badge variant={plan.status === "approved" ? "default" : "secondary"}>
                      {plan.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Focus: {plan.focusAreas.join(", ")}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Generated {new Date(plan.createdAt).toLocaleDateString()}
                    </span>
                    <div className="space-x-2">
                      <Button size="sm" variant="ghost" className="text-primary">
                        View
                      </Button>
                      <Button size="sm" variant="ghost" className="text-secondary">
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No training plans generated yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Generate plans for students to see them here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Progress Insights */}
      <Card className="custom-shadow">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">AI Progress Insights</h3>
          <div className="space-y-3">
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">Sample AI Insight</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    "Generate progress summaries for students to see AI insights here. Click 'Analyze' next to any student above."
                  </p>
                  <p className="text-xs text-gray-500 mt-2">AI Analysis</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Plan Modal */}
      {showTrainingPlan && selectedStudentId && (
        <TrainingPlanModal
          studentId={selectedStudentId}
          open={showTrainingPlan}
          onOpenChange={setShowTrainingPlan}
        />
      )}
    </section>
  );
}

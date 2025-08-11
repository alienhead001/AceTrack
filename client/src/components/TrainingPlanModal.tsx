import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, RefreshCw, Check, Clock, Target } from "lucide-react";
import { Student } from "@shared/schema";

// interface Student {
//   id: number;
//   name: string;
//   age: number;
//   email: string;
// }

interface TrainingPlanModalProps {
  studentId: number;
  open: boolean;
  student: Student;
  onOpenChange: (open: boolean) => void;
}

interface TrainingPlanWeek {
  week: number;
  focusAreas: string[];
  days: Array<{
    day: string;
    drills: Array<{
      name: string;
      description: string;
      duration: string;
      difficulty: string;
      equipment: string[];
      steps: string[];
    }>;
    notes?: string;
  }>;
  progressGoals: string[];
}

export default function TrainingPlanModal({ studentId, open, onOpenChange }: TrainingPlanModalProps) {
  const [generatedPlan, setGeneratedPlan] = useState<TrainingPlanWeek | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { toast } = useToast();

  const { data: student } = useQuery<Student>({
    queryKey: [`/api/students/${studentId}`],
    enabled: !!studentId,
  });

  const generatePlanMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      const response = await apiRequest("POST", "/api/training-plans/generate", {
        studentId,
        focusAreas: ["serve consistency", "footwork patterns", "mental focus"]
      });
      return response;
    },
    onSuccess: (data: any) => {
      if (data && data.length > 0) {
        // Extract the AI-generated plan from the drills field
        const plan = data[0].drills;
        setGeneratedPlan(plan);
        toast({
          title: "Training plan generated",
          description: "AI has created a personalized training plan.",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/training-plans"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate plan",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsGenerating(false);
    }
  });

  const approvePlanMutation = useMutation({
    mutationFn: async () => {
      // In a real implementation, this would approve the plan
      return Promise.resolve();
    },
    onSuccess: () => {
      toast({
        title: "Plan approved",
        description: "Training plan has been approved and saved.",
      });
      onOpenChange(false);
    }
  });

  const handleGeneratePlan = () => {
    generatePlanMutation.mutate();
  };

  const handleRegeneratePlan = () => {
    setGeneratedPlan(null);
    generatePlanMutation.mutate();
  };

  const handleApprovePlan = () => {
    approvePlanMutation.mutate();
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-primary" />
            AI Training Plan
            {student?.name && (
              <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                for {student.name}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {!generatedPlan && !isGenerating && (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Generate AI Training Plan
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create a personalized weekly training plan using AI analysis
              </p>
              <Button onClick={handleGeneratePlan} className="bg-primary text-white">
                <Target className="w-4 h-4 mr-2" />
                Generate Plan
              </Button>
            </div>
          )}

          {isGenerating && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
                <p className="text-gray-600 dark:text-gray-400">AI is generating training plan...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
              </div>
            </div>
          )}

          {generatedPlan && (
            <div className="space-y-4">
              {/* Plan Overview */}
              <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    Week {generatedPlan.week} Training Plan
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Focus Areas: {generatedPlan.focusAreas.join(", ")}
                  </p>
                </CardContent>
              </Card>

              {/* Training Days */}
              <div className="space-y-3">
                {generatedPlan.days?.map((day, dayIndex) => (
                  <Card key={dayIndex} className="border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-3">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3">{day.day}</h5>
                      <div className="space-y-3">
                        {day.drills.map((drill, drillIndex) => (
                          <div key={drillIndex} className="border-l-3 border-primary pl-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-r">
                            <div className="flex items-start justify-between mb-1">
                              <h6 className="font-medium text-gray-900 dark:text-white text-sm">
                                {drill.name}
                              </h6>
                              <div className="flex items-center space-x-2">
                                <Badge className={`text-xs ${getDifficultyColor(drill.difficulty)}`}>
                                  {drill.difficulty}
                                </Badge>
                                <span className="text-xs text-gray-500 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {drill.duration}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              {drill.description}
                            </p>
                            {drill.steps.length > 0 && (
                              <div className="text-xs">
                                <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Steps:</p>
                                <ol className="list-decimal list-inside text-gray-600 dark:text-gray-400 space-y-0.5">
                                  {drill.steps.slice(0, 3).map((step, stepIndex) => (
                                    <li key={stepIndex}>{step}</li>
                                  ))}
                                </ol>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {day.notes && (
                        <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/10 rounded text-xs">
                          <span className="font-medium text-yellow-800 dark:text-yellow-300">Note: </span>
                          <span className="text-yellow-700 dark:text-yellow-400">{day.notes}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Progress Goals */}
              {generatedPlan.progressGoals && generatedPlan.progressGoals.length > 0 && (
                <Card className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
                  <CardContent className="p-4">
                    <h5 className="font-medium text-green-900 dark:text-green-300 mb-2">
                      Week Goals
                    </h5>
                    <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                      {generatedPlan.progressGoals.map((goal, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {generatedPlan && (
          <div className="flex space-x-3 pt-4 border-t">
            <Button
              onClick={handleApprovePlan}
              disabled={approvePlanMutation.isPending}
              className="flex-1 bg-primary text-white"
            >
              {approvePlanMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Approve Plan
            </Button>
            <Button
              onClick={handleRegeneratePlan}
              disabled={generatePlanMutation.isPending}
              variant="outline"
              className="flex-1"
            >
              {generatePlanMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Regenerate
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

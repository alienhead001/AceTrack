import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { StudentWithBatch } from "@shared/schema";
import { User, Phone, Mail, Calendar, TrendingUp, Save, Target } from "lucide-react";
import TrainingPlanModal from "./TrainingPlanModal";
import { SkillAssessment, Batch, ProgressSummary } from "@shared/schema";


interface StudentDetailModalProps {
  student: StudentWithBatch;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export default function StudentDetailModal({ student, open, onOpenChange, onUpdate }: StudentDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showTrainingPlan, setShowTrainingPlan] = useState(false);
  const [formData, setFormData] = useState({
    name: student.name,
    age: student.age.toString(),
    email: student.email || "",
    phone: student.phone || "",
    parentName: student.parentName || "",
    parentPhone: student.parentPhone || "",
    batchId: student.batchId?.toString() || "",
    status: student.status || "active",
  });

  const { toast } = useToast();

  useEffect(() => {
    setFormData({
      name: student.name,
      age: student.age.toString(),
      email: student.email || "",
      phone: student.phone || "",
      parentName: student.parentName || "",
      parentPhone: student.parentPhone || "",
      batchId: student.batchId?.toString() || "",
      status: student.status || "active",
    });
  }, [student]);

  const { data: batches } = useQuery<Batch[]>({
    queryKey: ["/api/batches"],
  });

  const { data: skillAssessments } = useQuery<SkillAssessment[]>({
    queryKey: [`/api/students/${student.id}/skill-assessments`],
    enabled: !!student.id,
  });

  const { data: progressSummaries } = useQuery<ProgressSummary[]>({
    queryKey: [`/api/students/${student.id}/progress-summaries`],
    enabled: !!student.id,
  });

  const updateStudentMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PATCH", `/api/students/${student.id}`, {
        ...data,
        age: parseInt(data.age),
        batchId: data.batchId ? parseInt(data.batchId) : null,
      });
    },
    onSuccess: () => {
      toast({
        title: "Student updated",
        description: "Student information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      setIsEditing(false);
      onUpdate();
    },
    onError: (error) => {
      toast({
        title: "Failed to update student",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateProgressSummaryMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/progress-summaries/generate", {
        studentId: student.id
      });
    },
    onSuccess: () => {
      toast({
        title: "Progress summary generated",
        description: "AI has analyzed the student's progress.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/students/${student.id}/progress-summaries`] });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate summary",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudentMutation.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "status-active";
      case "at_risk":
        return "status-at-risk";
      default:
        return "status-inactive";
    }
  };

  const getSkillTrend = (skill: string) => {
    if (!skillAssessments || skillAssessments.length < 2) return null;
    
    const latest = skillAssessments[0];
    const previous = skillAssessments[1];
    
    const currentValue = latest[skill as keyof typeof latest] as number;
    const previousValue = previous[skill as keyof typeof previous] as number;
    
    return currentValue - previousValue;
  };

  const renderSkillTrend = (trend: number | null) => {
    if (trend === null) return null;
    
    if (trend > 0) {
      return <TrendingUp className="w-3 h-3 text-green-500 ml-1" />;
    } else if (trend < 0) {
      return <TrendingUp className="w-3 h-3 text-red-500 ml-1 rotate-180" />;
    }
    return null;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center">
                <User className="w-5 h-5 mr-2 text-primary" />
                {student.name}
              </DialogTitle>
              <div className="flex items-center space-x-2">
                <Badge className={`${getStatusColor(student.status || "active")}`}>
                  {student.status === "at_risk" ? "At Risk" : student.status?.charAt(0).toUpperCase() + (student.status?.slice(1) || "")}
                </Badge>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="profile" className="flex-1 overflow-hidden">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="profile" className="space-y-4">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="age">Age *</Label>
                        <Input
                          id="age"
                          type="number"
                          value={formData.age}
                          onChange={(e) => handleInputChange("age", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="parentName">Parent Name</Label>
                        <Input
                          id="parentName"
                          value={formData.parentName}
                          onChange={(e) => handleInputChange("parentName", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="parentPhone">Parent Phone</Label>
                        <Input
                          id="parentPhone"
                          value={formData.parentPhone}
                          onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="batch">Batch</Label>
                        <Select value={formData.batchId} onValueChange={(value) => handleInputChange("batchId", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a batch" />
                          </SelectTrigger>
                          <SelectContent>
                            {batches?.map((batch: any) => (
                              <SelectItem key={batch.id} value={batch.id.toString()}>
                                {batch.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="at_risk">At Risk</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={updateStudentMutation.isPending}
                        className="bg-primary text-white"
                      >
                        {updateStudentMutation.isPending ? (
                          <>Saving...</>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Personal Information</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">Age:</span>
                            <span className="font-medium">{student.age} years</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">Email:</span>
                            <span className="font-medium">{student.email || "Not provided"}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                            <span className="font-medium">{student.phone || "Not provided"}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">Joined:</span>
                            <span className="font-medium">
                              {student.joinDate ? new Date(student.joinDate).toLocaleDateString() : "Unknown"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Parent Information</h4>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">Parent Name:</span>
                            <span className="font-medium">{student.parentName || "Not provided"}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">Parent Phone:</span>
                            <span className="font-medium">{student.parentPhone || "Not provided"}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Training Information</h4>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">Batch:</span>
                            <span className="font-medium">{student.batch?.name || "Not assigned"}</span>
                          </div>
                          {student.batch && (
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-600 dark:text-gray-400">Level:</span>
                              <Badge variant="outline">{student.batch.level}</Badge>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="skills" className="space-y-4">
                {student.latestSkillAssessment ? (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-4">Current Skill Levels</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                              {student.latestSkillAssessment.serve}
                            </div>
                            {renderSkillTrend(getSkillTrend('serve'))}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Serve</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                              {student.latestSkillAssessment.footwork}
                            </div>
                            {renderSkillTrend(getSkillTrend('footwork'))}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Footwork</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                              {student.latestSkillAssessment.stamina}
                            </div>
                            {renderSkillTrend(getSkillTrend('stamina'))}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Stamina</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                              {student.latestSkillAssessment.mentalFocus}
                            </div>
                            {renderSkillTrend(getSkillTrend('mentalFocus'))}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Mental Focus</div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t text-center">
                        <div className="text-2xl font-bold text-primary">
                          {student.latestSkillAssessment.overall}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Overall Score</div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-gray-500 dark:text-gray-400">No skill assessments recorded yet</p>
                    </CardContent>
                  </Card>
                )}

                <div className="flex space-x-2">
                  <Button
                    onClick={() => setShowTrainingPlan(true)}
                    className="flex-1 bg-primary text-white"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Generate Training Plan
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="progress" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white">Progress Analysis</h4>
                  <Button
                    size="sm"
                    onClick={() => generateProgressSummaryMutation.mutate()}
                    disabled={generateProgressSummaryMutation.isPending}
                    className="bg-secondary text-white"
                  >
                    Generate Summary
                  </Button>
                </div>

                {progressSummaries && progressSummaries.length > 0 ? (
                  <div className="space-y-3">
                    {progressSummaries.slice(0, 3).map((summary: any) => (
                      <Card key={summary.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              Week {summary.week} Summary
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(summary.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {summary.summary}
                          </p>
                          {summary.improvements.length > 0 && (
                            <div className="mb-2">
                              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                Improvements:
                              </span>
                              <ul className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {summary.improvements.map((improvement: string, index: number) => (
                                  <li key={index}>• {improvement}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {summary.recommendations.length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                Recommendations:
                              </span>
                              <ul className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {summary.recommendations.map((rec: string, index: number) => (
                                  <li key={index}>• {rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-gray-500 dark:text-gray-400">No progress summaries available</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Generate a summary to see AI insights
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Training Plan Modal */}
      <TrainingPlanModal
        studentId={student.id}
        open={showTrainingPlan}
        student={student}
        onOpenChange={setShowTrainingPlan}
      />
    </>
  );
}

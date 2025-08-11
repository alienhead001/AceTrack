import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Save, Target } from "lucide-react";

interface SkillScoringModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId?: number;
}

interface SkillScores {
  serve: number;
  footwork: number;
  stamina: number;
  mentalFocus: number;
}

export default function SkillScoringModal({ open, onOpenChange, sessionId }: SkillScoringModalProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [skillScores, setSkillScores] = useState<SkillScores>({
    serve: 5,
    footwork: 5,
    stamina: 5,
    mentalFocus: 5,
  });
  const [notes, setNotes] = useState("");

  const { toast } = useToast();

  const { data: students } = useQuery({
    queryKey: ["/api/students"],
  });

  const saveSkillScoresMutation = useMutation({
    mutationFn: async () => {
      if (!selectedStudentId) {
        throw new Error("Please select a student");
      }

      const overall = Math.round(
        (skillScores.serve + skillScores.footwork + skillScores.stamina + skillScores.mentalFocus) / 4
      );

      return apiRequest("POST", "/api/skill-assessments", {
        studentId: parseInt(selectedStudentId),
        sessionId: sessionId || null,
        serve: skillScores.serve,
        footwork: skillScores.footwork,
        stamina: skillScores.stamina,
        mentalFocus: skillScores.mentalFocus,
        overall,
        notes,
      });
    },
    onSuccess: () => {
      toast({
        title: "Skill scores saved",
        description: "Student skill assessment has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skill-assessments"] });
      handleReset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to save scores",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSkillScoreChange = (skill: keyof SkillScores, value: number[]) => {
    setSkillScores(prev => ({
      ...prev,
      [skill]: value[0]
    }));
  };

  const handleReset = () => {
    setSelectedStudentId("");
    setSkillScores({
      serve: 5,
      footwork: 5,
      stamina: 5,
      mentalFocus: 5,
    });
    setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSkillScoresMutation.mutate();
  };

  const overallScore = Math.round(
    (skillScores.serve + skillScores.footwork + skillScores.stamina + skillScores.mentalFocus) / 4
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-primary" />
            Update Skill Scores
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Selection */}
          <div>
            <Label htmlFor="student" className="block text-sm font-medium mb-2">
              Select Student *
            </Label>
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a student" />
              </SelectTrigger>
              <SelectContent>
                {students?.map((student: any) => (
                  <SelectItem key={student.id} value={student.id.toString()}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Skill Scoring */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Skill Assessment (1-10 scale)</h4>
            
            {/* Serve */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Serve</Label>
                <span className="text-sm font-bold text-primary">{skillScores.serve}</span>
              </div>
              <Slider
                value={[skillScores.serve]}
                onValueChange={(value) => handleSkillScoreChange('serve', value)}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            {/* Footwork */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Footwork</Label>
                <span className="text-sm font-bold text-primary">{skillScores.footwork}</span>
              </div>
              <Slider
                value={[skillScores.footwork]}
                onValueChange={(value) => handleSkillScoreChange('footwork', value)}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            {/* Stamina */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Stamina</Label>
                <span className="text-sm font-bold text-primary">{skillScores.stamina}</span>
              </div>
              <Slider
                value={[skillScores.stamina]}
                onValueChange={(value) => handleSkillScoreChange('stamina', value)}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            {/* Mental Focus */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Mental Focus</Label>
                <span className="text-sm font-bold text-primary">{skillScores.mentalFocus}</span>
              </div>
              <Slider
                value={[skillScores.mentalFocus]}
                onValueChange={(value) => handleSkillScoreChange('mentalFocus', value)}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            {/* Overall Score Display */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  Overall Score
                </span>
                <span className="text-lg font-bold text-blue-900 dark:text-blue-300">
                  {overallScore}/10
                </span>
              </div>
            </div>
          </div>

          {/* Session Notes */}
          <div>
            <Label htmlFor="notes" className="block text-sm font-medium mb-2">
              Session Notes
            </Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Add notes about today's performance..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Record specific observations or improvements
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saveSkillScoresMutation.isPending || !selectedStudentId}
              className="bg-primary text-white"
            >
              {saveSkillScoresMutation.isPending ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Scores
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

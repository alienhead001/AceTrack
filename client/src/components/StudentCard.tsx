import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudentWithBatch } from "@shared/schema";

interface StudentCardProps {
  student: StudentWithBatch;
  onViewDetails: () => void;
  onGenerateTrainingPlan: () => void;
}

export default function StudentCard({ student, onViewDetails, onGenerateTrainingPlan }: StudentCardProps) {
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

  const skills = student.latestSkillAssessment;

  return (
    <Card className="custom-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={student.profileImageUrl || "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&crop=face"}
              alt={student.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{student.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {student.batch?.name} • Age {student.age}
              </p>
              <div className="flex items-center mt-1">
                <Badge className={`text-xs ${getStatusColor(student.status || "active")}`}>
                  {student.status === "at_risk" ? "At Risk" : student.status?.charAt(0).toUpperCase() + (student.status?.slice(1) || "")}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Button variant="ghost" size="sm" onClick={onViewDetails} className="text-primary">
              View
            </Button>
            <Button variant="ghost" size="sm" onClick={onGenerateTrainingPlan} className="text-secondary">
              AI Plan
            </Button>
          </div>
        </div>

        {/* Skill Scores */}
        {skills && (
          <div className="mt-4 grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">{skills.serve}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Serve</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">{skills.footwork}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Footwork</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">{skills.stamina}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Stamina</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">{skills.overall.toFixed(1)}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Overall</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

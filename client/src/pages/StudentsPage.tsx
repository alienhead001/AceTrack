import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import StudentCard from "@/components/StudentCard";
import AddStudentModal from "@/components/AddStudentModal";
import StudentDetailModal from "@/components/StudentDetailModal";
import TrainingPlanModal from "@/components/TrainingPlanModal";
import { StudentWithBatch } from "@shared/schema";

export default function StudentsPage() {
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithBatch | null>(null);
  const [showTrainingPlan, setShowTrainingPlan] = useState(false);
  const [trainingPlanStudentId, setTrainingPlanStudentId] = useState<number | null>(null);

  const { data: students, isLoading, refetch } = useQuery<StudentWithBatch[]>({
    queryKey: ["/api/students", selectedBatchId ? `?batchId=${selectedBatchId}` : ""],
  });

  const { data: batches } = useQuery({
    queryKey: ["/api/batches"],
  });

  const handleGenerateTrainingPlan = (studentId: number) => {
    setTrainingPlanStudentId(studentId);
    setShowTrainingPlan(true);
  };

  const filteredStudents = students || [];

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Students</h2>
        <Button onClick={() => setShowAddStudent(true)} className="bg-primary text-white">
          <Plus className="w-4 h-4 mr-1" />
          Add Student
        </Button>
      </div>

      {/* Batch Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <Button
          variant={selectedBatchId === null ? "default" : "outline"}
          onClick={() => setSelectedBatchId(null)}
          className="whitespace-nowrap"
        >
          All Students
        </Button>
        {batches?.map((batch: any) => (
          <Button
            key={batch.id}
            variant={selectedBatchId === batch.id ? "default" : "outline"}
            onClick={() => setSelectedBatchId(batch.id)}
            className="whitespace-nowrap"
          >
            {batch.name}
          </Button>
        ))}
      </div>

      {/* Students List */}
      <div className="space-y-3">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No students found</p>
            <Button 
              onClick={() => setShowAddStudent(true)} 
              className="mt-4 bg-primary text-white"
            >
              Add First Student
            </Button>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onViewDetails={() => setSelectedStudent(student)}
              onGenerateTrainingPlan={() => handleGenerateTrainingPlan(student.id)}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <AddStudentModal
        open={showAddStudent}
        onOpenChange={setShowAddStudent}
        onSuccess={() => {
          refetch();
          setShowAddStudent(false);
        }}
      />

      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          open={!!selectedStudent}
          onOpenChange={(open) => !open && setSelectedStudent(null)}
          onUpdate={refetch}
        />
      )}

      {showTrainingPlan && trainingPlanStudentId && (
        <TrainingPlanModal
          studentId={trainingPlanStudentId}
          open={showTrainingPlan}
          onOpenChange={setShowTrainingPlan}
        />
      )}
    </section>
  );
}

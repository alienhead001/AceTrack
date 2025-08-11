import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertStudentSchema } from "@shared/schema";

interface AddStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddStudentModal({ open, onOpenChange, onSuccess }: AddStudentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    email: "",
    phone: "",
    parentName: "",
    parentPhone: "",
    batchId: "",
  });

  const { toast } = useToast();

  const { data: batches } = useQuery({
    queryKey: ["/api/batches"],
  });

  const addStudentMutation = useMutation({
    mutationFn: async (data: any) => {
      const validatedData = insertStudentSchema.parse({
        ...data,
        age: parseInt(data.age),
        batchId: data.batchId ? parseInt(data.batchId) : null,
      });
      return apiRequest("POST", "/api/students", validatedData);
    },
    onSuccess: () => {
      toast({
        title: "Student added",
        description: "Student has been successfully added.",
      });
      setFormData({
        name: "",
        age: "",
        email: "",
        phone: "",
        parentName: "",
        parentPhone: "",
        batchId: "",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Failed to add student",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addStudentMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={addStudentMutation.isPending}
              className="bg-primary text-white"
            >
              {addStudentMutation.isPending ? "Adding..." : "Add Student"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

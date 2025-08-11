import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Play, Clock, Users, CheckCircle } from "lucide-react";
import SkillScoringModal from "@/components/SkillScoringModal";

interface Session {
  id: number;
  batchId: number;
  date: string;
  duration: number;
  court: string;
  status: string;
  batch?: {
    id: number;
    name: string;
  };
  attendance?: Array<{
    id: number;
    studentId: number;
    present: boolean;
    student: {
      id: number;
      name: string;
      profileImageUrl?: string;
    };
  }>;
}

export default function SessionsPage() {
  const [showNewSession, setShowNewSession] = useState(false);
  const [showSkillScoring, setShowSkillScoring] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [newSessionData, setNewSessionData] = useState({
    batchId: "",
    date: new Date().toISOString().split('T')[0],
    duration: "60",
    court: "Court 1",
  });

  const { toast } = useToast();

  const { data: sessions, isLoading, refetch } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  const { data: batches } = useQuery({
    queryKey: ["/api/batches"],
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/sessions", {
        batchId: parseInt(data.batchId),
        date: new Date(data.date + "T09:00:00"),
        duration: parseInt(data.duration),
        court: data.court,
      });
    },
    onSuccess: () => {
      toast({
        title: "Session created",
        description: "New session has been scheduled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      setShowNewSession(false);
      setNewSessionData({
        batchId: "",
        date: new Date().toISOString().split('T')[0],
        duration: "60",
        court: "Court 1",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create session",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateAttendanceMutation = useMutation({
    mutationFn: async ({ sessionId, studentId, present }: { sessionId: number; studentId: number; present: boolean }) => {
      return apiRequest("PATCH", `/api/attendance/${sessionId}/${studentId}`, { present });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
    },
  });

  const updateSessionStatusMutation = useMutation({
    mutationFn: async ({ sessionId, status }: { sessionId: number; status: string }) => {
      return apiRequest("PATCH", `/api/sessions/${sessionId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
    },
  });

  const handleStartSession = (sessionId: number) => {
    updateSessionStatusMutation.mutate({ sessionId, status: "active" });
    setActiveSessionId(sessionId);
  };

  const handleCompleteSession = (sessionId: number) => {
    updateSessionStatusMutation.mutate({ sessionId, status: "completed" });
    setActiveSessionId(null);
  };

  const handleAttendanceChange = (sessionId: number, studentId: number, present: boolean) => {
    updateAttendanceMutation.mutate({ sessionId, studentId, present });
  };

  const activeSession = sessions?.find(s => s.status === "active");
  const todaySessions = sessions?.filter(s => {
    const sessionDate = new Date(s.date).toDateString();
    const today = new Date().toDateString();
    return sessionDate === today;
  }) || [];

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Session Tracking</h2>
        <Button onClick={() => setShowNewSession(true)} className="bg-primary text-white">
          <Play className="w-4 h-4 mr-1" />
          Start Session
        </Button>
      </div>

      {/* Active Session */}
      {activeSession && (
        <Card className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-300">Active Session</h3>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {activeSession.batch?.name} - {activeSession.court}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-800 dark:text-green-300">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {activeSession.duration} min
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">Duration</div>
              </div>
            </div>

            {/* Attendance */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Mark Attendance</h4>
              {activeSession.attendance?.map((attendance) => (
                <div key={attendance.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img
                      src={attendance.student.profileImageUrl || "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&crop=face"}
                      alt={attendance.student.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {attendance.student.name}
                    </span>
                  </div>
                  <Switch
                    checked={attendance.present}
                    onCheckedChange={(checked) => 
                      handleAttendanceChange(activeSession.id, attendance.studentId, checked)
                    }
                  />
                </div>
              ))}
            </div>

            <div className="flex space-x-2 mt-4">
              <Button
                onClick={() => setShowSkillScoring(true)}
                className="flex-1 bg-primary text-white"
              >
                Update Skill Scores
              </Button>
              <Button
                onClick={() => handleCompleteSession(activeSession.id)}
                variant="outline"
                className="flex-1"
              >
                Complete Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Sessions */}
      <Card className="custom-shadow">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Today's Sessions</h3>
          {todaySessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No sessions scheduled for today</p>
              <Button 
                onClick={() => setShowNewSession(true)} 
                className="mt-4 bg-primary text-white"
              >
                Schedule Session
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {session.batch?.name} - {session.court}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {session.duration} minutes
                    </p>
                    <div className="flex items-center mt-1">
                      <Badge variant={session.status === "completed" ? "default" : session.status === "active" ? "secondary" : "outline"}>
                        {session.status}
                      </Badge>
                      {session.attendance && (
                        <span className="ml-2 text-xs text-gray-500">
                          <Users className="w-3 h-3 inline mr-1" />
                          {session.attendance.filter(a => a.present).length}/{session.attendance.length} attended
                        </span>
                      )}
                    </div>
                  </div>
                  {session.status === "scheduled" && (
                    <Button
                      size="sm"
                      onClick={() => handleStartSession(session.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Start
                    </Button>
                  )}
                  {session.status === "completed" && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card className="custom-shadow">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Sessions</h3>
          <div className="space-y-3">
            {sessions?.slice(0, 5).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {session.batch?.name} - {session.court}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(session.date).toLocaleDateString()} - {session.duration} minutes
                  </p>
                  {session.attendance && (
                    <p className="text-xs text-gray-500">
                      {session.attendance.filter(a => a.present).length}/{session.attendance.length} students attended
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="text-primary">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Session Modal */}
      <Dialog open={showNewSession} onOpenChange={setShowNewSession}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule New Session</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            createSessionMutation.mutate(newSessionData);
          }} className="space-y-4">
            <div>
              <Label htmlFor="batch">Batch *</Label>
              <Select value={newSessionData.batchId} onValueChange={(value) => 
                setNewSessionData(prev => ({ ...prev, batchId: value }))
              }>
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
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={newSessionData.date}
                onChange={(e) => setNewSessionData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                value={newSessionData.duration}
                onChange={(e) => setNewSessionData(prev => ({ ...prev, duration: e.target.value }))}
                required
                min="30"
                max="180"
              />
            </div>

            <div>
              <Label htmlFor="court">Court *</Label>
              <Select value={newSessionData.court} onValueChange={(value) => 
                setNewSessionData(prev => ({ ...prev, court: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Court 1">Court 1</SelectItem>
                  <SelectItem value="Court 2">Court 2</SelectItem>
                  <SelectItem value="Court 3">Court 3</SelectItem>
                  <SelectItem value="Court 4">Court 4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowNewSession(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createSessionMutation.isPending}
                className="bg-primary text-white"
              >
                {createSessionMutation.isPending ? "Creating..." : "Create Session"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Skill Scoring Modal */}
      <SkillScoringModal
        open={showSkillScoring}
        onOpenChange={setShowSkillScoring}
        sessionId={activeSession?.id}
      />
    </section>
  );
}

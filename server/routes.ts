import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiService } from "./services/aiService";
import {
  insertUserSchema,
  insertStudentSchema,
  insertBatchSchema,
  insertSessionSchema,
  insertSkillAssessmentSchema,
  insertAttendanceSchema,
  insertTrainingPlanSchema,
} from "@shared/schema";

// Simple session-based auth
let currentUser: any = null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      currentUser = user;
      res.json({ user: { id: user.id, username: user.username, role: user.role, academyName: user.academyName } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    currentUser = null;
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!currentUser) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({ id: currentUser.id, username: currentUser.username, role: currentUser.role, academyName: currentUser.academyName });
  });

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!currentUser) {
      return res.status(401).json({ message: "Authentication required" });
    }
    req.user = currentUser;
    next();
  };

  // Student routes
  app.get("/api/students", requireAuth, async (req, res) => {
    try {
      const { batchId } = req.query;
      const students = await storage.getStudents(batchId ? parseInt(batchId as string) : undefined);
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/students/:id", requireAuth, async (req, res) => {
    try {
      const student = await storage.getStudent(parseInt(req.params.id));
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  app.post("/api/students", requireAuth, async (req, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(studentData);
      res.status(201).json(student);
    } catch (error) {
      res.status(400).json({ message: "Invalid student data", error: error.message });
    }
  });

  app.patch("/api/students/:id", requireAuth, async (req, res) => {
    try {
      const studentData = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(parseInt(req.params.id), studentData);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      res.status(400).json({ message: "Invalid student data", error: error.message });
    }
  });

  app.delete("/api/students/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteStudent(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  app.get("/api/students/at-risk", requireAuth, async (req, res) => {
    try {
      const students = await storage.getAtRiskStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch at-risk students" });
    }
  });

  // Batch routes
  app.get("/api/batches", requireAuth, async (req, res) => {
    try {
      const batches = await storage.getBatches(req.user.id);
      res.json(batches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch batches" });
    }
  });

  app.post("/api/batches", requireAuth, async (req, res) => {
    try {
      const batchData = insertBatchSchema.parse({ ...req.body, coachId: req.user.id });
      const batch = await storage.createBatch(batchData);
      res.status(201).json(batch);
    } catch (error) {
      res.status(400).json({ message: "Invalid batch data", error: error.message });
    }
  });

  // Session routes
  app.get("/api/sessions", requireAuth, async (req, res) => {
    try {
      const { batchId, date } = req.query;
      const sessions = await storage.getSessions(
        batchId ? parseInt(batchId as string) : undefined,
        date ? new Date(date as string) : undefined
      );
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.get("/api/sessions/:id", requireAuth, async (req, res) => {
    try {
      const session = await storage.getSession(parseInt(req.params.id));
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  app.post("/api/sessions", requireAuth, async (req, res) => {
    try {
      // Ensure date is properly formatted
      const sessionData = {
        ...req.body,
        coachId: req.user.id,
        date: new Date(req.body.date),
        batchId: parseInt(req.body.batchId),
        duration: parseInt(req.body.duration)
      };
      
      const validatedData = insertSessionSchema.parse(sessionData);
      const session = await storage.createSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      console.error("Session creation error:", error);
      res.status(400).json({ message: "Invalid session data", error: error.message });
    }
  });

  app.patch("/api/sessions/:id", requireAuth, async (req, res) => {
    try {
      const sessionData = insertSessionSchema.partial().parse(req.body);
      const session = await storage.updateSession(parseInt(req.params.id), sessionData);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data", error: error.message });
    }
  });

  // Attendance routes
  app.get("/api/sessions/:id/attendance", requireAuth, async (req, res) => {
    try {
      const attendance = await storage.getAttendance(parseInt(req.params.id));
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.post("/api/attendance", requireAuth, async (req, res) => {
    try {
      const attendanceData = insertAttendanceSchema.parse(req.body);
      const attendance = await storage.markAttendance(attendanceData);
      res.status(201).json(attendance);
    } catch (error) {
      res.status(400).json({ message: "Invalid attendance data", error: error.message });
    }
  });

  app.patch("/api/attendance/:sessionId/:studentId", requireAuth, async (req, res) => {
    try {
      const { present } = req.body;
      const attendance = await storage.updateAttendance(
        parseInt(req.params.sessionId),
        parseInt(req.params.studentId),
        present
      );
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to update attendance" });
    }
  });

  // Skill assessment routes
  app.get("/api/students/:id/skill-assessments", requireAuth, async (req, res) => {
    try {
      const assessments = await storage.getSkillAssessments(parseInt(req.params.id));
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch skill assessments" });
    }
  });

  app.post("/api/skill-assessments", requireAuth, async (req, res) => {
    try {
      const assessmentData = insertSkillAssessmentSchema.parse({ ...req.body, assessedBy: req.user.id });
      const assessment = await storage.createSkillAssessment(assessmentData);
      res.status(201).json(assessment);
    } catch (error) {
      res.status(400).json({ message: "Invalid assessment data", error: error.message });
    }
  });

  // Training plan routes
  app.get("/api/training-plans", requireAuth, async (req, res) => {
    try {
      const { studentId, batchId } = req.query;
      const plans = await storage.getTrainingPlans(
        studentId ? parseInt(studentId as string) : undefined,
        batchId ? parseInt(batchId as string) : undefined
      );
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch training plans" });
    }
  });

  app.post("/api/training-plans/generate", requireAuth, async (req, res) => {
    try {
      const { studentId, batchId, focusAreas } = req.body;
      
      let student;
      let students;
      
      if (studentId) {
        student = await storage.getStudent(studentId);
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }
        students = [student];
      } else if (batchId) {
        students = await storage.getStudents(batchId);
        if (!students.length) {
          return res.status(404).json({ message: "No students found in batch" });
        }
      } else {
        return res.status(400).json({ message: "Either studentId or batchId is required" });
      }

      const plans = [];
      
      for (const student of students) {
        try {
          const skillLevel = student.latestSkillAssessment 
            ? student.latestSkillAssessment.overall >= 7 ? "advanced" 
              : student.latestSkillAssessment.overall >= 5 ? "intermediate" 
              : "beginner"
            : "beginner";

          const currentSkills = student.latestSkillAssessment 
            ? {
                serve: student.latestSkillAssessment.serve,
                footwork: student.latestSkillAssessment.footwork,
                stamina: student.latestSkillAssessment.stamina,
                mentalFocus: student.latestSkillAssessment.mentalFocus
              }
            : { serve: 5, footwork: 5, stamina: 5, mentalFocus: 5 };

          const aiPlan = await aiService.generateTrainingPlan(
            student.name,
            student.age,
            skillLevel,
            currentSkills,
            focusAreas
          );

          const planData = insertTrainingPlanSchema.parse({
            studentId: student.id,
            batchId: student.batchId,
            week: aiPlan.week,
            focusAreas: aiPlan.focusAreas,
            drills: aiPlan,
            createdBy: req.user.id
          });

          const plan = await storage.createTrainingPlan(planData);
          plans.push(plan);
        } catch (error) {
          console.error(`Error generating plan for student ${student.id}:`, error);
        }
      }

      res.json(plans);
    } catch (error) {
      console.error("Error generating training plans:", error);
      res.status(500).json({ message: "Failed to generate training plans" });
    }
  });

  app.patch("/api/training-plans/:id", requireAuth, async (req, res) => {
    try {
      const planData = insertTrainingPlanSchema.partial().parse(req.body);
      const plan = await storage.updateTrainingPlan(parseInt(req.params.id), planData);
      if (!plan) {
        return res.status(404).json({ message: "Training plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(400).json({ message: "Invalid training plan data", error: error.message });
    }
  });

  // Progress summary routes
  app.get("/api/students/:id/progress-summaries", requireAuth, async (req, res) => {
    try {
      const summaries = await storage.getProgressSummaries(parseInt(req.params.id));
      res.json(summaries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress summaries" });
    }
  });

  app.post("/api/progress-summaries/generate", requireAuth, async (req, res) => {
    try {
      const { studentId } = req.body;
      
      const student = await storage.getStudent(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const assessments = await storage.getSkillAssessments(studentId);
      if (assessments.length < 2) {
        return res.status(400).json({ message: "Need at least 2 skill assessments to generate progress summary" });
      }

      const currentSkills = {
        serve: assessments[0].serve,
        footwork: assessments[0].footwork,
        stamina: assessments[0].stamina,
        mentalFocus: assessments[0].mentalFocus
      };

      const previousSkills = {
        serve: assessments[1].serve,
        footwork: assessments[1].footwork,
        stamina: assessments[1].stamina,
        mentalFocus: assessments[1].mentalFocus
      };

      const sessionNotes = assessments.slice(0, 5).map(a => a.notes || "").filter(Boolean);
      const attendanceRate = 85; // This would be calculated from actual attendance data

      const insight = await aiService.generateProgressSummary(
        student.name,
        previousSkills,
        currentSkills,
        sessionNotes,
        attendanceRate
      );

      const summaryData = {
        studentId,
        week: Math.ceil(Date.now() / (7 * 24 * 60 * 60 * 1000)),
        summary: insight.summary,
        improvements: insight.improvements,
        concerns: insight.concerns,
        recommendations: insight.recommendations
      };

      const summary = await storage.createProgressSummary(summaryData);
      res.json(summary);
    } catch (error) {
      console.error("Error generating progress summary:", error);
      res.status(500).json({ message: "Failed to generate progress summary" });
    }
  });

  // Drill recommendation routes
  app.get("/api/drill-recommendations", requireAuth, async (req, res) => {
    try {
      const recommendations = await storage.getDrillRecommendations();
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch drill recommendations" });
    }
  });

  app.post("/api/drill-recommendations", requireAuth, async (req, res) => {
    try {
      const { query, ageGroup, skillLevel } = req.body;
      
      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }

      const drills = await aiService.recommendDrills(query, ageGroup, skillLevel);
      
      const recommendationData = {
        query,
        recommendations: drills,
        ageGroup,
        skillLevel,
        createdBy: req.user.id
      };

      const recommendation = await storage.createDrillRecommendation(recommendationData);
      res.json({ drills });
    } catch (error) {
      console.error("Error generating drill recommendations:", error);
      res.status(500).json({ message: "Failed to generate drill recommendations" });
    }
  });

  // Dropout risk analysis
  app.post("/api/students/:id/analyze-dropout-risk", requireAuth, async (req, res) => {
    try {
      const student = await storage.getStudent(parseInt(req.params.id));
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const assessments = await storage.getSkillAssessments(student.id);
      const skillProgression = assessments.slice(0, 5).map(a => a.overall).reverse();
      const lastSessionNotes = assessments.slice(0, 3).map(a => a.notes || "").filter(Boolean);
      
      // Mock data for demonstration - in real app would calculate from actual data
      const attendanceRate = student.status === "at_risk" ? 40 : 85;
      const missedSessions = student.status === "at_risk" ? 3 : 0;

      const retentionPlan = await aiService.analyzeDropoutRisk(
        student.name,
        attendanceRate,
        skillProgression,
        missedSessions,
        lastSessionNotes
      );

      res.json(retentionPlan);
    } catch (error) {
      console.error("Error analyzing dropout risk:", error);
      res.status(500).json({ message: "Failed to analyze dropout risk" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const today = new Date();
      const todaySessions = await storage.getSessions(undefined, today);
      const allStudents = await storage.getStudents();
      const atRiskStudents = await storage.getAtRiskStudents();
      
      const stats = {
        sessionsToday: todaySessions.length,
        activeStudents: allStudents.filter(s => s.status === "active").length,
        totalStudents: allStudents.length,
        atRiskStudents: atRiskStudents.length,
        averageImprovement: "+1.2" // This would be calculated from actual skill assessments
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

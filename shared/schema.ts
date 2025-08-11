import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("coach"), // "coach" or "admin"
  academyName: text("academy_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Batches table
export const batches = pgTable("batches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ageGroup: text("age_group").notNull(),
  level: text("level").notNull(), // "beginner", "intermediate", "advanced"
  coachId: integer("coach_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Students table
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  email: text("email"),
  phone: text("phone"),
  parentName: text("parent_name"),
  parentPhone: text("parent_phone"),
  batchId: integer("batch_id").references(() => batches.id),
  profileImageUrl: text("profile_image_url"),
  status: text("status").notNull().default("active"), // "active", "inactive", "at_risk"
  joinDate: timestamp("join_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sessions table (moved before skill assessments to fix reference)
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  batchId: integer("batch_id").references(() => batches.id).notNull(),
  date: timestamp("date").notNull(),
  duration: integer("duration"), // in minutes
  court: text("court"),
  status: text("status").notNull().default("scheduled"), // "scheduled", "active", "completed"
  notes: text("notes"),
  coachId: integer("coach_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Skill assessments table
export const skillAssessments = pgTable("skill_assessments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  sessionId: integer("session_id").references(() => sessions.id),
  serve: integer("serve").notNull(),
  footwork: integer("footwork").notNull(),
  stamina: integer("stamina").notNull(),
  mentalFocus: integer("mental_focus").notNull(),
  overall: integer("overall").notNull(),
  notes: text("notes"),
  assessedBy: integer("assessed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});



// Attendance table
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => sessions.id).notNull(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  present: boolean("present").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Training plans table
export const trainingPlans = pgTable("training_plans", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id),
  batchId: integer("batch_id").references(() => batches.id),
  week: integer("week").notNull(),
  focusAreas: text("focus_areas").array(),
  drills: jsonb("drills"), // Array of drill objects
  notes: text("notes"),
  status: text("status").notNull().default("generated"), // "generated", "approved", "modified"
  generatedBy: text("generated_by").notNull().default("ai"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Progress summaries table
export const progressSummaries = pgTable("progress_summaries", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  week: integer("week").notNull(),
  summary: text("summary").notNull(),
  improvements: text("improvements").array(),
  concerns: text("concerns").array(),
  recommendations: text("recommendations").array(),
  generatedBy: text("generated_by").notNull().default("ai"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Drill recommendations table
export const drillRecommendations = pgTable("drill_recommendations", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  recommendations: jsonb("recommendations"), // Array of drill objects
  ageGroup: text("age_group"),
  skillLevel: text("skill_level"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  academyName: true,
});

export const insertBatchSchema = createInsertSchema(batches).pick({
  name: true,
  ageGroup: true,
  level: true,
  coachId: true,
});

export const insertStudentSchema = createInsertSchema(students).pick({
  name: true,
  age: true,
  email: true,
  phone: true,
  parentName: true,
  parentPhone: true,
  batchId: true,
  profileImageUrl: true,
});

export const insertSkillAssessmentSchema = createInsertSchema(skillAssessments).omit({
  id: true,
  createdAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  batchId: true,
  coachId: true,
  date: true,
  duration: true,
  court: true,
  notes: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).pick({
  sessionId: true,
  studentId: true,
  present: true,
  notes: true,
});

export const insertTrainingPlanSchema = createInsertSchema(trainingPlans).pick({
  studentId: true,
  batchId: true,
  week: true,
  focusAreas: true,
  drills: true,
  notes: true,
  status: true,
  createdBy: true,
});

export const insertProgressSummarySchema = createInsertSchema(progressSummaries).pick({
  studentId: true,
  week: true,
  summary: true,
  improvements: true,
  concerns: true,
  recommendations: true,
});

export const insertDrillRecommendationSchema = createInsertSchema(drillRecommendations).pick({
  query: true,
  recommendations: true,
  ageGroup: true,
  skillLevel: true,
  createdBy: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBatch = z.infer<typeof insertBatchSchema>;
export type Batch = typeof batches.$inferSelect;

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

export type InsertSkillAssessment = z.infer<typeof insertSkillAssessmentSchema>;
export type SkillAssessment = typeof skillAssessments.$inferSelect;

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;

export type InsertTrainingPlan = z.infer<typeof insertTrainingPlanSchema>;
export type TrainingPlan = typeof trainingPlans.$inferSelect;

export type InsertProgressSummary = z.infer<typeof insertProgressSummarySchema>;
export type ProgressSummary = typeof progressSummaries.$inferSelect;

export type InsertDrillRecommendation = z.infer<typeof insertDrillRecommendationSchema>;
export type DrillRecommendation = typeof drillRecommendations.$inferSelect;

// Extended types with relations
export type StudentWithBatch = Student & {
  batch?: Batch;
  latestSkillAssessment?: SkillAssessment;
};

export type SessionWithDetails = Session & {
  batch?: Batch;
  coach?: User;
  attendance?: (Attendance & { student: Student })[];
};

export type TrainingPlanWithDetails = TrainingPlan & {
  student?: Student;
  batch?: Batch;
  creator?: User;
};

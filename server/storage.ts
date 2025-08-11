import {
  users,
  batches,
  students,
  skillAssessments,
  sessions,
  attendance,
  trainingPlans,
  progressSummaries,
  drillRecommendations,
  type User,
  type InsertUser,
  type Batch,
  type InsertBatch,
  type Student,
  type InsertStudent,
  type StudentWithBatch,
  type SkillAssessment,
  type InsertSkillAssessment,
  type Session,
  type InsertSession,
  type SessionWithDetails,
  type Attendance,
  type InsertAttendance,
  type TrainingPlan,
  type InsertTrainingPlan,
  type TrainingPlanWithDetails,
  type ProgressSummary,
  type InsertProgressSummary,
  type DrillRecommendation,
  type InsertDrillRecommendation,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Batch operations
  getBatches(coachId?: number): Promise<Batch[]>;
  getBatch(id: number): Promise<Batch | undefined>;
  createBatch(batch: InsertBatch): Promise<Batch>;
  updateBatch(id: number, batch: Partial<InsertBatch>): Promise<Batch | undefined>;
  deleteBatch(id: number): Promise<boolean>;
  
  // Student operations
  getStudents(batchId?: number): Promise<StudentWithBatch[]>;
  getStudent(id: number): Promise<StudentWithBatch | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;
  getAtRiskStudents(): Promise<StudentWithBatch[]>;
  
  // Skill assessment operations
  getSkillAssessments(studentId: number): Promise<SkillAssessment[]>;
  getLatestSkillAssessment(studentId: number): Promise<SkillAssessment | undefined>;
  createSkillAssessment(assessment: InsertSkillAssessment): Promise<SkillAssessment>;
  
  // Session operations
  getSessions(batchId?: number, date?: Date): Promise<SessionWithDetails[]>;
  getSession(id: number): Promise<SessionWithDetails | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: number, session: Partial<InsertSession>): Promise<Session | undefined>;
  deleteSession(id: number): Promise<boolean>;
  
  // Attendance operations
  getAttendance(sessionId: number): Promise<(Attendance & { student: Student })[]>;
  markAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(sessionId: number, studentId: number, present: boolean): Promise<Attendance | undefined>;
  
  // Training plan operations
  getTrainingPlans(studentId?: number, batchId?: number): Promise<TrainingPlanWithDetails[]>;
  getTrainingPlan(id: number): Promise<TrainingPlanWithDetails | undefined>;
  createTrainingPlan(plan: InsertTrainingPlan): Promise<TrainingPlan>;
  updateTrainingPlan(id: number, plan: Partial<InsertTrainingPlan>): Promise<TrainingPlan | undefined>;
  deleteTrainingPlan(id: number): Promise<boolean>;
  
  // Progress summary operations
  getProgressSummaries(studentId: number): Promise<ProgressSummary[]>;
  createProgressSummary(summary: InsertProgressSummary): Promise<ProgressSummary>;
  
  // Drill recommendation operations
  getDrillRecommendations(limit?: number): Promise<DrillRecommendation[]>;
  createDrillRecommendation(recommendation: InsertDrillRecommendation): Promise<DrillRecommendation>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private batches: Map<number, Batch> = new Map();
  private students: Map<number, Student> = new Map();
  private skillAssessments: Map<number, SkillAssessment> = new Map();
  private sessions: Map<number, Session> = new Map();
  private attendance: Map<string, Attendance> = new Map(); // key: sessionId-studentId
  private trainingPlans: Map<number, TrainingPlan> = new Map();
  private progressSummaries: Map<number, ProgressSummary> = new Map();
  private drillRecommendations: Map<number, DrillRecommendation> = new Map();
  
  private currentUserId = 1;
  private currentBatchId = 1;
  private currentStudentId = 1;
  private currentSkillAssessmentId = 1;
  private currentSessionId = 1;
  private currentAttendanceId = 1;
  private currentTrainingPlanId = 1;
  private currentProgressSummaryId = 1;
  private currentDrillRecommendationId = 1;

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample users
    this.createUser({
      username: "coach@academy.com",
      password: "password123",
      role: "coach",
      academyName: "Elite Tennis Academy"
    });

    this.createUser({
      username: "admin@academy.com",
      password: "admin123",
      role: "admin",
      academyName: "Elite Tennis Academy"
    });

    // Create sample batches
    this.createBatch({
      name: "Junior Batch",
      ageGroup: "12-16",
      level: "intermediate",
      coachId: 1
    });

    this.createBatch({
      name: "Senior Batch",
      ageGroup: "16-18",
      level: "advanced",
      coachId: 1
    });

    this.createBatch({
      name: "Beginner Batch",
      ageGroup: "8-12",
      level: "beginner",
      coachId: 1
    });

    // Create sample students
    this.createStudent({
      name: "Aanya Sharma",
      age: 14,
      email: "aanya@email.com",
      phone: "+91-9876543210",
      parentName: "Raj Sharma",
      parentPhone: "+91-9876543211",
      batchId: 1,
      profileImageUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&crop=face"
    });

    this.createStudent({
      name: "Rahul Kumar",
      age: 16,
      email: "rahul@email.com",
      phone: "+91-9876543212",
      parentName: "Suresh Kumar",
      parentPhone: "+91-9876543213",
      batchId: 2,
      status: "at_risk",
      profileImageUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop&crop=face"
    });

    this.createStudent({
      name: "Priya Patel",
      age: 13,
      email: "priya@email.com",
      phone: "+91-9876543214",
      parentName: "Amit Patel",
      parentPhone: "+91-9876543215",
      batchId: 1,
      profileImageUrl: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=400&fit=crop&crop=face"
    });

    // Create skill assessments
    this.createSkillAssessment({
      studentId: 1,
      serve: 7,
      footwork: 8,
      stamina: 6,
      mentalFocus: 7,
      overall: 7,
      assessedBy: 1
    });

    this.createSkillAssessment({
      studentId: 2,
      serve: 5,
      footwork: 6,
      stamina: 4,
      mentalFocus: 5,
      overall: 5,
      assessedBy: 1
    });

    this.createSkillAssessment({
      studentId: 3,
      serve: 6,
      footwork: 7,
      stamina: 7,
      mentalFocus: 8,
      overall: 7,
      assessedBy: 1
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Batch operations
  async getBatches(coachId?: number): Promise<Batch[]> {
    let allBatches = Array.from(this.batches.values());
    if (coachId) {
      allBatches = allBatches.filter(batch => batch.coachId === coachId);
    }
    return allBatches;
  }

  async getBatch(id: number): Promise<Batch | undefined> {
    return this.batches.get(id);
  }

  async createBatch(insertBatch: InsertBatch): Promise<Batch> {
    const id = this.currentBatchId++;
    const batch: Batch = {
      ...insertBatch,
      id,
      createdAt: new Date()
    };
    this.batches.set(id, batch);
    return batch;
  }

  async updateBatch(id: number, updateData: Partial<InsertBatch>): Promise<Batch | undefined> {
    const batch = this.batches.get(id);
    if (!batch) return undefined;
    
    const updatedBatch = { ...batch, ...updateData };
    this.batches.set(id, updatedBatch);
    return updatedBatch;
  }

  async deleteBatch(id: number): Promise<boolean> {
    return this.batches.delete(id);
  }

  // Student operations
  async getStudents(batchId?: number): Promise<StudentWithBatch[]> {
    let allStudents = Array.from(this.students.values());
    if (batchId) {
      allStudents = allStudents.filter(student => student.batchId === batchId);
    }

    return Promise.all(allStudents.map(async student => {
      const batch = student.batchId ? await this.getBatch(student.batchId) : undefined;
      const latestSkillAssessment = await this.getLatestSkillAssessment(student.id);
      return {
        ...student,
        batch,
        latestSkillAssessment
      };
    }));
  }

  async getStudent(id: number): Promise<StudentWithBatch | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;

    const batch = student.batchId ? await this.getBatch(student.batchId) : undefined;
    const latestSkillAssessment = await this.getLatestSkillAssessment(student.id);
    
    return {
      ...student,
      batch,
      latestSkillAssessment
    };
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = this.currentStudentId++;
    const student: Student = {
      ...insertStudent,
      id,
      status: "active",
      joinDate: new Date(),
      createdAt: new Date()
    };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(id: number, updateData: Partial<InsertStudent>): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;
    
    const updatedStudent = { ...student, ...updateData };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  async deleteStudent(id: number): Promise<boolean> {
    return this.students.delete(id);
  }

  async getAtRiskStudents(): Promise<StudentWithBatch[]> {
    const allStudents = await this.getStudents();
    return allStudents.filter(student => student.status === "at_risk");
  }

  // Skill assessment operations
  async getSkillAssessments(studentId: number): Promise<SkillAssessment[]> {
    return Array.from(this.skillAssessments.values())
      .filter(assessment => assessment.studentId === studentId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getLatestSkillAssessment(studentId: number): Promise<SkillAssessment | undefined> {
    const assessments = await this.getSkillAssessments(studentId);
    return assessments[0];
  }

  async createSkillAssessment(insertAssessment: InsertSkillAssessment): Promise<SkillAssessment> {
    const id = this.currentSkillAssessmentId++;
    const assessment: SkillAssessment = {
      ...insertAssessment,
      id,
      createdAt: new Date()
    };
    this.skillAssessments.set(id, assessment);
    return assessment;
  }

  // Session operations
  async getSessions(batchId?: number, date?: Date): Promise<SessionWithDetails[]> {
    let allSessions = Array.from(this.sessions.values());
    
    if (batchId) {
      allSessions = allSessions.filter(session => session.batchId === batchId);
    }
    
    if (date) {
      const targetDate = date.toDateString();
      allSessions = allSessions.filter(session => 
        session.date?.toDateString() === targetDate
      );
    }

    return Promise.all(allSessions.map(async session => {
      const batch = await this.getBatch(session.batchId);
      const coach = session.coachId ? await this.getUser(session.coachId) : undefined;
      const attendance = await this.getAttendance(session.id);
      
      return {
        ...session,
        batch,
        coach,
        attendance
      };
    }));
  }

  async getSession(id: number): Promise<SessionWithDetails | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;

    const batch = await this.getBatch(session.batchId);
    const coach = session.coachId ? await this.getUser(session.coachId) : undefined;
    const attendance = await this.getAttendance(session.id);
    
    return {
      ...session,
      batch,
      coach,
      attendance
    };
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = this.currentSessionId++;
    const session: Session = {
      ...insertSession,
      id,
      status: "scheduled",
      createdAt: new Date()
    };
    this.sessions.set(id, session);
    return session;
  }

  async updateSession(id: number, updateData: Partial<InsertSession>): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updateData };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  async deleteSession(id: number): Promise<boolean> {
    return this.sessions.delete(id);
  }

  // Attendance operations
  async getAttendance(sessionId: number): Promise<(Attendance & { student: Student })[]> {
    const attendanceRecords = Array.from(this.attendance.values())
      .filter(record => record.sessionId === sessionId);

    return Promise.all(attendanceRecords.map(async record => {
      const student = await this.students.get(record.studentId);
      return {
        ...record,
        student: student!
      };
    }));
  }

  async markAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const key = `${insertAttendance.sessionId}-${insertAttendance.studentId}`;
    const id = this.currentAttendanceId++;
    const attendance: Attendance = {
      ...insertAttendance,
      id,
      createdAt: new Date()
    };
    this.attendance.set(key, attendance);
    return attendance;
  }

  async updateAttendance(sessionId: number, studentId: number, present: boolean): Promise<Attendance | undefined> {
    const key = `${sessionId}-${studentId}`;
    const existingAttendance = this.attendance.get(key);
    
    if (existingAttendance) {
      const updatedAttendance = { ...existingAttendance, present };
      this.attendance.set(key, updatedAttendance);
      return updatedAttendance;
    } else {
      return this.markAttendance({ sessionId, studentId, present });
    }
  }

  // Training plan operations
  async getTrainingPlans(studentId?: number, batchId?: number): Promise<TrainingPlanWithDetails[]> {
    let allPlans = Array.from(this.trainingPlans.values());
    
    if (studentId) {
      allPlans = allPlans.filter(plan => plan.studentId === studentId);
    }
    
    if (batchId) {
      allPlans = allPlans.filter(plan => plan.batchId === batchId);
    }

    return Promise.all(allPlans.map(async plan => {
      const student = plan.studentId ? await this.getStudent(plan.studentId) : undefined;
      const batch = plan.batchId ? await this.getBatch(plan.batchId) : undefined;
      const creator = plan.createdBy ? await this.getUser(plan.createdBy) : undefined;
      
      return {
        ...plan,
        student,
        batch,
        creator
      };
    }));
  }

  async getTrainingPlan(id: number): Promise<TrainingPlanWithDetails | undefined> {
    const plan = this.trainingPlans.get(id);
    if (!plan) return undefined;

    const student = plan.studentId ? await this.getStudent(plan.studentId) : undefined;
    const batch = plan.batchId ? await this.getBatch(plan.batchId) : undefined;
    const creator = plan.createdBy ? await this.getUser(plan.createdBy) : undefined;
    
    return {
      ...plan,
      student,
      batch,
      creator
    };
  }

  async createTrainingPlan(insertPlan: InsertTrainingPlan): Promise<TrainingPlan> {
    const id = this.currentTrainingPlanId++;
    const plan: TrainingPlan = {
      ...insertPlan,
      id,
      status: "generated",
      generatedBy: "ai",
      createdAt: new Date()
    };
    this.trainingPlans.set(id, plan);
    return plan;
  }

  async updateTrainingPlan(id: number, updateData: Partial<InsertTrainingPlan>): Promise<TrainingPlan | undefined> {
    const plan = this.trainingPlans.get(id);
    if (!plan) return undefined;
    
    const updatedPlan = { ...plan, ...updateData };
    this.trainingPlans.set(id, updatedPlan);
    return updatedPlan;
  }

  async deleteTrainingPlan(id: number): Promise<boolean> {
    return this.trainingPlans.delete(id);
  }

  // Progress summary operations
  async getProgressSummaries(studentId: number): Promise<ProgressSummary[]> {
    return Array.from(this.progressSummaries.values())
      .filter(summary => summary.studentId === studentId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createProgressSummary(insertSummary: InsertProgressSummary): Promise<ProgressSummary> {
    const id = this.currentProgressSummaryId++;
    const summary: ProgressSummary = {
      ...insertSummary,
      id,
      generatedBy: "ai",
      createdAt: new Date()
    };
    this.progressSummaries.set(id, summary);
    return summary;
  }

  // Drill recommendation operations
  async getDrillRecommendations(limit = 10): Promise<DrillRecommendation[]> {
    const recommendations = Array.from(this.drillRecommendations.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    
    return recommendations.slice(0, limit);
  }

  async createDrillRecommendation(insertRecommendation: InsertDrillRecommendation): Promise<DrillRecommendation> {
    const id = this.currentDrillRecommendationId++;
    const recommendation: DrillRecommendation = {
      ...insertRecommendation,
      id,
      createdAt: new Date()
    };
    this.drillRecommendations.set(id, recommendation);
    return recommendation;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getBatches(coachId?: number): Promise<Batch[]> {
    let query = db.select().from(batches);
    if (coachId) {
      query = query.where(eq(batches.coachId, coachId));
    }
    return await query;
  }

  async getBatch(id: number): Promise<Batch | undefined> {
    const [batch] = await db.select().from(batches).where(eq(batches.id, id));
    return batch || undefined;
  }

  async createBatch(insertBatch: InsertBatch): Promise<Batch> {
    const [batch] = await db
      .insert(batches)
      .values(insertBatch)
      .returning();
    return batch;
  }

  async updateBatch(id: number, updateData: Partial<InsertBatch>): Promise<Batch | undefined> {
    const [batch] = await db
      .update(batches)
      .set(updateData)
      .where(eq(batches.id, id))
      .returning();
    return batch || undefined;
  }

  async deleteBatch(id: number): Promise<boolean> {
    const result = await db.delete(batches).where(eq(batches.id, id));
    return result.rowCount > 0;
  }

  async getStudents(batchId?: number): Promise<StudentWithBatch[]> {
    let query = db
      .select({
        ...students,
        batch: batches
      })
      .from(students)
      .leftJoin(batches, eq(students.batchId, batches.id));
    
    if (batchId) {
      query = query.where(eq(students.batchId, batchId));
    }
    
    const results = await query;
    return results.map(row => ({ ...row, batch: row.batch || undefined }));
  }

  async getStudent(id: number): Promise<StudentWithBatch | undefined> {
    const [result] = await db
      .select({
        ...students,
        batch: batches
      })
      .from(students)
      .leftJoin(batches, eq(students.batchId, batches.id))
      .where(eq(students.id, id));
    
    if (!result) return undefined;
    return { ...result, batch: result.batch || undefined };
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db
      .insert(students)
      .values(insertStudent)
      .returning();
    return student;
  }

  async updateStudent(id: number, updateData: Partial<InsertStudent>): Promise<Student | undefined> {
    const [student] = await db
      .update(students)
      .set(updateData)
      .where(eq(students.id, id))
      .returning();
    return student || undefined;
  }

  async deleteStudent(id: number): Promise<boolean> {
    const result = await db.delete(students).where(eq(students.id, id));
    return result.rowCount > 0;
  }

  async getAtRiskStudents(): Promise<StudentWithBatch[]> {
    const results = await db
      .select({
        ...students,
        batch: batches
      })
      .from(students)
      .leftJoin(batches, eq(students.batchId, batches.id))
      .where(eq(students.status, "at_risk"));
    
    return results.map(row => ({ ...row, batch: row.batch || undefined }));
  }

  async getSkillAssessments(studentId: number): Promise<SkillAssessment[]> {
    return await db
      .select()
      .from(skillAssessments)
      .where(eq(skillAssessments.studentId, studentId));
  }

  async getLatestSkillAssessment(studentId: number): Promise<SkillAssessment | undefined> {
    const [assessment] = await db
      .select()
      .from(skillAssessments)
      .where(eq(skillAssessments.studentId, studentId))
      .orderBy(skillAssessments.createdAt)
      .limit(1);
    return assessment || undefined;
  }

  async createSkillAssessment(insertAssessment: InsertSkillAssessment): Promise<SkillAssessment> {
    const [assessment] = await db
      .insert(skillAssessments)
      .values(insertAssessment)
      .returning();
    return assessment;
  }

  async getSessions(batchId?: number, date?: Date): Promise<SessionWithDetails[]> {
    let query = db
      .select({
        ...sessions,
        batch: batches,
        coach: users
      })
      .from(sessions)
      .leftJoin(batches, eq(sessions.batchId, batches.id))
      .leftJoin(users, eq(sessions.coachId, users.id));
    
    if (batchId) {
      query = query.where(eq(sessions.batchId, batchId));
    }
    
    const results = await query;
    return results.map(row => ({
      ...row,
      batch: row.batch || undefined,
      coach: row.coach || undefined
    }));
  }

  async getSession(id: number): Promise<SessionWithDetails | undefined> {
    const [result] = await db
      .select({
        ...sessions,
        batch: batches,
        coach: users
      })
      .from(sessions)
      .leftJoin(batches, eq(sessions.batchId, batches.id))
      .leftJoin(users, eq(sessions.coachId, users.id))
      .where(eq(sessions.id, id));
    
    if (!result) return undefined;
    return {
      ...result,
      batch: result.batch || undefined,
      coach: result.coach || undefined
    };
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db
      .insert(sessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async updateSession(id: number, updateData: Partial<InsertSession>): Promise<Session | undefined> {
    const [session] = await db
      .update(sessions)
      .set(updateData)
      .where(eq(sessions.id, id))
      .returning();
    return session || undefined;
  }

  async deleteSession(id: number): Promise<boolean> {
    const result = await db.delete(sessions).where(eq(sessions.id, id));
    return result.rowCount > 0;
  }

  async getAttendance(sessionId: number): Promise<(Attendance & { student: Student })[]> {
    const results = await db
      .select({
        ...attendance,
        student: students
      })
      .from(attendance)
      .innerJoin(students, eq(attendance.studentId, students.id))
      .where(eq(attendance.sessionId, sessionId));
    
    return results;
  }

  async markAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const [attendanceRecord] = await db
      .insert(attendance)
      .values(insertAttendance)
      .returning();
    return attendanceRecord;
  }

  async updateAttendance(sessionId: number, studentId: number, present: boolean): Promise<Attendance | undefined> {
    const [attendanceRecord] = await db
      .update(attendance)
      .set({ present })
      .where(eq(attendance.sessionId, sessionId))
      .returning();
    return attendanceRecord || undefined;
  }

  async getTrainingPlans(studentId?: number, batchId?: number): Promise<TrainingPlanWithDetails[]> {
    let query = db
      .select({
        ...trainingPlans,
        student: students,
        batch: batches,
        creator: users
      })
      .from(trainingPlans)
      .leftJoin(students, eq(trainingPlans.studentId, students.id))
      .leftJoin(batches, eq(trainingPlans.batchId, batches.id))
      .leftJoin(users, eq(trainingPlans.createdBy, users.id));
    
    if (studentId) {
      query = query.where(eq(trainingPlans.studentId, studentId));
    } else if (batchId) {
      query = query.where(eq(trainingPlans.batchId, batchId));
    }
    
    const results = await query;
    return results.map(row => ({
      ...row,
      student: row.student || undefined,
      batch: row.batch || undefined,
      creator: row.creator || undefined
    }));
  }

  async getTrainingPlan(id: number): Promise<TrainingPlanWithDetails | undefined> {
    const [result] = await db
      .select({
        ...trainingPlans,
        student: students,
        batch: batches,
        creator: users
      })
      .from(trainingPlans)
      .leftJoin(students, eq(trainingPlans.studentId, students.id))
      .leftJoin(batches, eq(trainingPlans.batchId, batches.id))
      .leftJoin(users, eq(trainingPlans.createdBy, users.id))
      .where(eq(trainingPlans.id, id));
    
    if (!result) return undefined;
    return {
      ...result,
      student: result.student || undefined,
      batch: result.batch || undefined,
      creator: result.creator || undefined
    };
  }

  async createTrainingPlan(insertPlan: InsertTrainingPlan): Promise<TrainingPlan> {
    const [plan] = await db
      .insert(trainingPlans)
      .values(insertPlan)
      .returning();
    return plan;
  }

  async updateTrainingPlan(id: number, updateData: Partial<InsertTrainingPlan>): Promise<TrainingPlan | undefined> {
    const [plan] = await db
      .update(trainingPlans)
      .set(updateData)
      .where(eq(trainingPlans.id, id))
      .returning();
    return plan || undefined;
  }

  async deleteTrainingPlan(id: number): Promise<boolean> {
    const result = await db.delete(trainingPlans).where(eq(trainingPlans.id, id));
    return result.rowCount > 0;
  }

  async getProgressSummaries(studentId: number): Promise<ProgressSummary[]> {
    return await db
      .select()
      .from(progressSummaries)
      .where(eq(progressSummaries.studentId, studentId));
  }

  async createProgressSummary(insertSummary: InsertProgressSummary): Promise<ProgressSummary> {
    const [summary] = await db
      .insert(progressSummaries)
      .values(insertSummary)
      .returning();
    return summary;
  }

  async getDrillRecommendations(limit = 10): Promise<DrillRecommendation[]> {
    return await db
      .select()
      .from(drillRecommendations)
      .limit(limit);
  }

  async createDrillRecommendation(insertRecommendation: InsertDrillRecommendation): Promise<DrillRecommendation> {
    const [recommendation] = await db
      .insert(drillRecommendations)
      .values(insertRecommendation)
      .returning();
    return recommendation;
  }
}

// Note: Database infrastructure is ready with sample data in PostgreSQL
// Currently using memory storage for immediate functionality
// To use database: uncomment DatabaseStorage and fix TypeScript issues
export const storage = new MemStorage();

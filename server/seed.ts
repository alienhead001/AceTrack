import { db } from "./db";
import {
  users,
  batches,
  students,
  sessions,
  skillAssessments,
  attendance,
  trainingPlans,
  progressSummaries,
  drillRecommendations,
} from "@shared/schema";

async function seedDatabase() {
  console.log("Starting database seeding...");

  try {
    // Clear existing data
    await db.delete(drillRecommendations);
    await db.delete(progressSummaries);
    await db.delete(trainingPlans);
    await db.delete(attendance);
    await db.delete(skillAssessments);
    await db.delete(sessions);
    await db.delete(students);
    await db.delete(batches);
    await db.delete(users);

    // Seed users (coaches and admin)
    const userData = [
      {
        username: "coach@academy.com",
        password: "password123",
        role: "coach",
        academyName: "Elite Tennis Academy",
      },
      {
        username: "admin@academy.com",
        password: "admin123",
        role: "admin",
        academyName: "Elite Tennis Academy",
      },
      {
        username: "coach.sarah@academy.com",
        password: "password123",
        role: "coach",
        academyName: "Elite Tennis Academy",
      },
    ];

    const insertedUsers = await db.insert(users).values(userData).returning();
    console.log(`✓ Created ${insertedUsers.length} users`);

    // Seed batches
    const batchData = [
      {
        name: "Junior Beginners",
        ageGroup: "8-12",
        level: "beginner",
        coachId: insertedUsers[0].id,
      },
      {
        name: "Teen Intermediate",
        ageGroup: "13-17",
        level: "intermediate",
        coachId: insertedUsers[0].id,
      },
      {
        name: "Adult Advanced",
        ageGroup: "18+",
        level: "advanced",
        coachId: insertedUsers[2].id,
      },
      {
        name: "Kids Starter",
        ageGroup: "6-10",
        level: "beginner",
        coachId: insertedUsers[2].id,
      },
    ];

    const insertedBatches = await db.insert(batches).values(batchData).returning();
    console.log(`✓ Created ${insertedBatches.length} batches`);

    // Seed students
    const studentData = [
      {
        name: "Emma Johnson",
        age: 10,
        email: "emma.parent@email.com",
        phone: "+1-555-0101",
        parentName: "Sarah Johnson",
        parentPhone: "+1-555-0102",
        status: "active",
        batchId: insertedBatches[0].id,
        profileImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
        joinDate: new Date("2024-09-01"),
      },
      {
        name: "Lucas Martinez",
        age: 15,
        email: "lucas.martinez@email.com",
        phone: "+1-555-0201",
        parentName: "Maria Martinez",
        parentPhone: "+1-555-0202",
        status: "active",
        batchId: insertedBatches[1].id,
        profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        joinDate: new Date("2024-08-15"),
      },
      {
        name: "Sophia Chen",
        age: 12,
        email: "sophia.parent@email.com",
        phone: "+1-555-0301",
        parentName: "David Chen",
        parentPhone: "+1-555-0302",
        status: "active",
        batchId: insertedBatches[0].id,
        profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b1e2?w=100&h=100&fit=crop&crop=face",
        joinDate: new Date("2024-10-01"),
      },
      {
        name: "Alex Thompson",
        age: 16,
        email: "alex.thompson@email.com",
        phone: "+1-555-0401",
        parentName: "Jennifer Thompson",
        parentPhone: "+1-555-0402",
        status: "at_risk",
        batchId: insertedBatches[1].id,
        profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
        joinDate: new Date("2024-07-20"),
      },
      {
        name: "Maya Patel",
        age: 24,
        email: "maya.patel@email.com",
        phone: "+1-555-0501",
        parentName: null,
        parentPhone: null,
        status: "active",
        batchId: insertedBatches[2].id,
        profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
        joinDate: new Date("2024-06-10"),
      },
      {
        name: "Ryan O'Connor",
        age: 8,
        email: "ryan.parent@email.com",
        phone: "+1-555-0601",
        parentName: "Michael O'Connor",
        parentPhone: "+1-555-0602",
        status: "active",
        batchId: insertedBatches[3].id,
        profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        joinDate: new Date("2024-11-01"),
      },
    ];

    const insertedStudents = await db.insert(students).values(studentData).returning();
    console.log(`✓ Created ${insertedStudents.length} students`);

    // Seed sessions
    const now = new Date();
    const sessionData = [
      {
        date: new Date(now.getTime() - 86400000), // Yesterday
        coachId: insertedUsers[0].id,
        batchId: insertedBatches[0].id,
        duration: 90,
        court: "Court 1",
        notes: "Focused on basic forehand technique and footwork",
        status: "completed",
      },
      {
        date: new Date(), // Today
        coachId: insertedUsers[0].id,
        batchId: insertedBatches[1].id,
        duration: 120,
        court: "Court 2",
        notes: "Advanced serve practice and match play",
        status: "scheduled",
      },
      {
        date: new Date(now.getTime() + 86400000), // Tomorrow
        coachId: insertedUsers[2].id,
        batchId: insertedBatches[2].id,
        duration: 120,
        court: "Court 3",
        notes: "Tournament preparation - high intensity drills",
        status: "scheduled",
      },
    ];

    const insertedSessions = await db.insert(sessions).values(sessionData).returning();
    console.log(`✓ Created ${insertedSessions.length} sessions`);

    // Seed skill assessments
    const skillAssessmentData = [
      {
        studentId: insertedStudents[0].id,
        sessionId: insertedSessions[0].id,
        serve: 6,
        footwork: 7,
        stamina: 8,
        mentalFocus: 7,
        overall: 7,
        notes: "Good improvement in serve consistency",
        assessedBy: insertedUsers[0].id,
      },
      {
        studentId: insertedStudents[1].id,
        sessionId: insertedSessions[0].id,
        serve: 8,
        footwork: 8,
        stamina: 9,
        mentalFocus: 8,
        overall: 8,
        notes: "Strong player, ready for tournament play",
        assessedBy: insertedUsers[0].id,
      },
      {
        studentId: insertedStudents[2].id,
        sessionId: insertedSessions[0].id,
        serve: 5,
        footwork: 6,
        stamina: 7,
        mentalFocus: 6,
        overall: 6,
        notes: "Needs more practice on serve technique",
        assessedBy: insertedUsers[0].id,
      },
    ];

    const insertedAssessments = await db.insert(skillAssessments).values(skillAssessmentData).returning();
    console.log(`✓ Created ${insertedAssessments.length} skill assessments`);

    // Seed attendance
    const attendanceData = [
      {
        sessionId: insertedSessions[0].id,
        studentId: insertedStudents[0].id,
        present: true,
        notes: "Excellent participation",
      },
      {
        sessionId: insertedSessions[0].id,
        studentId: insertedStudents[1].id,
        present: true,
        notes: "Great focus during practice",
      },
      {
        sessionId: insertedSessions[0].id,
        studentId: insertedStudents[2].id,
        present: true,
        notes: "Improved technique",
      },
      {
        sessionId: insertedSessions[1].id,
        studentId: insertedStudents[3].id,
        present: false,
        notes: "Missed due to family vacation",
      },
    ];

    const insertedAttendance = await db.insert(attendance).values(attendanceData).returning();
    console.log(`✓ Created ${insertedAttendance.length} attendance records`);

    // Seed training plans
    const trainingPlanData = [
      {
        studentId: insertedStudents[0].id,
        batchId: insertedBatches[0].id,
        week: 1,
        focusAreas: ["forehand", "footwork", "serve"],
        drills: {
          week: 1,
          focusAreas: ["forehand", "footwork", "serve"],
          days: [
            {
              day: "Monday",
              drills: [
                {
                  name: "Forehand Rally",
                  description: "Practice consistent forehand shots from the baseline",
                  duration: "20 minutes",
                  difficulty: "beginner",
                  equipment: ["racket", "balls"],
                  steps: ["Warm up with gentle rallying", "Focus on form", "Increase pace gradually"]
                }
              ]
            }
          ]
        },
        notes: "Focus on building consistency before power",
        status: "active",
        generatedBy: "AI Assistant",
        createdBy: insertedUsers[0].id,
      },
      {
        studentId: insertedStudents[1].id,
        batchId: insertedBatches[1].id,
        week: 2,
        focusAreas: ["serve", "volley", "match_play"],
        drills: {
          week: 2,
          focusAreas: ["serve", "volley", "match_play"],
          days: [
            {
              day: "Tuesday",
              drills: [
                {
                  name: "Serve Practice",
                  description: "Work on first and second serve consistency",
                  duration: "30 minutes",
                  difficulty: "intermediate",
                  equipment: ["racket", "balls", "targets"],
                  steps: ["Practice service motion", "Hit to targets", "Work on spin variation"]
                }
              ]
            }
          ]
        },
        notes: "Preparing for upcoming junior tournament",
        status: "active",
        generatedBy: "AI Assistant",
        createdBy: insertedUsers[0].id,
      },
    ];

    const insertedPlans = await db.insert(trainingPlans).values(trainingPlanData).returning();
    console.log(`✓ Created ${insertedPlans.length} training plans`);

    // Seed progress summaries
    const progressData = [
      {
        studentId: insertedStudents[0].id,
        week: 1,
        summary: "Emma has shown excellent improvement in forehand consistency and court movement",
        improvements: ["forehand technique", "court positioning", "ball tracking"],
        concerns: ["serve power needs work"],
        recommendations: ["focus on serve practice", "continue footwork drills"],
        generatedBy: "AI Assistant",
      },
      {
        studentId: insertedStudents[1].id,
        week: 2,
        summary: "Lucas demonstrates strong competitive spirit and technical skills",
        improvements: ["serve accuracy", "net play", "tactical awareness"],
        concerns: ["mental pressure in matches"],
        recommendations: ["practice pressure situations", "work on breathing techniques"],
        generatedBy: "AI Assistant",
      },
    ];

    const insertedProgress = await db.insert(progressSummaries).values(progressData).returning();
    console.log(`✓ Created ${insertedProgress.length} progress summaries`);

    // Seed drill recommendations
    const drillData = [
      {
        query: "forehand practice",
        ageGroup: "8-12",
        skillLevel: "beginner",
        recommendations: {
          drills: [
            {
              name: "Wall Rally",
              description: "Hit forehand shots against a wall for consistency",
              duration: "15 minutes",
              difficulty: "beginner",
              equipment: ["racket", "tennis ball", "wall"],
              steps: ["Stand 6 feet from wall", "Hit gentle forehands", "Focus on form over power"]
            }
          ]
        },
        createdBy: insertedUsers[0].id,
      },
      {
        query: "serve improvement",
        ageGroup: "13-17",
        skillLevel: "intermediate",
        recommendations: {
          drills: [
            {
              name: "Target Serve",
              description: "Practice serving to specific court areas",
              duration: "25 minutes",
              difficulty: "intermediate",
              equipment: ["racket", "tennis balls", "court targets"],
              steps: ["Set up targets in service boxes", "Practice hitting targets", "Track success rate"]
            }
          ]
        },
        createdBy: insertedUsers[0].id,
      },
    ];

    const insertedDrills = await db.insert(drillRecommendations).values(drillData).returning();
    console.log(`✓ Created ${insertedDrills.length} drill recommendations`);

    console.log("🎾 Database seeding completed successfully!");
    console.log(`
Sample login credentials:
- Coach: coach@academy.com / password123
- Admin: admin@academy.com / admin123
- Coach Sarah: coach.sarah@academy.com / password123
    `);

  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedDatabase };
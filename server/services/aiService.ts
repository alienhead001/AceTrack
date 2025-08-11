import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "default_key"
});

export interface Drill {
  name: string;
  description: string;
  duration: string;
  difficulty: string;
  equipment: string[];
  steps: string[];
}

export interface TrainingPlanWeek {
  week: number;
  focusAreas: string[];
  days: {
    day: string;
    drills: Drill[];
    notes?: string;
  }[];
  progressGoals: string[];
}

export interface ProgressInsight {
  summary: string;
  improvements: string[];
  concerns: string[];
  recommendations: string[];
  nextWeekFocus: string[];
}

export interface RetentionPlan {
  riskFactors: string[];
  interventions: string[];
  timeline: string;
  successMetrics: string[];
}

export class AIService {
  async generateTrainingPlan(
    studentName: string,
    age: number,
    skillLevel: string,
    currentSkills: {
      serve: number;
      footwork: number;
      stamina: number;
      mentalFocus: number;
    },
    focusAreas?: string[]
  ): Promise<TrainingPlanWeek> {
    try {
      const prompt = `Generate a comprehensive weekly training plan for a tennis student with the following details:

Student: ${studentName}
Age: ${age}
Current Skill Level: ${skillLevel}
Current Skills (1-10 scale):
- Serve: ${currentSkills.serve}
- Footwork: ${currentSkills.footwork}
- Stamina: ${currentSkills.stamina}
- Mental Focus: ${currentSkills.mentalFocus}

${focusAreas ? `Priority Focus Areas: ${focusAreas.join(', ')}` : ''}

Create a detailed training plan that includes:
1. Main focus areas for improvement
2. Daily drill recommendations (4-5 days)
3. Specific drills with steps, duration, and equipment needed
4. Progress goals for the week

Format the response as JSON with this structure:
{
  "week": 1,
  "focusAreas": ["area1", "area2"],
  "days": [
    {
      "day": "Day 1-2",
      "drills": [
        {
          "name": "Drill Name",
          "description": "Brief description",
          "duration": "15-20 mins",
          "difficulty": "beginner/intermediate/advanced",
          "equipment": ["racket", "balls"],
          "steps": ["step1", "step2", "step3"]
        }
      ],
      "notes": "Additional coaching notes"
    }
  ],
  "progressGoals": ["goal1", "goal2"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert tennis coach AI with 20+ years of experience in tennis training and player development. Generate practical, age-appropriate training plans that focus on skill progression and player safety."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result as TrainingPlanWeek;
    } catch (error) {
      console.error("Error generating training plan:", error);
      // throw new Error("Failed to generate training plan");
      console.log("OpenAI failed, using fallback training plan");

      const fallbackDrills = this.getFallbackDrills("serve, footwork", "", skillLevel);
      const fallbackPlan: TrainingPlanWeek = {
        week: 1,
        focusAreas: ["Serve", "Footwork", "Fallback AI Plan"],
        days: [
          {
            day: "Day 1-2",
            drills: fallbackDrills,
            notes: "Generated using fallback due to AI error or quota limit."
          }
        ],
        progressGoals: [
          "Improve consistency using serve drills",
          "Build foundational movement with footwork patterns",
          "Maintain engagement despite AI unavailability"
        ]
      };

      return fallbackPlan;
    }
  }

  async generateProgressSummary(
    studentName: string,
    previousSkills: {
      serve: number;
      footwork: number;
      stamina: number;
      mentalFocus: number;
    },
    currentSkills: {
      serve: number;
      footwork: number;
      stamina: number;
      mentalFocus: number;
    },
    sessionNotes: string[],
    attendanceRate: number
  ): Promise<ProgressInsight> {
    try {
      const prompt = `Analyze the weekly progress for tennis student ${studentName} and provide insights:

Previous Week Skills (1-10 scale):
- Serve: ${previousSkills.serve}
- Footwork: ${previousSkills.footwork}
- Stamina: ${previousSkills.stamina}
- Mental Focus: ${previousSkills.mentalFocus}

Current Week Skills (1-10 scale):
- Serve: ${currentSkills.serve}
- Footwork: ${currentSkills.footwork}
- Stamina: ${currentSkills.stamina}
- Mental Focus: ${currentSkills.mentalFocus}

Session Notes: ${sessionNotes.join('. ')}
Attendance Rate: ${attendanceRate}%

Provide a comprehensive progress analysis in JSON format:
{
  "summary": "Overall progress summary in 2-3 sentences",
  "improvements": ["specific improvement 1", "specific improvement 2"],
  "concerns": ["concern 1", "concern 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "nextWeekFocus": ["focus area 1", "focus area 2"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert tennis coach AI that provides detailed progress analysis for tennis students. Focus on specific, actionable insights and recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result as ProgressInsight;
    } catch (error) {
      console.error("Error generating progress summary:", error);
      throw new Error("Failed to generate progress summary");
    }
  }

  async recommendDrills(
    query: string,
    ageGroup?: string,
    skillLevel?: string
  ): Promise<Drill[]> {
    // For now, use fallback drills directly since API quota is exceeded
    // This ensures the demo works reliably while API issues are resolved
    console.log("Using intelligent fallback drill system for query:", query);
    //return this.getFallbackDrills(query, ageGroup, skillLevel);
    

    // Original OpenAI integration - will be restored when API quota is available
    try {
      const prompt = `Provide tennis drill recommendations for the following request:

Query: "${query}"
${ageGroup ? `Age Group: ${ageGroup}` : ''}
${skillLevel ? `Skill Level: ${skillLevel}` : ''}

Generate 3-5 specific tennis drills that address this request. Format as JSON:
{
  "drills": [
    {
      "name": "Drill Name",
      "description": "Clear description of what the drill accomplishes",
      "duration": "5-10 mins",
      "difficulty": "beginner/intermediate/advanced",
      "equipment": ["equipment1", "equipment2"],
      "steps": ["step1", "step2", "step3", "step4"]
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert tennis coach AI. Provide practical, safe, and effective tennis drills that are appropriate for the specified age group and skill level. Focus on clear, step-by-step instructions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      console.log("OpenAI raw response:", response);
      console.log("OpenAI message content:", response.choices[0]?.message?.content);
      return result.drills || [];
    } catch (error: any) {
      console.error("Error recommending drills:", error);
      
      // If API quota exceeded or other OpenAI error, return fallback drills
      if (error?.status === 429 || error?.code === 'insufficient_quota' || error?.type === 'insufficient_quota') {
        console.log("OpenAI quota exceeded, using fallback drill recommendations");
        return this.getFallbackDrills(query, ageGroup, skillLevel);
      }
      
      // For any other OpenAI error, also use fallback
      if (error?.message?.includes('OpenAI') || error?.message?.includes('quota') || error?.message?.includes('rate limit')) {
        console.log("OpenAI API issue detected, using fallback drill recommendations");
        return this.getFallbackDrills(query, ageGroup, skillLevel);
      }
      
      throw new Error("Failed to recommend drills");
    }
  }

  private getFallbackDrills(query: string, ageGroup?: string, skillLevel?: string): Drill[] {
    // Smart fallback system based on query keywords
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('serve') || queryLower.includes('serving')) {
      return [
        {
          name: "Target Practice Serves",
          description: "Improve serve accuracy by aiming at specific targets",
          duration: "15-20 mins",
          difficulty: skillLevel || "intermediate",
          equipment: ["tennis balls", "cones or targets"],
          steps: [
            "Place targets in service boxes",
            "Start with slow, controlled serves",
            "Focus on consistent contact point",
            "Gradually increase power while maintaining accuracy",
            "Practice both first and second serves"
          ]
        },
        {
          name: "Shadow Serving",
          description: "Practice serve motion without a ball to perfect technique",
          duration: "10-15 mins",
          difficulty: "beginner",
          equipment: ["tennis racket"],
          steps: [
            "Stand in serving position",
            "Practice the complete serving motion slowly",
            "Focus on smooth weight transfer",
            "Repeat the motion 20-30 times",
            "Gradually increase speed of motion"
          ]
        }
      ];
    }
    
    if (queryLower.includes('footwork') || queryLower.includes('movement')) {
      return [
        {
          name: "Ladder Drills",
          description: "Improve foot speed and coordination",
          duration: "10-15 mins",
          difficulty: skillLevel || "intermediate",
          equipment: ["agility ladder or cones"],
          steps: [
            "Set up ladder or cones in a line",
            "Practice quick feet through the ladder",
            "Use different patterns: in-in-out-out",
            "Focus on staying on balls of feet",
            "Rest 30 seconds between sets"
          ]
        },
        {
          name: "Split Step Practice",
          description: "Master the fundamental ready position",
          duration: "8-12 mins",
          difficulty: "beginner",
          equipment: ["tennis court"],
          steps: [
            "Start in ready position at baseline",
            "Practice small jump as opponent hits",
            "Land on balls of feet, knees bent",
            "Immediately move in desired direction",
            "Repeat 15-20 times"
          ]
        }
      ];
    }
    
    if (queryLower.includes('forehand') || queryLower.includes('groundstroke')) {
      return [
        {
          name: "Wall Rally Practice",
          description: "Develop consistent forehand technique",
          duration: "15-20 mins",
          difficulty: skillLevel || "intermediate",
          equipment: ["tennis ball", "wall or backboard"],
          steps: [
            "Stand 6-8 feet from wall",
            "Hit gentle forehand shots against wall",
            "Focus on smooth swing path",
            "Maintain consistent contact point",
            "Count consecutive hits"
          ]
        },
        {
          name: "Forehand Cross-Court",
          description: "Practice forehand accuracy and placement",
          duration: "12-18 mins",
          difficulty: "intermediate",
          equipment: ["tennis balls", "cones"],
          steps: [
            "Set up targets in cross-court areas",
            "Hit forehands from baseline",
            "Focus on topspin and depth",
            "Aim for consistency over power",
            "Track successful target hits"
          ]
        }
      ];
    }
    
    // Default general drills
    return [
      {
        name: "Mini Tennis",
        description: "Improve hand-eye coordination and control",
        duration: "10-15 mins",
        difficulty: "beginner",
        equipment: ["tennis balls", "short court or service boxes"],
        steps: [
          "Play within service boxes only",
          "Use gentle, controlled shots",
          "Focus on consistent ball contact",
          "Rally back and forth",
          "Gradually increase pace"
        ]
      },
      {
        name: "Cone Weaving",
        description: "Enhance agility and court movement",
        duration: "8-12 mins",
        difficulty: "intermediate",
        equipment: ["cones", "tennis court"],
        steps: [
          "Set up cones in zigzag pattern",
          "Weave through cones at varying speeds",
          "Stay low and balanced",
          "Use proper tennis movement patterns",
          "Time yourself for improvement"
        ]
      },
      {
        name: "Ball Bounce Control",
        description: "Develop racket control and touch",
        duration: "5-10 mins",
        difficulty: "beginner",
        equipment: ["tennis ball", "tennis racket"],
        steps: [
          "Bounce ball on racket strings",
          "Keep ball low and controlled",
          "Alternate between forehand and backhand sides",
          "Try to reach 50 consecutive bounces",
          "Progress to walking while bouncing"
        ]
      }
    ];
  }

  async analyzeDropoutRisk(
    studentName: string,
    attendanceRate: number,
    skillProgression: number[], // array of overall skill scores over time
    missedSessions: number,
    lastSessionNotes: string[]
  ): Promise<RetentionPlan> {
    try {
      const prompt = `Analyze dropout risk for tennis student ${studentName} and create a retention plan:

Student Details:
- Attendance Rate: ${attendanceRate}%
- Skill Progression: ${skillProgression.join(' → ')} (recent scores)
- Consecutive Missed Sessions: ${missedSessions}
- Recent Session Notes: ${lastSessionNotes.join('. ')}

Analyze the risk factors and create an action plan in JSON format:
{
  "riskFactors": ["factor1", "factor2"],
  "interventions": ["intervention1", "intervention2"],
  "timeline": "2-4 weeks",
  "successMetrics": ["metric1", "metric2"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert tennis coach AI specializing in student retention and motivation. Provide practical, empathetic interventions that address both technical and motivational aspects of tennis training."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result as RetentionPlan;
    } catch (error) {
      console.error("Error analyzing dropout risk:", error);
      throw new Error("Failed to analyze dropout risk");
    }
  }
}

export const aiService = new AIService();

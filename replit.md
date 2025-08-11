# Tennis Academy AI Coach Assistant

## Overview

The Tennis Academy AI Coach Assistant is a mobile-first web application built with React and Node.js that serves as an AI-powered coaching tool for tennis academies. The application enables coaches and academy administrators to manage students, track training sessions, generate AI-powered training plans, and monitor student progress using ChatGPT integration.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: Radix UI with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database serverless
- **Authentication**: Simple session-based authentication
- **AI Integration**: OpenAI GPT-4 API for intelligent features

### Mobile-First Design
- Progressive Web App (PWA) optimized for mobile devices
- Bottom navigation for mobile-friendly UX
- Floating action button for AI assistant access
- Touch-optimized interface with appropriate spacing
- Dark mode support with system preference detection

## Key Components

### User Management
- **Role-based Access**: Coach and Academy Admin roles
- **Authentication**: Session-based login system
- **User Context**: Shared user state across the application

### Student & Batch Management
- **Student Profiles**: Complete student information with photos
- **Batch Organization**: Group students by age, skill level, and coach
- **Student Status Tracking**: Active, inactive, and at-risk classifications

### AI-Powered Features
- **Training Plan Generation**: Weekly training plans based on student skills
- **Progress Analysis**: AI-generated performance summaries
- **Drill Recommendations**: Natural language drill suggestions
- **Dropout Risk Prediction**: AI analysis of attendance and performance patterns

### Session Management
- **Attendance Tracking**: Mark student attendance for sessions
- **Skill Assessment**: Manual scoring system (1-10 scale) for various skills
- **Session Planning**: Schedule and organize training sessions by batch

### Dashboard & Reports
- **Performance Metrics**: Overview of academy statistics
- **Progress Tracking**: Visual representation of student improvements
- **At-Risk Alerts**: Early warning system for potential dropouts

## Data Flow

1. **Authentication Flow**: Users log in through credential validation, establishing session state
2. **Student Data Flow**: CRUD operations for student management with real-time updates
3. **AI Integration Flow**: User inputs → API requests → OpenAI processing → structured responses
4. **Session Flow**: Session creation → attendance tracking → skill scoring → progress analysis
5. **Real-time Updates**: TanStack Query handles cache invalidation and optimistic updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe SQL ORM with PostgreSQL support
- **openai**: Official OpenAI API client for GPT integration
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Headless UI component primitives

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds
- **drizzle-kit**: Database migration and schema management
- **vite**: Build tool with HMR and development server

### UI & Styling
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library for consistent iconography

## Deployment Strategy

### Development Environment
- **Local Development**: `npm run dev` starts both Vite dev server and Express backend
- **Hot Module Replacement**: Vite HMR for instant frontend updates
- **Database**: Drizzle migrations with `npm run db:push`

### Production Build
- **Frontend Build**: Vite builds optimized static assets to `dist/public`
- **Backend Build**: esbuild bundles Express server to `dist/index.js`
- **Single Deployment**: Combined frontend and backend deployment
- **Environment Variables**: Database URL and OpenAI API key configuration

### Database Management
- **Schema Definition**: Centralized in `shared/schema.ts`
- **Migrations**: Drizzle Kit handles schema changes
- **Connection**: Serverless PostgreSQL through Neon Database

## Changelog

- July 03, 2025: Initial tennis academy app setup
- July 03, 2025: Added PostgreSQL database support with Drizzle ORM
- July 03, 2025: Fixed AI assistant drill recommendations with intelligent fallback system
- July 03, 2025: Database schema pushed successfully to PostgreSQL
- July 03, 2025: Added comprehensive sample data to PostgreSQL database
- July 03, 2025: Database seeding completed with realistic tennis academy data

## User Preferences

Preferred communication style: Simple, everyday language.
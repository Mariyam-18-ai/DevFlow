# DevFlow — Developer Productivity Platform

DevFlow is a full-stack developer productivity platform designed to help individual developers and teams plan, organize, prioritize, and understand their work from one workspace.

It combines project and task management, workspace organization, team visibility, productivity insights, notifications, and AI-assisted planning in a single application.

The project was developed progressively through the Innovation Hacks Full Stack Development Internship tasks, with Task 4 introducing the AI-assisted planning and work-intelligence capabilities.

## Overview

DevFlow brings projects, tasks, blockers, priorities, team activity, insights, and AI assistance together in one workspace.

The platform is backed by a real PostgreSQL database and authenticated APIs rather than relying on static dashboard data.

## Core Features

### Authentication
- User registration and login
- Authenticated API access
- Signed authentication tokens
- Current-user-aware application state
- Protected application operations
- User-scoped productivity data
- Authorization checks for sensitive operations

### Project Management
- Create, view, update, and delete projects
- Assign projects to users
- Organize projects by workspace
- Track project health and progress
- View project-related tasks

### Task Management
- Create, edit, and delete tasks
- Task status and priority
- Assignee and due date
- Estimated effort
- Blocking status
- Project association
- Persistent database-backed task data

### Workspaces
- Engineering
- Design
- Personal

Workspace selection affects the relevant project, task, team, and productivity views.

## Application Pages

### Today
Personalized active work for the signed-in user, including:
- Next Best Action
- Attention Queue
- Flow Map
- Today's Tasks
- Productivity information
- AI Work Intelligence

### Work
Project-focused work management with:
- Project browsing
- Project details
- Project health and progress
- Project tasks
- Filtering
- AI-assisted task generation

### Team
Workspace-level team visibility including:
- Team workload
- Team members
- Active work
- Blockers
- Project health
- Workspace activity

### Insights
Live productivity and project information derived from application data, including task status, workload, blocked work, and project health.

### Settings
Preferences, appearance, notifications, workspace controls, landing-page behavior, and supported display preferences.

### Profile
Current-user profile and workload summary.

### Global Search
Search across tasks, projects, and people.

# AI Capabilities

Task 4 introduced two major AI-assisted capabilities.

## 1. AI-Assisted Task Generation

DevFlow can generate actionable task suggestions from project context.

The AI can consider:
- Project name
- Project description
- Workspace
- Project health
- Existing active tasks
- User-provided generation brief

Suggestions can include:
- Title
- Description
- Priority
- Estimated hours
- Blocking status
- Suggested timeframe

### Human-in-the-loop workflow

AI suggestions are not automatically inserted into the database.

```text
Project
   ↓
Project context
   ↓
AI task generation
   ↓
Task suggestions
   ↓
User reviews suggestions
   ↓
User accepts selected suggestion
   ↓
Task is created
   ↓
PostgreSQL
```

## AI Duplicate Protection

The task-generation flow considers existing active tasks. The local DevFlow fallback checks existing task titles before returning suggestions to avoid simply repeating tasks already present in the project.

## 2. AI Work Intelligence

Work Intelligence analyzes the signed-in user's active work using information such as:
- Task priority
- Due-date pressure
- Blocking status
- Project health
- Task status
- Estimated effort
- Current workload

It provides contextual productivity guidance such as a recommended next action and the reason it requires attention.

The server validates an AI-selected task ID against the actual task set before returning the recommendation.

## Gemini + Local Fallback

Google Gemini is used when configured.

If Gemini is unavailable or no API key is configured, DevFlow can use its deterministic local intelligence engine.

```text
DevFlow AI Request
       ↓
Google Gemini
       ↓
Validated response
       ↓
DevFlow UI

If Gemini is unavailable:
       ↓
DevFlow local intelligence
       ↓
Explainable recommendation
```

# Core Workflow

```text
Sign in
   ↓
Select workspace
   ↓
Create or open project
   ↓
Describe project requirements
   ↓
Generate AI task suggestions
   ↓
Review suggestions
   ↓
Accept selected tasks
   ↓
Tasks are persisted in PostgreSQL
   ↓
Today / Work / Team / Insights update
   ↓
AI Work Intelligence analyzes active work
   ↓
Developer receives actionable work guidance
```

# Technology Stack

- Frontend: React 19 + Vite + TypeScript
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma 7
- AI: Google Gemini API + deterministic DevFlow fallback
- Authentication: authenticated REST API with signed tokens
- Styling: custom CSS with CSS variables
- Deployment: Vercel frontend + Render backend

# Architecture

```text
React frontend
      ↓
Authenticated REST API
      ↓
Express + TypeScript
      ↓
Prisma
      ↓
PostgreSQL

AI task generation / Work Intelligence
      ↓
Google Gemini when configured
      ↓
Validated response
      ↓
Human approval or explainable recommendation
```

Business logic is separated into reusable frontend utilities/components and backend services/repositories.

# Data and Persistence

DevFlow uses PostgreSQL for persistent application data, including users, projects, tasks, workspace-related information, and project/task relationships.

Frontend actions communicate with the authenticated backend API rather than directly modifying PostgreSQL.

# Security and Data Integrity

- Protected application operations require authentication.
- A normal authenticated user cannot arbitrarily delete another user through the user-delete endpoint.
- Project/task relationships are validated during backend operations.
- AI-generated task suggestions require explicit user approval before creation.
- AI Work Intelligence validates selected task IDs against real database tasks.
- Environment secrets are kept outside committed source files.

Never commit:
- `.env`
- Database passwords
- Authentication secrets
- Gemini API keys
- Other private credentials

# Project Structure

```text
DevFlow/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   ├── types/
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── lib/
│   │   └── ...
│   │
│   └── prisma/
│       └── schema.prisma
│
├── public/
├── package.json
├── vite.config.ts
└── README.md
```

# Environment Variables

## Frontend

Configure the frontend API base URL using the environment configuration used by the project.

Use the actual variable names present in the project's `.env.example` and deployment configuration.

## Backend

Typical backend configuration includes:

```text
DATABASE_URL=<postgresql-connection-string>
AUTH_SECRET=<authentication-secret>
CORS_ORIGIN=<frontend-url>
GEMINI_API_KEY=<optional-gemini-api-key>
GEMINI_MODEL=gemini-2.5-flash
```

`GEMINI_API_KEY` is optional because DevFlow includes a local fallback intelligence engine.

Never commit real environment values.

# Local Development

## Frontend

```bash
npm install
npm run dev
```

The Vite development server normally runs on `http://localhost:5173`.

## Backend

Open another terminal:

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

# Build Verification

Frontend:

```bash
npm run build
```

Backend:

```bash
cd backend
npm run build
```

Both builds should complete without TypeScript errors before submission.

# Deployment

DevFlow uses:

```text
Frontend → Vercel
Backend  → Render
Database → PostgreSQL
```

Before submission:
1. Push the latest verified commit to GitHub.
2. Confirm Vercel has deployed the latest frontend commit.
3. Confirm Render has deployed the latest backend commit.
4. Verify production environment variables.
5. Test authentication.
6. Test project/task creation.
7. Test AI task generation.
8. Test AI Work Intelligence.
9. Verify the deployed application rather than relying only on localhost.

# Task 4 — AI & Productivity Enhancements

Task 4 extends the existing DevFlow application with AI-assisted productivity capabilities while preserving the existing project/task management architecture.

### Task 4 additions

- AI-assisted task generation
- AI Work Intelligence
- Gemini integration
- Deterministic local AI fallback
- AI duplicate protection
- Human-in-the-loop task approval
- User-scoped work intelligence
- Structured AI responses
- AI task validation
- Improved user authorization
- Documentation and deployment readiness

Task 4 was implemented as an extension of the existing DevFlow application rather than as a separate application.

# Product Value

DevFlow combines traditional productivity management with contextual AI assistance.

Instead of simply displaying a list of tasks, the platform helps answer:

> What should I work on next, and why?

The AI-assisted task generator turns project requirements into actionable work suggestions, while Work Intelligence uses existing project and task data to provide contextual productivity guidance.

The final decision remains with the developer.

# Testing Checklist

## Authentication
- [ ] Register user
- [ ] Login
- [ ] Logout
- [ ] Verify authenticated pages

## Projects
- [ ] Create project
- [ ] Open project
- [ ] Edit project
- [ ] Delete test project
- [ ] Verify deleted project does not remain in active views

## Tasks
- [ ] Create task
- [ ] Edit task
- [ ] Change status
- [ ] Assign task
- [ ] Mark task blocked
- [ ] Delete test task

## AI
- [ ] Select project
- [ ] Generate task suggestions
- [ ] Review suggestions
- [ ] Accept a suggestion
- [ ] Verify task appears in project
- [ ] Generate again and check duplicate protection
- [ ] Run Work Intelligence
- [ ] Verify recommendation refers to real work

## Team
- [ ] Check team workload
- [ ] Check blockers
- [ ] Open blocker project
- [ ] Verify deleted projects/tasks are not shown

## Settings
- [ ] Change preferences
- [ ] Check notification settings
- [ ] Reload
- [ ] Verify supported settings persist

## Production
- [ ] Verify Vercel deployment
- [ ] Verify Render deployment
- [ ] Verify production environment variables
- [ ] Test deployed login
- [ ] Test deployed project/task operations
- [ ] Test deployed AI functionality

# Project Status

DevFlow is a working full-stack developer productivity platform with:
- Real authentication
- Real PostgreSQL persistence
- Project management
- Task management
- Workspace organization
- Team visibility
- Productivity insights
- Notifications
- User settings
- AI-assisted task generation
- AI Work Intelligence
- Gemini integration
- Local AI fallback
- Human-in-the-loop AI workflows
- Vercel frontend deployment
- Render backend deployment

# Innovation Hacks

**Project:** DevFlow  
**Program:** Innovation Hacks — Full Stack Development Internship  
**Focus:** Developer Productivity + Full-Stack Engineering + AI-Assisted Work Management

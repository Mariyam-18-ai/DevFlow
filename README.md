# DevFlow — Developer Productivity Platform

DevFlow is a full-stack developer productivity workspace built for the **Innovation Hacks Full Stack Development Internship — Task 4**. It combines real project/task management with AI-assisted planning and work intelligence so developers can understand what to work on next and why.

## Task 4 highlights

- Real user authentication and authenticated API access
- Project and task CRUD backed by PostgreSQL
- Workspace-aware Today, Work, Team and Insights views
- **AI-assisted task generation** using Google Gemini when configured
- Human-in-the-loop AI flow: suggestions are reviewed before they become database tasks
- **AI Work Intelligence** that analyzes the signed-in user's active work and explains the recommended next action
- Deterministic DevFlow intelligence fallback when Gemini is unavailable
- Real task/project statistics and blocker detection
- Notifications and per-user settings
- Responsive, keyboard-accessible dashboard UI

## Core workflow

```text
Sign in
   ↓
Select workspace
   ↓
Create/open project
   ↓
Describe project requirements
   ↓
AI generates task suggestions
   ↓
User reviews and accepts selected suggestions
   ↓
Tasks are persisted in PostgreSQL
   ↓
Today / Work / Team / Insights update from live data
   ↓
AI Work Intelligence explains the next best action
```

AI suggestions are **not automatically inserted into the database**. The user remains in control and explicitly accepts the tasks they want to create.

## Pages

- **Today** — personalized active work for the signed-in user, Next Best Action, Attention Queue, Flow Map, Today's Tasks and activity.
- **Work** — projects and their task lists with filtering and project details.
- **Team** — team-wide pulse, workload and blockers for the selected workspace.
- **Insights** — live task status distribution, workload and project health information.
- **Settings** — Preferences, Appearance, Notifications and Workspace controls. User preferences are persisted per user/browser with localStorage and affect supported notification, landing-page and display-density behavior.
- **Profile** — current-user profile and workload summary.

Global search can find tasks, projects and people. The sidebar workspace switcher and Settings workspace control share the same workspace state.

## AI features

### 1. AI-assisted task generation

The task generator sends the selected project's name, description, workspace, health, existing active tasks and the user's optional brief to Gemini. The prompt explicitly asks for concrete tasks and to avoid duplicates. Returned suggestions are validated before being shown to the user.

If Gemini is unavailable or no API key is configured, DevFlow uses a deterministic local planner. The local planner also checks existing active task titles before returning suggestions so it does not repeat tasks already present in the project.

### 2. AI Work Intelligence

Work Intelligence analyzes the signed-in user's active tasks in the selected workspace. It considers priority, deadline pressure, blocking status, project health, current status and estimated effort. Gemini is used when available; otherwise the local DevFlow signal engine produces an explainable recommendation.

The server validates an AI-selected task ID against the real task set before returning the recommendation, preventing the model from inventing a task.

## Tech stack

- **Frontend:** React 19 + Vite + TypeScript
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL + Prisma 7
- **AI:** Google Gemini API
- **Authentication:** custom authenticated API flow with signed tokens
- **Styling:** custom CSS with CSS variables
- **Deployment:** Vercel (frontend) + Render (backend)

## Architecture

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
Google Gemini (when configured)
      ↓
Validated response
      ↓
Human approval or explainable recommendation
```

Business logic is kept in reusable `lib/` utilities and backend services/repositories. Dashboard mutations update the live API-backed application state so project/task changes are reflected across the relevant views.

## Environment variables

### Frontend

Use the environment variables documented in `.env.example`/deployment configuration for the frontend API base URL. Never commit secret values.

### Backend

Configure the backend environment with the required database and authentication settings, including:

```text
DATABASE_URL
AUTH_SECRET
CORS_ORIGIN
GEMINI_API_KEY        # optional; enables Gemini-powered AI instead of the local fallback
GEMINI_MODEL          # optional; defaults to gemini-2.5-flash
```

**Never commit real API keys, database credentials or authentication secrets.**

## Local development

Install frontend dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

In another terminal, install backend dependencies and start the API:

```bash
cd backend
npm install
npm run dev
```

Open the Vite URL shown by the frontend terminal (normally `http://localhost:5173`).

## Build verification

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

## Deployment

The production architecture uses the existing Vercel frontend deployment and Render backend deployment. The frontend communicates with the deployed Express API, which connects to PostgreSQL.

Before submitting a Task 4 build, verify the latest Git commit is deployed to both services and test the deployed application rather than relying only on localhost.

## Security and data integrity

- Protected application routes require authentication.
- A normal authenticated user can only delete their own user account through the user-delete endpoint.
- Project/task relationships are validated before mutations.
- AI-generated task suggestions require explicit user approval before creation.
- AI Work Intelligence validates selected task IDs against real database tasks.
- Environment secrets are kept outside committed source files.

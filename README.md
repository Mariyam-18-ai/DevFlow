# DevFlow — Developer Productivity Dashboard

A frontend-only developer productivity workspace built for the Innovation Hacks Full Stack Development Internship.

## Concept

DevFlow answers one question first: **"What should I work on next, and why?"**

The **Today** page leads with a **Next Best Action** card — a single, explainable recommendation computed from priority, due-date urgency, whether the task blocks other work, and whether its project is at risk. Below it, a **Flow Map** shows every task moving through To do → In progress → Blocked → Done, and an **Attention Queue** ranks what else deserves focus next. Nothing here is manually curated — it's all derived live from task/project state, so completing or reassigning a task immediately changes what the app recommends.

## Pages

- **Today** — greeting + live stats, Next Best Action, Attention Queue, Flow Map, Today's Tasks, Activity feed.
- **Work** — every project (health, progress, task counts) plus the full task list with combinable status + priority filters.
- **Team** — Team Pulse (per-person active/high-priority/blocked task counts), a weekly workload heatmap, and a Blockers view.
- **Insights** — Flow Velocity (stacked bar of task status across the whole board), the same workload heatmap, and a Project Health matrix.
- **Settings** — mock/local-only Preferences, Appearance, Notifications and Workspace controls. Nothing here persists; it exists so the page is real rather than a dead link.
- **Profile** — read-only summary of the current user's role and live workload (active tasks, completed tasks, owned projects), reached via "View profile" in the profile menu.

Global search (navbar, `⌘K` / `Ctrl+K`) is a command palette that searches tasks, projects and people together and groups the results. Selecting a result jumps back to Today with that search applied. A workspace switcher (sidebar and Settings, same shared state) swaps the visible workspace label; only "Engineering" has data in this build.

**Focus Mode** is a 25-minute session view (start/pause/reset/mark complete), reachable from Start Focus on the Next Best Action card, a task card, or the Flow Map's task detail panel.

## Visual identity

- Dark graphite background, warm off-white content, amber used sparingly for focus/priority signals
- Inter for content, JetBrains Mono for metadata/timestamps/scores
- Hairline borders, left-border status indicators, no shadows or gradients
- Icons are inline SVG (logo) or unicode glyphs — no icon library is currently wired in

## Tech stack

- React 19 + Vite + TypeScript
- Custom CSS (CSS variables for theming, no utility framework)

No backend, database, or auth — all data is mocked in `src/data/`. `useDashboardData()` simulates an async fetch (loading → success, or error with `?forceError=1` in the URL) so every page already renders through real loading/error/success states, ready to be pointed at a real API later without touching any component.

## Features implemented

- Next Best Action with visible, derived reasons ("High priority", "Due today", "Blocks other work", "Project is at risk")
- Flow Map: click a task for full detail (project, assignee, priority, status, due date, estimate, what's blocking it) plus Start Focus / Mark Complete / change status
- Team Pulse, weekly workload heatmap, and a Blockers view, all derived from live task assignment — not static counts
- Project Health matrix (healthy / at-risk / blocked), computed the same way on the Work grid and on Insights
- Flow Velocity: live status distribution across all tasks
- Global command palette search across tasks, projects and people, with recent-activity suggestions when empty
- Task filter chips (status + priority), combinable, working together with search
- Loading, empty and error states on every async view, with a working Retry
- Settings page (Preferences / Appearance / Notifications / Workspace — the Workspace control here shares the same state as the sidebar switcher) and a working profile menu (View profile, Preferences, Sign out) — click-outside and Escape both close it
- Keyboard/focus accessibility: visible focus rings, `aria-current` on the active nav item, `aria-expanded`/`aria-haspopup` on the profile menu, `role="listbox"`/`role="option"` on the command palette, Escape closes the profile menu and Focus Mode
- Fully responsive from 1440px down to 320px: sidebar collapses to a mobile drawer, project/team grids reflow to fewer columns, filters wrap instead of clipping

## Architecture

```
src/
  components/
    layout/     Navbar, Sidebar, CommandPalette, PageShell, DevFlowLogo
    ui/         Button, Badge, Chip, ProgressBar, ProgressRing,
                LoadingState, EmptyState, ErrorState
    dashboard/  TodayHeader, FocusCard, FocusRail, FlowMap, FocusMode,
                ActivityFeed
    projects/   ProjectCard, ProjectGrid, WorkOverview
    tasks/      TaskCard, TaskList, TaskFilters
    team/       TeamPulse, WorkloadChart, Blockers
    insights/   FlowVelocity, ProjectHealthMatrix
  hooks/        useDashboardData
  lib/          focusScore, projectHealth, filterUtils, search,
                badgeTone, taskLinks, workload, workspaces
  data/         mockUsers, mockProjects, mockTasks, mockActivity
  types/        user, project, task, activity
  pages/        Dashboard.tsx (Today/Work/Team/Insights), Settings.tsx,
                Profile.tsx
```

Business logic (`lib/`) is pure and separate from presentation — badge tone, focus scoring, project health, workload and search all live there once, reused across every page instead of being recomputed per component. `tasks` state is owned in one place (`Dashboard.tsx`) and mirrored up to `App.tsx` only so the navbar's search can see live (post-completion) data; there is no second copy of task state anywhere.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:5173.

```bash
npm run build   # tsc -b && vite build
npm run lint    # eslint
```

## Roadmap (later tasks)

- Replace mock data with real API calls
- Auth
- Persist filters/search/workspace in URL state
- Real-time activity feed

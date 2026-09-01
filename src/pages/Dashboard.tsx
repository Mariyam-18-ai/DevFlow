import { useEffect, useMemo, useState } from "react";
import type { Activity, Task, TaskStatus } from "../types";
import { mockProjects } from "../data/mockProjects";
import { mockTasks } from "../data/mockTasks";
import { mockActivity } from "../data/mockActivity";
import { currentUser, mockUsers } from "../data/mockUsers";
import { FocusCard } from "../components/dashboard/FocusCard";
import { FocusRail } from "../components/dashboard/FocusRail";
import { FlowMap } from "../components/dashboard/FlowMap";
import { FocusMode } from "../components/dashboard/FocusMode";
import { TodayHeader } from "../components/dashboard/TodayHeader";
import { ActivityFeed } from "../components/dashboard/ActivityFeed";
import { WorkOverview } from "../components/projects/WorkOverview";
import { TeamPulse } from "../components/team/TeamPulse";
import { WorkloadChart } from "../components/team/WorkloadChart";
import { ProjectHealthMatrix } from "../components/insights/ProjectHealthMatrix";
import { FlowVelocity } from "../components/insights/FlowVelocity";
import { Blockers } from "../components/team/Blockers";
import { PageShell } from "../components/layout/PageShell";
import { LoadingState } from "../components/ui/LoadingState";
import { ErrorState } from "../components/ui/ErrorState";
import { TaskList } from "../components/tasks/TaskList";
import { searchProjects, searchTasks } from "../lib/search";
import { getBestNextTask, getTodayTasks } from "../lib/focusScore";
import { useDashboardData } from "../hooks/useDashboardData";
import {
  DEFAULT_TASK_FILTER_STATE,
  type TaskFilterState,
} from "../lib/filterUtils";

// Dashboard only ever renders its own four tabs; Settings/Profile are
// separate top-level pages handled directly by App.tsx.
export type ActivePage = "today" | "work" | "team" | "insights";

interface DashboardProps {
  searchQuery: string;
  activePage: ActivePage;
  workspace: string;
  onNavigate: (page: ActivePage) => void;
  onTasksChange?: (tasks: Task[]) => void;
  searchTarget?: {
    type: "task" | "project" | "person";
    id: string;
  } | null;
}

const PAGE_COPY: Record<
  Exclude<ActivePage, "today">,
  { eyebrow: string; title: string; description: string }
> = {
  work: {
    eyebrow: "WORK",
    title: "Projects & Flow",
    description: "Every active project, its tasks, and how work is moving through statuses.",
  },
  team: {
    eyebrow: "TEAM",
    title: "Team Pulse",
    description: "Engineering workload visibility — who's carrying what, and where it's heavy.",
  },
  insights: {
    eyebrow: "INSIGHTS",
    title: "Insights",
    description: "Flow velocity, team workload and project health, derived from live task data.",
  },
};

let activityCounter = 0;

export function Dashboard({
  searchQuery,
  activePage,
  workspace,
  onNavigate,
  onTasksChange,
  searchTarget,
}: DashboardProps) {
  const { status, retry } = useDashboardData();

  const [tasks, setTasks] = useState(mockTasks);
  const [activity, setActivity] = useState<Activity[]>(mockActivity);
  const [filters, setFilters] = useState<TaskFilterState>(
    DEFAULT_TASK_FILTER_STATE
  );

  useEffect(() => {
    onTasksChange?.(tasks);
  }, [tasks, onTasksChange]);

const [focusTaskId, setFocusTaskId] = useState<string | null>(null);

const [flowSelectedTaskId, setFlowSelectedTaskId] =
  useState<string | null>(null);

useEffect(() => {
  if (searchTarget?.type !== "task") return;

  const timer = window.setTimeout(() => {
    setFlowSelectedTaskId(searchTarget.id);

    document
      .getElementById("today-flow-map")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }, 100);

  return () => window.clearTimeout(timer);
}, [searchTarget]);

const [highlightedProjectId, setHighlightedProjectId] =
  useState<string | null>(null);

const filteredProjects = useMemo(
  () => searchProjects(mockProjects, searchQuery, tasks),
  [searchQuery, tasks]
);

const searchedTasks = useMemo(
  () => searchTasks(tasks, searchQuery, mockUsers),
  [tasks, searchQuery]
);

const searchedUsers = useMemo(
  () =>
    searchQuery.trim()
      ? mockUsers.filter((user) =>
          `${user.name} ${user.role}`
            .toLowerCase()
            .includes(searchQuery.trim().toLowerCase())
        )
      : mockUsers,
  [searchQuery]
);

  const bestNextTask = getBestNextTask(tasks, mockProjects);

  const bestNextProject = bestNextTask
    ? mockProjects.find(
        (project) => project.id === bestNextTask.projectId
      )
    : undefined;

  // Today's Tasks excludes whatever is already shown as the Next
  // Best Action, so the two sections don't repeat the same task.
  const todayTasks = getTodayTasks(
    tasks,
    mockProjects,
    bestNextTask?.id ?? null
  );

  const focusTask = focusTaskId
    ? tasks.find((task) => task.id === focusTaskId) ?? null
    : null;

  const focusProject = focusTask
    ? mockProjects.find(
        (project) => project.id === focusTask.projectId
      )
    : undefined;

  function logActivity(message: string, type: Activity["type"]) {
    activityCounter += 1;
    setActivity((current) => [
      {
        id: `local-${activityCounter}`,
        userId: currentUser.id,
        type,
        message,
        timestamp: "Just now",
      },
      ...current,
    ]);
  }

  function setTaskStatus(taskId: string, nextStatus: TaskStatus) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, status: nextStatus } : task
      )
    );
  }

  function handleToggleTask(taskId: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const nextStatus: TaskStatus =
      task.status === "done" ? "todo" : "done";

    setTaskStatus(taskId, nextStatus);

    if (nextStatus === "done") {
      logActivity(`completed "${task.title}"`, "completed");
      if (focusTaskId === taskId) setFocusTaskId(null);
    }
  }

  function handleStartFocus(taskId: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.status === "todo") {
      setTaskStatus(taskId, "in-progress");
    }

    logActivity(`started "${task.title}"`, "started");
    setFocusTaskId(taskId);
  }

  function handleMarkComplete(taskId: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setTaskStatus(taskId, "done");
    logActivity(`completed "${task.title}"`, "completed");

    if (focusTaskId === taskId) setFocusTaskId(null);
  }

  // Task clicks from Today (FocusRail), or from Team/Blockers on
  // another page, all land on Today's Flow Map with the task selected —
  // reusing the same navigation + scroll pattern either way.
  function handleInspectTask(taskId: string) {
    const needsNavigate = activePage !== "today";
    if (needsNavigate) onNavigate("today");

    setFlowSelectedTaskId(taskId);
    window.setTimeout(
      () => {
        document
          .getElementById("today-flow-map")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      },
      needsNavigate ? 60 : 30
    );
  }

  function handleViewProject(projectId: string) {
    setHighlightedProjectId(projectId);
    if (activePage !== "work") onNavigate("work");

    window.setTimeout(() => {
      document
        .getElementById(`project-${projectId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);

    window.setTimeout(() => {
      setHighlightedProjectId((current) =>
        current === projectId ? null : current
      );
    }, 1700);
  }

  const activeCount = tasks.filter(
    (task) => task.status !== "done"
  ).length;
  const blockedCount = tasks.filter(
    (task) => task.status === "blocked"
  ).length;
  const dueTodayCount = tasks.filter(
    (task) => task.dueDate === "Today" && task.status !== "done"
  ).length;

  const pageCopy = activePage === "today" ? undefined : PAGE_COPY[activePage];

  return (
    <PageShell
      eyebrow={pageCopy ? `${workspace.toUpperCase()} · ${pageCopy.eyebrow}` : undefined}
      title={pageCopy?.title}
      description={pageCopy?.description}
    >
      <div className="df-dashboard">
        {activePage === "today" && (
          <TodayHeader
            user={currentUser}
            activeCount={activeCount}
            blockedCount={blockedCount}
            dueTodayCount={dueTodayCount}
          />
        )}

        {status === "loading" && (
          <LoadingState
            message={
              activePage === "today"
                ? "Loading your workday..."
                : "Loading workspace data..."
            }
          />
        )}

        {status === "error" && <ErrorState onRetry={retry} />}

        {status === "success" && activePage === "today" && (
          <>
            <div id="next-best-action">
              <FocusCard
                task={bestNextTask}
                project={bestNextProject}
                allTasks={tasks}
                onStartFocus={handleStartFocus}
                onViewProject={handleViewProject}
              />
            </div>

            <FocusRail
              tasks={tasks}
              projects={mockProjects}
              onTaskClick={handleInspectTask}
            />

            <div id="today-flow-map">
              <FlowMap
                tasks={tasks}
                projects={mockProjects}
                users={mockUsers}
                selectedTaskId={flowSelectedTaskId}
                onSelectTask={setFlowSelectedTaskId}
                onStartFocus={handleStartFocus}
                onMarkComplete={handleMarkComplete}
                onStatusChange={setTaskStatus}
              />
            </div>

            <section className="df-work-section">
              <div className="df-section-heading">
                <div>
                  <span className="df-eyebrow">TODAY'S TASKS</span>
                  <h2>Ready for you</h2>
                  <p>
                    Due today, high priority, or already in
                    progress — the tasks worth working next.
                  </p>
                </div>
              </div>

              <TaskList
                tasks={todayTasks}
                allTasks={tasks}
                projects={mockProjects}
                onToggle={handleToggleTask}
                onFocus={handleStartFocus}
                emptyTitle="No tasks need your attention today."
                emptyMessage="You're all caught up — check Work for the full backlog."
              />
            </section>

            <ActivityFeed activity={activity} />
          </>
        )}

        {status === "success" && activePage === "work" && (
          <WorkOverview
            projects={filteredProjects}
            tasks={searchedTasks}
            allTasks={tasks}
            filters={filters}
            onFiltersChange={setFilters}
            onTaskToggle={handleToggleTask}
            onTaskFocus={handleStartFocus}
            onProjectClick={handleViewProject}
            highlightedProjectId={highlightedProjectId}
          />
        )}

        {status === "success" && activePage === "team" && (
          <>
            <TeamPulse
              users={searchedUsers}
              tasks={tasks}
              projects={mockProjects}
              onInspectTask={handleInspectTask}
            />
            <WorkloadChart users={searchedUsers} tasks={tasks} />
            <Blockers
              tasks={tasks}
              projects={mockProjects}
              users={mockUsers}
              onInspectTask={handleInspectTask}
            />
          </>
        )}

        {status === "success" && activePage === "insights" && (
          <>
            <FlowVelocity tasks={tasks} />
            <WorkloadChart users={mockUsers} tasks={tasks} />
            <ProjectHealthMatrix projects={mockProjects} tasks={tasks} />
          </>
        )}
      </div>

      {focusTask && (
        <FocusMode
          task={focusTask}
          project={focusProject}
          onClose={() => setFocusTaskId(null)}
          onMarkComplete={handleMarkComplete}
        />
      )}
    </PageShell>
  );
}
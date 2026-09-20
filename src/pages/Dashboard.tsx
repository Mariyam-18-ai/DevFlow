import { useEffect, useMemo, useState } from "react";
import type {
  Activity,
  Project,
  Task,
  TaskStatus,
  User,
} from "../types";
import { mockActivity } from "../data/mockActivity";
import { currentUser } from "../data/mockUsers";
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
import { api } from "../lib/api";
import { ManagementModal } from "../components/ui/ManagementModal";
import { getLocalDateInputValue, isDueToday } from "../lib/dateUtils";
import {
  DEFAULT_TASK_FILTER_STATE,
  type TaskFilterState,
} from "../lib/filterUtils";

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
    description:
      "Every active project, its tasks, and how work is moving through statuses.",
  },
  team: {
    eyebrow: "TEAM",
    title: "Team Pulse",
    description:
      "Engineering workload visibility — who's carrying what, and where it's heavy.",
  },
  insights: {
    eyebrow: "INSIGHTS",
    title: "Insights",
    description:
      "Flow velocity, team workload and project health, derived from live task data.",
  },
};

let activityCounter = 0;

type ManagementMode = "user" | "project" | "task";

const emptyUser = {
  name: "",
  role: "",
  initials: "",
  activeTasks: 0,
};

const emptyProject = {
  name: "",
  description: "",
  ownerId: "",
  color: "#f59e0b",
  health: "healthy" as Project["health"],
};

const emptyTask = {
  title: "",
  description: "",
  projectId: "",
  assigneeId: "",
  status: "todo" as Task["status"],
  priority: "medium" as Task["priority"],
  dueDate: getLocalDateInputValue(),
  estimatedHours: 1,
  blocking: false,
};

export function Dashboard({
  searchQuery,
  activePage,
  workspace,
  onNavigate,
  onTasksChange,
  searchTarget,
}: DashboardProps) {
  const { status, retry, data } = useDashboardData();

  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [activity, setActivity] =
    useState<Activity[]>(mockActivity);

  const [filters, setFilters] = useState<TaskFilterState>(
    DEFAULT_TASK_FILTER_STATE
  );

  const [focusTaskId, setFocusTaskId] =
    useState<string | null>(null);

  const [flowSelectedTaskId, setFlowSelectedTaskId] =
    useState<string | null>(null);

  const [highlightedProjectId, setHighlightedProjectId] =
    useState<string | null>(null);

  /*
   * Management state
   */
  const [managementMode, setManagementMode] =
    useState<ManagementMode | null>(null);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [managementOpen, setManagementOpen] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [managementMessage, setManagementMessage] =
    useState("");

  const [userForm, setUserForm] = useState(emptyUser);
  const [projectForm, setProjectForm] =
    useState(emptyProject);
  const [taskForm, setTaskForm] =
    useState(emptyTask);

  /*
   * Load API data.
   */
  useEffect(() => {
    if (status === "success") {
      setUsers(data.users);
      setProjects(data.projects);
      setTasks(data.tasks);
    }
  }, [status, data.users, data.projects, data.tasks]);

  useEffect(() => {
    onTasksChange?.(tasks);
  }, [tasks, onTasksChange]);

  /*
   * Search navigation.
   */
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

  const filteredProjects = useMemo(
    () => searchProjects(projects, searchQuery, tasks),
    [searchQuery, tasks, projects]
  );

  const searchedTasks = useMemo(
    () => searchTasks(tasks, searchQuery, users),
    [tasks, searchQuery, users]
  );

  const searchedUsers = useMemo(
    () =>
      searchQuery.trim()
        ? users.filter((user) =>
            `${user.name} ${user.role}`
              .toLowerCase()
              .includes(searchQuery.trim().toLowerCase())
          )
        : users,
    [searchQuery, users]
  );

  const bestNextTask = getBestNextTask(tasks, projects);

  const bestNextProject = bestNextTask
    ? projects.find(
        (project) => project.id === bestNextTask.projectId
      )
    : undefined;

  const todayTasks = getTodayTasks(
    tasks,
    projects,
    bestNextTask?.id ?? null
  );

  const focusTask = focusTaskId
    ? tasks.find((task) => task.id === focusTaskId) ?? null
    : null;

  const focusProject = focusTask
    ? projects.find(
        (project) => project.id === focusTask.projectId
      )
    : undefined;

  function logActivity(
    message: string,
    type: Activity["type"]
  ) {
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

  /*
   * TASK STATUS
   */
  async function setTaskStatus(
    taskId: string,
    nextStatus: TaskStatus
  ) {
    try {
      const updatedTask = (await api.tasks.updateStatus(
        taskId,
        nextStatus
      )) as Task;

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId ? updatedTask : task
        )
      );
    } catch (error) {
      console.error(
        "Failed to update task status:",
        error
      );
    }
  }

  function handleToggleTask(taskId: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const nextStatus: TaskStatus =
      task.status === "done" ? "todo" : "done";

    setTaskStatus(taskId, nextStatus);

    if (nextStatus === "done") {
      logActivity(
        `completed "${task.title}"`,
        "completed"
      );

      if (focusTaskId === taskId) {
        setFocusTaskId(null);
      }
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
    logActivity(
      `completed "${task.title}"`,
      "completed"
    );

    if (focusTaskId === taskId) {
      setFocusTaskId(null);
    }
  }

  /*
   * NAVIGATION
   */
  function handleInspectTask(taskId: string) {
    const needsNavigate = activePage !== "today";

    if (needsNavigate) {
      onNavigate("today");
    }

    setFlowSelectedTaskId(taskId);

    window.setTimeout(
      () => {
        document
          .getElementById("today-flow-map")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      },
      needsNavigate ? 60 : 30
    );
  }

  function handleViewProject(projectId: string) {
    setHighlightedProjectId(projectId);

    if (activePage !== "work") {
      onNavigate("work");
    }

    window.setTimeout(() => {
      document
        .getElementById(`project-${projectId}`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 60);

    window.setTimeout(() => {
      setHighlightedProjectId((current) =>
        current === projectId ? null : current
      );
    }, 1700);
  }

  /*
   * MANAGEMENT
   */
  function closeManagement() {
    setManagementOpen(false);
    setManagementMode(null);
    setEditingId(null);
    setManagementMessage("");
    setUserForm(emptyUser);
    setProjectForm(emptyProject);
    setTaskForm(emptyTask);
  }

  function openCreate(mode: ManagementMode) {
    setEditingId(null);
    setManagementMode(mode);
    setManagementOpen(true);
    setManagementMessage("");

    if (mode === "user") {
      setUserForm(emptyUser);
    }

    if (mode === "project") {
      setProjectForm({
        ...emptyProject,
        ownerId: users[0]?.id ?? "",
      });
    }

    if (mode === "task") {
      setTaskForm({
        ...emptyTask,
        projectId: projects[0]?.id ?? "",
        assigneeId: users[0]?.id ?? "",
      });
    }
  }

  function editUser(user: User) {
    setEditingId(user.id);
    setManagementMode("user");
    setManagementOpen(true);

    setUserForm({
      name: user.name,
      role: user.role,
      initials: user.initials,
      activeTasks: user.activeTasks,
    });
  }

  function editProject(project: Project) {
    setEditingId(project.id);
    setManagementMode("project");
    setManagementOpen(true);

    setProjectForm({
      name: project.name,
      description: project.description,
      ownerId: project.ownerId,
      color: project.color,
      health: project.health,
    });
  }

  function editTask(task: Task) {
    setEditingId(task.id);
    setManagementMode("task");
    setManagementOpen(true);

    setTaskForm({
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      assigneeId: task.assigneeId,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      estimatedHours: task.estimatedHours,
      blocking: task.blocking,
    });
  }

  async function handleSaveManagement() {
    if (!managementMode) return;

    setSaving(true);
    setManagementMessage("");

    try {
      if (managementMode === "user") {
        if (editingId) {
          const updated = (await api.users.update(
            editingId,
            userForm
          )) as User;

          setUsers((current) =>
            current.map((user) =>
              user.id === updated.id ? updated : user
            )
          );

          setManagementMessage("Team member updated.");
        } else {
          const created = (await api.users.create(
            userForm
          )) as User;

          setUsers((current) => [...current, created]);

          setManagementMessage("Team member created.");
        }
      }

      if (managementMode === "project") {
        if (editingId) {
          const updated = (await api.projects.update(
            editingId,
            projectForm
          )) as Project;

          setProjects((current) =>
            current.map((project) =>
              project.id === updated.id
                ? updated
                : project
            )
          );

          setManagementMessage("Project updated.");
        } else {
          const created = (await api.projects.create(
            projectForm
          )) as Project;

          setProjects((current) => [
            ...current,
            created,
          ]);

          setManagementMessage("Project created.");
        }
      }

      if (managementMode === "task") {
        if (editingId) {
          const updated = (await api.tasks.update(
            editingId,
            taskForm
          )) as Task;

          setTasks((current) =>
            current.map((task) =>
              task.id === updated.id ? updated : task
            )
          );

          setManagementMessage("Task updated.");
        } else {
          const created = (await api.tasks.create(
            taskForm
          )) as Task;

          setTasks((current) => [
            ...current,
            created,
          ]);

          setManagementMessage("Task created.");
        }
      }

      window.setTimeout(() => {
        closeManagement();
      }, 700);
    } catch (error) {
      setManagementMessage(
        error instanceof Error
          ? error.message
          : "Unable to save changes."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    mode: ManagementMode,
    id: string
  ) {
    const confirmed = window.confirm(
      "Delete this item? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      if (mode === "user") {
        await api.users.delete(id);

        setUsers((current) =>
          current.filter((user) => user.id !== id)
        );
      }

      if (mode === "project") {
        await api.projects.delete(id);

        setProjects((current) =>
          current.filter(
            (project) => project.id !== id
          )
        );
      }

      if (mode === "task") {
        await api.tasks.delete(id);

        setTasks((current) =>
          current.filter((task) => task.id !== id)
        );
      }

      setManagementMessage("Deleted successfully.");
    } catch (error) {
      setManagementMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete this item."
      );
    }
  }

  /*
   * MANAGEMENT FORM
   */
  function renderManagementForm() {
    if (!managementOpen || !managementMode) {
      return null;
    }

    return (
      <ManagementModal
        eyebrow={editingId ? "EDIT" : "CREATE"}
        title={
          managementMode === "user"
            ? editingId
              ? "Edit team member"
              : "Add team member"
            : managementMode === "project"
              ? editingId
                ? "Edit project"
                : "Start project"
              : editingId
                ? "Edit task"
                : "Add task"
        }
        message={managementMessage}
        saving={saving}
        onClose={closeManagement}
        onSubmit={handleSaveManagement}
        submitLabel={editingId ? "Save changes" : "Create"}
      >
        <div className="df-crud-form">
          {managementMode === "user" && (
            <>
              <label>
                Name
                <input
                  value={userForm.name}
                  onChange={(event) =>
                    setUserForm({
                      ...userForm,
                      name: event.target.value,
                    })
                  }
                  placeholder="Full name"
                />
              </label>

              <label>
                Role
                <input
                  value={userForm.role}
                  onChange={(event) =>
                    setUserForm({
                      ...userForm,
                      role: event.target.value,
                    })
                  }
                  placeholder="Developer"
                />
              </label>

              <label>
                Initials
                <input
                  value={userForm.initials}
                  onChange={(event) =>
                    setUserForm({
                      ...userForm,
                      initials: event.target.value,
                    })
                  }
                  placeholder="AB"
                />
              </label>

              <label>
                Active tasks
                <input
                  type="number"
                  min="0"
                  value={userForm.activeTasks}
                  onChange={(event) =>
                    setUserForm({
                      ...userForm,
                      activeTasks: Number(
                        event.target.value
                      ),
                    })
                  }
                />
              </label>
            </>
          )}

          {managementMode === "project" && (
            <>
              <label>
                Project name
                <input
                  value={projectForm.name}
                  onChange={(event) =>
                    setProjectForm({
                      ...projectForm,
                      name: event.target.value,
                    })
                  }
                  placeholder="Project name"
                />
              </label>

              <label>
                Description
                <textarea
                  value={projectForm.description}
                  onChange={(event) =>
                    setProjectForm({
                      ...projectForm,
                      description:
                        event.target.value,
                    })
                  }
                  placeholder="Project description"
                />
              </label>

              <label>
                Owner
                <select
                  value={projectForm.ownerId}
                  onChange={(event) =>
                    setProjectForm({
                      ...projectForm,
                      ownerId: event.target.value,
                    })
                  }
                >
                  <option value="">
                    Select owner
                  </option>

                  {users.map((user) => (
                    <option
                      key={user.id}
                      value={user.id}
                    >
                      {user.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Health
                <select
                  value={projectForm.health}
                  onChange={(event) =>
                    setProjectForm({
                      ...projectForm,
                      health: event.target
                        .value as Project["health"],
                    })
                  }
                >
                  <option value="healthy">
                    Healthy
                  </option>
                  <option value="at-risk">
                    At risk
                  </option>
                  <option value="blocked">
                    Blocked
                  </option>
                </select>
              </label>

              <label>
                Project color
                <input
                  type="color"
                  value={projectForm.color}
                  onChange={(event) =>
                    setProjectForm({
                      ...projectForm,
                      color: event.target.value,
                    })
                  }
                />
              </label>
            </>
          )}

          {managementMode === "task" && (
            <>
              <label>
                Task title
                <input
                  value={taskForm.title}
                  onChange={(event) =>
                    setTaskForm({
                      ...taskForm,
                      title: event.target.value,
                    })
                  }
                  placeholder="Task title"
                />
              </label>

              <label>
                Description
                <textarea
                  value={taskForm.description}
                  onChange={(event) =>
                    setTaskForm({
                      ...taskForm,
                      description:
                        event.target.value,
                    })
                  }
                  placeholder="Task description"
                />
              </label>

              <label>
                Project
                <select
                  value={taskForm.projectId}
                  onChange={(event) =>
                    setTaskForm({
                      ...taskForm,
                      projectId:
                        event.target.value,
                    })
                  }
                >
                  <option value="">
                    Select project
                  </option>

                  {projects.map((project) => (
                    <option
                      key={project.id}
                      value={project.id}
                    >
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Assignee
                <select
                  value={taskForm.assigneeId}
                  onChange={(event) =>
                    setTaskForm({
                      ...taskForm,
                      assigneeId:
                        event.target.value,
                    })
                  }
                >
                  <option value="">
                    Select assignee
                  </option>

                  {users.map((user) => (
                    <option
                      key={user.id}
                      value={user.id}
                    >
                      {user.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Status
                <select
                  value={taskForm.status}
                  onChange={(event) =>
                    setTaskForm({
                      ...taskForm,
                      status: event.target
                        .value as TaskStatus,
                    })
                  }
                >
                  <option value="todo">
                    To do
                  </option>
                  <option value="in-progress">
                    In progress
                  </option>
                  <option value="blocked">
                    Blocked
                  </option>
                  <option value="done">
                    Done
                  </option>
                </select>
              </label>

              <label>
                Priority
                <select
                  value={taskForm.priority}
                  onChange={(event) =>
                    setTaskForm({
                      ...taskForm,
                      priority:
                        event.target.value as Task["priority"],
                    })
                  }
                >
                  <option value="high">
                    High
                  </option>
                  <option value="medium">
                    Medium
                  </option>
                  <option value="low">
                    Low
                  </option>
                </select>
              </label>

              <label>
                Due date
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(event) =>
                    setTaskForm({
                      ...taskForm,
                      dueDate:
                        event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Estimated hours
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={taskForm.estimatedHours}
                  onChange={(event) =>
                    setTaskForm({
                      ...taskForm,
                      estimatedHours:
                        Number(event.target.value),
                    })
                  }
                />
              </label>

              <label className="df-checkbox-field">
                <input
                  type="checkbox"
                  checked={taskForm.blocking}
                  onChange={(event) =>
                    setTaskForm({
                      ...taskForm,
                      blocking:
                        event.target.checked,
                    })
                  }
                />

                Blocking task
              </label>
            </>
          )}

        </div>
      </ManagementModal>
    );
  }

  const activeCount = tasks.filter(
    (task) => task.status !== "done"
  ).length;

  const blockedCount = tasks.filter(
    (task) => task.status === "blocked"
  ).length;

  const dueTodayCount = tasks.filter(
    (task) =>
      isDueToday(task.dueDate) &&
      task.status !== "done"
  ).length;

  const pageCopy =
    activePage === "today"
      ? undefined
      : PAGE_COPY[activePage];

  return (
    <PageShell
      eyebrow={
        pageCopy
          ? `${workspace.toUpperCase()} · ${pageCopy.eyebrow}`
          : undefined
      }
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

        {status === "error" && (
          <ErrorState onRetry={retry} />
        )}

        {status === "success" &&
          activePage === "today" && (
            <>
              <div className="df-page-action-row">
                <button type="button" className="df-primary-button" onClick={() => openCreate("task")}>
                  + Add task
                </button>
              </div>

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
                projects={projects}
                onTaskClick={handleInspectTask}
              />

              <div id="today-flow-map">
                <FlowMap
                  tasks={tasks}
                  projects={projects}
                  users={users}
                  selectedTaskId={
                    flowSelectedTaskId
                  }
                  onSelectTask={
                    setFlowSelectedTaskId
                  }
                  onStartFocus={
                    handleStartFocus
                  }
                  onMarkComplete={
                    handleMarkComplete
                  }
                  onStatusChange={
                    setTaskStatus
                  }
                />
              </div>

              <section className="df-work-section">
                <div className="df-section-heading df-section-heading-row">
                  <div>
                    <span className="df-eyebrow">
                      TODAY'S TASKS
                    </span>

                    <h2>Ready for you</h2>

                    <p>
                      Due today, high priority, or
                      already in progress — the tasks
                      worth working next.
                    </p>
                  </div>
                  <button type="button" className="df-secondary-button" onClick={() => openCreate("task")}>
                    + New task
                  </button>
                </div>

                <TaskList
                  tasks={todayTasks}
                  allTasks={tasks}
                  projects={projects}
                  onToggle={handleToggleTask}
                  onFocus={handleStartFocus}
                  onEdit={editTask}
                  onDelete={(id) => handleDelete("task", id)}
                  emptyTitle="No tasks need your attention today."
                  emptyMessage="You're all caught up — check Work for the full backlog."
                />
              </section>

              <ActivityFeed activity={activity} />
            </>
          )}

        {status === "success" &&
          activePage === "work" && (
            <>
              <div className="df-page-action-row">
                <button type="button" className="df-primary-button" onClick={() => openCreate("project")}>
                  + New project
                </button>
              </div>

              <WorkOverview
                projects={filteredProjects}
                tasks={searchedTasks}
                allTasks={tasks}
                filters={filters}
                onFiltersChange={setFilters}
                onTaskToggle={handleToggleTask}
                onTaskFocus={handleStartFocus}
                onProjectClick={
                  handleViewProject
                }
                highlightedProjectId={
                  highlightedProjectId
                }
                onEditProject={editProject}
                onDeleteProject={(id) => handleDelete("project", id)}
                onEditTask={editTask}
                onDeleteTask={(id) => handleDelete("task", id)}
              />
            </>
          )}

        {status === "success" &&
          activePage === "team" && (
            <>
              <div className="df-page-action-row">
                <button type="button" className="df-primary-button" onClick={() => openCreate("user")}>
                  + Add member
                </button>
              </div>

              <TeamPulse
                users={searchedUsers}
                tasks={tasks}
                projects={projects}
                onInspectTask={
                  handleInspectTask
                }
                onEditUser={editUser}
                onDeleteUser={(id) => handleDelete("user", id)}
              />

              <WorkloadChart
                users={searchedUsers}
                tasks={tasks}
              />

              <Blockers
                tasks={tasks}
                projects={projects}
                users={users}
                onInspectTask={
                  handleInspectTask
                }
              />
            </>
          )}

        {status === "success" &&
          activePage === "insights" && (
            <>
              <FlowVelocity tasks={tasks} />

              <WorkloadChart
                users={users}
                tasks={tasks}
              />

              <ProjectHealthMatrix
                projects={projects}
                tasks={tasks}
              />
            </>
          )}
      </div>

      {managementMessage && !managementOpen && (
        <div className="df-action-toast" role="status">
          {managementMessage}
          <button type="button" onClick={() => setManagementMessage("")} aria-label="Dismiss notification">×</button>
        </div>
      )}

      {renderManagementForm()}

      {focusTask && (
        <FocusMode
          task={focusTask}
          project={focusProject}
          onClose={() =>
            setFocusTaskId(null)
          }
          onMarkComplete={
            handleMarkComplete
          }
        />
      )}
    </PageShell>
  );
}
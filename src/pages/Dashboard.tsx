import { useEffect, useMemo, useState } from "react";
import type {
  Activity,
  Project,
  Task,
  TaskStatus,
  User,
  Workspace,
} from "../types";
import { mockActivity } from "../data/mockActivity";
import { FocusCard } from "../components/dashboard/FocusCard";
import { FocusRail } from "../components/dashboard/FocusRail";
import { FlowMap } from "../components/dashboard/FlowMap";
import { FocusMode } from "../components/dashboard/FocusMode";
import { TodayHeader } from "../components/dashboard/TodayHeader";
import { ActivityFeed } from "../components/dashboard/ActivityFeed";
import { AIWorkIntelligence } from "../components/dashboard/AIWorkIntelligence";
import { AITaskGenerator } from "../components/dashboard/AITaskGenerator";
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
import type { DashboardData, DashboardStatus } from "../hooks/useDashboardData";
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
  workspace: Workspace;
  onNavigate: (page: ActivePage) => void;
  onTasksChange?: (tasks: Task[]) => void;
  onDataChange?: (data: DashboardData) => void;
  searchTarget?: {
    type: "task" | "project" | "person";
    id: string;
  } | null;
  currentUserId?: string | null;
  dashboardData: DashboardData;
  dashboardStatus: DashboardStatus;
  onRetryDashboard: () => void;
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
  workspace: "Engineering" as Workspace,
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
  onDataChange,
  searchTarget,
  currentUserId,
  dashboardData,
  dashboardStatus,
  onRetryDashboard,
}: DashboardProps) {
  const status = dashboardStatus;
  const data = dashboardData;

  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const currentUser = users.find((user) => user.id === currentUserId) ?? null;

  useEffect(() => {
    if (status !== "success" || !currentUserId || activePage !== "work") return;
    const savedProjectId = localStorage.getItem(`devflow_project_${currentUserId}`);
    if (!savedProjectId) return;
    if (projects.some((project) => project.id === savedProjectId && project.workspace === workspace)) {
      setSelectedProjectId(savedProjectId);
    } else {
      localStorage.removeItem(`devflow_project_${currentUserId}`);
    }
  }, [status, currentUserId, activePage, projects, workspace]);

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

  const [selectedProjectId, setSelectedProjectId] =
    useState<string | null>(null);

  const [inspectedTaskId, setInspectedTaskId] =
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

  function syncAppData(nextUsers: User[], nextProjects: Project[], nextTasks: Task[]) {
    onTasksChange?.(nextTasks);
    onDataChange?.({
      users: nextUsers,
      projects: nextProjects,
      tasks: nextTasks,
    });
  }


  /*
   * Search navigation.
   */
  useEffect(() => {
    if (!searchTarget) return;

    const timer = window.setTimeout(() => {
      if (searchTarget.type === "task") {
        if (activePage !== "today") {
          onNavigate("today");
        }

        setFlowSelectedTaskId(searchTarget.id);
        document.getElementById("today-flow-map")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        return;
      }

      if (searchTarget.type === "project") {
        handleViewProject(searchTarget.id);
        return;
      }

      if (activePage !== "team") {
        onNavigate("team");
      }
    }, 100);

    return () => window.clearTimeout(timer);
  }, [searchTarget, onNavigate]);

  const workspaceProjects = useMemo(
    () => projects.filter((project) => project.workspace === workspace),
    [projects, workspace]
  );

  const workspaceTasks = useMemo(
    () => tasks.filter((task) => workspaceProjects.some((project) => project.id === task.projectId)),
    [tasks, workspaceProjects]
  );

  const myTasks = useMemo(
    () => currentUser ? workspaceTasks.filter((task) => task.assigneeId === currentUser.id) : [],
    [workspaceTasks, currentUser]
  );

  const filteredProjects = useMemo(
    () => searchProjects(workspaceProjects, searchQuery, workspaceTasks),
    [searchQuery, workspaceTasks, workspaceProjects]
  );

  const searchedTasks = useMemo(
    () => searchTasks(workspaceTasks, searchQuery, users),
    [workspaceTasks, searchQuery, users]
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

  const selectedProject = selectedProjectId
    ? projects.find((project) => project.id === selectedProjectId) ?? null
    : null;

  const selectedProjectTasks = selectedProject
    ? tasks.filter((task) => task.projectId === selectedProject.id)
    : [];

  const inspectedTask = inspectedTaskId
    ? tasks.find((task) => task.id === inspectedTaskId) ?? null
    : null;

  const inspectedTaskProject = inspectedTask
    ? projects.find((project) => project.id === inspectedTask.projectId)
    : undefined;

  const inspectedTaskAssignee = inspectedTask
    ? users.find((user) => user.id === inspectedTask.assigneeId)
    : undefined;

  // Never keep UI selections pointing at records that were deleted or
  // moved out of the active workspace. This prevents ghost project/task
  // details from surviving a CRUD action.
  useEffect(() => {
    if (selectedProjectId && !workspaceProjects.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(null);
    }

    if (inspectedTaskId && !workspaceTasks.some((task) => task.id === inspectedTaskId)) {
      setInspectedTaskId(null);
    }

    if (flowSelectedTaskId && !workspaceTasks.some((task) => task.id === flowSelectedTaskId)) {
      setFlowSelectedTaskId(null);
    }

    if (focusTaskId && !myTasks.some((task) => task.id === focusTaskId)) {
      setFocusTaskId(null);
    }
  }, [selectedProjectId, inspectedTaskId, flowSelectedTaskId, focusTaskId, workspaceProjects, workspaceTasks, myTasks]);

  useEffect(() => {
    if (activePage !== "work" || !selectedProjectId || !selectedProject) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(`project-detail-${selectedProject.id}`)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activePage, selectedProjectId, selectedProject]);

  const bestNextTask = getBestNextTask(myTasks, workspaceProjects);

  const bestNextProject = bestNextTask
    ? workspaceProjects.find(
        (project) => project.id === bestNextTask.projectId
      )
    : undefined;

  const todayTasks = getTodayTasks(
    myTasks,
    workspaceProjects,
    bestNextTask?.id ?? null
  );

  const focusTask = focusTaskId
    ? myTasks.find((task) => task.id === focusTaskId) ?? null
    : null;

  const focusProject = focusTask
    ? workspaceProjects.find(
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
        userId: currentUser?.id ?? "",
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

      const nextTasks = tasks.map((task) =>
        task.id === taskId ? updatedTask : task
      );
      setTasks(nextTasks);
      syncAppData(users, projects, nextTasks);
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
    setInspectedTaskId(taskId);

    const task = tasks.find((item) => item.id === taskId);

    // Team blockers may belong to another developer. Keep them in
    // the team context instead of sending them to the current user's
    // personal task view.
    if (activePage === "team" || (task && task.assigneeId !== currentUser?.id)) {
      if (activePage !== "team") {
        onNavigate("team");
      }
      return;
    }

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
    const project = projects.find((item) => item.id === projectId);
    if (!project || !workspaceProjects.some((item) => item.id === projectId)) {
      setManagementMessage("That project is no longer available in this workspace.");
      return;
    }

    setInspectedTaskId(null);
    setSelectedProjectId(projectId);
    if (currentUserId) {
      localStorage.setItem(`devflow_project_${currentUserId}`, projectId);
    }
    setHighlightedProjectId(projectId);

    if (activePage !== "work") {
      onNavigate("work");
    }

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
        ownerId: currentUser?.id ?? "",
        workspace,
      });
    }

    if (mode === "task") {
      setTaskForm({
        ...emptyTask,
        projectId: workspaceProjects[0]?.id ?? "",
        assigneeId: currentUser?.id ?? users[0]?.id ?? "",
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
      workspace: project.workspace,
    });
  }

  function useGeneratedTask(suggestion: {
    title: string;
    description: string;
    priority: Task["priority"];
    estimatedHours: number;
    blocking: boolean;
    suggestedDays: number;
  }) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + suggestion.suggestedDays);

    const projectId = selectedProject?.id ?? taskForm.projectId;
    if (!projectId) {
      setManagementMessage("Select a project before using an AI suggestion.");
      return;
    }

    setEditingId(null);
    setManagementMode("task");
    setTaskForm((current) => ({
      ...current,
      projectId,
      assigneeId: current.assigneeId || currentUser?.id || users[0]?.id || "",
      title: suggestion.title,
      description: suggestion.description,
      priority: suggestion.priority,
      estimatedHours: suggestion.estimatedHours,
      blocking: suggestion.blocking,
      dueDate: dueDate.toISOString().slice(0, 10),
    }));
    setManagementOpen(true);
    setManagementMessage("AI suggestion loaded. Review it and create the task when ready.");
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

          const nextUsers = users.map((user) =>
            user.id === updated.id ? updated : user
          );
          setUsers(nextUsers);
          syncAppData(nextUsers, projects, tasks);

          setManagementMessage("Team member updated.");
        } else {
          const created = (await api.users.create(
            userForm
          )) as User;

          const nextUsers = [...users, created];
          setUsers(nextUsers);
          syncAppData(nextUsers, projects, tasks);

          setManagementMessage("Team member created.");
        }
      }

      if (managementMode === "project") {
        if (editingId) {
          const updated = (await api.projects.update(
            editingId,
            projectForm
          )) as Project;

          const nextProjects = projects.map((project) =>
            project.id === updated.id ? updated : project
          );
          setProjects(nextProjects);
          syncAppData(users, nextProjects, tasks);

          setManagementMessage("Project updated.");
        } else {
          const created = (await api.projects.create(
            projectForm
          )) as Project;

          const nextProjects = [...projects, created];
          setProjects(nextProjects);
          syncAppData(users, nextProjects, tasks);

          setManagementMessage("Project created.");
        }
      }

      if (managementMode === "task") {
        if (editingId) {
          const updated = (await api.tasks.update(
            editingId,
            taskForm
          )) as Task;

          const nextTasks = tasks.map((task) =>
            task.id === updated.id ? updated : task
          );
          setTasks(nextTasks);
          syncAppData(users, projects, nextTasks);

          setManagementMessage("Task updated.");
        } else {
          const created = (await api.tasks.create(
            taskForm
          )) as Task;

          const nextTasks = [...tasks, created];
          setTasks(nextTasks);
          syncAppData(users, projects, nextTasks);

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

  async function handleDelete(mode: ManagementMode, id: string) {
    const confirmed = window.confirm(
      "Delete this item? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      if (mode === "task") {
        await api.tasks.delete(id);
        const nextTasks = tasks.filter((task) => task.id !== id);
        setTasks(nextTasks);
        syncAppData(users, projects, nextTasks);
        if (inspectedTaskId === id) setInspectedTaskId(null);
        if (flowSelectedTaskId === id) setFlowSelectedTaskId(null);
        if (focusTaskId === id) setFocusTaskId(null);
      }

      if (mode === "project") {
        await api.projects.delete(id);
        const nextProjects = projects.filter((project) => project.id !== id);
        const nextTasks = tasks.filter((task) => task.projectId !== id);
        setProjects(nextProjects);
        setTasks(nextTasks);
        syncAppData(users, nextProjects, nextTasks);
        if (selectedProjectId === id) {
          setSelectedProjectId(null);
          if (currentUserId) localStorage.removeItem(`devflow_project_${currentUserId}`);
        }
        if (highlightedProjectId === id) setHighlightedProjectId(null);
      }

      if (mode === "user") {
        await api.users.delete(id);
        const ownedProjectIds = new Set(
          projects.filter((project) => project.ownerId === id).map((project) => project.id)
        );
        const nextUsers = users.filter((user) => user.id !== id);
        const nextProjects = projects.filter((project) => project.ownerId !== id);
        const nextTasks = tasks.filter(
          (task) => task.assigneeId !== id && !ownedProjectIds.has(task.projectId)
        );
        setUsers(nextUsers);
        setProjects(nextProjects);
        setTasks(nextTasks);
        syncAppData(nextUsers, nextProjects, nextTasks);
        if (currentUserId === id) {
          localStorage.removeItem("devflow_token");
          window.location.reload();
          return;
        }
      }

      setManagementMessage("Deleted successfully. Related records were removed from the workspace.");
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
                  value={userForm.activeTasks}
                  readOnly
                  aria-describedby="active-tasks-help"
                />
                <span id="active-tasks-help" className="df-form-help">
                  Calculated from the member's current assigned tasks.
                </span>
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
                Workspace
                <select
                  value={projectForm.workspace}
                  onChange={(event) =>
                    setProjectForm({
                      ...projectForm,
                      workspace: event.target.value as Workspace,
                    })
                  }
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Personal">Personal</option>
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

                  {workspaceProjects.map((project) => (
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

  const activeCount = myTasks.filter(
    (task) => task.status !== "done"
  ).length;

  const blockedCount = myTasks.filter(
    (task) => task.status === "blocked"
  ).length;

  const dueTodayCount = myTasks.filter(
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
      title={!selectedProject ? pageCopy?.title : undefined}
      description={!selectedProject ? pageCopy?.description : undefined}
    >
      <div className="df-dashboard">
        {activePage === "today" && currentUser && (
          <TodayHeader
            user={currentUser}
            activeCount={activeCount}
            blockedCount={blockedCount}
            dueTodayCount={dueTodayCount}
            workspace={workspace}
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
          <ErrorState onRetry={onRetryDashboard} />
        )}

        {status === "success" &&
          activePage === "today" && (
            <>
              

              <div id="next-best-action">
                <FocusCard
                  task={bestNextTask}
                  project={bestNextProject}
                  allTasks={myTasks}
                  onStartFocus={handleStartFocus}
                  onViewProject={handleViewProject}
                />
              </div>

              <FocusRail
                tasks={myTasks}
                projects={workspaceProjects}
                onTaskClick={handleInspectTask}
              />

              <div id="today-flow-map">
                <FlowMap
                  tasks={myTasks}
                  projects={workspaceProjects}
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

              <AIWorkIntelligence workspace={workspace} />

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
                  allTasks={myTasks}
                  projects={workspaceProjects}
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

        {status === "success" && activePage === "work" && selectedProject && (
              <section className="df-project-workspace" aria-label="Project workspace">
                <div className="df-project-workspace-toolbar">
                  <button
                    type="button"
                    className="df-back-button"
                    onClick={() => {
                      setSelectedProjectId(null);
                      setInspectedTaskId(null);
                      if (currentUserId) localStorage.removeItem(`devflow_project_${currentUserId}`);
                    }}
                  >
                    ← All projects
                  </button>
                  <div className="df-project-workspace-actions">
                    <button
                      type="button"
                      className="df-secondary-button"
                      onClick={() => editProject(selectedProject)}
                    >
                      Edit project
                    </button>
                    <button
                      type="button"
                      className="df-primary-button"
                      onClick={() => openCreate("task")}
                    >
                      + Add task
                    </button>
                  </div>
                </div>

                <div
                  id={`project-detail-${selectedProject.id}`}
                  className="df-project-hero"
                >
                  <div className="df-project-hero-main">
                    <span className="df-eyebrow">
                      {selectedProject.workspace.toUpperCase()} · PROJECT
                    </span>
                    <h2>{selectedProject.name}</h2>
                    <p>
                      {selectedProject.description ||
                        "No project description yet."}
                    </p>
                    <div className="df-project-hero-meta">
                      <span>
                        Owner: {users.find((user) => user.id === selectedProject.ownerId)?.name ?? "Unassigned"}
                      </span>
                      <span>
                        Health: {selectedProject.health === "at-risk" ? "At risk" : selectedProject.health}
                      </span>
                    </div>
                  </div>

                  <div className="df-project-progress-card">
                    <span>PROJECT PROGRESS</span>
                    <strong>
                      {selectedProjectTasks.length
                        ? Math.round(
                            (selectedProjectTasks.filter(
                              (task) => task.status === "done"
                            ).length /
                              selectedProjectTasks.length) *
                              100
                          )
                        : 0}%
                    </strong>
                    <small>
                      {selectedProjectTasks.filter(
                        (task) => task.status === "done"
                      ).length} of {selectedProjectTasks.length} tasks complete
                    </small>
                  </div>
                </div>

                <div className="df-project-stat-grid">
                  <div>
                    <span>Total</span>
                    <strong>{selectedProjectTasks.length}</strong>
                  </div>
                  <div>
                    <span>Active</span>
                    <strong>
                      {selectedProjectTasks.filter(
                        (task) => task.status !== "done"
                      ).length}
                    </strong>
                  </div>
                  <div>
                    <span>Blocked</span>
                    <strong>
                      {selectedProjectTasks.filter(
                        (task) => task.status === "blocked"
                      ).length}
                    </strong>
                  </div>
                  <div>
                    <span>Completed</span>
                    <strong>
                      {selectedProjectTasks.filter(
                        (task) => task.status === "done"
                      ).length}
                    </strong>
                  </div>
                </div>

                <div className="df-project-content-grid">
                  <section className="df-project-task-panel">
                    <div className="df-section-heading df-section-heading-row">
                      <div>
                        <span className="df-eyebrow">PROJECT TASKS</span>
                        <h3>Work inside this project</h3>
                      </div>
                    </div>

                    {selectedProjectTasks.length === 0 ? (
                      <p className="df-flow-empty">
                        No tasks yet. Add a task or use DevFlow AI to generate a starting plan.
                      </p>
                    ) : (
                      <div className="df-project-task-list">
                        {selectedProjectTasks.map((task) => {
                          const assignee = users.find(
                            (user) => user.id === task.assigneeId
                          );
                          const isInspected = inspectedTaskId === task.id;

                          return (
                            <div
                              key={task.id}
                              className={`df-project-task-item ${
                                isInspected ? "is-selected" : ""
                              }`}
                            >
                              <button
                                type="button"
                                className="df-project-task-main"
                                onClick={() =>
                                  setInspectedTaskId(
                                    isInspected ? null : task.id
                                  )
                                }
                              >
                                <strong>{task.title}</strong>
                                <span>
                                  {assignee?.name ?? "Unassigned"} · {task.status} · {task.priority} · Due {task.dueDate}
                                </span>
                              </button>

                              <div className="df-project-task-actions">
                                <button
                                  type="button"
                                  className="df-inline-button"
                                  onClick={() => editTask(task)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="df-inline-button is-danger"
                                  onClick={() => handleDelete("task", task.id)}
                                >
                                  Delete
                                </button>
                              </div>

                              {isInspected && (
                                <div className="df-project-task-detail">
                                  <p>
                                    {task.description ||
                                      "No additional description."}
                                  </p>
                                  <div className="df-project-task-detail-grid">
                                    <span>
                                      Assignee <strong>{assignee?.name ?? "Unassigned"}</strong>
                                    </span>
                                    <span>
                                      Status <strong>{task.status}</strong>
                                    </span>
                                    <span>
                                      Priority <strong>{task.priority}</strong>
                                    </span>
                                    <span>
                                      Estimate <strong>{task.estimatedHours}h</strong>
                                    </span>
                                    <span>
                                      Blocking <strong>{task.blocking ? "Yes" : "No"}</strong>
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  <aside className="df-project-ai-panel">
                    <div>
                      <span className="df-eyebrow">DEVFLOW AI</span>
                      <h3>Plan the next steps</h3>
                      <p>
                        Generate project-specific task suggestions, review them, and create only the work you approve.
                      </p>
                    </div>
                    <AITaskGenerator
                      project={selectedProject}
                      onUseSuggestion={useGeneratedTask}
                    />
                  </aside>
                </div>
              </section>
        )}

        {status === "success" && activePage === "work" && !selectedProject && (
              <>
                <div className="df-page-action-row">
                  <button
                    type="button"
                    className="df-primary-button"
                    onClick={() => openCreate("project")}
                  >
                    + New project
                  </button>
                </div>
                <WorkOverview
                  projects={filteredProjects}
                  tasks={searchedTasks}
                  allTasks={workspaceTasks}
                  filters={filters}
                  onFiltersChange={setFilters}
                  onTaskToggle={handleToggleTask}
                  onTaskFocus={handleStartFocus}
                  onProjectClick={handleViewProject}
                  highlightedProjectId={highlightedProjectId}
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

              {inspectedTask && (
                <section className="df-flow-detail" aria-label="Task details">
                  <div className="df-flow-detail-head">
                    <div>
                      <span className="df-eyebrow">TASK DETAIL</span>
                      <h3>{inspectedTask.title}</h3>
                      <p>{inspectedTask.description || "No additional description."}</p>
                    </div>
                    <button
                      type="button"
                      className="df-flow-detail-close"
                      onClick={() => setInspectedTaskId(null)}
                      aria-label="Close task details"
                    >
                      ×
                    </button>
                  </div>

                  <div className="df-flow-detail-grid">
                    <div>
                      <span>Assignee</span>
                      <strong>{inspectedTaskAssignee?.name ?? "Unassigned"}</strong>
                    </div>
                    <div>
                      <span>Project</span>
                      <strong>{inspectedTaskProject?.name ?? "No project"}</strong>
                    </div>
                    <div>
                      <span>Status</span>
                      <strong>{inspectedTask.status}</strong>
                    </div>
                    <div>
                      <span>Priority</span>
                      <strong>{inspectedTask.priority}</strong>
                    </div>
                    <div>
                      <span>Due</span>
                      <strong>{inspectedTask.dueDate}</strong>
                    </div>
                    <div>
                      <span>Estimated</span>
                      <strong>{inspectedTask.estimatedHours}h</strong>
                    </div>
                  </div>

                  <div className="df-page-action-row">
                    {inspectedTaskProject && (
                      <button
                        type="button"
                        className="df-secondary-button"
                        onClick={() => {
                          setInspectedTaskId(null);
                          handleViewProject(inspectedTaskProject.id);
                        }}
                      >
                        Open project
                      </button>
                    )}
                    <button
                      type="button"
                      className="df-secondary-button"
                      onClick={() => editTask(inspectedTask)}
                    >
                      Edit task
                    </button>
                  </div>
                </section>
              )}

              <TeamPulse
                users={searchedUsers}
                tasks={workspaceTasks}
                projects={workspaceProjects}
                focusUserId={
                  searchTarget?.type === "person"
                    ? searchTarget.id
                    : null
                }
                onInspectTask={
                  handleInspectTask
                }
                onEditUser={editUser}
                onDeleteUser={(id) => handleDelete("user", id)}
              />

              <WorkloadChart
                users={searchedUsers}
                tasks={workspaceTasks}
              />

              <Blockers
                tasks={workspaceTasks}
                projects={workspaceProjects}
                users={users}
                onInspectTask={
                  handleInspectTask
                }
                onViewProject={handleViewProject}
              />
            </>
          )}

        {status === "success" &&
          activePage === "insights" && (
            <>
              <FlowVelocity tasks={workspaceTasks} />

              <WorkloadChart
                users={users}
                tasks={workspaceTasks}
              />

              <ProjectHealthMatrix
                projects={workspaceProjects}
                tasks={workspaceTasks}
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
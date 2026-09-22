import { useEffect, useMemo, useState } from "react";
import { Navbar } from "./components/layout/Navbar";
import { Sidebar } from "./components/layout/Sidebar";
import { WORKSPACES } from "./lib/workspaces";
import { Dashboard, type ActivePage } from "./pages/Dashboard";
import { Settings } from "./pages/Settings";
import { Profile } from "./pages/Profile";
import { useDashboardData } from "./hooks/useDashboardData";
import type { Task, User, Workspace } from "./types";
import type { DashboardData } from "./hooks/useDashboardData";
import { Auth } from "./pages/Auth";
import { api } from "./lib/api";

type AppPage = ActivePage | "settings" | "profile";

export interface UserSettings {
  openOnToday: boolean;
  compactTaskMetadata: boolean;
  dueTodayReminders: boolean;
  blockerAlerts: boolean;
}

const DEFAULT_USER_SETTINGS: UserSettings = {
  openOnToday: true,
  compactTaskMetadata: true,
  dueTodayReminders: true,
  blockerAlerts: true,
};

function readUserSettings(userId: string | null): UserSettings {
  if (!userId) return DEFAULT_USER_SETTINGS;
  try {
    const stored = localStorage.getItem(`devflow_settings_${userId}`);
    return stored ? { ...DEFAULT_USER_SETTINGS, ...JSON.parse(stored) } : DEFAULT_USER_SETTINGS;
  } catch {
    return DEFAULT_USER_SETTINGS;
  }
}

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [authReady, setAuthReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(Boolean(localStorage.getItem("devflow_token")));
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState<AppPage>("today");
  const [navigationReady, setNavigationReady] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [workspace, setWorkspace] = useState<Workspace>(WORKSPACES[0]);
  const [liveTasks, setLiveTasks] = useState<Task[]>([]);
  const [liveData, setLiveData] = useState<DashboardData>({
    users: [],
    projects: [],
    tasks: [],
  });
  const [searchTarget, setSearchTarget] = useState<{
    type: "task" | "project" | "person";
    id: string;
  } | null>(null);

  const { data, status, retry } = useDashboardData(authenticated);

  useEffect(() => {
    if (!authenticated) { setAuthReady(true); return; }
    api.auth.me()
      .then((user) => {
        setCurrentUserId(user.id);
        setAuthReady(true);
      })
      .catch(() => {
        localStorage.removeItem("devflow_token");
        setCurrentUserId(null);
        setAuthenticated(false);
        setAuthReady(true);
      });
  }, [authenticated]);

  useEffect(() => {
    if (!currentUserId) {
      setNavigationReady(false);
      return;
    }

    const next = readUserSettings(currentUserId);
    setUserSettings(next);

    const savedPage = localStorage.getItem(`devflow_page_${currentUserId}`) as AppPage | null;
    const savedWorkspace = localStorage.getItem(`devflow_workspace_${currentUserId}`) as Workspace | null;
    const validPages: AppPage[] = ["today", "work", "team", "insights", "settings", "profile"];

    if (savedWorkspace && WORKSPACES.includes(savedWorkspace)) {
      setWorkspace(savedWorkspace);
    }

    if (savedPage && validPages.includes(savedPage)) {
      setActivePage(savedPage);
    } else if (!next.openOnToday) {
      setActivePage("work");
    } else {
      setActivePage("today");
    }

    document.documentElement.dataset.compactTasks = String(next.compactTaskMetadata);
    setNavigationReady(true);
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId || !navigationReady) return;
    localStorage.setItem(`devflow_page_${currentUserId}`, activePage);
    localStorage.setItem(`devflow_workspace_${currentUserId}`, workspace);
  }, [activePage, workspace, currentUserId, navigationReady]);

  useEffect(() => {
    document.documentElement.dataset.compactTasks = String(userSettings.compactTaskMetadata);
  }, [userSettings.compactTaskMetadata]);

  useEffect(() => {
    function handleSettingsChanged(event: Event) {
      const customEvent = event as CustomEvent<UserSettings>;
      setUserSettings(customEvent.detail ?? DEFAULT_USER_SETTINGS);
    }
    window.addEventListener("devflow-settings-changed", handleSettingsChanged);
    return () => window.removeEventListener("devflow-settings-changed", handleSettingsChanged);
  }, []);

  useEffect(() => {
    setLiveTasks(data.tasks);
    setLiveData(data);
  }, [data]);

  const currentUser: User | null =
    liveData.users.find((user) => user.id === currentUserId) ?? null;

  const notifications = useMemo(() => {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const workspaceProjects = liveData.projects.filter((project) => project.workspace === workspace);
    const projectIds = new Set(workspaceProjects.map((project) => project.id));
    const workspaceTasks = liveData.tasks.filter((task) => projectIds.has(task.projectId));
    const items: Array<{ id: string; label: string; type: "task" | "project"; targetId: string }> = [];

    if (userSettings.blockerAlerts) {
      workspaceTasks
        .filter((task) => task.status === "blocked" && task.assigneeId === currentUserId)
        .slice(0, 3)
        .forEach((task) => items.push({ id: `blocked-${task.id}`, label: `Blocked: ${task.title}`, type: "task", targetId: task.id }));
    }

    if (userSettings.dueTodayReminders) {
      workspaceTasks
        .filter((task) => task.status !== "done" && task.assigneeId === currentUserId && task.dueDate.slice(0, 10) === todayKey)
        .slice(0, 3)
        .forEach((task) => items.push({ id: `due-${task.id}`, label: `Due today: ${task.title}`, type: "task", targetId: task.id }));
    }

    workspaceProjects
      .filter((project) => project.health === "blocked" || project.health === "at-risk")
      .slice(0, 3)
      .forEach((project) => items.push({ id: `health-${project.id}`, label: `${project.health === "blocked" ? "Blocked" : "At risk"}: ${project.name}`, type: "project", targetId: project.id }));

    return items.slice(0, 6);
  }, [liveData.projects, liveData.tasks, workspace, currentUserId, userSettings]);

  function handleNavigateToResult(

    type: "task" | "project" | "person",
    id: string
  ) {
    setSearchTarget({ type, id });

    if (type === "task") {
      setActivePage("today");
    } else if (type === "project") {
      setActivePage("work");
    } else {
      setActivePage("team");
    }
  }

  if (!authReady) return <div className="df-auth-shell"><div className="df-auth-card"><span className="df-eyebrow">DEVFLOW</span><h1>Loading your workspace…</h1></div></div>;
  if (!authenticated) return <Auth mode={authMode} onModeChange={setAuthMode} onSuccess={() => setAuthenticated(true)} />;
  if (!navigationReady) return <div className="df-auth-shell"><div className="df-auth-card"><span className="df-eyebrow">DEVFLOW</span><h1>Restoring your workspace…</h1></div></div>;

  return (
    <div className="df-app">
      <Sidebar
        activePage={activePage}
        onPageChange={(page) => setActivePage(page as AppPage)}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        workspace={workspace}
        onWorkspaceChange={setWorkspace}
        currentUser={currentUser}
      />

      <div className="df-main">
        <Navbar
          search={searchQuery}
          onSearchChange={setSearchQuery}
          onMenuClick={() => setSidebarOpen(true)}
          tasks={liveTasks}
          projects={liveData.projects}
          users={liveData.users}
          currentUser={currentUser}
          notifications={notifications}
          onNavigateToResult={handleNavigateToResult}
          onNavigate={(page) => setActivePage(page as AppPage)}
        />

        {activePage === "settings" ? (
          <Settings
            workspace={workspace}
            onWorkspaceChange={setWorkspace}
            userId={currentUserId}
            settings={userSettings}
          />
        ) : activePage === "profile" ? (
          <Profile
            tasks={liveData.tasks}
            projects={liveData.projects}
            currentUser={currentUser}
          />
        ) : (
          <Dashboard
            searchQuery={searchQuery}
            activePage={activePage}
            workspace={workspace}
            onNavigate={setActivePage}
            onTasksChange={setLiveTasks}
            onDataChange={setLiveData}
            searchTarget={searchTarget}
            currentUserId={currentUserId}
            dashboardData={liveData}
            dashboardStatus={status}
            onRetryDashboard={retry}
          />
        )}
      </div>
    </div>
  );
}

export default App;
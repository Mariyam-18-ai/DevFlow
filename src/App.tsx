import { useEffect, useState } from "react";
import { Navbar } from "./components/layout/Navbar";
import { Sidebar } from "./components/layout/Sidebar";
import { WORKSPACES } from "./lib/workspaces";
import { Dashboard, type ActivePage } from "./pages/Dashboard";
import { Settings } from "./pages/Settings";
import { Profile } from "./pages/Profile";
import { useDashboardData } from "./hooks/useDashboardData";
import type { Task, User } from "./types";
import type { DashboardData } from "./hooks/useDashboardData";

type AppPage = ActivePage | "settings" | "profile";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState<AppPage>("today");
  const [workspace, setWorkspace] = useState<string>(WORKSPACES[0]);
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

  const { data } = useDashboardData();

  useEffect(() => {
    setLiveTasks(data.tasks);
    setLiveData(data);
  }, [data]);

  const currentUser: User | null = liveData.users[0] ?? null;

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
          onNavigateToResult={handleNavigateToResult}
          onNavigate={(page) => setActivePage(page as AppPage)}
        />

        {activePage === "settings" ? (
          <Settings
            workspace={workspace}
            onWorkspaceChange={setWorkspace}
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
          />
        )}
      </div>
    </div>
  );
}

export default App;
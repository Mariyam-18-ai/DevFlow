import { useState } from "react";
import type { Task } from "./types";
import { Navbar } from "./components/layout/Navbar";
import { Sidebar } from "./components/layout/Sidebar";
import { WORKSPACES } from "./lib/workspaces";
import { Dashboard, type ActivePage } from "./pages/Dashboard";
import { mockProjects } from "./data/mockProjects";
import { mockTasks } from "./data/mockTasks";
import { mockUsers } from "./data/mockUsers";
import { Settings } from "./pages/Settings";
import { Profile } from "./pages/Profile";

// Dashboard only ever renders its own four tabs (see ActivePage in
// pages/Dashboard.tsx). Settings and Profile are separate top-level
// pages App renders directly, so the app-wide page state is a
// superset of Dashboard's own page type rather than forcing
// Dashboard to know about pages it never shows.
type AppPage = ActivePage | "settings" | "profile";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState<AppPage>("today");
  const [workspace, setWorkspace] = useState<string>(WORKSPACES[0]);

  // Mirrors Dashboard's live task state (including completions) so the
  // navbar's command palette searches current data, not the static
  // mock import — without moving task-mutation logic out of Dashboard.
  const [liveTasks, setLiveTasks] = useState<Task[]>(mockTasks);

  function handleNavigateToResult() {
    setActivePage("today");
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
      />

      <div className="df-main">
        <Navbar
          search={searchQuery}
          onSearchChange={setSearchQuery}
          onMenuClick={() => setSidebarOpen(true)}
          tasks={liveTasks}
          projects={mockProjects}
          users={mockUsers}
          onNavigateToResult={handleNavigateToResult}
          onNavigate={(page) => setActivePage(page)}
        />

        {activePage === "settings" ? (
          <Settings
  workspace={workspace}
  onWorkspaceChange={setWorkspace}
/>
        ) : activePage === "profile" ? (
          <Profile tasks={liveTasks} />
        ) : (
          <Dashboard
            searchQuery={searchQuery}
            activePage={activePage}
            workspace={workspace}
            onNavigate={setActivePage}
            onTasksChange={setLiveTasks}
          />
        )}
      </div>
    </div>
  );
}

export default App;
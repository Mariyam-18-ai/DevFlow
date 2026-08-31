import { DevFlowLogo } from "./DevFlowLogo";
import { currentUser } from "../../data/mockUsers";
import { WORKSPACES } from "../../lib/workspaces";

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  open: boolean;
  onClose: () => void;
  workspace: string;
  onWorkspaceChange: (workspace: string) => void;
}

const navigation = [
  {
    id: "today",
    label: "Today",
    icon: "⌂",
  },
  {
    id: "work",
    label: "Work",
    icon: "▣",
  },
  {
    id: "team",
    label: "Team",
    icon: "◎",
  },
  {
    id: "insights",
    label: "Insights",
    icon: "◒",
  },
];

export function Sidebar({
  activePage,
  onPageChange,
  open,
  onClose,
  workspace,
  onWorkspaceChange,
}: SidebarProps) {
  return (
    <>
      {open && (
        <button
          type="button"
          className="df-sidebar-overlay"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`df-sidebar ${
          open ? "is-open" : ""
        }`}
      >
        <div className="df-sidebar-top">
          <DevFlowLogo />

          <button
            type="button"
            className="df-sidebar-close"
            onClick={onClose}
            aria-label="Close navigation"
          >
            ×
          </button>
        </div>

        <div className="df-workspace-switcher">
          <span className="df-nav-label">WORKSPACE</span>
          <select
            aria-label="Switch workspace"
            value={workspace}
            onChange={(event) => onWorkspaceChange(event.target.value)}
          >
            {WORKSPACES.map((option) => (
              <option key={option} value={option}>
                {option} Workspace
              </option>
            ))}
          </select>
        </div>

        <nav className="df-navigation">
          <span className="df-nav-label">
            SECTIONS
          </span>

          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={activePage === item.id ? "page" : undefined}
              className={`df-nav-item ${
                activePage === item.id
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                onPageChange(item.id);
                onClose();
              }}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="df-sidebar-bottom">
          <span className="df-nav-label">
            ACCOUNT
          </span>

          <button
            type="button"
            aria-current={activePage === "settings" ? "page" : undefined}
            className={`df-nav-item ${activePage === "settings" ? "active" : ""}`}
            onClick={() => {
              onPageChange("settings");
              onClose();
            }}
          >
            <span aria-hidden="true">⚙</span>
            Settings
          </button>

          <div className="df-sidebar-user">
            <div className="df-avatar">
              {currentUser.initials}
            </div>

            <div>
              <strong>{currentUser.name}</strong>
              <span>{currentUser.role}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

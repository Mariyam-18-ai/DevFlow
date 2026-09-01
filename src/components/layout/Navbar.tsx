import { useEffect, useRef, useState } from "react";
import type { Project, Task, User } from "../../types";
import { currentUser } from "../../data/mockUsers";
import { DevFlowLogo } from "./DevFlowLogo";
import { CommandPalette } from "./CommandPalette";

interface NavbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onMenuClick: () => void;
  tasks: Task[];
  projects: Project[];
  users: User[];

  onNavigateToResult: (
    type: "task" | "project" | "person",
    id: string,
    label: string
  ) => void;

  onNavigate: (page: "settings" | "profile") => void;
}

export function Navbar({
  search,
  onSearchChange,
  onMenuClick,
  tasks,
  projects,
  users,
  onNavigateToResult,
  onNavigate,
}: NavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        inputRef.current?.focus();
        setPaletteOpen(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;

      if (!profileRef.current?.contains(target)) {
        setProfileOpen(false);
      }

      if (!notificationRef.current?.contains(target)) {
        setNotificationsOpen(false);
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  function handleEscape() {
    onSearchChange("");
    setPaletteOpen(false);
    inputRef.current?.blur();
  }

  function handleSelectResult(
    type: "task" | "project" | "person",
    id: string,
    label: string
  ) {
    onSearchChange(label);
    setPaletteOpen(false);

    onNavigateToResult(type, id, label);

    inputRef.current?.blur();
  }

  return (
    <header className="df-navbar">
      <div className="df-mobile-brand">
        <button
          type="button"
          className="df-menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <span aria-hidden="true">☰</span>
        </button>

        <DevFlowLogo />
      </div>

      <div className="df-search-wrap">
        <div className="df-search">
          <span aria-hidden="true">⌕</span>

          <input
            ref={inputRef}
            value={search}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            onFocus={() => setPaletteOpen(true)}
            onBlur={() =>
              window.setTimeout(
                () => setPaletteOpen(false),
                120
              )
            }
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                handleEscape();
              }
            }}
            placeholder="Search tasks, projects or people"
            aria-label="Search"
          />

          <kbd>⌘ K</kbd>
        </div>

        {paletteOpen && (
          <CommandPalette
            query={search}
            tasks={tasks}
            projects={projects}
            users={users}
            onSelectResult={handleSelectResult}
          />
        )}
      </div>

      <div className="df-navbar-actions">
        <div
          className="df-notification-menu"
          ref={notificationRef}
        >
          <button
            type="button"
            className="df-icon-button"
            aria-label="Open notifications"
            aria-expanded={notificationsOpen}
            aria-haspopup="true"
            title="Notifications"
            onClick={() =>
              setNotificationsOpen((value) => !value)
            }
          >
            <span aria-hidden="true">♢</span>
          </button>

          {notificationsOpen && (
            <div
              className="df-notification-dropdown"
              role="menu"
            >
              <strong>Notifications</strong>

              <button
                type="button"
                role="menuitem"
              >
                Billing Migration is at risk
              </button>

              <button
                type="button"
                role="menuitem"
              >
                2 tasks are due today
              </button>
            </div>
          )}
        </div>

        <div
          className="df-profile-menu"
          ref={profileRef}
        >
          <button
            type="button"
            className="df-profile-trigger"
            onClick={() =>
              setProfileOpen((value) => !value)
            }
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <div className="df-avatar">
              {currentUser.initials}
            </div>

            <div className="df-profile-copy">
              <strong>{currentUser.name}</strong>
              <span>Developer</span>
            </div>

            <span aria-hidden="true">⌄</span>
          </button>

          {profileOpen && (
            <div className="df-profile-dropdown">
              <strong>{currentUser.name}</strong>

              <span>{currentUser.role}</span>

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  onNavigate("profile");
                }}
              >
                View profile
              </button>

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  onNavigate("settings");
                }}
              >
                Preferences
              </button>

              <button
                type="button"
                onClick={() => setProfileOpen(false)}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
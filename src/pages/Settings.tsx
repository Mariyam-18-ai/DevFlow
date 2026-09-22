import { useEffect, useState } from "react";
import { PageShell } from "../components/layout/PageShell";
import { WORKSPACES } from "../lib/workspaces";
import type { Workspace } from "../types";
import type { UserSettings } from "../App";

interface SettingsProps {
  workspace: Workspace;
  onWorkspaceChange: (workspace: Workspace) => void;
  userId: string | null;
  settings: UserSettings;
}

export function Settings({ workspace, onWorkspaceChange, userId, settings }: SettingsProps) {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);

  useEffect(() => setLocalSettings(settings), [settings]);

  function updateSetting<K extends keyof UserSettings>(key: K, value: UserSettings[K]) {
    const next = { ...localSettings, [key]: value };
    setLocalSettings(next);
    if (userId) localStorage.setItem(`devflow_settings_${userId}`, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent<UserSettings>("devflow-settings-changed", { detail: next }));
  }

  return (
    <PageShell
      eyebrow="ACCOUNT · SETTINGS"
      title="Settings"
      description="Your preferences are saved to this DevFlow account and used by the workspace in real time."
    >
      <div className="df-settings-grid">
        <section className="df-settings-card">
          <span className="df-eyebrow">PREFERENCES</span>
          <h2>Workspace defaults</h2>
          <label className="df-setting-row">
            <span><strong>Open on Today</strong><small>Return to your personal work queue when you sign in.</small></span>
            <input type="checkbox" checked={localSettings.openOnToday} onChange={(e) => updateSetting("openOnToday", e.target.checked)} aria-label="Open on Today" />
          </label>
          <label className="df-setting-row">
            <span><strong>Compact task metadata</strong><small>Use the compact task presentation across work lists.</small></span>
            <input type="checkbox" checked={localSettings.compactTaskMetadata} onChange={(e) => updateSetting("compactTaskMetadata", e.target.checked)} aria-label="Compact task metadata" />
          </label>
        </section>

        <section className="df-settings-card">
          <span className="df-eyebrow">APPEARANCE</span>
          <h2>DevFlow theme</h2>
          <div className="df-setting-static">
            <strong>Dark · Terminal-meets-paper</strong>
            <span>The active visual system is shared across the workspace for consistency.</span>
          </div>
        </section>

        <section className="df-settings-card">
          <span className="df-eyebrow">NOTIFICATIONS</span>
          <h2>Live work alerts</h2>
          <label className="df-setting-row">
            <span><strong>Due today reminders</strong><small>Show your real tasks that are due today in the notification center.</small></span>
            <input type="checkbox" checked={localSettings.dueTodayReminders} onChange={(e) => updateSetting("dueTodayReminders", e.target.checked)} aria-label="Due today reminders" />
          </label>
          <label className="df-setting-row">
            <span><strong>Blocker alerts</strong><small>Show your real blocked tasks and project health alerts.</small></span>
            <input type="checkbox" checked={localSettings.blockerAlerts} onChange={(e) => updateSetting("blockerAlerts", e.target.checked)} aria-label="Blocker alerts" />
          </label>
        </section>

        <section className="df-settings-card">
          <span className="df-eyebrow">WORKSPACE</span>
          <h2>Active workspace</h2>
          <label className="df-setting-row df-setting-row-select">
            <span><strong>Workspace</strong><small>This changes the live workspace context used by Work, Team, Insights and notifications.</small></span>
            <select aria-label="Switch workspace" value={workspace} onChange={(event) => onWorkspaceChange(event.target.value as Workspace)}>
              {WORKSPACES.map((option) => <option key={option} value={option}>{option} Workspace</option>)}
            </select>
          </label>
        </section>
      </div>
    </PageShell>
  );
}

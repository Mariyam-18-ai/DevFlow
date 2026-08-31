import { PageShell } from "../components/layout/PageShell";
import { WORKSPACES } from "../lib/workspaces";

interface SettingsProps {
  workspace: string;
  onWorkspaceChange: (workspace: string) => void;
}

export function Settings({ workspace, onWorkspaceChange }: SettingsProps) {
  return (
    <PageShell
      eyebrow="ACCOUNT · SETTINGS"
      title="Settings"
      description="Manage workspace preferences for this DevFlow prototype."
    >
      <div className="df-settings-grid">
        <section className="df-settings-card">
          <span className="df-eyebrow">PREFERENCES</span>
          <h2>Workspace defaults</h2>
          <label className="df-setting-row">
            <span>
              <strong>Open on Today</strong>
              <small>Start each session with your next best action.</small>
            </span>
            <input type="checkbox" defaultChecked aria-label="Open on Today" />
          </label>
          <label className="df-setting-row">
            <span>
              <strong>Compact task metadata</strong>
              <small>Keep task cards focused on the information that matters.</small>
            </span>
            <input type="checkbox" defaultChecked aria-label="Compact task metadata" />
          </label>
        </section>

        <section className="df-settings-card">
          <span className="df-eyebrow">APPEARANCE</span>
          <h2>DevFlow theme</h2>
          <div className="df-setting-static">
            <strong>Dark · Terminal-meets-paper</strong>
            <span>Warm amber focus signals with high-contrast graphite surfaces.</span>
          </div>
        </section>

        <section className="df-settings-card">
          <span className="df-eyebrow">NOTIFICATIONS</span>
          <h2>Work alerts</h2>
          <label className="df-setting-row">
            <span>
              <strong>Due today reminders</strong>
              <small>Show important work that needs attention today.</small>
            </span>
            <input type="checkbox" defaultChecked aria-label="Due today reminders" />
          </label>
          <label className="df-setting-row">
            <span>
              <strong>Blocker alerts</strong>
              <small>Surface blocked work in the command center.</small>
            </span>
            <input type="checkbox" defaultChecked aria-label="Blocker alerts" />
          </label>
        </section>

        <section className="df-settings-card">
          <span className="df-eyebrow">WORKSPACE</span>
          <h2>Active workspace</h2>
          <label className="df-setting-row df-setting-row-select">
            <span>
              <strong>Workspace</strong>
              <small>Switches the workspace label used across the app. Same setting as the sidebar.</small>
            </span>
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
          </label>
        </section>
      </div>
    </PageShell>
  );
}

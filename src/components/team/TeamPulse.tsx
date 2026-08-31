import { useState } from "react";
import type { Project, Task, User } from "../../types";
import { Badge } from "../ui/Badge";
import { EmptyState } from "../ui/EmptyState";
import { ProgressBar } from "../ui/ProgressBar";
import { getAllMemberStats, getMemberStats } from "../../lib/workload";
import { getPriorityTone, getStatusTone } from "../../lib/badgeTone";

interface TeamPulseProps {
  users: User[];
  tasks: Task[];
  projects: Project[];
  /** Optional: lets a person's active task row jump to that task's
   * detail in the existing FlowMap, reusing Dashboard's existing
   * task-inspection navigation rather than a new interaction system. */
  onInspectTask?: (taskId: string) => void;
}

// Rough weekly capacity used only to express workload as a percentage;
// a mock constant, not a real staffing input.
const WEEKLY_CAPACITY_HOURS = 24;

export function TeamPulse({
  users,
  tasks,
  projects,
  onInspectTask,
}: TeamPulseProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const memberStats = getAllMemberStats(users, tasks);

  if (users.length === 0) {
    return (
      <section className="df-team-pulse">
        <div className="df-section-heading">
          <div>
            <span className="df-eyebrow">TEAM PULSE</span>
            <h2>Engineering workload, at a glance</h2>
          </div>
        </div>

        <EmptyState
          title="No team members yet"
          message="Workload will appear once people are added to the team."
        />
      </section>
    );
  }

  const selected = selectedId
    ? getMemberStats(
        users.find((u) => u.id === selectedId)!,
        tasks
      )
    : null;

  return (
    <section className="df-team-pulse">
      <div className="df-section-heading">
        <div>
          <span className="df-eyebrow">TEAM PULSE</span>
          <h2>Engineering workload, at a glance</h2>
          <p>Who's carrying what right now — not a social feed, just capacity.</p>
        </div>
      </div>

      <div className="df-team-grid">
        {memberStats.map((stats) => {
          const workloadPct = Math.min(
            100,
            Math.round((stats.totalEstimatedHours / WEEKLY_CAPACITY_HOURS) * 100)
          );

          const projectCount = new Set(
            stats.activeTasks.map((task) => task.projectId)
          ).size;

          return (
            <button
              type="button"
              key={stats.user.id}
              className={`df-team-card ${selectedId === stats.user.id ? "is-selected" : ""}`}
              onClick={() =>
                setSelectedId((current) => (current === stats.user.id ? null : stats.user.id))
              }
            >
              <div className="df-team-card-top">
                <div className="df-avatar">{stats.user.initials}</div>
                <div>
                  <strong>{stats.user.name}</strong>
                  <span>{stats.user.role}</span>
                </div>
              </div>

              <div className="df-team-card-stats">
                <div>
                  <strong>{stats.activeTasks.length}</strong>
                  <span>Active</span>
                </div>
                <div className={stats.highPriorityTasks.length > 0 ? "is-danger" : ""}>
                  <strong>{stats.highPriorityTasks.length}</strong>
                  <span>High priority</span>
                </div>
                <div className={stats.blockedTasks.length > 0 ? "is-danger" : ""}>
                  <strong>{stats.blockedTasks.length}</strong>
                  <span>Blocked</span>
                </div>
                <div>
                  <strong>{projectCount}</strong>
                  <span>Projects</span>
                </div>
              </div>

              <ProgressBar value={workloadPct} label="Workload" />
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="df-team-detail">
          <div className="df-flow-detail-head">
            <div>
              <span className="df-eyebrow">WORKLOAD DETAIL</span>
              <h3>{selected.user.name}</h3>
            </div>
            <button
              type="button"
              className="df-flow-detail-close"
              onClick={() => setSelectedId(null)}
              aria-label="Close workload detail"
            >
              ×
            </button>
          </div>

          {selected.activeTasks.length === 0 ? (
            <EmptyState
              title="No active tasks"
              message="Nothing assigned to this person right now."
            />
          ) : (
            <div className="df-task-list">
              {selected.activeTasks.map((task) => {
                const project = projects.find((p) => p.id === task.projectId);
                const rowContent = (
                  <>
                    <div>
                      <strong>{task.title}</strong>
                      <span>{project?.name ?? "Unassigned project"}</span>
                    </div>
                    <Badge tone={getPriorityTone(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge tone={getStatusTone(task.status)}>
                      {task.status}
                    </Badge>
                  </>
                );

                return onInspectTask ? (
                  <button
                    type="button"
                    key={task.id}
                    className="df-team-task-row"
                    onClick={() => onInspectTask(task.id)}
                  >
                    {rowContent}
                  </button>
                ) : (
                  <div className="df-team-task-row" key={task.id}>
                    {rowContent}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

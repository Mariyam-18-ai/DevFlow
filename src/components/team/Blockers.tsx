import type { Project, Task, User } from "../../types";
import { EmptyState } from "../ui/EmptyState";
import { Badge } from "../ui/Badge";
import { getPriorityTone } from "../../lib/badgeTone";
import { getBlockingTask } from "../../lib/taskLinks";

interface BlockersProps {
  tasks: Task[];
  projects: Project[];
  users: User[];
  onInspectTask?: (taskId: string) => void;
}

/**
 * Surfaces currently-blocked tasks straight from the existing task
 * state (same source as FlowMap/TeamPulse) — no separate blocker
 * tracking, just a filtered, readable view of it.
 */
export function Blockers({
  tasks,
  projects,
  users,
  onInspectTask,
}: BlockersProps) {
  const blockedTasks = tasks.filter(
    (task) => task.status === "blocked"
  );

  return (
    <section className="df-team-pulse">
      <div className="df-section-heading">
        <div>
          <span className="df-eyebrow">BLOCKERS</span>
          <h2>What's stuck right now</h2>
          <p>
            Blocked tasks pulled directly from current task
            state.
          </p>
        </div>
      </div>

      {blockedTasks.length === 0 ? (
        <EmptyState
          title="Nothing is blocked"
          message="All active work is currently moving."
        />
      ) : (
        <div className="df-team-detail">
          {blockedTasks.map((task) => {
            const assignee = users.find(
              (user) => user.id === task.assigneeId
            );
            const project = projects.find(
              (p) => p.id === task.projectId
            );
            const blocker = getBlockingTask(task, tasks);

            const content = (
              <>
                <div>
                  <strong>{task.title}</strong>
                  <span>
                    {assignee?.name ?? "Unassigned"} ·{" "}
                    {project?.name ?? "No project"}
                  </span>
                  {blocker && (
                    <span className="df-task-blocked-note">
                      ⊘ Blocked by "{blocker.title}"
                    </span>
                  )}
                </div>

                <Badge tone={getPriorityTone(task.priority)}>
                  {task.priority}
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
                {content}
              </button>
            ) : (
              <div className="df-team-task-row" key={task.id}>
                {content}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

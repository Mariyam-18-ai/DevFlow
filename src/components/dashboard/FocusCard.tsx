import type { Project, Task } from "../../types";
import {
  getFocusReasons,
  getFocusScore,
} from "../../lib/focusScore";
import { getBlockingTask } from "../../lib/taskLinks";
import { getPriorityTone } from "../../lib/badgeTone";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { ProgressRing } from "../ui/ProgressRing";

interface FocusCardProps {
  task: Task | null;
  project?: Project;
  allTasks: Task[];
  onStartFocus: (taskId: string) => void;
  onViewProject: (projectId: string) => void;
}

export function FocusCard({
  task,
  project,
  allTasks,
  onStartFocus,
  onViewProject,
}: FocusCardProps) {
  if (!task) {
    return (
      <section className="df-focus-card df-focus-card-empty">
        <div className="df-focus-main">
          <span className="df-eyebrow">
            NEXT BEST ACTION
          </span>

          <h2>You're all caught up.</h2>

          <p>
            There are no active tasks requiring
            your attention right now.
          </p>
        </div>
      </section>
    );
  }

  const score = getFocusScore(task, project, allTasks);
  const reasons = getFocusReasons(task, project, allTasks);
  const blocksTask = task.blocking
    ? allTasks.find(
        (candidate) =>
          candidate.id !== task.id &&
          candidate.projectId === task.projectId &&
          getBlockingTask(candidate, allTasks)?.id ===
            task.id
      )
    : undefined;

  return (
    <section className="df-focus-card">
      <div className="df-focus-main">
        <div className="df-focus-header">
          <div>
            <span className="df-eyebrow">
              NEXT BEST ACTION
            </span>

            <h2>{task.title}</h2>

            <p>
              {project?.name ?? "Your workspace"}
            </p>
          </div>

          <ProgressRing
            value={score}
            size={82}
          />
        </div>

        <div className="df-focus-meta">
          <Badge tone={getPriorityTone(task.priority)}>
            {task.priority.toUpperCase()} PRIORITY
          </Badge>

          <span>Due {task.dueDate}</span>

          <span>
            {task.estimatedHours}h estimated
          </span>

          {blocksTask && (
            <span className="df-focus-blocks-note">
              Blocks "{blocksTask.title}"
            </span>
          )}
        </div>

        <div className="df-why">
          <strong>Why this task?</strong>

          <div className="df-reason-list">
            {reasons.map((reason) => (
              <span key={reason.label}>
                + {reason.label}
              </span>
            ))}
          </div>
        </div>

        <div className="df-focus-actions">
          <Button
            onClick={() => onStartFocus(task.id)}
          >
            Start Focus
          </Button>

          <Button
            variant="secondary"
            onClick={() =>
              project && onViewProject(project.id)
            }
            disabled={!project}
          >
            View Project
          </Button>
        </div>
      </div>

      <div className="df-focus-side">
        <span>FOCUS SCORE</span>
        <strong>{score}</strong>
        <p>
          Based on priority, urgency,
          dependencies and project health.
        </p>
      </div>
    </section>
  );
}

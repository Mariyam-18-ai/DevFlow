import type { Project, Task } from "../../types";
import { getBlockingTask } from "../../lib/taskLinks";
import {
  getPriorityTone,
  getStatusTone,
  TASK_STATUS_LABEL,
} from "../../lib/badgeTone";
import { Badge } from "../ui/Badge";

interface TaskCardProps {
  task: Task;
  project?: Project;
  allTasks: Task[];
  onToggle: (taskId: string) => void;
  onFocus?: (taskId: string) => void;
}

export function TaskCard({
  task,
  project,
  allTasks,
  onToggle,
  onFocus,
}: TaskCardProps) {
  const blockedBy =
    task.status === "blocked"
      ? getBlockingTask(task, allTasks)
      : undefined;

  return (
    <div
      id={`task-${task.id}`}
      className={`df-task-card ${
        task.status === "done" ? "is-done" : ""
      }`}
    >
      <button
        type="button"
        className="df-task-check"
        aria-pressed={task.status === "done"}
        aria-label={
          task.status === "done"
            ? "Mark as not done"
            : "Mark as done"
        }
        onClick={() => onToggle(task.id)}
      >
        {task.status === "done" ? "✓" : ""}
      </button>

      <div className="df-task-card-body">
        <p className="df-task-card-title">
          {task.title}
        </p>

        <div className="df-task-card-meta">
          {project && <span>{project.name}</span>}
          <span>Due {task.dueDate}</span>
          <span>{task.estimatedHours}h estimate</span>
        </div>

        {blockedBy && (
          <div className="df-task-blocked-note">
            ⊘ Blocked by "{blockedBy.title}"
          </div>
        )}
      </div>

      <div className="df-task-card-side">
        <Badge tone={getPriorityTone(task.priority)}>
          {task.priority}
        </Badge>

        <Badge tone={getStatusTone(task.status)}>
          {TASK_STATUS_LABEL[task.status]}
        </Badge>

        {onFocus && task.status !== "done" && (
          <button
            type="button"
            className="df-task-focus-btn"
            onClick={() => onFocus(task.id)}
            aria-label={`Start focus session on ${task.title}`}
          >
            ◎
          </button>
        )}
      </div>
    </div>
  );
}

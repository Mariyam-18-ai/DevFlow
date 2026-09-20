import type { Project, Task } from "../../types";
import { getBlockingTask } from "../../lib/taskLinks";
import {
  getPriorityTone,
  getStatusTone,
  TASK_STATUS_LABEL,
} from "../../lib/badgeTone";
import { Badge } from "../ui/Badge";
import { formatDueDate } from "../../lib/dateUtils";

interface TaskCardProps {
  task: Task;
  project?: Project;
  allTasks: Task[];
  onToggle: (taskId: string) => void;
  onFocus?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskCard({
  task,
  project,
  allTasks,
  onToggle,
  onFocus,
  onEdit,
  onDelete,
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
          <span>Due {formatDueDate(task.dueDate)}</span>
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

        {(onEdit || onDelete) && (
          <div className="df-card-actions">
            {onEdit && (
              <button type="button" onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`}>
                Edit
              </button>
            )}
            {onDelete && (
              <button type="button" className="is-danger" onClick={() => onDelete(task.id)} aria-label={`Delete ${task.title}`}>
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

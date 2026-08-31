import type { Project, Task, TaskStatus, User } from "../../types";
import { getBlockingTask } from "../../lib/taskLinks";
import { TASK_STATUS_LABEL } from "../../lib/badgeTone";

interface FlowMapProps {
  tasks: Task[];
  projects: Project[];
  users: User[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string | null) => void;
  onStartFocus: (taskId: string) => void;
  onMarkComplete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

const columns: { status: TaskStatus; label: string }[] = [
  { status: "todo", label: "To do" },
  { status: "in-progress", label: "In progress" },
  { status: "blocked", label: "Blocked" },
  { status: "done", label: "Done" },
];

const STATUS_OPTIONS: TaskStatus[] = [
  "todo",
  "in-progress",
  "blocked",
  "done",
];

export function FlowMap({
  tasks,
  projects,
  users,
  selectedTaskId,
  onSelectTask,
  onStartFocus,
  onMarkComplete,
  onStatusChange,
}: FlowMapProps) {
  const selectedTask = tasks.find(
    (task) => task.id === selectedTaskId
  );

  const selectedProject = selectedTask
    ? projects.find(
        (project) => project.id === selectedTask.projectId
      )
    : undefined;

  const selectedAssignee = selectedTask
    ? users.find((user) => user.id === selectedTask.assigneeId)
    : undefined;

  const blockedBy =
    selectedTask && selectedTask.status === "blocked"
      ? getBlockingTask(selectedTask, tasks)
      : undefined;

  return (
    <section className="df-flow-map">
      <div className="df-section-heading">
        <div>
          <span className="df-eyebrow">FLOW MAP</span>
          <h2>How work is moving</h2>
        </div>
      </div>

      <div className="df-flow-columns">
        {columns.map((column) => {
          const columnTasks = tasks.filter(
            (task) => task.status === column.status
          );

          return (
            <div className="df-flow-column" key={column.status}>
              <div className="df-flow-column-head">
                <span>{column.label}</span>
                <span className="df-flow-count">
                  {columnTasks.length}
                </span>
              </div>

              <div className="df-flow-column-body">
                {columnTasks.length === 0 && (
                  <p className="df-flow-empty">Nothing here</p>
                )}

                {columnTasks.map((task) => (
                  <button
                    type="button"
                    key={task.id}
                    aria-pressed={selectedTaskId === task.id}
                    className={`df-flow-task ${
                      task.priority === "high"
                        ? "is-high"
                        : ""
                    } ${
                      selectedTaskId === task.id
                        ? "is-selected"
                        : ""
                    }`}
                    onClick={() =>
                      onSelectTask(
                        selectedTaskId === task.id
                          ? null
                          : task.id
                      )
                    }
                  >
                    {task.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedTask && (
        <div className="df-flow-detail">
          <div className="df-flow-detail-head">
            <div>
              <span className="df-eyebrow">
                TASK DETAILS
              </span>
              <h3>{selectedTask.title}</h3>
            </div>

            <button
              type="button"
              className="df-flow-detail-close"
              onClick={() => onSelectTask(null)}
              aria-label="Close task details"
            >
              ×
            </button>
          </div>

          <div className="df-flow-detail-grid">
            <div>
              <span>Project</span>
              <strong>
                {selectedProject?.name ?? "Unassigned"}
              </strong>
            </div>

            <div>
              <span>Assignee</span>
              <strong>
                {selectedAssignee?.name ?? "Unassigned"}
              </strong>
            </div>

            <div>
              <span>Priority</span>
              <strong>{selectedTask.priority}</strong>
            </div>

            <div>
              <span>Status</span>
              <strong>
                {TASK_STATUS_LABEL[selectedTask.status]}
              </strong>
            </div>

            <div>
              <span>Due date</span>
              <strong>{selectedTask.dueDate}</strong>
            </div>

            <div>
              <span>Estimate</span>
              <strong>
                {selectedTask.estimatedHours}h
              </strong>
            </div>

            {blockedBy && (
              <div className="df-flow-detail-blocked">
                <span>Blocked by</span>
                <strong>{blockedBy.title}</strong>
              </div>
            )}
          </div>

          <div className="df-flow-detail-actions">
            {selectedTask.status !== "done" && (
              <button
                type="button"
                className="df-button df-button-primary df-button-sm"
                onClick={() =>
                  onStartFocus(selectedTask.id)
                }
              >
                Start Focus
              </button>
            )}

            {selectedTask.status !== "done" && (
              <button
                type="button"
                className="df-button df-button-secondary df-button-sm"
                onClick={() =>
                  onMarkComplete(selectedTask.id)
                }
              >
                Mark Complete
              </button>
            )}

            <label className="df-status-select-label">
              <span>Change status</span>
              <select
                className="df-status-select"
                value={selectedTask.status}
                onChange={(event) =>
                  onStatusChange(
                    selectedTask.id,
                    event.target.value as TaskStatus
                  )
                }
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {TASK_STATUS_LABEL[status]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}
    </section>
  );
}

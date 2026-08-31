import type { Project, Task } from "../../types";
import { getFocusScore } from "../../lib/focusScore";

interface FocusRailProps {
  tasks: Task[];
  projects: Project[];
  onTaskClick?: (taskId: string) => void;
}

export function FocusRail({
  tasks,
  projects,
  onTaskClick,
}: FocusRailProps) {
  const projectOf = (task: Task) =>
    projects.find((p) => p.id === task.projectId);

  const activeTasks = tasks
    .filter((task) => task.status !== "done")
    .sort(
      (a, b) =>
        getFocusScore(b, projectOf(b)) -
        getFocusScore(a, projectOf(a))
    )
    .slice(0, 3);

  return (
    <div className="df-focus-rail">
      <div className="df-section-heading">
        <div>
          <span className="df-eyebrow">
            ATTENTION QUEUE
          </span>

          <h2>What needs you next</h2>
        </div>
      </div>

      <div className="df-attention-list">
        {activeTasks.map((task, index) => (
          <button
            type="button"
            className="df-attention-item"
            key={task.id}
            onClick={() => onTaskClick?.(task.id)}
          >
            <span className="df-attention-number">
              0{index + 1}
            </span>

            <div>
              <strong>{task.title}</strong>
              <span>
                {task.dueDate} ·{" "}
                {task.priority} priority
              </span>
            </div>

            <span className="df-score">
              {getFocusScore(task, projectOf(task))}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

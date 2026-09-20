import type { Project, Task } from "../../types";
import { Badge } from "../ui/Badge";
import { ProgressBar } from "../ui/ProgressBar";
import { getHealthTone } from "../../lib/badgeTone";
import {
  getProjectHealth,
  getProjectProgress,
  getProjectTasks,
} from "../../lib/projectHealth";

interface ProjectCardProps {
  project: Project;
  tasks: Task[];
  onClick?: (projectId: string) => void;
  highlighted?: boolean;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
}

const projectColors: Record<string, string> = {
  amber: "#d89b2b",
  blue: "#4f73c5",
  violet: "#8064b5",
  emerald: "#3b9470",
};

export function ProjectCard({
  project,
  tasks,
  onClick,
  highlighted = false,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  // Health and progress are computed live from current task data
  // (lib/projectHealth) rather than the static project.health field,
  // so this stays consistent with ProjectHealthMatrix.
  const projectTasks = getProjectTasks(project.id, tasks);
  const completedTasks = projectTasks.filter(
    (task) => task.status === "done"
  ).length;
  const totalTasks = projectTasks.length;
  const progress = getProjectProgress(project.id, tasks);

  const health = getProjectHealth(project, tasks);
  const healthTone = getHealthTone(health);

  return (
    <article
      id={`project-${project.id}`}
      className={`df-project-card ${
        highlighted ? "is-highlighted" : ""
      }`}
      onClick={() => onClick?.(project.id)}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && onClick) {
          event.preventDefault();
          onClick(project.id);
        }
      }}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="df-project-card-top">
        <div className="df-project-title">
          <span
            className="df-project-icon"
            style={{
              backgroundColor:
                (projectColors[project.color] ?? project.color) ||
                "#172033",
            }}
          >
            ◆
          </span>

          <h3>{project.name}</h3>
        </div>

        <div className="df-card-actions">
          {onEdit && (
            <button type="button" onClick={(event) => { event.stopPropagation(); onEdit(project); }}>
              Edit
            </button>
          )}
          {onDelete && (
            <button type="button" className="is-danger" onClick={(event) => { event.stopPropagation(); onDelete(project.id); }}>
              Delete
            </button>
          )}
          <Badge tone={healthTone}>{health}</Badge>
        </div>
      </div>

      <p>{project.description}</p>

      <ProgressBar
        value={progress}
        label="Project progress"
      />

      <div className="df-project-card-footer">
        <span>
          {completedTasks} / {totalTasks} tasks
        </span>

        <span>{progress}%</span>
      </div>
    </article>
  );
}

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
    <button
      type="button"
      id={`project-${project.id}`}
      className={`df-project-card ${
        highlighted ? "is-highlighted" : ""
      }`}
      onClick={() => onClick?.(project.id)}
    >
      <div className="df-project-card-top">
        <div className="df-project-title">
          <span
            className="df-project-icon"
            style={{
              backgroundColor:
                projectColors[project.color] ??
                "#172033",
            }}
          >
            ◆
          </span>

          <h3>{project.name}</h3>
        </div>

        <Badge tone={healthTone}>
          {health}
        </Badge>
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
    </button>
  );
}

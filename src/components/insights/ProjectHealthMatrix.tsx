import { useEffect, useState } from "react";
import type { Project, ProjectHealth, Task } from "../../types";
import { Badge } from "../ui/Badge";
import { ProgressBar } from "../ui/ProgressBar";
import { getProjectProgress, getProjectTasks } from "../../lib/projectHealth";
import { getHealthTone } from "../../lib/badgeTone";
import { EmptyState } from "../ui/EmptyState";
import { isDueToday } from "../../lib/dateUtils";

interface ProjectHealthMatrixProps {
  projects: Project[];
  tasks: Task[];
}

const COLUMNS: { health: ProjectHealth; label: string }[] = [
  { health: "healthy", label: "Healthy" },
  { health: "at-risk", label: "At risk" },
  { health: "blocked", label: "Blocked" },
];

export function ProjectHealthMatrix({
  projects,
  tasks,
}: ProjectHealthMatrixProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = projects.find((project) => project.id === selectedId);

  useEffect(() => {
    if (selectedId && !projects.some((project) => project.id === selectedId)) {
      setSelectedId(null);
    }
  }, [projects, selectedId]);

  if (projects.length === 0) {
    return (
      <section className="df-health-matrix">
        <div className="df-section-heading">
          <div>
            <span className="df-eyebrow">PROJECT HEALTH</span>
            <h2>Where risk is building up</h2>
          </div>
        </div>
        <EmptyState
          title="No projects yet"
          message="Project health will appear once projects exist."
        />
      </section>
    );
  }

  const selectedTasks = selected
    ? getProjectTasks(selected.id, tasks)
    : [];

  return (
    <section className="df-health-matrix">
      <div className="df-section-heading">
        <div>
          <span className="df-eyebrow">PROJECT HEALTH</span>
          <h2>Where risk is building up</h2>
          <p>
            Live project health from the current workspace data.
          </p>
        </div>
      </div>

      <div className="df-health-columns">
        {COLUMNS.map((column) => {
          const columnProjects = projects.filter(
            (project) => project.health === column.health
          );

          return (
            <div className="df-health-column" key={column.health}>
              <div className="df-flow-column-head">
                <span>{column.label}</span>
                <span className="df-flow-count">
                  {columnProjects.length}
                </span>
              </div>

              <div className="df-flow-column-body">
                {columnProjects.length === 0 && (
                  <p className="df-flow-empty">Nothing here</p>
                )}

                {columnProjects.map((project) => (
                  <button
                    type="button"
                    key={project.id}
                    className={`df-flow-task ${
                      selectedId === project.id ? "is-selected" : ""
                    }`}
                    onClick={() =>
                      setSelectedId((current) =>
                        current === project.id ? null : project.id
                      )
                    }
                  >
                    {project.name}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="df-flow-detail">
          <div className="df-flow-detail-head">
            <div>
              <span className="df-eyebrow">PROJECT DETAIL</span>
              <h3>{selected.name}</h3>
              <p>{selected.description}</p>
            </div>

            <button
              type="button"
              className="df-flow-detail-close"
              onClick={() => setSelectedId(null)}
              aria-label="Close project detail"
            >
              ×
            </button>
          </div>

          <ProgressBar
            value={getProjectProgress(selected.id, tasks)}
            label="Progress"
          />

          <div className="df-flow-detail-grid">
            <div>
              <span>Total tasks</span>
              <strong>{selectedTasks.length}</strong>
            </div>
            <div>
              <span>Completed</span>
              <strong>
                {selectedTasks.filter((task) => task.status === "done").length}
              </strong>
            </div>
            <div>
              <span>Blocked</span>
              <strong>
                {selectedTasks.filter((task) => task.status === "blocked").length}
              </strong>
            </div>
            <div>
              <span>Health</span>
              <Badge tone={getHealthTone(selected.health)}>
                {selected.health === "at-risk"
                  ? "At risk"
                  : selected.health === "blocked"
                    ? "Blocked"
                    : "Healthy"}
              </Badge>
            </div>
          </div>

          {selectedTasks.some(
            (task) =>
              isDueToday(task.dueDate) && task.status !== "done"
          ) && (
            <p className="df-focus-blocks-note">
              Has work due today.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

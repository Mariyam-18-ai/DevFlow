import type { Project, Task } from "../../types";
import { EmptyState } from "../ui/EmptyState";
import { ProjectCard } from "./ProjectCard";

interface ProjectGridProps {
  projects: Project[];
  tasks: Task[];
  onProjectClick?: (
    projectId: string
  ) => void;
  highlightedProjectId?: string | null;
}

export function ProjectGrid({
  projects,
  tasks,
  onProjectClick,
  highlightedProjectId,
}: ProjectGridProps) {
  if (!projects.length) {
    return (
      <EmptyState
        title="No projects found"
        message="Try adjusting your search."
      />
    );
  }

  return (
    <div className="df-project-grid">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          tasks={tasks}
          onClick={onProjectClick}
          highlighted={
            project.id === highlightedProjectId
          }
        />
      ))}
    </div>
  );
}

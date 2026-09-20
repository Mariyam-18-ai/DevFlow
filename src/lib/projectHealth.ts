import type { Project, Task } from "../types";

export function getProjectTasks(
  projectId: string,
  tasks: Task[]
): Task[] {
  return tasks.filter(
    (task) => task.projectId === projectId
  );
}

export function getProjectProgress(
  projectId: string,
  tasks: Task[]
): number {
  const projectTasks = getProjectTasks(
    projectId,
    tasks
  );

  if (!projectTasks.length) return 0;

  const completed = projectTasks.filter(
    (task) => task.status === "done"
  ).length;

  return Math.round(
    (completed / projectTasks.length) * 100
  );
}

export function getProjectHealth(project: Project): "healthy" | "at-risk" | "blocked" {
  // Project health is persisted as part of the Project record. Task data
  // drives progress, but it must not overwrite the health selected by the
  // user in the project form.
  return project.health;
}

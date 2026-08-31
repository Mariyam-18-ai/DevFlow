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

export function getProjectHealth(
  project: Project,
  tasks: Task[]
): "healthy" | "at-risk" | "blocked" {
  const projectTasks = getProjectTasks(
    project.id,
    tasks
  );

  if (
    projectTasks.some(
      (task) =>
        task.status === "blocked" &&
        task.priority === "high"
    )
  ) {
    return "blocked";
  }

  if (
    projectTasks.some(
      (task) =>
        task.priority === "high" &&
        task.status !== "done"
    )
  ) {
    return "at-risk";
  }

  return "healthy";
}
import type { Project, Task } from "../types";
import { getProjectHealth } from "./projectHealth";
import { isDueToday, isDueTomorrow, isDueYesterday } from "./dateUtils";

export interface FocusReason {
  label: string;
  points: number;
}

export function getFocusReasons(
  task: Task,
  project?: Project,
  _allTasks: Task[] = []
): FocusReason[] {
  const reasons: FocusReason[] = [];

  if (task.priority === "high") {
    reasons.push({
      label: "High priority",
      points: 30,
    });
  }

  if (isDueYesterday(task.dueDate) && task.status !== "done") {
    reasons.push({
      label: "Overdue",
      points: 35,
    });
  } else if (
    isDueToday(task.dueDate) ||
    isDueTomorrow(task.dueDate)
  ) {
    reasons.push({
      label: `Due ${isDueToday(task.dueDate) ? "today" : "tomorrow"}`,
      points: 25,
    });
  }

  if (task.blocking) {
    reasons.push({
      label: "Blocks other work",
      points: 25,
    });
  }

  if (task.status === "in-progress") {
    reasons.push({
      label: "Already in progress",
      points: 10,
    });
  }

  // Use the persisted project health returned by the API. Task data
  // affects task scoring, but must not overwrite project.health.
  if (project) {
    const health = getProjectHealth(project);
    if (health !== "healthy") {
      reasons.push({
        label:
          health === "blocked"
            ? "Project is blocked"
            : "Project is at risk",
        points: 15,
      });
    }
  }

  return reasons;
}

export function getFocusScore(
  task: Task,
  project?: Project,
  _allTasks: Task[] = []
): number {
  const score = getFocusReasons(task, project, _allTasks).reduce(
    (total, reason) => total + reason.points,
    0
  );

  return Math.min(score, 100);
}

export function getBestNextTask(
  tasks: Task[],
  projects: Project[] = []
): Task | null {
  const activeTasks = tasks.filter(
    (task) => task.status !== "done"
  );

  if (!activeTasks.length) return null;

  const projectOf = (task: Task) =>
    projects.find((p) => p.id === task.projectId);

  return [...activeTasks].sort(
    (a, b) =>
      getFocusScore(b, projectOf(b), tasks) -
      getFocusScore(a, projectOf(a), tasks)
  )[0];
}

/**
 * Selects the tasks worth surfacing in the Today's Tasks section.
 * Prioritizes tasks due today, high priority, or already in progress;
 * falls back to other active tasks (ranked by the same focus score
 * used elsewhere) if none of those exist, so the section is never
 * emptier than it needs to be. Reuses getFocusScore rather than a
 * separate ranking system.
 */
export function getTodayTasks(
  tasks: Task[],
  projects: Project[] = [],
  excludeTaskId?: string | null,
  limit = 6
): Task[] {
  const projectOf = (task: Task) =>
    projects.find((p) => p.id === task.projectId);

  const activeTasks = tasks.filter(
    (task) => task.status !== "done" && task.id !== excludeTaskId
  );

  const priorityTasks = activeTasks.filter(
    (task) =>
      task.dueDate === "Today" ||
      task.priority === "high" ||
      task.status === "in-progress"
  );

  const pool = priorityTasks.length ? priorityTasks : activeTasks;

  return [...pool]
    .sort(
      (a, b) =>
        getFocusScore(b, projectOf(b), tasks) -
        getFocusScore(a, projectOf(a), tasks)
    )
    .slice(0, limit);
}

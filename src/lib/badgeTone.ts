import type { Priority, ProjectHealth, TaskStatus } from "../types";

export type BadgeTone = "amber" | "green" | "red" | "blue" | "muted";

/**
 * Single source of truth for priority -> badge tone mapping.
 * Mirrors the tone behavior previously duplicated across TaskCard,
 * FocusCard and TeamPulse.
 */
export function getPriorityTone(priority: Priority): BadgeTone {
  switch (priority) {
    case "high":
      return "red";
    case "medium":
      return "amber";
    case "low":
    default:
      return "muted";
  }
}

/**
 * Single source of truth for task status -> display label. Reused by
 * TaskCard and FlowMap so status text stays consistent everywhere.
 */
export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To do",
  "in-progress": "In progress",
  blocked: "Blocked",
  done: "Done",
};

/**
 * Single source of truth for task status -> badge tone mapping.
 * Mirrors the tone behavior previously duplicated across TaskCard
 * and TeamPulse.
 */
export function getStatusTone(status: TaskStatus): BadgeTone {
  switch (status) {
    case "done":
      return "green";
    case "in-progress":
      return "blue";
    case "blocked":
      return "red";
    case "todo":
    default:
      return "muted";
  }
}

/**
 * Single source of truth for project health -> badge tone mapping.
 * Mirrors the tone behavior previously duplicated across ProjectCard
 * and ProjectHealthMatrix.
 */
export function getHealthTone(health: ProjectHealth): BadgeTone {
  switch (health) {
    case "healthy":
      return "green";
    case "at-risk":
      return "amber";
    case "blocked":
    default:
      return "red";
  }
}

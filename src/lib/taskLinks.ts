import type { Task } from "../types";

/**
 * Finds the task that is most likely blocking the given task.
 * Heuristic: same project, marked as `blocking`, not itself, not done.
 * No explicit blockedBy field exists in the data model, so this is
 * derived rather than hardcoded.
 */
export function getBlockingTask(
  task: Task,
  tasks: Task[]
): Task | undefined {
  if (task.status !== "blocked") return undefined;

  return tasks.find(
    (candidate) =>
      candidate.id !== task.id &&
      candidate.projectId === task.projectId &&
      candidate.blocking &&
      candidate.status !== "done"
  );
}

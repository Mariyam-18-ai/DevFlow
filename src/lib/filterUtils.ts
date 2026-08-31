import type { Priority, Task } from "../types";
import type { TaskFilter } from "../components/tasks/TaskFilters";

export type PriorityFilter = Priority | "all";

export interface TaskFilterState {
  status: TaskFilter;
  priority: PriorityFilter;
}

export const DEFAULT_TASK_FILTER_STATE: TaskFilterState = {
  status: "all",
  priority: "all",
};

/**
 * Applies status + priority filters together (AND, not OR) — e.g.
 * status "in-progress" + priority "high" returns only tasks matching
 * both. This is the single place task filtering happens; callers
 * should not re-implement status/priority checks inline.
 */
export function filterTasks(
  tasks: Task[],
  filters: TaskFilterState
): Task[] {
  return tasks.filter((task) => {
    if (filters.status !== "all" && task.status !== filters.status) {
      return false;
    }

    if (
      filters.priority !== "all" &&
      task.priority !== filters.priority
    ) {
      return false;
    }

    return true;
  });
}

export function hasActiveTaskFilters(filters: TaskFilterState): boolean {
  return filters.status !== "all" || filters.priority !== "all";
}

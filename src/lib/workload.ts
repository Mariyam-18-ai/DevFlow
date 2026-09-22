import type { Task, User } from "../types";

export interface MemberStats {
  user: User;
  activeTasks: Task[];
  highPriorityTasks: Task[];
  blockedTasks: Task[];
  totalEstimatedHours: number;
}

/**
 * Derives real workload stats for a team member from actual task
 * assignment data — not the static `activeTasks` field on User, which
 * only ever reflects the initial mock snapshot and does not update as
 * tasks change status during the session.
 */
export function getMemberStats(user: User, tasks: Task[]): MemberStats {
  const ownTasks = tasks.filter((task) => task.assigneeId === user.id);
  const activeTasks = ownTasks.filter((task) => task.status !== "done");

  return {
    user,
    activeTasks,
    highPriorityTasks: activeTasks.filter((task) => task.priority === "high"),
    blockedTasks: activeTasks.filter((task) => task.status === "blocked"),
    totalEstimatedHours: activeTasks.reduce(
      (sum, task) => sum + task.estimatedHours,
      0
    ),
  };
}

export function getAllMemberStats(users: User[], tasks: Task[]): MemberStats[] {
  return users.map((user) => getMemberStats(user, tasks));
}

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

/**
 * Places each active task's estimated hours on its real due-date weekday.
 * This keeps the workload chart grounded in persisted task dates rather
 * than a synthetic distribution.
 */
export function getWeeklyLoad(user: User, tasks: Task[]): number[] {
  const stats = getMemberStats(user, tasks);
  const load = [0, 0, 0, 0, 0];

  stats.activeTasks.forEach((task) => {
    const day = new Date(`${task.dueDate}T00:00:00`).getDay();
    const weekdayIndex = day === 0 ? -1 : day - 1;
    if (weekdayIndex >= 0 && weekdayIndex < WEEKDAYS.length) {
      load[weekdayIndex] += task.estimatedHours;
    }
  });

  return load;
}

export type LoadLevel = 0 | 1 | 2 | 3;

/** Buckets raw hours into a 4-step visual load level. */
export function loadLevel(hours: number): LoadLevel {
  if (hours <= 0) return 0;
  if (hours <= 2) return 1;
  if (hours <= 4) return 2;
  return 3;
}

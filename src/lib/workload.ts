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
 * Spreads a member's active-task estimated hours across the work week.
 * Deterministic (based on task id, not random) so the chart is stable
 * across renders: each active task lands on one weekday derived from
 * its id, contributing its estimated hours to that day's load.
 */
export function getWeeklyLoad(user: User, tasks: Task[]): number[] {
  const stats = getMemberStats(user, tasks);
  const load = [0, 0, 0, 0, 0];

  stats.activeTasks.forEach((task) => {
    const dayIndex = hashToIndex(task.id, WEEKDAYS.length);
    load[dayIndex] += task.estimatedHours;
  });

  return load;
}

function hashToIndex(value: string, bucketCount: number): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash % bucketCount;
}

export type LoadLevel = 0 | 1 | 2 | 3;

/** Buckets raw hours into a 4-step visual load level. */
export function loadLevel(hours: number): LoadLevel {
  if (hours <= 0) return 0;
  if (hours <= 2) return 1;
  if (hours <= 4) return 2;
  return 3;
}

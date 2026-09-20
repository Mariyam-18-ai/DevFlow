import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Project, Task, User } from "../types";

export type DashboardStatus = "loading" | "success" | "error";

export interface DashboardData {
  users: User[];
  projects: Project[];
  tasks: Task[];
}

function normalizeDueDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === tomorrow.getTime()) return "Tomorrow";
  if (date.getTime() === yesterday.getTime()) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
  });
}

function normalizeTask(task: Task): Task {
  return {
    ...task,
    dueDate: normalizeDueDate(task.dueDate),
  };
}

export function useDashboardData() {
  const [status, setStatus] =
    useState<DashboardStatus>("loading");

  const [data, setData] = useState<DashboardData>({
    users: [],
    projects: [],
    tasks: [],
  });

  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const [users, projects, tasks] =
        await Promise.all([
          api.users.getAll(),
          api.projects.getAll(),
          api.tasks.getAll(),
        ]);

      setData({
        users: users as User[],
        projects: projects as Project[],
        tasks: (tasks as Task[]).map(normalizeTask),
      });

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard data."
      );
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const retry = () => {
    void loadData();
  };

  return {
    status,
    data,
    error,
    retry,
  };
}

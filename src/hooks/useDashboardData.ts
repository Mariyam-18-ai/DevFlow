import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Project, Task, User } from "../types";

export type DashboardStatus = "loading" | "success" | "error";

export interface DashboardData {
  users: User[];
  projects: Project[];
  tasks: Task[];
}

interface UseDashboardDataResult {
  data: DashboardData;
  status: DashboardStatus;
  error: string | null;
  retry: () => void;
}

export function useDashboardData(
  enabled = true
): UseDashboardDataResult {
  const [status, setStatus] =
    useState<DashboardStatus>("loading");

  const [data, setData] = useState<DashboardData>({
    users: [],
    projects: [],
    tasks: [],
  });

  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const [users, projects, tasks] = await Promise.all([
        api.users.getAll(),
        api.projects.getAll(),
        api.tasks.getAll(),
      ]);

      setData({
        users: users as User[],
        projects: projects as Project[],
        tasks: tasks as Task[],
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
  }, [enabled]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const retry = useCallback(() => {
    void loadData();
  }, [loadData]);

  return {
    data,
    status,
    error,
    retry,
  };
}
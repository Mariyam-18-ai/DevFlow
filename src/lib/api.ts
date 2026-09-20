const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://devflow-api-tmeu.onrender.com/api";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: {
    count?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !result.success) {
    throw new Error(
      result.error?.message ||
        `Request failed with status ${response.status}`
    );
  }

  return result.data as T;
}

export const api = {
  users: {
    getAll: () => apiRequest("/users"),

    getById: (id: string) =>
      apiRequest(`/users/${id}`),

    create: (user: {
      name: string;
      role: string;
      initials: string;
      activeTasks: number;
    }) =>
      apiRequest("/users", {
        method: "POST",
        body: JSON.stringify(user),
      }),

    update: (
      id: string,
      user: {
        name: string;
        role: string;
        initials: string;
        activeTasks: number;
      }
    ) =>
      apiRequest(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(user),
      }),

    delete: (id: string) =>
      apiRequest<void>(`/users/${id}`, {
        method: "DELETE",
      }),
  },

  projects: {
    getAll: () => apiRequest("/projects"),

    getById: (id: string) =>
      apiRequest(`/projects/${id}`),

    create: (project: {
      name: string;
      description: string;
      ownerId: string;
      color: string;
      health: "healthy" | "at-risk" | "blocked";
    }) =>
      apiRequest("/projects", {
        method: "POST",
        body: JSON.stringify(project),
      }),

    update: (
      id: string,
      project: {
        name: string;
        description: string;
        ownerId: string;
        color: string;
        health: "healthy" | "at-risk" | "blocked";
      }
    ) =>
      apiRequest(`/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify(project),
      }),

    delete: (id: string) =>
      apiRequest<void>(`/projects/${id}`, {
        method: "DELETE",
      }),
  },

  tasks: {
    getAll: () => apiRequest("/tasks"),

    getById: (id: string) =>
      apiRequest(`/tasks/${id}`),

    create: (task: {
      title: string;
      description: string;
      projectId: string;
      assigneeId: string;
      status: "todo" | "in-progress" | "blocked" | "done";
      priority: "high" | "medium" | "low";
      dueDate: string;
      estimatedHours: number;
      blocking: boolean;
    }) =>
      apiRequest("/tasks", {
        method: "POST",
        body: JSON.stringify(task),
      }),

    update: (
      id: string,
      task: {
        title: string;
        description: string;
        projectId: string;
        assigneeId: string;
        status: "todo" | "in-progress" | "blocked" | "done";
        priority: "high" | "medium" | "low";
        dueDate: string;
        estimatedHours: number;
        blocking: boolean;
      }
    ) =>
      apiRequest(`/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(task),
      }),

    updateStatus: (
      id: string,
      status: "todo" | "in-progress" | "blocked" | "done"
    ) =>
      apiRequest(`/tasks/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),

    delete: (id: string) =>
      apiRequest<void>(`/tasks/${id}`, {
        method: "DELETE",
      }),
  },
};

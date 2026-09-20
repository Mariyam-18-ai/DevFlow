const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://devflow-api-tmeu.onrender.com/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    count?: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !result.success) {
    throw new Error(
      result.error?.message || `Request failed with status ${response.status}`
    );
  }

  return result.data;
}

export const api = {
  users: {
    getAll: () => apiRequest("/users"),
    getById: (id: string) => apiRequest(`/users/${id}`),
    create: (data: unknown) =>
      apiRequest("/users", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: unknown) =>
      apiRequest(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest(`/users/${id}`, {
        method: "DELETE",
      }),
  },

  projects: {
    getAll: () => apiRequest("/projects"),
    getById: (id: string) => apiRequest(`/projects/${id}`),
    create: (data: unknown) =>
      apiRequest("/projects", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: unknown) =>
      apiRequest(`/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest(`/projects/${id}`, {
        method: "DELETE",
      }),
  },

  tasks: {
    getAll: (query = "") => apiRequest(`/tasks${query}`),
    getById: (id: string) => apiRequest(`/tasks/${id}`),
    create: (data: unknown) =>
      apiRequest("/tasks", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: unknown) =>
      apiRequest(`/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, status: string) =>
      apiRequest(`/tasks/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    delete: (id: string) =>
      apiRequest(`/tasks/${id}`, {
        method: "DELETE",
      }),
  },
};
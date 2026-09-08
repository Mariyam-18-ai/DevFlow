export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR", details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export interface User {
  id: string;
  name: string;
  role: string;
  initials: string;
  activeTasks: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  color: string;
  health: "healthy" | "at-risk" | "blocked";
}

export interface Task {
  id: string;
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

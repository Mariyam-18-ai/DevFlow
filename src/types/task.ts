export type TaskStatus = "todo" | "in-progress" | "blocked" | "done";

export type Priority = "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  estimatedHours: number;
  blocking: boolean;
}
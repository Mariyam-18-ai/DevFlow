export type ActivityType =
  | "completed"
  | "started"
  | "blocked"
  | "created";

export interface Activity {
  id: string;
  userId: string;
  taskId?: string;
  type: ActivityType;
  message: string;
  timestamp: string;
}
import type { Activity } from "../types";

export const mockActivity: Activity[] = [
  {
    id: "a1",
    userId: "u1",
    taskId: "t1",
    type: "started",
    message: 'started "Map old billing fields to new schema"',
    timestamp: "1h ago",
  },
  {
    id: "a2",
    userId: "u5",
    taskId: "t8",
    type: "completed",
    message: 'completed "Write migration tests"',
    timestamp: "2h ago",
  },
  {
    id: "a3",
    userId: "u3",
    taskId: "t5",
    type: "blocked",
    message: 'blocked "Coordinate cutover with ops"',
    timestamp: "3h ago",
  },
  {
    id: "a4",
    userId: "u4",
    taskId: "t7",
    type: "completed",
    message: 'completed "Review mobile navigation"',
    timestamp: "5h ago",
  },
  {
    id: "a5",
    userId: "u2",
    taskId: "t3",
    type: "created",
    message: 'created "Wire up focus score utility"',
    timestamp: "Yesterday",
  },
];
import { randomUUID } from "crypto";
import { Task } from "../types/index.js";
import { userRepository } from "./userRepository.js";
import { projectRepository } from "./projectRepository.js";

export type CreateTaskInput = Omit<Task, "id">;
export type UpdateTaskInput = Omit<Task, "id">;

export interface TaskFilter {
  status?: Task["status"];
  priority?: Task["priority"];
  projectId?: string;
  assigneeId?: string;
  search?: string;
}

const projectIds = projectRepository.findAll().map((p) => p.id);
const userIds = userRepository.findAll().map((u) => u.id);

const tasks: Task[] = [
  {
    id: randomUUID(),
    title: "Design login screen",
    description: "Create wireframes and high-fidelity mockups for login",
    projectId: projectIds[0]!,
    assigneeId: userIds[0]!,
    status: "todo",
    priority: "medium",
    dueDate: "2026-09-20",
    estimatedHours: 6,
    blocking: false,
  },
  {
    id: randomUUID(),
    title: "Build auth API",
    description: "Implement backend authentication endpoints",
    projectId: projectIds[1]!,
    assigneeId: userIds[1]!,
    status: "in-progress",
    priority: "high",
    dueDate: "2026-09-15",
    estimatedHours: 12,
    blocking: true,
  },
  {
    id: randomUUID(),
    title: "Write API documentation",
    description: "Document all REST endpoints for the DevFlow backend",
    projectId: projectIds[1]!,
    assigneeId: userIds[2]!,
    status: "todo",
    priority: "low",
    dueDate: "2026-09-25",
    estimatedHours: 4,
    blocking: false,
  },
  {
    id: randomUUID(),
    title: "Fix dashboard rendering bug",
    description: "Resolve layout issue on the project dashboard",
    projectId: projectIds[0]!,
    assigneeId: userIds[1]!,
    status: "blocked",
    priority: "high",
    dueDate: "2026-09-12",
    estimatedHours: 3,
    blocking: true,
  },
  {
    id: randomUUID(),
    title: "Set up CI pipeline",
    description: "Configure automated build and test pipeline",
    projectId: projectIds[0]!,
    assigneeId: userIds[2]!,
    status: "done",
    priority: "medium",
    dueDate: "2026-09-01",
    estimatedHours: 8,
    blocking: false,
  },
];

export const taskRepository = {
  findAll(filter?: TaskFilter): Task[] {
    if (!filter) return tasks;
    return tasks.filter((t) => {
      if (filter.status && t.status !== filter.status) return false;
      if (filter.priority && t.priority !== filter.priority) return false;
      if (filter.projectId && t.projectId !== filter.projectId) return false;
      if (filter.assigneeId && t.assigneeId !== filter.assigneeId) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        if (!t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  },

  findById(id: string): Task | undefined {
    return tasks.find((t) => t.id === id);
  },

  create(input: CreateTaskInput): Task {
    const task: Task = { id: randomUUID(), ...input };
    tasks.push(task);
    return task;
  },

  update(id: string, input: UpdateTaskInput): Task | undefined {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return undefined;
    const updated: Task = { id, ...input };
    tasks[index] = updated;
    return updated;
  },

  updateStatus(id: string, status: Task["status"]): Task | undefined {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return undefined;
    tasks[index] = { ...tasks[index]!, status };
    return tasks[index];
  },

  delete(id: string): boolean {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return false;
    tasks.splice(index, 1);
    return true;
  },
};

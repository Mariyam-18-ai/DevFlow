import { Task } from "../types/index.js";
import { prisma } from "../lib/prisma.js";

export type CreateTaskInput = Omit<Task, "id">;
export type UpdateTaskInput = Omit<Task, "id">;

export interface TaskFilter {
  status?: Task["status"];
  priority?: Task["priority"];
  projectId?: string;
  assigneeId?: string;
  search?: string;
}

function toDatabaseStatus(
  status: Task["status"]
): "todo" | "in_progress" | "blocked" | "done" {
  return status === "in-progress" ? "in_progress" : status;
}

function toTask(task: {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  status: "todo" | "in_progress" | "blocked" | "done";
  priority: "high" | "medium" | "low";
  dueDate: Date;
  estimatedHours: number;
  blocking: boolean;
}): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    projectId: task.projectId,
    assigneeId: task.assigneeId,
    status: task.status === "in_progress" ? "in-progress" : task.status,
    priority: task.priority,
    dueDate: task.dueDate.toISOString().split("T")[0]!,
    estimatedHours: task.estimatedHours,
    blocking: task.blocking,
  };
}

export const taskRepository = {
  async findAll(filter?: TaskFilter): Promise<Task[]> {
    const tasks = await prisma.task.findMany({
      where: {
        ...(filter?.status
          ? { status: toDatabaseStatus(filter.status) }
          : {}),
        ...(filter?.priority ? { priority: filter.priority } : {}),
        ...(filter?.projectId ? { projectId: filter.projectId } : {}),
        ...(filter?.assigneeId ? { assigneeId: filter.assigneeId } : {}),
        ...(filter?.search
          ? {
              OR: [
                {
                  title: {
                    contains: filter.search,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: filter.search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "asc" },
    });

    return tasks.map(toTask);
  },

  async findById(id: string): Promise<Task | undefined> {
    const task = await prisma.task.findUnique({
      where: { id },
    });

    return task ? toTask(task) : undefined;
  },

  async create(input: CreateTaskInput): Promise<Task> {
    const task = await prisma.task.create({
      data: {
        title: input.title,
        description: input.description,
        projectId: input.projectId,
        assigneeId: input.assigneeId,
        status: toDatabaseStatus(input.status),
        priority: input.priority,
        dueDate: new Date(input.dueDate),
        estimatedHours: input.estimatedHours,
        blocking: input.blocking,
      },
    });

    return toTask(task);
  },

  async update(
    id: string,
    input: UpdateTaskInput
  ): Promise<Task | undefined> {
    const existing = await prisma.task.findUnique({
      where: { id },
    });

    if (!existing) return undefined;

    const task = await prisma.task.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        projectId: input.projectId,
        assigneeId: input.assigneeId,
        status: toDatabaseStatus(input.status),
        priority: input.priority,
        dueDate: new Date(input.dueDate),
        estimatedHours: input.estimatedHours,
        blocking: input.blocking,
      },
    });

    return toTask(task);
  },

  async updateStatus(
    id: string,
    status: Task["status"]
  ): Promise<Task | undefined> {
    const existing = await prisma.task.findUnique({
      where: { id },
    });

    if (!existing) return undefined;

    const task = await prisma.task.update({
      where: { id },
      data: {
        status: toDatabaseStatus(status),
      },
    });

    return toTask(task);
  },

  async delete(id: string): Promise<boolean> {
    const existing = await prisma.task.findUnique({
      where: { id },
    });

    if (!existing) return false;

    await prisma.task.delete({
      where: { id },
    });

    return true;
  },
};
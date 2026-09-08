import { z } from "zod";

const statusEnum = z.enum(["todo", "in-progress", "blocked", "done"]);
const priorityEnum = z.enum(["high", "medium", "low"]);

export const taskInputSchema = z.object({
  title: z.string().trim().min(1, "title is required"),
  description: z.string().trim().min(1, "description is required"),
  projectId: z.string().trim().min(1, "projectId is required"),
  assigneeId: z.string().trim().min(1, "assigneeId is required"),
  status: statusEnum,
  priority: priorityEnum,
  dueDate: z.string().trim().min(1, "dueDate is required"),
  estimatedHours: z.number().nonnegative("estimatedHours must be non-negative"),
  blocking: z.boolean(),
});

export const taskStatusSchema = z.object({
  status: statusEnum,
});

export const taskFilterSchema = z.object({
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  projectId: z.string().trim().min(1).optional(),
  assigneeId: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
});

export type TaskInput = z.infer<typeof taskInputSchema>;

import { z } from "zod";

export const userInputSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  role: z.string().trim().min(1, "role is required"),
  initials: z.string().trim().min(1, "initials is required"),
  activeTasks: z.number().int().nonnegative("activeTasks must be a non-negative integer"),
});

export type UserInput = z.infer<typeof userInputSchema>;

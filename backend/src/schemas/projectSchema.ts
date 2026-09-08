import { z } from "zod";

export const projectInputSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  description: z.string().trim().min(1, "description is required"),
  ownerId: z.string().trim().min(1, "ownerId is required"),
  color: z.string().trim().min(1, "color is required"),
  health: z.enum(["healthy", "at-risk", "blocked"]),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;

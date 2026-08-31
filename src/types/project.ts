export type ProjectHealth = "healthy" | "at-risk" | "blocked";

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  color: string;
  health: ProjectHealth;
}
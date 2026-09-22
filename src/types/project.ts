export type ProjectHealth = "healthy" | "at-risk" | "blocked";
export type Workspace = "Engineering" | "Design" | "Personal";

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  color: string;
  health: ProjectHealth;
  workspace: Workspace;
}
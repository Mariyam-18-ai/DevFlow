import { randomUUID } from "crypto";
import { Project } from "../types/index.js";
import { userRepository } from "./userRepository.js";

export type CreateProjectInput = Omit<Project, "id">;
export type UpdateProjectInput = Omit<Project, "id">;

const ownerIds = userRepository.findAll().map((u) => u.id);

const projects: Project[] = [
  {
    id: randomUUID(),
    name: "DevFlow Platform",
    description: "Internal task and project tracking tool",
    ownerId: ownerIds[0]!,
    color: "#4F46E5",
    health: "healthy",
  },
  {
    id: randomUUID(),
    name: "API Migration",
    description: "Migrate legacy endpoints to the new backend",
    ownerId: ownerIds[1]!,
    color: "#F59E0B",
    health: "at-risk",
  },
];

export const projectRepository = {
  findAll(): Project[] {
    return projects;
  },

  findById(id: string): Project | undefined {
    return projects.find((p) => p.id === id);
  },

  create(input: CreateProjectInput): Project {
    const project: Project = { id: randomUUID(), ...input };
    projects.push(project);
    return project;
  },

  update(id: string, input: UpdateProjectInput): Project | undefined {
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) return undefined;
    const updated: Project = { id, ...input };
    projects[index] = updated;
    return updated;
  },

  delete(id: string): boolean {
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) return false;
    projects.splice(index, 1);
    return true;
  },
};

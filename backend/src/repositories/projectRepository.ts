import { AppError, Project } from "../types/index.js";
import { prisma } from "../lib/prisma.js";

export type CreateProjectInput = Omit<Project, "id">;
export type UpdateProjectInput = Omit<Project, "id">;

function toProject(project: {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  color: string;
  health: "healthy" | "at_risk" | "blocked";
}): Project {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    ownerId: project.ownerId,
    color: project.color,
    health: project.health === "at_risk" ? "at-risk" : project.health,
  };
}

function toDatabaseHealth(
  health: Project["health"]
): "healthy" | "at_risk" | "blocked" {
  return health === "at-risk" ? "at_risk" : health;
}

export const projectRepository = {
  async findAll(): Promise<Project[]> {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "asc" },
    });

    return projects.map(toProject);
  },

  async findById(id: string): Promise<Project | undefined> {
    const project = await prisma.project.findUnique({
      where: { id },
    });

    return project ? toProject(project) : undefined;
  },

  async create(input: CreateProjectInput): Promise<Project> {
    const project = await prisma.project.create({
      data: {
        ...input,
        health: toDatabaseHealth(input.health),
      },
    });

    return toProject(project);
  },

  async update(
    id: string,
    input: UpdateProjectInput
  ): Promise<Project | undefined> {
    const existing = await prisma.project.findUnique({
      where: { id },
    });

    if (!existing) return undefined;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...input,
        health: toDatabaseHealth(input.health),
      },
    });

    return toProject(project);
  },

  async delete(id: string): Promise<boolean> {
    const existing = await prisma.project.findUnique({
      where: { id },
    });

    if (!existing) return false;

    try {
      await prisma.project.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Foreign key constraint")
      ) {
        throw new AppError(
          "Project cannot be deleted because it still has tasks.",
          409,
          "PROJECT_HAS_DEPENDENCIES"
        );
      }

      throw error;
    }

    return true;
  },
};
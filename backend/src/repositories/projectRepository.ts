import { prisma } from "../lib/prisma.js";
import { Project } from "../types/index.js";

type Workspace = "Engineering" | "Design" | "Personal";

type ProjectHealth = "healthy" | "at-risk" | "blocked";

/**
 * Input used when creating a project.
 * This matches projectInputSchema and projectService.
 */
export type CreateProjectInput = {
  name: string;
  description: string;
  ownerId: string;
  color: string;
  health: ProjectHealth;
  workspace: Workspace;
};

/**
 * Input used when updating a project.
 *
 * ownerId is intentionally included because the existing
 * projectService validates that the owner exists before updating.
 */
export type UpdateProjectInput = {
  name: string;
  description: string;
  ownerId: string;
  color: string;
  health: ProjectHealth;
  workspace: Workspace;
};

/**
 * Convert application health to Prisma/database health.
 *
 * Application:
 *   at-risk
 *
 * Database:
 *   at_risk
 */
function toDatabaseHealth(
  health: ProjectHealth
): "healthy" | "at_risk" | "blocked" {
  switch (health) {
    case "at-risk":
      return "at_risk";

    case "blocked":
      return "blocked";

    case "healthy":
    default:
      return "healthy";
  }
}

/**
 * Convert Prisma/database health to application health.
 */
function toDomainHealth(
  health: string
): ProjectHealth {
  switch (health) {
    case "at_risk":
      return "at-risk";

    case "blocked":
      return "blocked";

    case "healthy":
    default:
      return "healthy";
  }
}

/**
 * Convert a Prisma project into the application's Project type.
 */
function toProject(project: {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  color: string;
  health: string;
  workspace: string;
}): Project {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    ownerId: project.ownerId,
    color: project.color,
    health: toDomainHealth(project.health),
    workspace: project.workspace as Workspace,
  };
}

/**
 * Project repository
 */
export const projectRepository = {
  /**
   * Get all projects.
   */
  async findAll(): Promise<Project[]> {
    const projects = await prisma.project.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });

    return projects.map(toProject);
  },

  /**
   * Get a project by ID.
   */
  async findById(id: string): Promise<Project | undefined> {
    const project = await prisma.project.findUnique({
      where: {
        id,
      },
    });

    if (!project) {
      return undefined;
    }

    return toProject(project);
  },

  /**
   * Get projects owned by a user.
   */
  async findByOwnerId(ownerId: string): Promise<Project[]> {
    const projects = await prisma.project.findMany({
      where: {
        ownerId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return projects.map(toProject);
  },

  /**
   * Create a project.
   */
  async create(
    input: CreateProjectInput
  ): Promise<Project> {
    const project = await prisma.project.create({
      data: {
        name: input.name,
        description: input.description,
        ownerId: input.ownerId,
        color: input.color,
        health: toDatabaseHealth(input.health),
        workspace: input.workspace,
      },
    });

    return toProject(project);
  },

  /**
   * Update a project.
   *
   * Returns undefined when the project does not exist.
   * This matches projectService's existing contract.
   */
  async update(
    id: string,
    input: UpdateProjectInput
  ): Promise<Project | undefined> {
    const existing = await prisma.project.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return undefined;
    }

    const project = await prisma.project.update({
      where: {
        id,
      },
      data: {
        name: input.name,
        description: input.description,
        ownerId: input.ownerId,
        color: input.color,
        health: toDatabaseHealth(input.health),
        workspace: input.workspace,
      },
    });

    return toProject(project);
  },

  /**
   * Delete a project.
   *
   * Returns true when deleted and false when it did not exist.
   * This matches projectService's existing contract.
   */
  async delete(id: string): Promise<boolean> {
    const existing = await prisma.project.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return false;
    }

    // A project owns its tasks. Remove those tasks first because the
    // database relation intentionally uses Restrict rather than cascade.
    // This keeps deletion deterministic and prevents stale/orphaned work
    // from appearing in Team, Insights, search, or AI context.
    await prisma.$transaction(async (tx) => {
      await tx.task.deleteMany({ where: { projectId: id } });
      await tx.project.delete({ where: { id } });
    });

    return true;
  },
};

/**
 * Named exports kept for compatibility with any existing imports.
 */

export async function findAllProjects(): Promise<Project[]> {
  return projectRepository.findAll();
}

export async function findProjectById(
  id: string
): Promise<Project | undefined> {
  return projectRepository.findById(id);
}

export async function findProjectsByOwnerId(
  ownerId: string
): Promise<Project[]> {
  return projectRepository.findByOwnerId(ownerId);
}

export async function createProject(
  input: CreateProjectInput
): Promise<Project> {
  return projectRepository.create(input);
}

export async function updateProject(
  id: string,
  input: UpdateProjectInput
): Promise<Project | undefined> {
  return projectRepository.update(id, input);
}

export async function deleteProject(
  id: string
): Promise<boolean> {
  return projectRepository.delete(id);
}
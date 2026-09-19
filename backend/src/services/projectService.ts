import { AppError, Project } from "../types/index.js";
import {
  projectRepository,
  CreateProjectInput,
  UpdateProjectInput,
} from "../repositories/projectRepository.js";
import { userRepository } from "../repositories/userRepository.js";

async function assertOwnerExists(ownerId: string): Promise<void> {
  const owner = await userRepository.findById(ownerId);

  if (!owner) {
    throw new AppError(
      `Owner not found: ${ownerId}`,
      404,
      "OWNER_NOT_FOUND"
    );
  }
}

export const projectService = {
  async getAll(): Promise<Project[]> {
    return await projectRepository.findAll();
  },

  async getById(id: string): Promise<Project> {
    const project = await projectRepository.findById(id);

    if (!project) {
      throw new AppError(
        `Project not found: ${id}`,
        404,
        "NOT_FOUND"
      );
    }

    return project;
  },

  async create(input: CreateProjectInput): Promise<Project> {
    await assertOwnerExists(input.ownerId);

    return await projectRepository.create(input);
  },

  async update(
    id: string,
    input: UpdateProjectInput
  ): Promise<Project> {
    await assertOwnerExists(input.ownerId);

    const updated = await projectRepository.update(id, input);

    if (!updated) {
      throw new AppError(
        `Project not found: ${id}`,
        404,
        "NOT_FOUND"
      );
    }

    return updated;
  },

  async delete(id: string): Promise<void> {
    const deleted = await projectRepository.delete(id);

    if (!deleted) {
      throw new AppError(
        `Project not found: ${id}`,
        404,
        "NOT_FOUND"
      );
    }
  },
};
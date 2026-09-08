import { AppError, Project } from "../types/index.js";
import { projectRepository, CreateProjectInput, UpdateProjectInput } from "../repositories/projectRepository.js";
import { userRepository } from "../repositories/userRepository.js";

function assertOwnerExists(ownerId: string): void {
  if (!userRepository.findById(ownerId)) {
    throw new AppError(`Owner not found: ${ownerId}`, 404, "OWNER_NOT_FOUND");
  }
}

export const projectService = {
  getAll(): Project[] {
    return projectRepository.findAll();
  },

  getById(id: string): Project {
    const project = projectRepository.findById(id);
    if (!project) {
      throw new AppError(`Project not found: ${id}`, 404, "NOT_FOUND");
    }
    return project;
  },

  create(input: CreateProjectInput): Project {
    assertOwnerExists(input.ownerId);
    return projectRepository.create(input);
  },

  update(id: string, input: UpdateProjectInput): Project {
    assertOwnerExists(input.ownerId);
    const updated = projectRepository.update(id, input);
    if (!updated) {
      throw new AppError(`Project not found: ${id}`, 404, "NOT_FOUND");
    }
    return updated;
  },

  delete(id: string): void {
    const deleted = projectRepository.delete(id);
    if (!deleted) {
      throw new AppError(`Project not found: ${id}`, 404, "NOT_FOUND");
    }
  },
};

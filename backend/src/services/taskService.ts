import { AppError, Task } from "../types/index.js";
import { taskRepository, CreateTaskInput, UpdateTaskInput, TaskFilter } from "../repositories/taskRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { projectRepository } from "../repositories/projectRepository.js";

function assertProjectExists(projectId: string): void {
  if (!projectRepository.findById(projectId)) {
    throw new AppError(`Project not found: ${projectId}`, 404, "PROJECT_NOT_FOUND");
  }
}

function assertAssigneeExists(assigneeId: string): void {
  if (!userRepository.findById(assigneeId)) {
    throw new AppError(`Assignee not found: ${assigneeId}`, 404, "ASSIGNEE_NOT_FOUND");
  }
}

export const taskService = {
  getAll(filter?: TaskFilter): Task[] {
    return taskRepository.findAll(filter);
  },

  getById(id: string): Task {
    const task = taskRepository.findById(id);
    if (!task) {
      throw new AppError(`Task not found: ${id}`, 404, "NOT_FOUND");
    }
    return task;
  },

  create(input: CreateTaskInput): Task {
    assertProjectExists(input.projectId);
    assertAssigneeExists(input.assigneeId);
    return taskRepository.create(input);
  },

  update(id: string, input: UpdateTaskInput): Task {
    assertProjectExists(input.projectId);
    assertAssigneeExists(input.assigneeId);
    const updated = taskRepository.update(id, input);
    if (!updated) {
      throw new AppError(`Task not found: ${id}`, 404, "NOT_FOUND");
    }
    return updated;
  },

  updateStatus(id: string, status: Task["status"]): Task {
    const updated = taskRepository.updateStatus(id, status);
    if (!updated) {
      throw new AppError(`Task not found: ${id}`, 404, "NOT_FOUND");
    }
    return updated;
  },

  delete(id: string): void {
    const deleted = taskRepository.delete(id);
    if (!deleted) {
      throw new AppError(`Task not found: ${id}`, 404, "NOT_FOUND");
    }
  },
};

import { AppError, Task } from "../types/index.js";
import {
  taskRepository,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilter,
} from "../repositories/taskRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { projectRepository } from "../repositories/projectRepository.js";

async function assertProjectExists(projectId: string): Promise<void> {
  if (!(await projectRepository.findById(projectId))) {
    throw new AppError(
      `Project not found: ${projectId}`,
      404,
      "PROJECT_NOT_FOUND"
    );
  }
}

async function assertAssigneeExists(assigneeId: string): Promise<void> {
  if (!(await userRepository.findById(assigneeId))) {
    throw new AppError(
      `Assignee not found: ${assigneeId}`,
      404,
      "ASSIGNEE_NOT_FOUND"
    );
  }
}

export const taskService = {
  async getAll(filter?: TaskFilter): Promise<Task[]> {
    return taskRepository.findAll(filter);
  },

  async getById(id: string): Promise<Task> {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new AppError(`Task not found: ${id}`, 404, "NOT_FOUND");
    }
    return task;
  },

  async create(input: CreateTaskInput): Promise<Task> {
    await assertProjectExists(input.projectId);
    await assertAssigneeExists(input.assigneeId);
    return taskRepository.create(input);
  },

  async update(
    id: string,
    input: UpdateTaskInput
  ): Promise<Task> {
    await assertProjectExists(input.projectId);
    await assertAssigneeExists(input.assigneeId);
    const updated = await taskRepository.update(id, input);
    if (!updated) {
      throw new AppError(`Task not found: ${id}`, 404, "NOT_FOUND");
    }
    return updated;
  },

  async updateStatus(
    id: string,
    status: Task["status"]
  ): Promise<Task> {
    const updated = await taskRepository.updateStatus(id, status);
    if (!updated) {
      throw new AppError(`Task not found: ${id}`, 404, "NOT_FOUND");
    }
    return updated;
  },

  async delete(id: string): Promise<void> {
    const deleted = await taskRepository.delete(id);
    if (!deleted) {
      throw new AppError(`Task not found: ${id}`, 404, "NOT_FOUND");
    }
  },
};

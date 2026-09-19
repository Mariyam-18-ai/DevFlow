import { AppError, User } from "../types/index.js";
import {
  userRepository,
  CreateUserInput,
  UpdateUserInput,
} from "../repositories/userRepository.js";

export const userService = {
  async getAll(): Promise<User[]> {
    return await userRepository.findAll();
  },

  async getById(id: string): Promise<User> {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new AppError(`User not found: ${id}`, 404, "NOT_FOUND");
    }

    return user;
  },

  async create(input: CreateUserInput): Promise<User> {
    return await userRepository.create(input);
  },

  async update(
    id: string,
    input: UpdateUserInput
  ): Promise<User> {
    const updated = await userRepository.update(id, input);

    if (!updated) {
      throw new AppError(`User not found: ${id}`, 404, "NOT_FOUND");
    }

    return updated;
  },

  async delete(id: string): Promise<void> {
    const deleted = await userRepository.delete(id);

    if (!deleted) {
      throw new AppError(`User not found: ${id}`, 404, "NOT_FOUND");
    }
  },
};
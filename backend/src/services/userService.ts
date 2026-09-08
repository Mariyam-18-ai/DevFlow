import { AppError, User } from "../types/index.js";
import { userRepository, CreateUserInput, UpdateUserInput } from "../repositories/userRepository.js";

export const userService = {
  getAll(): User[] {
    return userRepository.findAll();
  },

  getById(id: string): User {
    const user = userRepository.findById(id);
    if (!user) {
      throw new AppError(`User not found: ${id}`, 404, "NOT_FOUND");
    }
    return user;
  },

  create(input: CreateUserInput): User {
    return userRepository.create(input);
  },

  update(id: string, input: UpdateUserInput): User {
    const updated = userRepository.update(id, input);
    if (!updated) {
      throw new AppError(`User not found: ${id}`, 404, "NOT_FOUND");
    }
    return updated;
  },

  delete(id: string): void {
    const deleted = userRepository.delete(id);
    if (!deleted) {
      throw new AppError(`User not found: ${id}`, 404, "NOT_FOUND");
    }
  },
};

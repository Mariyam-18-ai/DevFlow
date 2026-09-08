import { randomUUID } from "crypto";
import { User } from "../types/index.js";

export type CreateUserInput = Omit<User, "id">;
export type UpdateUserInput = Omit<User, "id">;

const users: User[] = [
  { id: randomUUID(), name: "Ava Patel", role: "Frontend Engineer", initials: "AP", activeTasks: 3 },
  { id: randomUUID(), name: "Liam Chen", role: "Backend Engineer", initials: "LC", activeTasks: 5 },
  { id: randomUUID(), name: "Sofia Ramirez", role: "Product Manager", initials: "SR", activeTasks: 2 },
];

export const userRepository = {
  findAll(): User[] {
    return users;
  },

  findById(id: string): User | undefined {
    return users.find((u) => u.id === id);
  },

  create(input: CreateUserInput): User {
    const user: User = { id: randomUUID(), ...input };
    users.push(user);
    return user;
  },

  update(id: string, input: UpdateUserInput): User | undefined {
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;
    const updated: User = { id, ...input };
    users[index] = updated;
    return updated;
  },

  delete(id: string): boolean {
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    users.splice(index, 1);
    return true;
  },
};

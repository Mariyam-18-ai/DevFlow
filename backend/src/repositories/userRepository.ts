import { AppError, User } from "../types/index.js";
import { prisma } from "../lib/prisma.js";

export type CreateUserInput = Omit<User, "id">;
export type UpdateUserInput = Omit<User, "id">;

function toUser(user: {
  id: string;
  name: string;
  role: string;
  initials: string;
  activeTasks: number;
}): User {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    initials: user.initials,
    activeTasks: user.activeTasks,
  };
}

export const userRepository = {
  async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
    });

    return users.map(toUser);
  },

  async findById(id: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user ? toUser(user) : undefined;
  },

  async create(input: CreateUserInput): Promise<User> {
    const user = await prisma.user.create({
      data: input,
    });

    return toUser(user);
  },

  async update(id: string, input: UpdateUserInput): Promise<User | undefined> {
    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) return undefined;

    const user = await prisma.user.update({
      where: { id },
      data: input,
    });

    return toUser(user);
  },

  async delete(id: string): Promise<boolean> {
  const existing = await prisma.user.findUnique({
    where: { id },
  });

  if (!existing) {
    return false;
  }

  try {
    await prisma.user.delete({
      where: { id },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Foreign key constraint")
    ) {
      throw new AppError(
        "User cannot be deleted because it is still referenced by projects or tasks.",
        409,
        "USER_HAS_DEPENDENCIES"
      );
    }

    throw error;
  }

  return true;
},
};
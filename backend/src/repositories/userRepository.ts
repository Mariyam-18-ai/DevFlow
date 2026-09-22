import { User } from "../types/index.js";
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

    const activeTaskCounts = await Promise.all(
      users.map(async (user) => ({
        id: user.id,
        count: await prisma.task.count({
          where: {
            assigneeId: user.id,
            status: { not: "done" },
          },
        }),
      }))
    );

    const counts = new Map(
      activeTaskCounts.map((entry) => [entry.id, entry.count])
    );

    return users.map((user) =>
      toUser({
        ...user,
        activeTasks: counts.get(user.id) ?? 0,
      })
    );
  },

  async findById(id: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) return undefined;

    const activeTasks = await prisma.task.count({
      where: {
        assigneeId: user.id,
        status: { not: "done" },
      },
    });

    return toUser({
      ...user,
      activeTasks,
    });
  },

  async create(input: CreateUserInput): Promise<User> {
    const user = await prisma.user.create({
      data: input,
    });

    const activeTasks = await prisma.task.count({
      where: {
        assigneeId: user.id,
        status: { not: "done" },
      },
    });

    return toUser({
      ...user,
      activeTasks,
    });
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

    const activeTasks = await prisma.task.count({
      where: {
        assigneeId: user.id,
        status: { not: "done" },
      },
    });

    return toUser({
      ...user,
      activeTasks,
    });
  },

  async delete(id: string): Promise<boolean> {
    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return false;
    }

    // Keep the workspace consistent when a member is removed. Tasks assigned
    // to the member and projects owned by the member cannot remain as hidden
    // foreign-key records, so remove the dependent records in one transaction.
    await prisma.$transaction(async (tx) => {
      const ownedProjects = await tx.project.findMany({
        where: { ownerId: id },
        select: { id: true },
      });

      const ownedProjectIds = ownedProjects.map((project) => project.id);

      if (ownedProjectIds.length > 0) {
        await tx.task.deleteMany({
          where: { projectId: { in: ownedProjectIds } },
        });
      }

      await tx.task.deleteMany({ where: { assigneeId: id } });

      if (ownedProjectIds.length > 0) {
        await tx.project.deleteMany({
          where: { id: { in: ownedProjectIds } },
        });
      }

      await tx.user.delete({ where: { id } });
    });

    return true;
  },
}
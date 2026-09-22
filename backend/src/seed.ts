import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

function getDueDate(label: string): Date {
  const today = new Date();

  const date = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  switch (label) {
    case "Yesterday":
      date.setDate(date.getDate() - 1);
      break;

    case "Today":
      break;

    case "Tomorrow":
      date.setDate(date.getDate() + 1);
      break;

    case "Monday":
    case "Thursday":
    case "Friday": {
      const targetDays: Record<string, number> = {
        Monday: 1,
        Thursday: 4,
        Friday: 5,
      };

      const targetDay = targetDays[label];
      const currentDay = date.getDay();

      let difference = (targetDay - currentDay + 7) % 7;

      if (difference === 0) {
        difference = 7;
      }

      date.setDate(date.getDate() + difference);
      break;
    }

    default:
      throw new Error(`Unknown due date: ${label}`);
  }

  return date;
}

async function main() {
  console.log("Seeding database...");

  // Clear existing records first.
  // Order matters because of foreign-key relationships.
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // -------------------------
  // USERS
  // -------------------------

  await prisma.user.createMany({
    data: [
      {
        id: "u1",
        name: "Arjun Mehta",
        role: "Full Stack Developer",
        initials: "AM",
        activeTasks: 5,
      },
      {
        id: "u2",
        name: "Sara Khan",
        role: "Frontend Developer",
        initials: "SK",
        activeTasks: 4,
      },
      {
        id: "u3",
        name: "Rohan Patel",
        role: "Backend Developer",
        initials: "RP",
        activeTasks: 6,
      },
      {
        id: "u4",
        name: "Aisha Verma",
        role: "Product Designer",
        initials: "AV",
        activeTasks: 3,
      },
      {
        id: "u5",
        name: "Kabir Singh",
        role: "QA Engineer",
        initials: "KS",
        activeTasks: 2,
      },
    ],
  });

  // -------------------------
  // PROJECTS
  // -------------------------

  await prisma.project.createMany({
    data: [
      {
        id: "p1",
        name: "DevFlow Dashboard",
        description:
          "Internal productivity workspace for the engineering team.",
        ownerId: "u1",
        color: "amber",
        health: "healthy",
        workspace: "Engineering",
      },
      {
        id: "p2",
        name: "Billing Migration",
        description:
          "Migration of legacy billing workflows to the new schema.",
        ownerId: "u3",
        color: "blue",
        health: "at_risk",
        workspace: "Engineering",
      },
      {
        id: "p3",
        name: "Mobile Onboarding",
        description:
          "Redesign of the first-time mobile user experience.",
        ownerId: "u4",
        color: "violet",
        health: "healthy",
        workspace: "Design",
      },
      {
        id: "p4",
        name: "API Reliability",
        description:
          "Improving service reliability and monitoring.",
        ownerId: "u2",
        color: "emerald",
        health: "blocked",
        workspace: "Engineering",
      },
    ],
  });

  // -------------------------
  // TASKS
  // -------------------------

  const tasks = [
    {
      id: "t1",
      title: "Map old billing fields to new schema",
      description:
        "Complete the field mapping required for the billing migration.",
      projectId: "p2",
      assigneeId: "u1",
      status: "in_progress" as const,
      priority: "high" as const,
      dueDate: "Today",
      estimatedHours: 3,
      blocking: true,
    },
    {
      id: "t2",
      title: "Build ProjectCard component",
      description:
        "Create the reusable project card used across the dashboard.",
      projectId: "p1",
      assigneeId: "u1",
      status: "in_progress" as const,
      priority: "high" as const,
      dueDate: "Today",
      estimatedHours: 2,
      blocking: false,
    },
    {
      id: "t3",
      title: "Wire up focus score utility",
      description:
        "Connect the recommendation score to dashboard tasks.",
      projectId: "p1",
      assigneeId: "u2",
      status: "todo" as const,
      priority: "high" as const,
      dueDate: "Tomorrow",
      estimatedHours: 2,
      blocking: false,
    },
    {
      id: "t4",
      title: "Prototype onboarding flow",
      description:
        "Create the first version of the mobile onboarding experience.",
      projectId: "p3",
      assigneeId: "u4",
      status: "todo" as const,
      priority: "medium" as const,
      dueDate: "Friday",
      estimatedHours: 4,
      blocking: false,
    },
    {
      id: "t5",
      title: "Coordinate cutover with ops",
      description:
        "Confirm the migration cutover plan with operations.",
      projectId: "p2",
      assigneeId: "u3",
      status: "blocked" as const,
      priority: "high" as const,
      dueDate: "Today",
      estimatedHours: 2,
      blocking: true,
    },
    {
      id: "t6",
      title: "Update API health checks",
      description:
        "Add reliability checks to the API monitoring flow.",
      projectId: "p4",
      assigneeId: "u2",
      status: "todo" as const,
      priority: "medium" as const,
      dueDate: "Thursday",
      estimatedHours: 3,
      blocking: false,
    },
    {
      id: "t7",
      title: "Review mobile navigation",
      description:
        "Review the responsive navigation implementation.",
      projectId: "p3",
      assigneeId: "u5",
      status: "done" as const,
      priority: "low" as const,
      dueDate: "Yesterday",
      estimatedHours: 1,
      blocking: false,
    },
    {
      id: "t8",
      title: "Write migration tests",
      description:
        "Add regression coverage for the billing migration.",
      projectId: "p2",
      assigneeId: "u5",
      status: "done" as const,
      priority: "medium" as const,
      dueDate: "Yesterday",
      estimatedHours: 2,
      blocking: false,
    },
    {
      id: "t9",
      title: "Audit empty states",
      description:
        "Check empty and loading experiences across the dashboard.",
      projectId: "p1",
      assigneeId: "u4",
      status: "todo" as const,
      priority: "low" as const,
      dueDate: "Monday",
      estimatedHours: 2,
      blocking: false,
    },
    {
      id: "t10",
      title: "Fix authentication edge case",
      description:
        "Resolve an authentication issue affecting returning users.",
      projectId: "p4",
      assigneeId: "u3",
      status: "blocked" as const,
      priority: "high" as const,
      dueDate: "Tomorrow",
      estimatedHours: 3,
      blocking: true,
    },
  ];

  await prisma.task.createMany({
    data: tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      assigneeId: task.assigneeId,
      status: task.status,
      priority: task.priority,
      dueDate: getDueDate(task.dueDate),
      estimatedHours: task.estimatedHours,
      blocking: task.blocking,
    })),
  });

  console.log("Database seeded successfully.");
  console.log("Users: 5");
  console.log("Projects: 4");
  console.log("Tasks: 10");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
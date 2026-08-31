import type { Project } from "../types";

export const mockProjects: Project[] = [
  {
    id: "p1",
    name: "DevFlow Dashboard",
    description:
      "Internal productivity workspace for the engineering team.",
    ownerId: "u1",
    color: "amber",
    health: "healthy",
  },
  {
    id: "p2",
    name: "Billing Migration",
    description:
      "Migration of legacy billing workflows to the new schema.",
    ownerId: "u3",
    color: "blue",
    health: "at-risk",
  },
  {
    id: "p3",
    name: "Mobile Onboarding",
    description:
      "Redesign of the first-time mobile user experience.",
    ownerId: "u4",
    color: "violet",
    health: "healthy",
  },
  {
    id: "p4",
    name: "API Reliability",
    description:
      "Improving service reliability and monitoring.",
    ownerId: "u2",
    color: "emerald",
    health: "blocked",
  },
];
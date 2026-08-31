import type { User } from "../types";

export const mockUsers: User[] = [
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
];

export const currentUser = mockUsers[0];
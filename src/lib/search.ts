import type { Project, Task, User } from "../types";
import { getProjectHealth } from "./projectHealth";

export function searchProjects(
  projects: Project[],
  query: string,
  tasks: Task[] = []
): Project[] {
  const normalized = query
    .trim()
    .toLowerCase();

  if (!normalized) {
    return projects;
  }

  return projects.filter((project) => {
    // Matches the same computed health (lib/projectHealth) that
    // ProjectCard, ProjectHealthMatrix and the Next Best Action
    // reasoning already use, rather than the static mock field, so
    // searching e.g. "blocked" finds the same projects those views
    // currently show as blocked.
    const health = getProjectHealth(project, tasks);

    return (
      project.name
        .toLowerCase()
        .includes(normalized) ||
      project.description
        .toLowerCase()
        .includes(normalized) ||
      health
        .toLowerCase()
        .includes(normalized)
    );
  });
}

export function searchTasks(
  tasks: Task[],
  query: string,
  users: User[] = []
): Task[] {
  const normalized = query
    .trim()
    .toLowerCase();

  if (!normalized) {
    return tasks;
  }

  return tasks.filter((task) => {
    const assignee = users.find(
      (user) => user.id === task.assigneeId
    );

    return (
      task.title
        .toLowerCase()
        .includes(normalized) ||
      task.description
        .toLowerCase()
        .includes(normalized) ||
      task.priority
        .toLowerCase()
        .includes(normalized) ||
      task.status
        .toLowerCase()
        .includes(normalized) ||
      // Matching the assignee lets a "person" result from
      // searchAll/searchUsers surface that person's tasks when
      // selected, without a second, parallel filtering system.
      assignee?.name.toLowerCase().includes(normalized) ||
      assignee?.role.toLowerCase().includes(normalized) ||
      false
    );
  });
}

export function searchUsers(
  users: User[],
  query: string
): User[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return users;
  }

  return users.filter(
    (user) =>
      user.name.toLowerCase().includes(normalized) ||
      user.role.toLowerCase().includes(normalized)
  );
}

export interface GroupedSearchResults {
  tasks: Task[];
  projects: Project[];
  people: User[];
  total: number;
}

const MAX_RESULTS_PER_GROUP = 5;

/**
 * Single entry point for the command palette: reuses the same
 * per-entity search functions the rest of the app already relies on,
 * grouped and capped for a compact dropdown.
 */
export function searchAll(
  query: string,
  tasks: Task[],
  projects: Project[],
  users: User[]
): GroupedSearchResults {
  const normalized = query.trim();

  if (!normalized) {
    return { tasks: [], projects: [], people: [], total: 0 };
  }

  const matchedTasks = searchTasks(tasks, normalized, users).slice(
    0,
    MAX_RESULTS_PER_GROUP
  );
  const matchedProjects = searchProjects(projects, normalized, tasks).slice(
    0,
    MAX_RESULTS_PER_GROUP
  );
  const matchedPeople = searchUsers(users, normalized).slice(
    0,
    MAX_RESULTS_PER_GROUP
  );

  return {
    tasks: matchedTasks,
    projects: matchedProjects,
    people: matchedPeople,
    total:
      matchedTasks.length +
      matchedProjects.length +
      matchedPeople.length,
  };
}
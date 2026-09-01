import type { Project, Task, User } from "../../types";
import { searchAll } from "../../lib/search";
import { mockActivity } from "../../data/mockActivity";

interface CommandPaletteProps {
  query: string;
  tasks: Task[];
  projects: Project[];
  users: User[];
  onSelectResult: (
    type: "task" | "project" | "person",
    id: string,
    label: string
  ) => void;
}

/**
 * Search results dropdown for tasks, projects and people.
 *
 * Selecting a result tells the parent what kind of result was selected
 * and which specific item was clicked so navigation can go to the
 * appropriate page.
 */
export function CommandPalette({
  query,
  tasks,
  projects,
  users,
  onSelectResult,
}: CommandPaletteProps) {
  const trimmed = query.trim();

  if (!trimmed) {
    const recent = mockActivity.slice(0, 4);

    return (
      <div
        className="df-command-palette"
        role="listbox"
        aria-label="Search results"
      >
        <div className="df-command-group">
          <span className="df-command-group-label">Recent</span>

          {recent.map((item) => {
            const relatedTask = item.taskId
              ? tasks.find((task) => task.id === item.taskId)
              : undefined;

            return (
              <button
                type="button"
                key={item.id}
                className="df-command-item"
                role="option"
                onMouseDown={(e) => {
                  e.preventDefault();

                  if (relatedTask) {
                    onSelectResult(
                      "task",
                      relatedTask.id,
                      relatedTask.title
                    );
                  }
                }}
              >
                <span className="df-command-item-title">
                  {item.message}
                </span>

                <span className="df-command-item-subtitle">
                  {item.timestamp}
                </span>
              </button>
            );
          })}
        </div>

        <div className="df-command-empty">
          Type to search tasks, projects and people.
        </div>
      </div>
    );
  }

  const results = searchAll(trimmed, tasks, projects, users);

  return (
    <div
      className="df-command-palette"
      role="listbox"
      aria-label="Search results"
    >
      {results.total === 0 && (
        <div className="df-command-empty">
          No results found for &ldquo;{query}&rdquo;
        </div>
      )}

      {results.tasks.length > 0 && (
        <div className="df-command-group">
          <span className="df-command-group-label">Tasks</span>

          {results.tasks.map((task) => {
            const project = projects.find(
              (p) => p.id === task.projectId
            );

            return (
              <button
                type="button"
                key={task.id}
                className="df-command-item"
                role="option"
                onMouseDown={(e) => {
                  e.preventDefault();

                  onSelectResult(
                    "task",
                    task.id,
                    task.title
                  );
                }}
              >
                <span className="df-command-item-title">
                  {task.title}
                </span>

                <span className="df-command-item-subtitle">
                  {project?.name ?? "No project"}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {results.projects.length > 0 && (
        <div className="df-command-group">
          <span className="df-command-group-label">Projects</span>

          {results.projects.map((project) => (
            <button
              type="button"
              key={project.id}
              className="df-command-item"
              role="option"
              onMouseDown={(e) => {
                e.preventDefault();

                onSelectResult(
                  "project",
                  project.id,
                  project.name
                );
              }}
            >
              <span className="df-command-item-title">
                {project.name}
              </span>

              <span className="df-command-item-subtitle">
                {project.description}
              </span>
            </button>
          ))}
        </div>
      )}

      {results.people.length > 0 && (
        <div className="df-command-group">
          <span className="df-command-group-label">People</span>

          {results.people.map((person) => (
            <button
              type="button"
              key={person.id}
              className="df-command-item"
              role="option"
              onMouseDown={(e) => {
                e.preventDefault();

                onSelectResult(
                  "person",
                  person.id,
                  person.name
                );
              }}
            >
              <span className="df-command-item-title">
                {person.name}
              </span>

              <span className="df-command-item-subtitle">
                {person.role}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
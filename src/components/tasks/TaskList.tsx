import type { Project, Task } from "../../types";
import { EmptyState } from "../ui/EmptyState";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  allTasks: Task[];
  projects: Project[];
  onToggle: (taskId: string) => void;
  onFocus?: (taskId: string) => void;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  emptyTitle?: string;
  emptyMessage?: string;
}

export function TaskList({
  tasks,
  allTasks,
  projects,
  onToggle,
  onFocus,
  hasActiveFilters = false,
  onResetFilters,
  emptyTitle = "No matching work found",
  emptyMessage = "Try changing your search or filters.",
}: TaskListProps) {
  if (!tasks.length) {
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
        action={
          hasActiveFilters && onResetFilters
            ? "Clear filters"
            : undefined
        }
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="df-task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          project={projects.find(
            (project) => project.id === task.projectId
          )}
          allTasks={allTasks}
          onToggle={onToggle}
          onFocus={onFocus}
        />
      ))}
    </div>
  );
}

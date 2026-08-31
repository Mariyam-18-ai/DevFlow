import type { Project, Task } from "../../types";
import {
  TaskFilters,
  type TaskFilter,
} from "../tasks/TaskFilters";
import { TaskList } from "../tasks/TaskList";
import { ProjectGrid } from "./ProjectGrid";
import {
  DEFAULT_TASK_FILTER_STATE,
  filterTasks,
  hasActiveTaskFilters,
  type PriorityFilter,
  type TaskFilterState,
} from "../../lib/filterUtils";

interface WorkOverviewProps {
  projects: Project[];
  tasks: Task[];
  allTasks: Task[];
  filters: TaskFilterState;
  onFiltersChange: (filters: TaskFilterState) => void;
  onTaskToggle: (taskId: string) => void;
  onTaskFocus?: (taskId: string) => void;
  onProjectClick?: (projectId: string) => void;
  highlightedProjectId?: string | null;
}

export function WorkOverview({
  projects,
  tasks,
  allTasks,
  filters,
  onFiltersChange,
  onTaskToggle,
  onTaskFocus,
  onProjectClick,
  highlightedProjectId,
}: WorkOverviewProps) {
  // Search already narrowed `tasks` upstream (in Dashboard); status +
  // priority filters combine with AND via the shared filterUtils helper.
  const filteredTasks = filterTasks(tasks, filters);

  function handleStatusChange(status: TaskFilter) {
    onFiltersChange({ ...filters, status });
  }

  function handlePriorityChange(priority: PriorityFilter) {
    onFiltersChange({ ...filters, priority });
  }

  function handleResetFilters() {
    onFiltersChange(DEFAULT_TASK_FILTER_STATE);
  }

  return (
    <div className="df-work-overview">
      <section
        className="df-work-section"
        id="projects-section"
      >
        <div className="df-section-heading">
          <div>
            <span className="df-eyebrow">
              PROJECTS
            </span>

            <h2>Your active work</h2>

            <p>
              Keep projects moving without losing
              sight of the next important task.
            </p>
          </div>
        </div>

        <ProjectGrid
          projects={projects}
          tasks={allTasks}
          onProjectClick={onProjectClick}
          highlightedProjectId={highlightedProjectId}
        />
      </section>

      <section className="df-work-section">
        <div className="df-section-heading df-section-heading-row">
          <div>
            <span className="df-eyebrow">
              TASKS
            </span>

            <h2>Today's tasks</h2>
          </div>

          <TaskFilters
            active={filters.status}
            onChange={handleStatusChange}
            activePriority={filters.priority}
            onPriorityChange={handlePriorityChange}
          />
        </div>

        <TaskList
          tasks={filteredTasks}
          allTasks={allTasks}
          projects={projects}
          onToggle={onTaskToggle}
          onFocus={onTaskFocus}
          hasActiveFilters={hasActiveTaskFilters(filters)}
          onResetFilters={handleResetFilters}
        />
      </section>
    </div>
  );
}

import { Chip } from "../ui/Chip";
import type { Priority } from "../../types";
import type { PriorityFilter } from "../../lib/filterUtils";

export type TaskFilter =
  | "all"
  | "todo"
  | "in-progress"
  | "blocked"
  | "done";

interface TaskFiltersProps {
  active: TaskFilter;
  onChange: (filter: TaskFilter) => void;
  activePriority: PriorityFilter;
  onPriorityChange: (priority: PriorityFilter) => void;
}

const statusFilters: {
  id: TaskFilter;
  label: string;
}[] = [
  {
    id: "all",
    label: "All",
  },
  {
    id: "todo",
    label: "To do",
  },
  {
    id: "in-progress",
    label: "In progress",
  },
  {
    id: "blocked",
    label: "Blocked",
  },
  {
    id: "done",
    label: "Completed",
  },
];

const priorityFilters: {
  id: PriorityFilter;
  label: string;
}[] = [
  { id: "all", label: "All priority" },
  { id: "high" as Priority, label: "High" },
  { id: "medium" as Priority, label: "Medium" },
  { id: "low" as Priority, label: "Low" },
];

export function TaskFilters({
  active,
  onChange,
  activePriority,
  onPriorityChange,
}: TaskFiltersProps) {
  return (
    <div className="df-filter-group">
      <div className="df-filter-row">
        {statusFilters.map((filter) => (
          <Chip
            key={filter.id}
            active={active === filter.id}
            onClick={() => onChange(filter.id)}
          >
            {filter.label}
          </Chip>
        ))}
      </div>

      <div className="df-filter-row">
        {priorityFilters.map((filter) => (
          <Chip
            key={filter.id}
            active={activePriority === filter.id}
            onClick={() => onPriorityChange(filter.id)}
          >
            {filter.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}

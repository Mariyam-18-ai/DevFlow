import type { Task, TaskStatus } from "../../types";
import { EmptyState } from "../ui/EmptyState";

interface FlowVelocityProps {
  tasks: Task[];
}

const SEGMENTS: { status: TaskStatus; label: string; className: string }[] = [
  { status: "done", label: "Done", className: "is-done" },
  { status: "in-progress", label: "In progress", className: "is-progress" },
  { status: "blocked", label: "Blocked", className: "is-blocked" },
  { status: "todo", label: "To do", className: "is-todo" },
];

/**
 * A single stacked bar over all tasks, sized by real counts — answers
 * "how much work is actually moving vs. stuck" at a glance, plus two
 * derived call-out numbers (completion rate, blocked rate).
 */
export function FlowVelocity({ tasks }: FlowVelocityProps) {
  if (tasks.length === 0) {
    return (
      <section className="df-flow-velocity">
        <div className="df-section-heading">
          <div>
            <span className="df-eyebrow">FLOW VELOCITY</span>
            <h2>How work is moving this week</h2>
          </div>
        </div>

        <EmptyState
          title="No task data yet"
          message="Flow velocity will appear once tasks exist."
        />
      </section>
    );
  }

  const total = tasks.length || 1;
  const counts = SEGMENTS.map((segment) => ({
    ...segment,
    count: tasks.filter((task) => task.status === segment.status).length,
  }));

  const completionRate = Math.round(
    (counts.find((c) => c.status === "done")!.count / total) * 100
  );
  const blockedRate = Math.round(
    (counts.find((c) => c.status === "blocked")!.count / total) * 100
  );

  return (
    <section className="df-flow-velocity">
      <div className="df-section-heading">
        <div>
          <span className="df-eyebrow">FLOW VELOCITY</span>
          <h2>How work is moving this week</h2>
          <p>{completionRate}% done · {blockedRate}% blocked, across {tasks.length} tasks.</p>
        </div>
      </div>

      <div className="df-velocity-bar">
        {counts.map(
          (segment) =>
            segment.count > 0 && (
              <div
                key={segment.status}
                className={`df-velocity-segment ${segment.className}`}
                style={{ width: `${(segment.count / total) * 100}%` }}
                title={`${segment.label}: ${segment.count}`}
              />
            )
        )}
      </div>

      <div className="df-velocity-legend">
        {counts.map((segment) => (
          <span key={segment.status}>
            <i className={`df-velocity-dot ${segment.className}`} />
            {segment.label}
            <strong>{segment.count}</strong>
          </span>
        ))}
      </div>
    </section>
  );
}

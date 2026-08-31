import type { Task, User } from "../../types";
import { WEEKDAYS, getWeeklyLoad, loadLevel } from "../../lib/workload";
import { EmptyState } from "../ui/EmptyState";

interface WorkloadChartProps {
  users: User[];
  tasks: Task[];
}

const LEVEL_LABEL = ["No load", "Light", "Moderate", "Heavy"];

/**
 * "ENGINEERING LOAD" grid: one row per person, one cell per weekday.
 * Cell fill/level is derived from real estimated-hours-on-active-tasks
 * data (see lib/workload), not decorative — it answers "who is
 * overloaded this week and on which day."
 */
export function WorkloadChart({ users, tasks }: WorkloadChartProps) {
  if (users.length === 0) {
    return (
      <div className="df-workload-chart">
        <div className="df-section-heading">
          <div>
            <span className="df-eyebrow">ENGINEERING LOAD</span>
            <h2>Who's carrying what this week</h2>
          </div>
        </div>
        <EmptyState
          title="No team members"
          message="Workload will appear once people are added."
        />
      </div>
    );
  }

  return (
    <div className="df-workload-chart">
      <div className="df-section-heading df-workload-header">
        <div>
          <span className="df-eyebrow">ENGINEERING LOAD</span>
          <h2>Who's carrying what this week</h2>
        </div>
        <div className="df-workload-days">
          {WEEKDAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
      </div>

      <div className="df-workload-rows">
        {users.map((user) => {
          const load = getWeeklyLoad(user, tasks);
          return (
            <div className="df-workload-row" key={user.id}>
              <span className="df-workload-name">{user.name.split(" ")[0]}</span>
              <div className="df-workload-cells">
                {load.map((hours, index) => {
                  const level = loadLevel(hours);
                  return (
                    <span
                      key={WEEKDAYS[index]}
                      className={`df-workload-cell df-level-${level}`}
                      title={`${user.name} · ${WEEKDAYS[index]}: ${
                        hours > 0 ? `${hours}h scheduled (${LEVEL_LABEL[level]})` : "No load"
                      }`}
                      aria-label={`${user.name} on ${WEEKDAYS[index]}: ${LEVEL_LABEL[level]}`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="df-workload-legend">
        {LEVEL_LABEL.map((label, index) => (
          <span key={label}>
            <i className={`df-workload-cell df-level-${index}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

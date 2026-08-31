import type { Activity } from "../../types";
import { EmptyState } from "../ui/EmptyState";

interface ActivityFeedProps {
  activity: Activity[];
}

const typeIcon: Record<Activity["type"], string> = {
  completed: "✓",
  started: "▶",
  blocked: "⊘",
  created: "+",
};

export function ActivityFeed({ activity }: ActivityFeedProps) {
  return (
    <section className="df-activity-feed">
      <div className="df-section-heading">
        <div>
          <span className="df-eyebrow">ACTIVITY</span>
          <h2>Recent moves</h2>
        </div>
      </div>

      {activity.length === 0 ? (
        <EmptyState
          title="No activity yet"
          message="Actions like starting or completing tasks will show up here."
        />
      ) : (
        <ul className="df-activity-list">
          {activity.slice(0, 6).map((item) => (
            <li key={item.id} className="df-activity-item">
              <span
                className={`df-activity-icon df-activity-${item.type}`}
              >
                {typeIcon[item.type]}
              </span>
              <div>
                <p>{item.message}</p>
                <span>{item.timestamp}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

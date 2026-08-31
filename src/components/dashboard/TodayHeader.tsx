import type { User } from "../../types";

interface TodayHeaderProps {
  user: User;
  activeCount: number;
  blockedCount: number;
  dueTodayCount: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function TodayHeader({
  user,
  activeCount,
  blockedCount,
  dueTodayCount,
}: TodayHeaderProps) {
  const firstName = user.name.split(" ")[0];

  return (
    <section className="df-today-header">
      <div>
        <span className="df-eyebrow">TODAY</span>
        <span className="df-today-date">{getFormattedDate()}</span>
        <h1>
          {getGreeting()}, {firstName}
        </h1>
        <p>Here's what needs your attention today.</p>
      </div>

      <div className="df-today-stats">
        <div className="df-stat-chip">
          <strong>{activeCount}</strong>
          <span>Active tasks</span>
        </div>

        <div className="df-stat-chip is-danger">
          <strong>{blockedCount}</strong>
          <span>Blocked</span>
        </div>

        <div className="df-stat-chip is-amber">
          <strong>{dueTodayCount}</strong>
          <span>Due today</span>
        </div>
      </div>
    </section>
  );
}

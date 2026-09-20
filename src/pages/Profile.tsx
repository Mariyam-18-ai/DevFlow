import { PageShell } from "../components/layout/PageShell";
import type { Project, Task, User } from "../types";

interface ProfileProps {
  tasks: Task[];
  projects: Project[];
  currentUser: User | null;
}

export function Profile({ tasks, projects, currentUser }: ProfileProps) {
  if (!currentUser) {
    return (
      <PageShell
        eyebrow="ACCOUNT · PROFILE"
        title="Profile"
        description="Your role and current engineering workload."
      >
        <section className="df-profile-page-card">
          <span className="df-eyebrow">LIVE WORKSPACE</span>
          <h2>Profile unavailable</h2>
          <p>Live user data is still loading.</p>
        </section>
      </PageShell>
    );
  }

  const completed = tasks.filter(
    (task) => task.assigneeId === currentUser.id && task.status === "done"
  ).length;
  const active = tasks.filter(
    (task) => task.assigneeId === currentUser.id && task.status !== "done"
  ).length;
  const ownedProjects = projects.filter(
    (project) => project.ownerId === currentUser.id
  ).length;

  return (
    <PageShell
      eyebrow="ACCOUNT · PROFILE"
      title={currentUser.name}
      description="Your role and current engineering workload."
    >
      <section className="df-profile-page-card">
        <div className="df-profile-page-header">
          <div className="df-avatar df-avatar-large">{currentUser.initials}</div>
          <div>
            <span className="df-eyebrow">DEVELOPER PROFILE</span>
            <h2>{currentUser.role}</h2>
          </div>
        </div>
        <div className="df-profile-stats">
          <div><strong>{active}</strong><span>Active tasks</span></div>
          <div><strong>{completed}</strong><span>Completed tasks</span></div>
          <div><strong>{ownedProjects}</strong><span>Owned projects</span></div>
        </div>
      </section>
    </PageShell>
  );
}

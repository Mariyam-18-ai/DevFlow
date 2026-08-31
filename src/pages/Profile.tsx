import { PageShell } from "../components/layout/PageShell";
import { currentUser } from "../data/mockUsers";
import { mockProjects } from "../data/mockProjects";
import type { Task } from "../types";

interface ProfileProps {
  /** Live task state (mirrored from Dashboard via App) so completions
   * made during the session are reflected here immediately, instead
   * of reading the static mock snapshot. */
  tasks: Task[];
}

export function Profile({ tasks }: ProfileProps) {
  const completed = tasks.filter((task) => task.assigneeId === currentUser.id && task.status === "done").length;
  const active = tasks.filter((task) => task.assigneeId === currentUser.id && task.status !== "done").length;
  const ownedProjects = mockProjects.filter((project) => project.ownerId === currentUser.id).length;

  return (
    <PageShell eyebrow="ACCOUNT · PROFILE" title={currentUser.name} description="Your role and current engineering workload.">
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

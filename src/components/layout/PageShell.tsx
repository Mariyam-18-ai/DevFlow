import type { ReactNode } from "react";

interface PageShellProps {
  title?: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
}

export function PageShell({
  title,
  eyebrow,
  description,
  children,
}: PageShellProps) {
  return (
    <main className="df-page">
      {title && (
        <div className="df-page-heading">
          <div>
            {eyebrow && (
              <span className="df-eyebrow">
                {eyebrow}
              </span>
            )}

            <h1>{title}</h1>

            {description && (
              <p>{description}</p>
            )}
          </div>
        </div>
      )}

      {children}
    </main>
  );
}

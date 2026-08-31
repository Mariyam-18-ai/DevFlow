import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  tone?: "amber" | "green" | "red" | "blue" | "muted";
}

export function Badge({
  children,
  tone = "muted",
}: BadgeProps) {
  return (
    <span className={`df-badge df-badge-${tone}`}>
      {children}
    </span>
  );
}
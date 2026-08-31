import type { ReactNode } from "react";

interface ChipProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function Chip({
  children,
  active = false,
  onClick,
}: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`df-chip ${active ? "is-active" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
import { Button } from "./Button";

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = "Nothing here yet",
  message = "Try changing your filters or create your first task.",
  action,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="df-state">
      <div className="df-state-icon">○</div>

      <strong>{title}</strong>

      <span>{message}</span>

      {action && (
        <Button
          variant="secondary"
          onClick={onAction}
        >
          {action}
        </Button>
      )}
    </div>
  );
}
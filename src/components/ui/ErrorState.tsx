import { Button } from "./Button";

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function ErrorState({
  message = "We couldn't load this view.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="df-state df-error-state">
      <div className="df-state-icon">!</div>

      <strong>Something went wrong</strong>

      <span>{message}</span>

      <Button
        variant="secondary"
        onClick={onRetry}
      >
        Retry
      </Button>
    </div>
  );
}
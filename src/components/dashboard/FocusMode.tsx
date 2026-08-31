import { useEffect, useRef, useState } from "react";
import type { Project, Task } from "../../types";

const FOCUS_SECONDS = 25 * 60;

interface FocusModeProps {
  task: Task;
  project?: Project;
  onClose: () => void;
  onMarkComplete: (taskId: string) => void;
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
}

export function FocusMode({
  task,
  project,
  onClose,
  onMarkComplete,
}: FocusModeProps) {
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setIsRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // Standard dialog behavior: Escape closes it, same as the profile
  // menu and command palette elsewhere in the app.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isDone = secondsLeft === 0;
  const progress =
    ((FOCUS_SECONDS - secondsLeft) / FOCUS_SECONDS) * 100;

  return (
    <div className="df-focus-mode-overlay">
      <div
        className="df-focus-mode"
        role="dialog"
        aria-modal="true"
        aria-label="Focus session"
      >
        <button
          type="button"
          className="df-focus-mode-close"
          onClick={onClose}
          aria-label="Close focus session"
        >
          ×
        </button>

        <span className="df-eyebrow">FOCUS SESSION</span>

        <h2>{task.title}</h2>
        <p>{project?.name ?? "Your workspace"}</p>

        <div className="df-focus-mode-ring">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle
              cx="60"
              cy="60"
              r="52"
              className="df-focus-mode-ring-bg"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              className="df-focus-mode-ring-value"
              strokeDasharray={2 * Math.PI * 52}
              strokeDashoffset={
                2 * Math.PI * 52 * (1 - progress / 100)
              }
            />
          </svg>
          <span className="df-focus-mode-timer">
            {formatTime(secondsLeft)}
          </span>
        </div>

        {isDone ? (
          <p className="df-focus-mode-done">
            Session complete. Nice work.
          </p>
        ) : (
          <p className="df-focus-mode-hint">
            {isRunning ? "Stay with it." : "Ready when you are."}
          </p>
        )}

        <div className="df-focus-mode-actions">
          {!isDone && !isRunning && (
            <button
              type="button"
              className="df-button df-button-primary df-button-sm"
              onClick={() => setIsRunning(true)}
            >
              {secondsLeft === FOCUS_SECONDS ? "Start" : "Resume"}
            </button>
          )}

          {!isDone && isRunning && (
            <button
              type="button"
              className="df-button df-button-secondary df-button-sm"
              onClick={() => setIsRunning(false)}
            >
              Pause
            </button>
          )}

          <button
            type="button"
            className="df-button df-button-ghost df-button-sm"
            onClick={() => {
              setIsRunning(false);
              setSecondsLeft(FOCUS_SECONDS);
            }}
          >
            Reset
          </button>

          <button
            type="button"
            className="df-button df-button-secondary df-button-sm"
            onClick={() => {
              onMarkComplete(task.id);
              onClose();
            }}
          >
            Mark Complete
          </button>
        </div>
      </div>
    </div>
  );
}

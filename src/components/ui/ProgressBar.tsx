interface ProgressBarProps {
  value: number;
  label?: string;
}

export function ProgressBar({
  value,
  label,
}: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className="df-progress-wrap">
      {label && (
        <div className="df-progress-label">
          <span>{label}</span>
          <span>{safeValue}%</span>
        </div>
      )}

      <div
        className="df-progress-track"
        role="progressbar"
        aria-valuenow={safeValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
      >
        <div
          className="df-progress-fill"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
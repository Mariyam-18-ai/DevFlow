interface ProgressRingProps {
  value: number;
  size?: number;
}

export function ProgressRing({
  value,
  size = 72,
}: ProgressRingProps) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference -
    (Math.max(0, Math.min(100, value)) / 100) *
      circumference;

  return (
    <div
      className="df-progress-ring"
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
      >
        <circle
          cx="32"
          cy="32"
          r={radius}
          className="df-ring-bg"
        />

        <circle
          cx="32"
          cy="32"
          r={radius}
          className="df-ring-value"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      <strong>{Math.round(value)}</strong>
    </div>
  );
}
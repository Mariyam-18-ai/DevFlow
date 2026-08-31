export function LoadingState({
  message = "Loading your workspace...",
}: {
  message?: string;
}) {
  return (
    <div className="df-state">
      <div className="df-loader" />
      <strong>{message}</strong>
      <span>Preparing your latest productivity data.</span>
    </div>
  );
}
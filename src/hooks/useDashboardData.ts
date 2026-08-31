import { useEffect, useState } from "react";

export type DashboardStatus = "loading" | "success" | "error";

/**
 * Simulates fetching dashboard data. There is no backend in this task,
 * so this stands in for a future API call — every consumer already
 * renders loading/error/success the same way it would for a real fetch.
 * Append ?forceError=1 to the URL to preview the error state.
 */
export function useDashboardData(delayMs = 500) {
  const [status, setStatus] = useState<DashboardStatus>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Intentional: this effect is the (simulated) data source itself.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus("loading");

    const forceError = new URLSearchParams(
      window.location.search
    ).get("forceError") === "1";

    const timer = window.setTimeout(() => {
      setStatus(forceError ? "error" : "success");
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [delayMs, attempt]);

  const retry = () => setAttempt((current) => current + 1);

  return { status, retry };
}

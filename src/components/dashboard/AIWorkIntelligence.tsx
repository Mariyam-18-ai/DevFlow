import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { Workspace } from "../../types/project";

interface Props { workspace: Workspace }

export function AIWorkIntelligence({ workspace }: Props) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setResult(null);
    setError("");
  }, [workspace]);

  async function run() {
    setLoading(true); setError("");
    try { setResult(await api.ai.workIntelligence(workspace)); }
    catch (err) { setError(err instanceof Error ? err.message : "AI could not analyze your work."); }
    finally { setLoading(false); }
  }

  return <section className="df-ai-card">
    <div className="df-ai-heading">
      <div>
        <span className="df-eyebrow">DEVFLOW AI · WORK INTELLIGENCE</span>
        <h2>{result?.headline || "What should I work on next?"}</h2>
        <p>Live signals from your {workspace} workspace: urgency, blockers, project health and effort.</p>
      </div>
      <button className="df-primary-button" onClick={run} disabled={loading}>{loading ? "Analyzing…" : "Analyze my work"}</button>
    </div>
    {error && <div className="df-auth-error">{error}</div>}
    {result && <div className="df-ai-result">
      <div><span className="df-eyebrow">WHY NOW</span><ul>{result.whyNow?.map((item: string) => <li key={item}>{item}</li>)}</ul></div>
      <div><span className="df-eyebrow">RECOMMENDATION</span><p>{result.recommendation}</p></div>
      <div><span className="df-eyebrow">RISK</span><p>{result.risk}</p></div>
      <div className="df-ai-source"><span>{result.source === "gemini" ? "Gemini analysis" : "DevFlow live signal engine"}</span><span>{result.workspace}</span></div>
    </div>}
  </section>;
}

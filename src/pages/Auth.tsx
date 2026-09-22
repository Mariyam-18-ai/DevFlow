import { useState, type FormEvent } from "react";
import { api } from "../lib/api";

interface AuthProps { mode: "login" | "register"; onSuccess: (token: string) => void; onModeChange: (mode: "login" | "register") => void; }

export function Auth({ mode, onSuccess, onModeChange }: AuthProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Developer");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const result = mode === "login"
        ? await api.auth.login({ email, password })
        : await api.auth.register({ name, email, password, role });
      localStorage.setItem("devflow_token", result.token);
      onSuccess(result.token);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to continue."); }
    finally { setBusy(false); }
  }

  return <main className="df-auth-shell"><section className="df-auth-card">
    <div className="df-auth-brand"><span className="df-eyebrow">DEVFLOW</span><h1>{mode === "login" ? "Welcome back." : "Build your flow."}</h1><p>Project intelligence for teams that want to know what to work on next — and why.</p></div>
    <form onSubmit={submit} className="df-auth-form">
      {mode === "register" && <label>Name<input required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" /></label>}
      <label>Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" /></label>
      <label>Password<input required type="password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" /></label>
      {mode === "register" && <label>Role<input value={role} onChange={e => setRole(e.target.value)} /></label>}
      {error && <div className="df-auth-error">{error}</div>}
      <button className="df-primary-button df-auth-submit" disabled={busy}>{busy ? "Working…" : mode === "login" ? "Sign in" : "Create account"}</button>
    </form>
    <button className="df-auth-switch" onClick={() => onModeChange(mode === "login" ? "register" : "login")}>
      {mode === "login" ? "New to DevFlow? Create an account" : "Already have an account? Sign in"}
    </button>
  </section></main>;
}

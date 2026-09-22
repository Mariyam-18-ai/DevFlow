import { useState } from "react";
import type { Project, Task } from "../../types";
import { api } from "../../lib/api";

interface Suggestion {
  title: string;
  description: string;
  priority: Task["priority"];
  estimatedHours: number;
  blocking: boolean;
  suggestedDays: number;
}

interface AITaskGeneratorProps {
  project?: Project;
  onUseSuggestion: (suggestion: Suggestion) => void;
}

export function AITaskGenerator({ project, onUseSuggestion }: AITaskGeneratorProps) {
  const [brief, setBrief] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [source, setSource] = useState<"gemini" | "devflow-engine" | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function generate() {
    if (!project) {
      setMessage("Select a project first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const result = await api.ai.generateTasks(project.id, brief);
      setSuggestions(result.suggestions);
      setSource(result.source);
      setMessage(`${result.suggestions.length} task ideas generated. Review one before adding it.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to generate tasks.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="df-ai-task-generator">
      <div className="df-ai-task-generator-header">
        <div>
          <span className="df-eyebrow">AI ASSIST</span>
          <strong>Generate task ideas</strong>
          <p>Turn the project context into small, actionable work items.</p>
        </div>
        {source && (
          <span className="df-ai-source-chip">
            {source === "gemini" ? "Gemini" : "DevFlow planner"}
          </span>
        )}
      </div>

      <textarea
        value={brief}
        onChange={(event) => setBrief(event.target.value)}
        placeholder="Optional: add what you want to build, a deadline, or a specific area to break down…"
        aria-label="AI task generation brief"
      />

      <button
        type="button"
        className="df-secondary-button df-ai-generate-button"
        onClick={generate}
        disabled={!project || loading}
      >
        {loading ? "Generating…" : "✨ Generate tasks"}
      </button>

      {message && <p className="df-ai-task-message">{message}</p>}

      {suggestions.length > 0 && (
        <div className="df-ai-task-suggestions">
          {suggestions.map((suggestion, index) => (
            <button
              type="button"
              className="df-ai-task-suggestion"
              key={`${suggestion.title}-${index}`}
              onClick={() => onUseSuggestion(suggestion)}
            >
              <div className="df-ai-task-suggestion-top">
                <strong>{suggestion.title}</strong>
                <span>{suggestion.priority}</span>
              </div>
              <p>{suggestion.description}</p>
              <small>
                {suggestion.estimatedHours}h
                {suggestion.blocking ? " · blocking" : ""}
                {" · "}
                target in {suggestion.suggestedDays}d
              </small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

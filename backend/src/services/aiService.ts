import { prisma } from "../lib/prisma.js";
import { AppError } from "../types/index.js";

type Workspace = "Engineering" | "Design" | "Personal";

interface IntelligenceResult {
  headline: string;
  taskId: string | null;
  whyNow: string[];
  recommendation: string;
  risk: string;
  source: "gemini" | "devflow-engine";
  workspace: Workspace;
}

function extractText(body: any): string {
  return (body?.candidates?.[0]?.content?.parts ?? [])
    .map((part: any) => part?.text ?? "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

function daysUntil(date: Date): number {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const due = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.ceil((due.getTime() - start.getTime()) / 86_400_000);
}

function localIntelligence(tasks: any[], workspace: Workspace): IntelligenceResult {
  if (!tasks.length) {
    return {
      headline: "No active work in this workspace",
      taskId: null,
      whyNow: [
        `There are no active tasks assigned to you in ${workspace}.`,
        "Create or assign work here to activate personalized prioritization.",
      ],
      recommendation: "Add or assign a task in this workspace, then run Work Intelligence again.",
      risk: "Important work may be outside the selected workspace or not assigned to your profile.",
      source: "devflow-engine",
      workspace,
    };
  }

  const scored = tasks.map((task) => {
    const days = daysUntil(task.dueDate);
    let score = task.priority === "high" ? 40 : task.priority === "medium" ? 25 : 10;
    if (days < 0) score += 45;
    else if (days === 0) score += 35;
    else if (days === 1) score += 25;
    if (task.blocking) score += 25;
    if (task.status === "in_progress") score += 10;
    if (task.project.health !== "healthy") score += 15;
    return { task, score, days };
  }).sort((a, b) => b.score - a.score);

  const top = scored[0]!;
  const reasons: string[] = [];
  if (top.days < 0) reasons.push(`Overdue by ${Math.abs(top.days)} day${Math.abs(top.days) === 1 ? "" : "s"}.`);
  else if (top.days === 0) reasons.push("Due today.");
  else if (top.days === 1) reasons.push("Due tomorrow.");
  if (top.task.priority === "high") reasons.push("High-priority work has a strong urgency signal.");
  if (top.task.blocking) reasons.push("Marked as blocking, so completing it can unblock other work.");
  if (top.task.project.health !== "healthy") reasons.push(`Project health is ${top.task.project.health.replace("_", " ")}.`);
  if (top.task.status === "in_progress") reasons.push("Already in progress, so finishing it reduces context switching.");

  return {
    headline: `Focus next: ${top.task.title}`,
    taskId: top.task.id,
    whyNow: reasons.slice(0, 4),
    recommendation: `Work on “${top.task.title}” before lower-scored active tasks. Estimated effort: ${top.task.estimatedHours}h.`,
    risk: top.task.blocking ? "Delay could keep dependent work blocked." : top.days <= 0 ? "Further delay increases deadline risk." : "Lower immediate risk, but delaying may increase workload near the deadline.",
    source: "devflow-engine",
    workspace,
  };
}

export async function getWorkIntelligence(userId: string, workspace: Workspace = "Engineering"): Promise<IntelligenceResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  const [tasks, projects] = await Promise.all([
    prisma.task.findMany({
      where: {
        status: { not: "done" },
        assigneeId: userId,
        project: { workspace },
      },
      include: { project: true },
      orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
    }),
    prisma.project.findMany({
      where: { workspace },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const context = {
    workspace,
    projects: projects.map((p) => ({ id: p.id, name: p.name, health: p.health })),
    tasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      project: t.project.name,
      projectHealth: t.project.health,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate.toISOString().slice(0, 10),
      estimatedHours: t.estimatedHours,
      blocking: t.blocking,
    })),
  };

  const fallback = localIntelligence(tasks, workspace);
  if (!tasks.length || !apiKey) return fallback;

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const body = {
    systemInstruction: {
      parts: [{
        text: `You are DevFlow Work Intelligence, a productivity decision engine. Analyze only the supplied data for the selected ${workspace} workspace. Select exactly one existing task. Prioritize deadline pressure, blockers, priority, project health, status, and effort. Be specific and concise. Do not invent facts. Return JSON only.`,
      }],
    },
    contents: [{ role: "user", parts: [{ text: JSON.stringify(context) }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          headline: { type: "STRING" },
          taskId: { type: "STRING" },
          whyNow: { type: "ARRAY", items: { type: "STRING" } },
          recommendation: { type: "STRING" },
          risk: { type: "STRING" },
        },
        required: ["headline", "taskId", "whyNow", "recommendation", "risk"],
      },
      maxOutputTokens: 500,
    },
  };

  let lastDetail = "";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body: JSON.stringify(body),
        },
      );

      if (response.ok) {
        const providerBody = await response.json();
        const text = extractText(providerBody);
        try {
          const parsed = JSON.parse(text);
          if (tasks.some((task) => task.id === parsed.taskId)) {
            return { ...parsed, source: "gemini", workspace };
          }
        } catch {
          lastDetail = "Gemini returned invalid JSON.";
        }
      } else {
        lastDetail = await response.text();
        console.error("Gemini API error", { status: response.status, body: lastDetail.slice(0, 1000) });
        if (response.status < 500 && response.status !== 429) break;
      }
    } catch (error) {
      lastDetail = error instanceof Error ? error.message : "Gemini request failed.";
    }

    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 800));
  }

  // Keep the feature useful even when the free provider tier is temporarily unavailable.
  console.warn("Gemini unavailable; using DevFlow signal engine.", lastDetail.slice(0, 300));
  return fallback;
}


export interface GeneratedTaskSuggestion {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  estimatedHours: number;
  blocking: boolean;
  suggestedDays: number;
}

function localTaskSuggestions(project: { name: string; description: string }): GeneratedTaskSuggestion[] {
  const name = project.name.trim();
  return [
    {
      title: `Define ${name} implementation plan`,
      description: `Break ${name} into clear technical steps, dependencies, and acceptance criteria.`,
      priority: "high",
      estimatedHours: 2,
      blocking: true,
      suggestedDays: 1,
    },
    {
      title: `Implement ${name} core workflow`,
      description: `Build the main workflow described for ${name} and connect it to the existing application flow.`,
      priority: "high",
      estimatedHours: 6,
      blocking: true,
      suggestedDays: 3,
    },
    {
      title: `Validate ${name} and handle edge cases`,
      description: `Test the main workflow, handle failure cases, and verify the feature works with realistic inputs.`,
      priority: "medium",
      estimatedHours: 4,
      blocking: false,
      suggestedDays: 5,
    },
  ];
}

export async function generateTaskSuggestions(
  _userId: string,
  projectId: string,
  brief?: string,
): Promise<{
  project: { id: string; name: string; description: string };
  suggestions: GeneratedTaskSuggestion[];
  source: "gemini" | "devflow-engine";
}> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      tasks: {
        where: { status: { not: "done" } },
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: { title: true, status: true, priority: true },
      },
    },
  });

  if (!project) {
    throw new AppError("Project not found.", 404, "PROJECT_NOT_FOUND");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const fallback = localTaskSuggestions(project);
  if (!apiKey) {
    return {
      project: { id: project.id, name: project.name, description: project.description },
      suggestions: fallback,
      source: "devflow-engine",
    };
  }

  const context = {
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      workspace: project.workspace,
      health: project.health,
    },
    existingTasks: project.tasks,
    userBrief: brief?.trim() || null,
  };

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const requestBody = {
    systemInstruction: {
      parts: [{
        text: "You are DevFlow Task Planner. Generate 3 to 5 concrete, actionable developer tasks for the supplied project. Use only the supplied project context. Do not duplicate existing active tasks. Tasks must be small enough to complete independently, have realistic effort in hours, and use priority high, medium, or low. Mark blocking true only when the task is likely to unblock later project work. suggestedDays is the number of calendar days from today to a reasonable target date and must be 1 to 14. Return JSON only.",
      }],
    },
    contents: [{
      role: "user",
      parts: [{ text: JSON.stringify(context) }],
    }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          suggestions: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                description: { type: "STRING" },
                priority: { type: "STRING", enum: ["high", "medium", "low"] },
                estimatedHours: { type: "NUMBER" },
                blocking: { type: "BOOLEAN" },
                suggestedDays: { type: "INTEGER" },
              },
              required: ["title", "description", "priority", "estimatedHours", "blocking", "suggestedDays"],
            },
          },
        },
        required: ["suggestions"],
      },
      temperature: 0.25,
      maxOutputTokens: 900,
    },
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(requestBody),
      },
    );

    if (response.ok) {
      const providerBody = await response.json();
      const text = extractText(providerBody);
      try {
        const parsed = JSON.parse(text);
        const suggestions = Array.isArray(parsed?.suggestions)
          ? parsed.suggestions
              .filter((item: any) =>
                item &&
                typeof item.title === "string" &&
                typeof item.description === "string" &&
                ["high", "medium", "low"].includes(item.priority),
              )
              .slice(0, 5)
              .map((item: any) => ({
                title: item.title.trim(),
                description: item.description.trim(),
                priority: item.priority,
                estimatedHours: Math.max(0.5, Math.min(40, Number(item.estimatedHours) || 2)),
                blocking: Boolean(item.blocking),
                suggestedDays: Math.max(1, Math.min(14, Math.round(Number(item.suggestedDays) || 3))),
              }))
          : [];

        if (suggestions.length >= 3) {
          return {
            project: { id: project.id, name: project.name, description: project.description },
            suggestions,
            source: "gemini",
          };
        }
      } catch {
        // Fall through to the deterministic planner.
      }
    }
  } catch {
    // Fall through to the deterministic planner.
  }

  return {
    project: { id: project.id, name: project.name, description: project.description },
    suggestions: fallback,
    source: "devflow-engine",
  };
}

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer, Server } from "node:http";
import { createApp } from "../src/app.js";

let server: Server;
let baseUrl: string;

before(async () => {
  const app = createApp();
  server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  baseUrl = `http://localhost:${port}`;
});

after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

async function get(path: string) {
  const res = await fetch(`${baseUrl}${path}`);
  return { status: res.status, body: res.status === 204 ? null : await res.json() };
}

async function send(method: string, path: string, body?: unknown) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: res.status === 204 ? null : await res.json() };
}

test("GET /api/health returns 200 and ok status", async () => {
  const { status, body } = await get("/api/health");
  assert.equal(status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.status, "ok");
});

test("GET /api/users returns 200 with a list", async () => {
  const { status, body } = await get("/api/users");
  assert.equal(status, 200);
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data));
  assert.equal(body.meta.count, body.data.length);
});

test("POST /api/users with invalid body returns 400 VALIDATION_ERROR", async () => {
  const { status, body } = await send("POST", "/api/users", { name: "" });
  assert.equal(status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "VALIDATION_ERROR");
});

test("GET /api/projects returns 200 with a list", async () => {
  const { status, body } = await get("/api/projects");
  assert.equal(status, 200);
  assert.ok(Array.isArray(body.data));
});

test("POST /api/projects with invalid ownerId returns 404 OWNER_NOT_FOUND", async () => {
  const { status, body } = await send("POST", "/api/projects", {
    name: "Test",
    description: "Test",
    ownerId: "does-not-exist",
    color: "#000",
    health: "healthy",
  });
  assert.equal(status, 404);
  assert.equal(body.error.code, "OWNER_NOT_FOUND");
});

test("GET /api/tasks returns 200 with a list", async () => {
  const { status, body } = await get("/api/tasks");
  assert.equal(status, 200);
  assert.ok(Array.isArray(body.data));
  assert.ok(body.data.length >= 5);
});

test("POST /api/tasks with invalid body returns 400 VALIDATION_ERROR", async () => {
  const { status, body } = await send("POST", "/api/tasks", { title: "" });
  assert.equal(status, 400);
  assert.equal(body.error.code, "VALIDATION_ERROR");
});

test("POST /api/tasks with invalid projectId returns 404 PROJECT_NOT_FOUND", async () => {
  const usersRes = await get("/api/users");
  const assigneeId = usersRes.body.data[0].id;
  const { status, body } = await send("POST", "/api/tasks", {
    title: "t",
    description: "d",
    projectId: "does-not-exist",
    assigneeId,
    status: "todo",
    priority: "low",
    dueDate: "2026-10-01",
    estimatedHours: 1,
    blocking: false,
  });
  assert.equal(status, 404);
  assert.equal(body.error.code, "PROJECT_NOT_FOUND");
});

test("POST /api/tasks with invalid assigneeId returns 404 ASSIGNEE_NOT_FOUND", async () => {
  const projectsRes = await get("/api/projects");
  const projectId = projectsRes.body.data[0].id;
  const { status, body } = await send("POST", "/api/tasks", {
    title: "t",
    description: "d",
    projectId,
    assigneeId: "does-not-exist",
    status: "todo",
    priority: "low",
    dueDate: "2026-10-01",
    estimatedHours: 1,
    blocking: false,
  });
  assert.equal(status, 404);
  assert.equal(body.error.code, "ASSIGNEE_NOT_FOUND");
});

test("PATCH /api/tasks/:id/status updates status", async () => {
  const tasksRes = await get("/api/tasks");
  const taskId = tasksRes.body.data[0].id;
  const { status, body } = await send("PATCH", `/api/tasks/${taskId}/status`, { status: "done" });
  assert.equal(status, 200);
  assert.equal(body.data.status, "done");
});

test("GET /api/tasks?status=blocked filters results", async () => {
  const { status, body } = await get("/api/tasks?status=blocked");
  assert.equal(status, 200);
  for (const task of body.data) {
    assert.equal(task.status, "blocked");
  }
});

test("GET /api/tasks/:id with missing id returns 404", async () => {
  const { status, body } = await get("/api/tasks/does-not-exist");
  assert.equal(status, 404);
  assert.equal(body.success, false);
});

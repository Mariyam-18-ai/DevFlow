# DevFlow Backend

## Purpose
Task 2 REST API for the DevFlow productivity platform.

## Stack
- Node.js
- Express
- TypeScript (strict)
- Zod
- dotenv
- CORS

## Architecture
```
Route → Controller → Service → Repository → In-memory data source
```
The repository layer is isolated from controllers/services so Task 3 can later
swap the in-memory data source for PostgreSQL/Prisma (e.g. `InMemoryTaskRepository`
→ `PrismaTaskRepository`) without rewriting any controller or service code.

## Features
- User CRUD
- Project CRUD
- Task CRUD
- Task status updates (`PATCH /api/tasks/:id/status`)
- Task filtering/search (`status`, `priority`, `projectId`, `assigneeId`, `search`)
- Zod validation on every POST/PUT/PATCH
- Relationship validation (project → owner, task → project, task → assignee)
- Centralized error handling with standardized error codes
- Standardized API response format
- Environment-based configuration

## Project Structure
```
backend/
├── docs/openapi.yaml
├── tests/api.test.ts
└── src/
    ├── config/env.ts
    ├── middleware/{errorHandler,notFound}.ts
    ├── types/index.ts
    ├── repositories/{user,project,task}Repository.ts
    ├── services/{user,project,task}Service.ts
    ├── controllers/{user,project,task}Controller.ts
    ├── routes/{user,project,task}Routes.ts
    ├── schemas/{user,project,task}Schema.ts
    ├── app.ts
    └── server.ts
```

## Setup
```bash
npm install
cp .env.example .env
npm run dev     # start dev server (watch mode)
npm run build   # compile TypeScript to dist/
npm start       # run compiled server
npm test        # run automated API tests
```

## Environment Variables
| Variable    | Description                | Default                |
|-------------|-----------------------------|--------------------------|
| PORT        | Server port                 | 5000                     |
| NODE_ENV    | Environment mode            | development               |
| CORS_ORIGIN | Allowed frontend origin     | http://localhost:5173     |

See `.env.example`.

## API
Base URL: `http://localhost:5000`

Full OpenAPI 3.0 specification: [`docs/openapi.yaml`](./docs/openapi.yaml)

### Endpoint Summary
| Method | Path                    | Description              |
|--------|--------------------------|---------------------------|
| GET    | /api/health              | Health check               |
| GET    | /api/users               | List users                  |
| GET    | /api/users/:id             | Get user                    |
| POST   | /api/users                | Create user                 |
| PUT    | /api/users/:id              | Update user                  |
| DELETE | /api/users/:id               | Delete user                  |
| GET    | /api/projects               | List projects                 |
| GET    | /api/projects/:id              | Get project                    |
| POST   | /api/projects                 | Create project                 |
| PUT    | /api/projects/:id                | Update project                  |
| DELETE | /api/projects/:id                 | Delete project                   |
| GET    | /api/tasks                      | List tasks (filterable)           |
| GET    | /api/tasks/:id                     | Get task                           |
| POST   | /api/tasks                        | Create task                         |
| PUT    | /api/tasks/:id                       | Update task                          |
| PATCH  | /api/tasks/:id/status                  | Update task status only               |
| DELETE | /api/tasks/:id                        | Delete task                            |

## Response Format
Success:
```json
{ "success": true, "data": { "id": "...", "name": "..." } }
```
Collection:
```json
{ "success": true, "data": [], "meta": { "count": 0 } }
```
Error:
```json
{
  "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "Validation failed", "details": [] }
}
```

## Task Filtering
`GET /api/tasks` supports combinable query parameters:
- `status` — todo | in-progress | blocked | done
- `priority` — high | medium | low
- `projectId`
- `assigneeId`
- `search` — matches title/description (case-insensitive)

Example: `GET /api/tasks?status=blocked&priority=high`

An empty filtered result returns `200` with `data: []`, not an error.

## Testing
`npm test` runs `tests/api.test.ts` using Node's built-in test runner
(`node:test` + built-in `fetch`) via `tsx` — no extra test dependencies.
Covers health, CRUD happy paths, validation errors, relationship errors
(project owner, task project/assignee), status updates, filtering, and 404s.

## Out of Scope (Task 2)
No database persistence, authentication, AI, or deployment — these are planned
for later tasks.

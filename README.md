# TaskFlow Backend Service

REST API for the EAP 4.0 Smart Project & Task Collaboration System.

## Features

- **Authentication**: Email/password signup & login, JWT access tokens, refresh token cookies
- **RBAC**: Admin, Project Manager, Team Member roles
- **Projects**: CRUD with name, description, deadline, status (Active / Completed / On Hold)
- **Tasks**: Kanban statuses, priorities, assignees, validation (duplicate titles, past deadlines, completed reassignment)
- **Dashboard**: KPIs, project summaries, workload, charts, upcoming deadlines
- **Activity log**: Recent system events
- **Comments**: Flat task comments
- **Notifications**: Persisted + Socket.IO real-time delivery
- **Search & filter**: Tasks by status, priority, assignee, deadline, pagination

## Setup

```bash
pnpm install
cp .env.example .env
# Set MONGODB_URI and JWT_SECRET
pnpm run seed
pnpm run start:dev
```

Server runs at `http://localhost:5000/api/v1`.

## Environment Variables

| Variable          | Description                           |
| ----------------- | ------------------------------------- |
| `PORT`            | Server port (default 5000)            |
| `MONGODB_URI`     | MongoDB connection string             |
| `JWT_SECRET`      | Secret for signing JWTs               |
| `CLIENT_ECOM_URL` | Frontend origin for CORS (production) |
| `NODE_ENV`        | `development` or `production`         |

## Demo Credentials

| Role            | Email               | Password   |
| --------------- | ------------------- | ---------- |
| Admin           | admin@taskflow.com  | Admin@123  |
| Project Manager | pm@taskflow.com     | Pm@123     |
| Team Member     | member@taskflow.com | Member@123 |

## API Routes

| Prefix          | Description                          |
| --------------- | ------------------------------------ |
| `/auth`         | Register, login, refresh, list users |
| `/project`      | Project CRUD, members                |
| `/task`         | Task CRUD, filtered list             |
| `/dashboard`    | Analytics endpoints                  |
| `/activity`     | Recent activity feed                 |
| `/comment`      | Task comments                        |
| `/notification` | User notifications                   |

## Deployment

Build: `pnpm run build`  
Start: `pnpm start`  
Vercel: configured via `vercel.json`.

## Module Structure

```
src/modules/{auth,project,task,dashboard,activity,comment,notification}/
  controllers/
  services/
  routes/
  models/
  validators/
  types/
```

Shared helpers: `permission.helper.ts`, `task-validation.helper.ts`, `activity.helper.ts`.

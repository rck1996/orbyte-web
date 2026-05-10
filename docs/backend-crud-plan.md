# Backend and CRUD Plan

## Goal

Replace the mock universe config with a real persisted domain and full CRUD operations.

## Recommended Stack

- PostgreSQL
- Prisma
- Zod
- Next.js Route Handlers
- optional TanStack Query for client mutations

## Suggested Database Model

### Workspace

- `id`
- `name`
- `createdAt`
- `updatedAt`

### Galaxy

- `id`
- `workspaceId`
- `name`
- `category`
- `description`
- `color`
- `accent`
- `progress`
- `positionX`
- `positionY`
- `positionZ`
- `order`
- `createdAt`
- `updatedAt`

### Objective

- `id`
- `galaxyId`
- `name`
- `description`
- `orbitRadius`
- `progress`
- `order`
- `createdAt`
- `updatedAt`

### Task

- `id`
- `objectiveId`
- `name`
- `summary`
- `state`
- `progress`
- `dueDate`
- `order`
- `createdAt`
- `updatedAt`

### Subtask

- `id`
- `taskId`
- `name`
- `metadata`
- `progress`
- `dueDate`
- `order`
- `createdAt`
- `updatedAt`

## Server Layer To Add

Recommended folders:

```text
src/lib/
└── server/
    ├── db.ts
    ├── prisma/
    ├── repositories/
    ├── services/
    └── validators/
```

## CRUD Endpoints

Minimum set:

- `GET /api/universe`
- `POST /api/galaxies`
- `PATCH /api/galaxies/:id`
- `DELETE /api/galaxies/:id`
- `POST /api/objectives`
- `PATCH /api/objectives/:id`
- `DELETE /api/objectives/:id`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `POST /api/subtasks`
- `PATCH /api/subtasks/:id`
- `DELETE /api/subtasks/:id`

## UI Integration Plan

The current HUD can evolve into CRUD in this order:

1. Add create buttons in the overlay
2. Add detail panel editing for selected entities
3. Add optimistic update flow for task and subtask edits
4. Add deletion confirmation
5. Add drag or reposition actions only after base CRUD is stable

## Migration Strategy

Recommended order:

1. add Prisma schema
2. add seed based on `src/config/universe.ts`
3. switch repository from mock config to database
4. keep API response shape unchanged
5. only then add write mutations

That order keeps the scene stable while the backend changes under it.

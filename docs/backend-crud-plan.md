# Backend and CRUD Plan

## Status In 1.0.0

This document is no longer a pure future plan. Orbyte `1.0.0` already includes working CRUD on top of a file-backed workspace domain.

Current persistence:

- local JSON database
- service/repository layer
- mapped universe response for the canvas

Current CRUD coverage:

- categories
- objectives
- tasks
- subtasks
- habits

## Current Domain Model

### Workspace

- `id`
- `name`
- `categories`
- `habits`

### Category

- `id`
- `name`
- `description`
- `color`
- `accent`
- `order`
- `objectives`

### Objective

- `id`
- `categoryId`
- `name`
- `description`
- `order`
- `tasks`
- `habitIds`

### Task

- `id`
- `objectiveId`
- `name`
- `summary`
- `state`
- `progress`
- `dueDate`
- `order`
- `subtasks`

### Subtask

- `id`
- `taskId`
- `name`
- `metadata`
- `progress`
- `dueDate`
- `order`

### Habit

- `id`
- `objectiveId`
- `name`
- `description`
- `cadence`
- `target`
- `completedCount`
- `streak`
- `metricLabel`

## Current API Surface

### Read models

- `GET /api/universe`
- `GET /api/workspace`

### Categories

- `GET /api/categories`
- `POST /api/categories`
- `GET /api/categories/:categoryId`
- `PATCH /api/categories/:categoryId`
- `DELETE /api/categories/:categoryId`

### Objectives

- `GET /api/objectives`
- `POST /api/objectives`
- `GET /api/objectives/:objectiveId`
- `PATCH /api/objectives/:objectiveId`
- `DELETE /api/objectives/:objectiveId`

### Tasks

- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:taskId`
- `PATCH /api/tasks/:taskId`
- `DELETE /api/tasks/:taskId`

### Subtasks

- `GET /api/subtasks`
- `POST /api/subtasks`
- `GET /api/subtasks/:subtaskId`
- `PATCH /api/subtasks/:subtaskId`
- `DELETE /api/subtasks/:subtaskId`

### Habits

- `GET /api/habits`
- `POST /api/habits`
- `GET /api/habits/:habitId`
- `PATCH /api/habits/:habitId`
- `DELETE /api/habits/:habitId`

## UI Integration Already Present

### Navigation and detail

- focus panel for contextual actions
- management panel for explicit CRUD
- task modal
- subtask modal
- habit modal with quick check-in

### Remaining UI gaps

- richer edit flows for category and objective
- delete confirmations with clearer messaging
- habit history view instead of only current streak/count
- better success/error toasts

## Migration To Real Database

Recommended order:

1. add Prisma schema
2. model the current workspace domain directly
3. seed from `src/data/universe-db.json`
4. replace `universe-db.ts` file IO with Prisma queries
5. keep API response shapes stable
6. only then add auth and per-user workspaces

## Recommended Stack For Next Phase

- PostgreSQL
- Prisma
- Zod
- Next.js Route Handlers
- optional TanStack Query for richer client-side caching and optimistic mutations

## Why The Mapping Layer Should Stay

Even after moving to PostgreSQL, keep this separation:

- `WorkspaceDomain` = source of truth
- `UniverseData` = canvas view-model

That keeps the rendering layer stable while backend storage evolves.

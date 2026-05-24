# Orbyte

Orbyte is a cinematic spatial productivity system built as a navigable universe.

Version `1.0.0` ships the new primary 2D canvas experience:
- `Galaxy` = category
- `Objective` = solar system / sun
- `Task` = planet
- `Subtask` = satellite
- `Habit` = orbital rhythm around an objective

The 3D prototype is still available as a legacy route, but the 2D experience is now the main product direction.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Three.js
- React Three Fiber
- Drei
- Zustand

## Run Locally

From `C:\Users\erick\Documents\orbyte`:

```powershell
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Production build:

```powershell
npm run build
npm run start
```

## Main Routes

- `/`
  Main Orbyte 2D universe experience.
- `/three`
  Legacy 3D prototype route.

## API Routes

- `GET /api/universe`
  Returns the mapped universe used by the visual experience.
- `GET /api/workspace`
  Returns the editable workspace domain.
- `GET/POST /api/categories`
- `GET/PATCH/DELETE /api/categories/:categoryId`
- `GET/POST /api/objectives`
- `GET/PATCH/DELETE /api/objectives/:objectiveId`
- `GET/POST /api/tasks`
- `GET/PATCH/DELETE /api/tasks/:taskId`
- `GET/POST /api/subtasks`
- `GET/PATCH/DELETE /api/subtasks/:subtaskId`
- `GET/POST /api/habits`
- `GET/PATCH/DELETE /api/habits/:habitId`
- `GET /api/dashboard`
  Legacy flat dashboard endpoint kept for backward compatibility.

## Product Model

The current hierarchy is:

- `Category`
- `Objective`
- `Task`
- `Subtask`
- `Habit`

Important distinction:

- `Task` and `Subtask` represent discrete work.
- `Habit` represents recurring behavior that contributes to objective progress.

Objective progress is currently derived from tasks plus linked habits, then mapped into the visual universe.

## Current Experience

### 2D universe

The main route now includes:

- professional 2D canvas navigation
- click to select
- drag on empty space to pan
- `space + drag` and right-drag for universal pan
- wheel zoom
- `Fit` action by level
- minimap on desktop
- mobile bottom sheet navigation
- contextual detail panels
- task and subtask focus modals
- habit focus modal with quick check-in actions

### 3D route

The 3D version remains available at `/three` as a preserved prototype and reference implementation.

## Data And Persistence

The app no longer depends only on a visual mock. It now has a file-backed editable workspace domain:

- `src/lib/server/universe-db.ts`
- `src/lib/server/universe-repository.ts`
- `src/lib/server/universe-service.ts`
- `src/lib/server/universe-mappers.ts`
- `src/data/universe-db.json`

This means CRUD already exists at the application level, even though the persistence layer is still local JSON rather than a database.

## Project Structure

```text
src/
  app/
    api/
    three/
  components/
    galaxy/
    overlays/
    planets/
    solar-system/
    universe-2d/
    ui/
  data/
  lib/
    server/
  scene/
  store/
  systems/
  types/
```

## Key Files

- `src/app/page.tsx`
  Main 2D entry route.
- `src/app/three/page.tsx`
  Legacy 3D route.
- `src/scene/orbyte-experience-2d.tsx`
  2D shell and refresh orchestration.
- `src/components/universe-2d/universe-map-2d.tsx`
  Main 2D canvas, pan/zoom, transitions, minimap, habits, and node interactions.
- `src/components/overlays/universe-hud.tsx`
  Sidebar / mobile sheet navigation container.
- `src/components/overlays/task-focus-modal.tsx`
  Task and subtask operational modal.
- `src/components/overlays/habit-focus-modal.tsx`
  Habit modal with check-in flow.

## Current Limitations

- persistence is local JSON, not a database
- no authentication yet
- no multi-user collaboration yet
- the 3D route is still heavier and experimental compared to the 2D experience

## Next Release Direction

The next major phase after `1.0.0` should be:

1. move from file-backed persistence to Prisma + PostgreSQL
2. deploy publicly
3. add authentication and workspaces
4. improve analytics and habit history
5. continue polishing mobile interaction and canvas performance

## Extra Documentation

- [Architecture Guide](./docs/architecture.md)
- [Backend and CRUD Plan](./docs/backend-crud-plan.md)

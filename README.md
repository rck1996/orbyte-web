# Orbyte

Orbyte is a cinematic 3D productivity dashboard built with Next.js, React Three Fiber, Three.js, Framer Motion, Tailwind CSS, and TypeScript.

The current product direction is:

- `Galaxy` = category
- `Objective` = solar system
- `Task` = planet
- `Subtask` = satellite

The root route renders a navigable space scene with a HUD on top and a small backend layer that serves the universe data.

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

## Available Routes

- `/`
  Main 3D Orbyte experience.
- `/api/universe`
  Returns the current spatial productivity data model.
- `/api/dashboard`
  Legacy flat dashboard data kept from the earlier phase of the project.

## Project Structure

```text
src/
├── app/
│   ├── api/
│   │   ├── dashboard/
│   │   └── universe/
│   ├── error.tsx
│   ├── layout.tsx
│   ├── loading.tsx
│   └── page.tsx
├── components/
│   ├── galaxy/
│   ├── overlays/
│   ├── planets/
│   ├── solar-system/
│   ├── sections/
│   └── ui/
├── config/
├── design-system/
├── lib/
│   ├── server/
│   ├── scene-anchors.ts
│   ├── space.ts
│   └── utils.ts
├── scene/
├── store/
├── systems/
└── types/
```

## How The App Works

### 1. Server data flow

`src/app/page.tsx` is a server component.

It loads the universe from:

- `src/lib/server/universe-service.ts`
- `src/lib/server/universe-repository.ts`
- `src/config/universe.ts`

Right now the repository returns mocked in-memory data. The structure already matches the future CRUD model, so replacing the mock with Prisma/Postgres is straightforward.

### 2. Scene composition

The main scene flow is:

- `src/scene/orbyte-experience.tsx`
  Top-level experience shell.
- `src/scene/universe-canvas.tsx`
  Creates the R3F canvas.
- `src/scene/universe-scene.tsx`
  Composes lights, stars, galaxies, and the camera rig.

### 3. Spatial hierarchy

The 3D world is built in layers:

- `src/components/galaxy/galaxy-node.tsx`
  Renders a galaxy and its active objective systems.
- `src/components/solar-system/objective-system.tsx`
  Renders orbital paths and objective anchors.
- `src/components/planets/task-planet.tsx`
  Renders tasks and orbiting subtasks.

### 4. Camera and navigation

The camera is controlled by:

- `src/systems/camera-rig.tsx`

Selection state lives in:

- `src/store/universe-store.ts`

Important detail:

The store only holds interaction state such as hovered and selected ids.

World positions are not stored in Zustand anymore. They are written into:

- `src/lib/scene-anchors.ts`

This avoids React rerenders on every animation frame and prevents scene instability.

### 5. HUD overlays

The HTML overlay layer is separate from the 3D scene:

- `src/components/overlays/universe-hud.tsx`
- `src/components/overlays/focus-panel.tsx`
- `src/components/overlays/galaxy-rail.tsx`

This keeps the scene responsible for rendering and motion, while the overlay remains responsible for reading and editing context.

## Core Types

Main spatial types live in:

- `src/types/universe.ts`

Key entities:

- `UniverseData`
- `GalaxyNode`
- `ObjectiveNode`
- `TaskNode`
- `SubtaskNode`

Legacy flat dashboard types still live in:

- `src/types/dashboard.ts`

## Current Technical Notes

### `THREE.Clock` deprecation warning

This warning currently comes from `@react-three/fiber`, not from the app code.

### `THREE.WebGLRenderer: Context Lost`

The scene was already reduced to a safer GPU budget:

- no `Environment preset`
- reduced stars
- reduced particles
- reduced geometry segments
- lower DPR
- antialias disabled

If the issue appears again, inspect the browser console first before changing the scene blindly.

## Current Limitations

- Data is still mocked in `src/config/universe.ts`
- No database yet
- No CRUD mutations yet
- No auth or multi-workspace support yet
- Legacy flat dashboard components still exist in the repo but are not the primary experience

## Recommended Next Backend Step

The next implementation phase should be:

1. Add Prisma
2. Add PostgreSQL
3. Replace `src/config/universe.ts` with persisted data
4. Create CRUD endpoints for galaxies, objectives, tasks, and subtasks
5. Wire overlay forms and mutations into those endpoints

## Extra Documentation

- [Architecture Guide](./docs/architecture.md)
- [Backend and CRUD Plan](./docs/backend-crud-plan.md)

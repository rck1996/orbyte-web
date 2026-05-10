# Architecture Guide

## Overview

Orbyte is split into four layers:

1. Server data loading
2. 3D rendering
3. Interaction state
4. Overlay UI

The goal is to keep rendering logic out of the backend layer and keep UI overlays independent from the world simulation.

## Layer Breakdown

### Server layer

Files:

- `src/app/page.tsx`
- `src/lib/server/universe-service.ts`
- `src/lib/server/universe-repository.ts`
- `src/app/api/universe/route.ts`

Responsibility:

- load universe data on the server
- expose it through the API
- define a clean seam for future persistence

Current status:

- mock-backed
- ready to be replaced by Prisma queries

### Scene layer

Files:

- `src/scene/universe-canvas.tsx`
- `src/scene/universe-scene.tsx`
- `src/components/galaxy/galaxy-node.tsx`
- `src/components/solar-system/objective-system.tsx`
- `src/components/planets/task-planet.tsx`

Responsibility:

- render the world
- animate objects
- respond to pointer interaction
- register spatial anchors for camera focus

### Motion and camera layer

Files:

- `src/systems/camera-rig.tsx`
- `src/lib/scene-anchors.ts`

Responsibility:

- smoothly move the camera
- preserve orientation
- lerp toward selected entities

Important design choice:

Camera targets depend on scene anchors stored in a mutable map, not React state. This is intentional because per-frame anchor updates in Zustand caused unnecessary rerenders and instability.

### UI state layer

Files:

- `src/store/universe-store.ts`

Responsibility:

- hovered galaxy
- selected galaxy
- selected objective
- selected task
- hovered subtask

This store should stay small. It should only contain UI and navigation state, not animation frame data.

### Overlay layer

Files:

- `src/components/overlays/universe-hud.tsx`
- `src/components/overlays/focus-panel.tsx`
- `src/components/overlays/galaxy-rail.tsx`

Responsibility:

- communicate hierarchy
- preserve context
- expose selected content clearly
- prepare the surface for future CRUD panels

## Data Model

The current domain model is defined in:

- `src/types/universe.ts`

Hierarchy:

- `UniverseData`
- `GalaxyNode[]`
- `ObjectiveNode[]`
- `TaskNode[]`
- `SubtaskNode[]`

The same hierarchy should become the database model later.

## Why Legacy Dashboard Files Still Exist

The project started as a flat SaaS dashboard.

These files still remain:

- `src/components/sections/*`
- `src/config/dashboard.ts`
- `src/types/dashboard.ts`
- `src/app/api/dashboard/route.ts`

They are no longer the primary UI, but they still document the earlier product direction and may be reused later for admin or analytics views.

## Performance Notes

Current scene safety measures:

- reduced DPR
- reduced star count
- reduced sparkle count
- reduced geometry segments
- no HDR environment preset
- no per-frame Zustand writes

If performance work continues, likely next steps are:

- instancing for repeated objects
- explicit LOD
- reduced HTML overlays inside the scene
- optional postprocessing only after baseline stability

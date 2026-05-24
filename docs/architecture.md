# Architecture Guide

## Overview

Orbyte is now split into five main layers:

1. Workspace domain and persistence
2. Universe mapping
3. 2D presentation shell
4. Interaction state
5. Overlay and modal surfaces

The 2D universe is the primary product. The 3D route remains in the repo as a preserved prototype.

## Layer Breakdown

### 1. Workspace domain and persistence

Files:

- `src/lib/server/universe-db.ts`
- `src/lib/server/universe-repository.ts`
- `src/lib/server/universe-service.ts`
- `src/data/universe-db.json`
- `src/types/domain.ts`

Responsibility:

- persist editable workspace data
- expose categories, objectives, tasks, subtasks, and habits
- handle mutations for CRUD endpoints

Current status:

- file-backed JSON persistence
- production-shaped service boundary
- ready to migrate later to Prisma/PostgreSQL

### 2. Universe mapping layer

Files:

- `src/lib/server/universe-mappers.ts`
- `src/types/universe.ts`
- `src/app/api/universe/route.ts`

Responsibility:

- convert workspace domain data into the visual universe format
- derive progress and habit contribution
- keep the canvas response shape stable even if persistence changes underneath

Important design choice:

The visual universe is a mapped view-model, not the source of truth. The source of truth is the workspace domain.

### 3. 2D presentation shell

Files:

- `src/app/page.tsx`
- `src/scene/orbyte-experience-2d.tsx`
- `src/components/universe-2d/universe-map-2d.tsx`

Responsibility:

- render the main universe canvas
- manage refresh after mutations
- coordinate cinematic transitions, pan, zoom, fit, and minimap

### 4. Interaction state

Files:

- `src/store/universe-store.ts`

Responsibility:

- selected galaxy
- selected objective
- selected task
- selected subtask
- drag offset
- task modal open state
- mobile sheet state

This store is intentionally UI-focused. It should not become the persistence layer.

### 5. Overlay and modal surfaces

Files:

- `src/components/overlays/universe-hud.tsx`
- `src/components/overlays/focus-panel.tsx`
- `src/components/overlays/galaxy-rail.tsx`
- `src/components/overlays/habits-panel.tsx`
- `src/components/overlays/management-panel.tsx`
- `src/components/overlays/task-focus-modal.tsx`
- `src/components/overlays/habit-focus-modal.tsx`

Responsibility:

- contextual navigation
- details on demand
- CRUD entry points
- mobile sheet behavior
- task/subtask/habit operational surfaces

## 2D Navigation Model

The primary canvas follows a standard interaction model:

- click/tap on nodes to select
- drag empty space to pan
- `space + drag` to pan from anywhere on desktop
- right-drag to pan from anywhere on desktop
- wheel to zoom
- contextual `Fit` control by level

Desktop also includes:

- minimap with viewport frame
- keyboard pan and zoom helpers

Mobile uses:

- bottom sheet instead of persistent sidebar
- peek / half / full states
- task and subtask modal flows

## Visual Hierarchy

The current spatial metaphor is:

- `Category` -> galaxy entry
- `Objective` -> solar sun
- `Task` -> planet
- `Subtask` -> satellite
- `Habit` -> orbital rhythm marker

This is important because it separates recurring behavior from discrete work.

## Legacy 3D Layer

Files:

- `src/app/three/page.tsx`
- `src/scene/orbyte-experience.tsx`
- `src/scene/universe-canvas.tsx`
- `src/scene/universe-scene.tsx`
- `src/systems/camera-rig.tsx`

Status:

- kept as a legacy prototype
- still functional
- no longer the primary product surface

## Performance Notes

Current protections:

- reduced 3D GPU budget on legacy route
- reduced procedural star count
- simplified parallax strategy
- limited transition cost
- direct pan mode for keyboard, fit, and minimap recenter
- UI overlays isolated from canvas gestures through explicit `data-universe-ui` boundaries

## Recommended Next Architecture Step

After `1.0.0`, the next structural move should be:

1. replace JSON persistence with Prisma + PostgreSQL
2. keep `WorkspaceDomain -> UniverseData` mapping stable
3. add authentication and workspace ownership
4. introduce history/analytics for habit tracking

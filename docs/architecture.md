# Arquitectura de Orbyte

## Principio

Orbyte mantiene una sola dirección de datos:

```text
localStorage -> WorkspaceDomain -> UniverseData -> interfaz 2D
```

`WorkspaceDomain` es la fuente de verdad. `UniverseData` es una vista derivada para el canvas.
La interfaz nunca persiste coordenadas visuales como datos del producto.

## Capas

### Persistencia local

- `src/lib/browser/workspace-storage.ts`
- `src/lib/browser/workspace-templates.ts`
- clave: `orbyte.workspace.v1`

Responsabilidades: lectura, escritura, CRUD, cascadas, historial de hábitos y plantillas opt-in.
Cada mutación emite `orbyte:workspace-changed`, permitiendo refrescar la experiencia sin red.

### Mapeo visual

- `src/lib/universe-mappers.ts`
- `src/types/domain.ts`
- `src/types/universe.ts`

Convierte categorías, objetivos, tareas, subtareas y hábitos en nodos visuales. El progreso de
un objetivo combina tareas (75 %) y hábitos vinculados (25 %).

### Interacción

- `src/store/universe-store.ts`
- `src/components/universe-2d/universe-map-2d.tsx`

Zustand conserva únicamente selección, pan y estado de modales. El canvas gestiona zoom,
encuadre, minimapa y transiciones; no es una capa de persistencia.

### Experiencia

- `src/scene/orbyte-experience-2d.tsx`
- `src/components/overlays/universe-hud.tsx`
- `src/components/overlays/*-panel.tsx`
- `src/components/overlays/*-modal.tsx`

El onboarding explica la jerarquía. Una vez creado el primer sistema, la navegación se limita a
Explorar, Hábitos y Editar. El breadcrumb y “volver” siguen la jerarquía natural del dominio.

## Rendimiento

- única ruta estática `/`
- sin Three.js, WebGL, APIs ni base de datos en el bundle
- fondo estelar determinista con 64 nodos y animación en solo una fracción
- reducción adicional para punteros táctiles y `prefers-reduced-motion`
- transiciones basadas principalmente en `transform` y `opacity`

## Pruebas

`src/lib/browser/workspace-storage.test.ts` cubre:

- inicio vacío sin datos de demostración
- aplicación explícita de plantillas
- persistencia del historial de hábitos

Antes de entregar cambios deben pasar `npm test`, `npm run lint` y `npm run build`.

## Próximas mejoras justificadas

1. exportación/importación para respaldar datos locales
2. migración explícita cuando cambie el esquema `v1`
3. pruebas E2E del flujo categoría -> objetivo -> tarea -> check-in

No se debe añadir backend, autenticación o sincronización hasta que exista una necesidad real.

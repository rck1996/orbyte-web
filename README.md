# Orbyte

Orbyte organiza categorías, objetivos, tareas, subtareas y hábitos como un universo visual 2D.
Es una aplicación local-first: no requiere cuenta, servidor de datos ni conexión permanente.

## Inicio rápido

```powershell
npm install
npm run dev
```

Abre `http://localhost:3000`.

Validación completa:

```powershell
npm test
npm run lint
npm run build
```

## Flujo del producto

1. Crea una categoría o elige una plantilla.
2. Dentro de la categoría, crea un objetivo.
3. Divide el objetivo en tareas y subtareas.
4. Añade hábitos únicamente cuando representen comportamiento recurrente.

La navegación principal sigue ese mismo orden y ofrece tres superficies:

- **Explorar:** contexto, progreso y navegación entre niveles.
- **Hábitos:** creación, check-ins e historial reciente.
- **Editar:** cambios estructurales y plantillas.

## Datos y privacidad

El workspace se guarda en `localStorage` con la clave `orbyte.workspace.v1`.
El primer inicio está vacío y las plantillas solo se aplican cuando el usuario las elige.
Los datos permanecen en el navegador y no se sincronizan entre dispositivos.

## Stack esencial

- Next.js 16 y React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Zustand
- Vitest

## Estructura

```text
src/
  app/                         # única ruta pública
  components/
    overlays/                  # navegación, edición y modales
    universe-2d/               # canvas visual
  lib/
    browser/                   # persistencia y plantillas
    universe-mappers.ts        # dominio -> modelo visual
  scene/                       # composición de la experiencia
  store/                       # estado de interacción
  types/                       # dominio y vista del universo
```

Consulta [docs/architecture.md](./docs/architecture.md) para las decisiones técnicas.

## Límites actuales

- Los datos pueden perderse si se limpia el almacenamiento del navegador.
- No existe sincronización, autenticación ni colaboración multiusuario.
- Las pruebas cubren persistencia crítica, pero aún no hay pruebas E2E.

No existe ruta 3D ni backend heredado: el producto mantiene una única experiencia 2D.

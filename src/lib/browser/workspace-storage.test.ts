import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  applyWorkspaceTemplate,
  createEmptyWorkspace,
  localWorkspaceRequest,
  readLocalWorkspace,
  WORKSPACE_STORAGE_KEY,
} from "./workspace-storage";

const values = new Map<string, string>();

beforeEach(() => {
  values.clear();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
    dispatchEvent: vi.fn(),
  });
});

describe("browser workspace", () => {
  it("starts empty and does not persist preview data", () => {
    expect(createEmptyWorkspace().categories).toEqual([]);
    expect(readLocalWorkspace().habits).toEqual([]);
    expect(values.has(WORKSPACE_STORAGE_KEY)).toBe(false);
  });

  it("applies a recurring template only when requested", () => {
    applyWorkspaceTemplate("weekly-planning");
    const workspace = readLocalWorkspace();
    expect(workspace.categories).toHaveLength(1);
    expect(workspace.categories[0].name).toBe("Semana");
    expect(workspace.habits[0].completedCount).toBe(0);
  });

  it("records habit history for check-ins", async () => {
    applyWorkspaceTemplate("personal-wellbeing");
    const habit = readLocalWorkspace().habits[0];
    await localWorkspaceRequest(`/api/habits/${habit.id}`, {
      method: "PATCH",
      body: JSON.stringify({ completedCount: 1, streak: 1 }),
    });
    const updated = readLocalWorkspace().habits[0];
    expect(updated.history).toHaveLength(1);
    expect(updated.history?.[0]).toMatchObject({ delta: 1, completedCount: 1 });
  });
});

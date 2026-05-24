import "server-only";

import { readWorkspaceDomain, writeWorkspaceDomain } from "@/lib/server/universe-db";
import type { WorkspaceDomain } from "@/types/domain";

export async function readUniverseWorkspace(): Promise<WorkspaceDomain> {
  return readWorkspaceDomain();
}

export async function writeUniverseWorkspace(workspace: WorkspaceDomain): Promise<WorkspaceDomain> {
  return writeWorkspaceDomain(workspace);
}

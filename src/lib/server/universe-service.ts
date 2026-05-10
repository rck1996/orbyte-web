import "server-only";

import { readUniverseData } from "@/lib/server/universe-repository";
import type { UniverseData } from "@/types/universe";

export async function getUniverseData(): Promise<UniverseData> {
  return readUniverseData();
}

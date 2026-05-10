import "server-only";

import { universeData } from "@/config/universe";
import type { UniverseData } from "@/types/universe";

export async function readUniverseData(): Promise<UniverseData> {
  return universeData;
}

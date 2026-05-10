import "server-only";

import { readDashboardData } from "@/lib/server/dashboard-repository";
import type { DashboardData } from "@/types/dashboard";

export async function getDashboardData(): Promise<DashboardData> {
  const data = await readDashboardData();

  return data;
}

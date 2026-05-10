import "server-only";

import { dashboardData } from "@/config/dashboard";
import type { DashboardData } from "@/types/dashboard";

export async function readDashboardData(): Promise<DashboardData> {
  return dashboardData;
}

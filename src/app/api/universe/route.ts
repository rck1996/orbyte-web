import { NextResponse } from "next/server";

import { getUniverseData } from "@/lib/server/universe-service";

export async function GET() {
  const universe = await getUniverseData();

  return NextResponse.json(universe);
}

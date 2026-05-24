import { NextResponse } from "next/server";

import { getWorkspaceDomain } from "@/lib/server/universe-service";

export async function GET() {
  const workspace = await getWorkspaceDomain();
  return NextResponse.json(workspace);
}

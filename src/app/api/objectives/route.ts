import { NextResponse } from "next/server";

import { apiError, readJson } from "@/app/api/_shared/responses";
import { createObjective, getWorkspaceDomain } from "@/lib/server/universe-service";
import type { ObjectiveInput } from "@/lib/server/universe-service";

export async function GET() {
  const workspace = await getWorkspaceDomain();
  return NextResponse.json(workspace.categories.flatMap((category) => category.objectives));
}

export async function POST(request: Request) {
  try {
    const body = await readJson<ObjectiveInput>(request);
    const objective = await createObjective(body);
    return NextResponse.json(objective, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

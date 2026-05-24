import { NextResponse } from "next/server";

import { apiError, readJson } from "@/app/api/_shared/responses";
import { deleteObjective, getWorkspaceDomain, updateObjective } from "@/lib/server/universe-service";
import type { ObjectiveInput } from "@/lib/server/universe-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ objectiveId: string }> },
) {
  const { objectiveId } = await params;
  const workspace = await getWorkspaceDomain();
  const objective =
    workspace.categories.flatMap((category) => category.objectives).find((item) => item.id === objectiveId) ??
    null;

  return objective
    ? NextResponse.json(objective)
    : NextResponse.json({ error: "Objective not found." }, { status: 404 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ objectiveId: string }> },
) {
  try {
    const { objectiveId } = await params;
    const body = await readJson<Partial<ObjectiveInput>>(request);
    const objective = await updateObjective(objectiveId, body);
    return NextResponse.json(objective);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ objectiveId: string }> },
) {
  try {
    const { objectiveId } = await params;
    await deleteObjective(objectiveId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}

import { NextResponse } from "next/server";

import { apiError, readJson } from "@/app/api/_shared/responses";
import { deleteSubtask, getWorkspaceDomain, updateSubtask } from "@/lib/server/universe-service";
import type { SubtaskInput } from "@/lib/server/universe-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ subtaskId: string }> },
) {
  const { subtaskId } = await params;
  const workspace = await getWorkspaceDomain();
  const subtask =
    workspace.categories
      .flatMap((category) => category.objectives)
      .flatMap((objective) => objective.tasks)
      .flatMap((task) => task.subtasks)
      .find((item) => item.id === subtaskId) ?? null;

  return subtask
    ? NextResponse.json(subtask)
    : NextResponse.json({ error: "Subtask not found." }, { status: 404 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ subtaskId: string }> },
) {
  try {
    const { subtaskId } = await params;
    const body = await readJson<Partial<SubtaskInput>>(request);
    const subtask = await updateSubtask(subtaskId, body);
    return NextResponse.json(subtask);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ subtaskId: string }> },
) {
  try {
    const { subtaskId } = await params;
    await deleteSubtask(subtaskId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}

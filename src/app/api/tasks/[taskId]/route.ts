import { NextResponse } from "next/server";

import { apiError, readJson } from "@/app/api/_shared/responses";
import { deleteTask, getWorkspaceDomain, updateTask } from "@/lib/server/universe-service";
import type { TaskInput } from "@/lib/server/universe-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const { taskId } = await params;
  const workspace = await getWorkspaceDomain();
  const task =
    workspace.categories
      .flatMap((category) => category.objectives)
      .flatMap((objective) => objective.tasks)
      .find((item) => item.id === taskId) ?? null;

  return task
    ? NextResponse.json(task)
    : NextResponse.json({ error: "Task not found." }, { status: 404 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const { taskId } = await params;
    const body = await readJson<Partial<TaskInput>>(request);
    const task = await updateTask(taskId, body);
    return NextResponse.json(task);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const { taskId } = await params;
    await deleteTask(taskId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}

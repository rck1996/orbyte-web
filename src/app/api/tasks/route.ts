import { NextResponse } from "next/server";

import { apiError, readJson } from "@/app/api/_shared/responses";
import { createTask, getWorkspaceDomain } from "@/lib/server/universe-service";
import type { TaskInput } from "@/lib/server/universe-service";

export async function GET() {
  const workspace = await getWorkspaceDomain();
  return NextResponse.json(
    workspace.categories.flatMap((category) =>
      category.objectives.flatMap((objective) => objective.tasks),
    ),
  );
}

export async function POST(request: Request) {
  try {
    const body = await readJson<TaskInput>(request);
    const task = await createTask(body);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

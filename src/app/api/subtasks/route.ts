import { NextResponse } from "next/server";

import { apiError, readJson } from "@/app/api/_shared/responses";
import { createSubtask, getWorkspaceDomain } from "@/lib/server/universe-service";
import type { SubtaskInput } from "@/lib/server/universe-service";

export async function GET() {
  const workspace = await getWorkspaceDomain();
  return NextResponse.json(
    workspace.categories.flatMap((category) =>
      category.objectives.flatMap((objective) =>
        objective.tasks.flatMap((task) => task.subtasks),
      ),
    ),
  );
}

export async function POST(request: Request) {
  try {
    const body = await readJson<SubtaskInput>(request);
    const subtask = await createSubtask(body);
    return NextResponse.json(subtask, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

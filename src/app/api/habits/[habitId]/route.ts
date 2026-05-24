import { NextResponse } from "next/server";

import { apiError, readJson } from "@/app/api/_shared/responses";
import { deleteHabit, getWorkspaceDomain, updateHabit } from "@/lib/server/universe-service";
import type { HabitInput } from "@/lib/server/universe-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ habitId: string }> },
) {
  const { habitId } = await params;
  const workspace = await getWorkspaceDomain();
  const habit = workspace.habits.find((item) => item.id === habitId) ?? null;

  return habit
    ? NextResponse.json(habit)
    : NextResponse.json({ error: "Habit not found." }, { status: 404 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ habitId: string }> },
) {
  try {
    const { habitId } = await params;
    const body = await readJson<Partial<HabitInput>>(request);
    const habit = await updateHabit(habitId, body);
    return NextResponse.json(habit);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ habitId: string }> },
) {
  try {
    const { habitId } = await params;
    await deleteHabit(habitId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}

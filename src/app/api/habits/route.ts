import { NextResponse } from "next/server";

import { apiError, readJson } from "@/app/api/_shared/responses";
import { createHabit, listHabits } from "@/lib/server/universe-service";
import type { HabitInput } from "@/lib/server/universe-service";

export async function GET() {
  const habits = await listHabits();
  return NextResponse.json(habits);
}

export async function POST(request: Request) {
  try {
    const body = await readJson<HabitInput>(request);
    const habit = await createHabit(body);
    return NextResponse.json(habit, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

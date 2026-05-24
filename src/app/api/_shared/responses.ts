import { NextResponse } from "next/server";

import { UniverseServiceError } from "@/lib/server/universe-service";

export async function readJson<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}

export function apiError(error: unknown) {
  if (error instanceof UniverseServiceError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.code === "not_found" ? 404 : 400 },
    );
  }

  return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
}

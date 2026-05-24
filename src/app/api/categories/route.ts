import { NextResponse } from "next/server";

import { apiError, readJson } from "@/app/api/_shared/responses";
import { createCategory, getWorkspaceDomain } from "@/lib/server/universe-service";
import type { CategoryInput } from "@/lib/server/universe-service";

export async function GET() {
  const workspace = await getWorkspaceDomain();
  return NextResponse.json(workspace.categories);
}

export async function POST(request: Request) {
  try {
    const body = await readJson<CategoryInput>(request);
    const category = await createCategory(body);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

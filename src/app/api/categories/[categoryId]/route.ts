import { NextResponse } from "next/server";

import { apiError, readJson } from "@/app/api/_shared/responses";
import { deleteCategory, getWorkspaceDomain, updateCategory } from "@/lib/server/universe-service";
import type { CategoryInput } from "@/lib/server/universe-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const { categoryId } = await params;
  const workspace = await getWorkspaceDomain();
  const category = workspace.categories.find((item) => item.id === categoryId);

  return category
    ? NextResponse.json(category)
    : NextResponse.json({ error: "Category not found." }, { status: 404 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  try {
    const { categoryId } = await params;
    const body = await readJson<Partial<CategoryInput>>(request);
    const category = await updateCategory(categoryId, body);
    return NextResponse.json(category);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  try {
    const { categoryId } = await params;
    await deleteCategory(categoryId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}

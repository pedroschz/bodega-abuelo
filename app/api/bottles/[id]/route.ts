import { NextResponse } from "next/server";
import { deleteBottle, getBottle, updateBottle } from "@/lib/db";
import type { Bottle } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Ctx {
  params: { id: string };
}

export async function GET(_req: Request, { params }: Ctx) {
  const bottle = await getBottle(params.id);
  if (!bottle) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }
  return NextResponse.json(bottle);
}

export async function PATCH(req: Request, { params }: Ctx) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }
  const patch = body as Partial<Bottle>;
  const updated = await updateBottle(params.id, patch);
  if (!updated) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const removed = await deleteBottle(params.id);
  if (!removed) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { bottleExists, createBottle } from "@/lib/db";
import {
  buildBottleId,
  toBottle,
  validateBulkRow,
  type BulkInput,
} from "@/lib/bulk";

export const dynamic = "force-dynamic";

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }
  const data = body as { bottles?: unknown };
  if (!Array.isArray(data.bottles)) {
    return NextResponse.json(
      { error: "Se esperaba { bottles: [...] }" },
      { status: 400 },
    );
  }

  const rows = data.bottles as BulkInput[];
  const errors: { row: number; errors: string[] }[] = [];
  const created: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const result = validateBulkRow(rows[i]);
    if (!result.ok || !result.value) {
      errors.push({ row: i, errors: result.errors });
      continue;
    }
    const baseId = buildBottleId(result.value.name, result.value.year);
    let id = baseId;
    if (await bottleExists(id)) {
      id = `${baseId}-${randomSuffix()}`;
    }
    const bottle = toBottle(result.value, id);
    await createBottle(bottle);
    created.push(id);
  }

  return NextResponse.json({ created: created.length, errors });
}

import { NextResponse } from "next/server";
import { createBottle, bottleExists, listBottles } from "@/lib/db";
import type { Bottle } from "@/lib/types";

export const dynamic = "force-dynamic";

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}

function readString(v: unknown): string {
  if (typeof v === "string") return v.trim();
  return "";
}

function readNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return NaN;
}

export async function GET() {
  const bottles = await listBottles();
  return NextResponse.json(bottles);
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
  const data = body as Record<string, unknown>;

  const name = readString(data.name);
  const region = readString(data.region);
  const varietal = readString(data.varietal);
  const producer = readString(data.producer);
  const drinkBy = readString(data.drinkBy);
  const rack = readString(data.rack);
  const notes = readString(data.notes);
  const year = readNumber(data.year);
  const row = readNumber(data.row);
  const col = readNumber(data.col);

  const missing: string[] = [];
  if (!name) missing.push("name");
  if (!region) missing.push("region");
  if (!varietal) missing.push("varietal");
  if (!producer) missing.push("producer");
  if (!drinkBy) missing.push("drinkBy");
  if (!rack) missing.push("rack");
  if (Number.isNaN(year)) missing.push("year");
  if (Number.isNaN(row)) missing.push("row");
  if (Number.isNaN(col)) missing.push("col");

  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Faltan campos: ${missing.join(", ")}` },
      { status: 400 },
    );
  }

  const base = `${slugify(name)}-${year}`;
  let id = base;
  if (await bottleExists(id)) {
    id = `${base}-${randomSuffix()}`;
  }

  const bottle: Bottle = {
    id,
    name,
    year,
    region,
    varietal,
    producer,
    position: { rack, row, col },
    notes,
    drinkBy,
  };

  const created = await createBottle(bottle);
  return NextResponse.json(created, { status: 201 });
}

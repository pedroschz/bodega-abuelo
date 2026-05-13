import { NextResponse } from "next/server";
import bottlesData from "@/data/bottles.json";
import {
  bottleExists,
  createBottle,
  listBottles,
} from "@/lib/db";
import type { Bottle } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST() {
  const seed = bottlesData as Bottle[];
  let added = 0;
  let skipped = 0;
  for (const bottle of seed) {
    if (await bottleExists(bottle.id)) {
      skipped++;
      continue;
    }
    await createBottle(bottle);
    added++;
  }
  const total = (await listBottles()).length;
  return NextResponse.json({ added, skipped, total });
}

export async function GET() {
  const total = (await listBottles()).length;
  return NextResponse.json({ total });
}

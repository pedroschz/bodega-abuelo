import { kv } from "@vercel/kv";
import type { Bottle } from "./types";

const INDEX_KEY = "bottles:index";
const bottleKey = (id: string) => `bottle:${id}`;

type BottleHash = {
  id: string;
  name: string;
  year: number | string;
  region: string;
  varietal: string;
  producer: string;
  rack: string;
  row: number | string;
  col: number | string;
  notes: string;
  drinkBy: string;
} & Record<string, unknown>;

function toHash(b: Bottle): Record<string, string | number> {
  return {
    id: b.id,
    name: b.name,
    year: b.year,
    region: b.region,
    varietal: b.varietal,
    producer: b.producer,
    rack: b.position.rack,
    row: b.position.row,
    col: b.position.col,
    notes: b.notes,
    drinkBy: b.drinkBy,
  };
}

function fromHash(h: BottleHash | null): Bottle | null {
  if (!h || !h.id) return null;
  return {
    id: String(h.id),
    name: String(h.name),
    year: Number(h.year),
    region: String(h.region),
    varietal: String(h.varietal),
    producer: String(h.producer),
    position: {
      rack: String(h.rack),
      row: Number(h.row),
      col: Number(h.col),
    },
    notes: String(h.notes ?? ""),
    drinkBy: String(h.drinkBy),
  };
}

export async function listBottles(): Promise<Bottle[]> {
  const ids = await kv.zrange<string[]>(INDEX_KEY, 0, -1);
  if (!ids || ids.length === 0) return [];
  const pipeline = kv.pipeline();
  for (const id of ids) pipeline.hgetall(bottleKey(id));
  const results = (await pipeline.exec()) as (BottleHash | null)[];
  const bottles: Bottle[] = [];
  for (const h of results) {
    const b = fromHash(h);
    if (b) bottles.push(b);
  }
  return bottles;
}

export async function getBottle(id: string): Promise<Bottle | null> {
  const h = await kv.hgetall<BottleHash>(bottleKey(id));
  return fromHash(h);
}

export async function bottleExists(id: string): Promise<boolean> {
  return (await kv.exists(bottleKey(id))) > 0;
}

export async function createBottle(bottle: Bottle): Promise<Bottle> {
  const key = bottleKey(bottle.id);
  await kv.hset(key, toHash(bottle));
  await kv.zadd(INDEX_KEY, { score: Date.now(), member: bottle.id });
  return bottle;
}

export async function updateBottle(
  id: string,
  patch: Partial<Bottle>,
): Promise<Bottle | null> {
  const existing = await getBottle(id);
  if (!existing) return null;
  const merged: Bottle = {
    ...existing,
    ...patch,
    id,
    position: {
      ...existing.position,
      ...(patch.position ?? {}),
    },
  };
  await kv.hset(bottleKey(id), toHash(merged));
  return merged;
}

export async function deleteBottle(id: string): Promise<boolean> {
  const removed = await kv.del(bottleKey(id));
  await kv.zrem(INDEX_KEY, id);
  return removed > 0;
}

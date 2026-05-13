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
  placed?: string | number;
} & Record<string, unknown>;

function toHash(b: Bottle): Record<string, string | number> {
  const placed = b.position ? "1" : "0";
  return {
    id: b.id,
    name: b.name,
    year: b.year,
    region: b.region,
    varietal: b.varietal,
    producer: b.producer,
    rack: b.position?.rack ?? "",
    row: b.position?.row ?? "",
    col: b.position?.col ?? "",
    notes: b.notes,
    drinkBy: b.drinkBy,
    placed,
  };
}

function fromHash(h: BottleHash | null): Bottle | null {
  if (!h || !h.id) return null;
  const placedFlag = h.placed !== undefined ? String(h.placed) : undefined;
  const rackStr = h.rack === undefined || h.rack === null ? "" : String(h.rack);
  const rowStr = h.row === undefined || h.row === null ? "" : String(h.row);
  const colStr = h.col === undefined || h.col === null ? "" : String(h.col);

  // A bottle is "placed" when the flag says so, or (for legacy rows without
  // the flag) when rack/row/col are all populated with valid values.
  const hasPosition =
    placedFlag === undefined
      ? rackStr !== "" && rowStr !== "" && colStr !== ""
      : placedFlag === "1";

  return {
    id: String(h.id),
    name: String(h.name),
    year: Number(h.year),
    region: String(h.region),
    varietal: String(h.varietal),
    producer: String(h.producer),
    position: hasPosition
      ? {
          rack: rackStr,
          row: Number(rowStr),
          col: Number(colStr),
        }
      : null,
    notes: String(h.notes ?? ""),
    drinkBy: String(h.drinkBy ?? ""),
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
  const hasPositionPatch = Object.prototype.hasOwnProperty.call(patch, "position");
  let nextPosition = existing.position;
  if (hasPositionPatch) {
    const p = patch.position;
    if (p === null) {
      nextPosition = null;
    } else if (p) {
      nextPosition = {
        rack: p.rack ?? existing.position?.rack ?? "",
        row: p.row ?? existing.position?.row ?? 0,
        col: p.col ?? existing.position?.col ?? 0,
      };
    }
  }
  const merged: Bottle = {
    ...existing,
    ...patch,
    id,
    position: nextPosition,
  };
  await kv.hset(bottleKey(id), toHash(merged));
  return merged;
}

export async function deleteBottle(id: string): Promise<boolean> {
  const removed = await kv.del(bottleKey(id));
  await kv.zrem(INDEX_KEY, id);
  return removed > 0;
}

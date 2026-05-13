import type { Bottle } from "./types";

export function groupByRack(bottles: Bottle[]): Record<string, Bottle[]> {
  const out: Record<string, Bottle[]> = {};
  for (const b of bottles) {
    const key = b.position.rack;
    if (!out[key]) out[key] = [];
    out[key].push(b);
  }
  return out;
}

export function rackDimensions(bottles: Bottle[]): { rows: number; cols: number } {
  let rows = 0;
  let cols = 0;
  for (const b of bottles) {
    if (b.position.row > rows) rows = b.position.row;
    if (b.position.col > cols) cols = b.position.col;
  }
  return { rows, cols };
}

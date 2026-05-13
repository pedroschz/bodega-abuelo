import type { Bottle, BottlePosition } from "./types";

export interface BulkInput {
  nombre?: unknown;
  año?: unknown;
  productor?: unknown;
  region?: unknown;
  variedad?: unknown;
  rack?: unknown;
  fila?: unknown;
  col?: unknown;
  notas?: unknown;
  beber_antes?: unknown;
}

export interface NormalizedBottleInput {
  name: string;
  year: number | null;
  producer: string;
  region: string;
  varietal: string;
  position: BottlePosition | null;
  notes: string;
  drinkBy: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  value?: NormalizedBottleInput;
}

function stripBom(input: string): string {
  return input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
}

function asString(v: unknown): string {
  if (v === null || v === undefined) return "";
  return stripBom(String(v)).trim();
}

function parseInteger(raw: string): number | null {
  if (!raw) return null;
  if (!/^-?\d+$/.test(raw)) return null;
  return Number(raw);
}

function normalizeDate(raw: string): { iso?: string; error?: string } {
  if (!raw) return { iso: "" };
  // ISO YYYY-MM-DD
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (iso) {
    const [, y, m, d] = iso;
    return { iso: `${y}-${m}-${d}` };
  }
  // DD/MM/YYYY
  const eu = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw);
  if (eu) {
    const [, d, m, y] = eu;
    return { iso: `${y}-${m}-${d}` };
  }
  return { error: "beber_antes debe ser AAAA-MM-DD o DD/MM/AAAA" };
}

export function validateBulkRow(row: BulkInput): ValidationResult {
  const errors: string[] = [];

  const name = asString(row.nombre);
  if (!name) errors.push("nombre obligatorio");

  const yearRaw = asString(row.año);
  let year: number | null = null;
  if (yearRaw) {
    const n = parseInteger(yearRaw);
    if (n === null || n < 1900 || n > 2100) {
      errors.push("año debe ser un entero entre 1900 y 2100");
    } else {
      year = n;
    }
  }

  const producer = asString(row.productor);
  const region = asString(row.region);
  const varietal = asString(row.variedad);
  const notes = asString(row.notas);

  const rackRaw = asString(row.rack);
  const rowRaw = asString(row.fila);
  const colRaw = asString(row.col);
  const positionFieldsPresent = [rackRaw, rowRaw, colRaw].filter(Boolean);

  let position: BottlePosition | null = null;
  if (positionFieldsPresent.length > 0) {
    if (positionFieldsPresent.length < 3) {
      errors.push("si indicas rack/fila/col, los tres son obligatorios");
    } else {
      if (!/^[A-Za-z]$/.test(rackRaw)) {
        errors.push("rack debe ser una sola letra A-Z");
      }
      const fila = parseInteger(rowRaw);
      const col = parseInteger(colRaw);
      if (fila === null || fila < 1) errors.push("fila debe ser un entero positivo");
      if (col === null || col < 1) errors.push("col debe ser un entero positivo");
      if (errors.length === 0 && fila !== null && col !== null) {
        position = { rack: rackRaw.toUpperCase(), row: fila, col };
      }
    }
  }

  const drinkByRaw = asString(row.beber_antes);
  const drinkResult = normalizeDate(drinkByRaw);
  if (drinkResult.error) errors.push(drinkResult.error);
  const drinkBy = drinkResult.iso ?? "";

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    errors: [],
    value: {
      name,
      year,
      producer,
      region,
      varietal,
      position,
      notes,
      drinkBy,
    },
  };
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildBottleId(name: string, year: number | null): string {
  const base = slugify(name) || "botella";
  return year ? `${base}-${year}` : base;
}

export function toBottle(
  input: NormalizedBottleInput,
  id: string,
): Bottle {
  return {
    id,
    name: input.name,
    year: input.year ?? 0,
    region: input.region,
    varietal: input.varietal,
    producer: input.producer,
    position: input.position,
    notes: input.notes,
    drinkBy: input.drinkBy,
  };
}

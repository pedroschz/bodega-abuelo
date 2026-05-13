import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Bottle } from "../lib/types";
import { bottleExists, createBottle, listBottles } from "../lib/db";

async function main() {
  const path = resolve(process.cwd(), "data/bottles.json");
  const raw = await readFile(path, "utf-8");
  const bottles = JSON.parse(raw) as Bottle[];

  let added = 0;
  let skipped = 0;
  for (const bottle of bottles) {
    if (await bottleExists(bottle.id)) {
      console.log(`· salto ${bottle.id} (ya existe)`);
      skipped++;
      continue;
    }
    await createBottle(bottle);
    console.log(`✓ guardada ${bottle.id}`);
    added++;
  }

  const stored = await listBottles();
  console.log("");
  console.log(`Botellas añadidas: ${added}`);
  console.log(`Botellas ya presentes: ${skipped}`);
  console.log(`Total en KV: ${stored.length}`);
}

main().catch((err) => {
  console.error("Migración fallida:", err);
  process.exit(1);
});

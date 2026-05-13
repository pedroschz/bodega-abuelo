import Link from "next/link";
import { listBottles } from "@/lib/db";
import { groupByRack, unplacedBottles } from "@/lib/bottles";
import RackGrid from "@/components/RackGrid";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const bottles = await listBottles();
  const placed = bottles.filter((b) => b.position);
  const unplaced = unplacedBottles(bottles);
  const byRack = groupByRack(placed);
  const rackKeys = Object.keys(byRack).sort();

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-display text-5xl text-wine-100">
            La bodega del abuelo
          </h1>
          {unplaced.length > 0 && (
            <Link
              href="/organizar"
              className="rounded-full border border-wine-300/40 bg-wine-300/10 px-4 py-2 text-sm text-wine-100 hover:border-wine-300/80"
            >
              Sin ubicar ({unplaced.length})
            </Link>
          )}
        </div>
        <p className="max-w-2xl text-wood-200/80">
          Un mapa cariñoso de las botellas guardadas. Pulsa una para ver sus
          detalles, sus notas y cuándo conviene abrirla.
        </p>
        <div className="flex flex-wrap gap-6 pt-2 text-sm text-wood-200/70">
          <span>
            Botellas: <strong className="text-wine-100">{bottles.length}</strong>
          </span>
          <span>
            Estanterías:{" "}
            <strong className="text-wine-100">{rackKeys.length}</strong>
          </span>
          {unplaced.length > 0 && (
            <span>
              Sin ubicar:{" "}
              <strong className="text-wine-100">{unplaced.length}</strong>
            </span>
          )}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {rackKeys.map((rack) => (
          <RackGrid key={rack} rack={rack} bottles={byRack[rack]} />
        ))}
      </div>
    </div>
  );
}

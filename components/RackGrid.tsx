import Link from "next/link";
import type { Bottle } from "@/lib/types";

interface Props {
  rack: string;
  bottles: Bottle[];
}

export default function RackGrid({ rack, bottles }: Props) {
  const maxRow = Math.max(2, ...bottles.map((b) => b.position.row));
  const maxCol = Math.max(3, ...bottles.map((b) => b.position.col));

  const slotAt = (row: number, col: number) =>
    bottles.find((b) => b.position.row === row && b.position.col === col);

  const rows = Array.from({ length: maxRow }, (_, i) => i + 1);
  const cols = Array.from({ length: maxCol }, (_, i) => i + 1);

  return (
    <section className="rack-frame rounded-2xl p-5">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl text-wood-100">
          Estantería <span className="text-wine-300">{rack}</span>
        </h2>
        <span className="text-xs uppercase tracking-widest text-wood-200/60">
          {bottles.length} {bottles.length === 1 ? "botella" : "botellas"}
        </span>
      </header>

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row}
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${maxCol}, minmax(0, 1fr))` }}
          >
            {cols.map((col) => {
              const bottle = slotAt(row, col);
              if (!bottle) {
                return (
                  <div
                    key={`${row}-${col}`}
                    className="bottle-slot flex h-28 flex-col items-center justify-center rounded-lg text-wood-200/40"
                  >
                    <span className="text-[10px] uppercase tracking-widest">
                      Vacío
                    </span>
                    <span className="text-[10px] mt-1">
                      {rack}-{row}-{col}
                    </span>
                  </div>
                );
              }
              return (
                <Link
                  key={bottle.id}
                  href={`/bottle/${bottle.id}`}
                  className="bottle-slot bottle-slot--filled flex h-28 flex-col justify-between rounded-lg p-3"
                >
                  <div className="text-xs font-semibold text-wine-100 leading-tight line-clamp-2">
                    {bottle.name}
                  </div>
                  <div className="flex items-end justify-between text-[10px] text-wood-100/80">
                    <span className="uppercase tracking-wide">
                      {bottle.region}
                    </span>
                    <span className="font-display text-lg text-wood-100">
                      {bottle.year}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { getBottle } from "@/lib/db";

interface Props {
  params: { id: string };
}

export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default async function BottleDetailPage({ params }: Props) {
  const bottle = await getBottle(params.id);
  if (!bottle) notFound();

  const drinkByYear = new Date(bottle.drinkBy).getFullYear();
  const yearsLeft = drinkByYear - new Date().getFullYear();

  return (
    <article className="space-y-8">
      <Link
        href="/"
        className="inline-block text-sm text-wood-200/70 hover:text-wood-100"
      >
        ← Volver a la bodega
      </Link>

      <header className="space-y-2">
        <div className="text-xs uppercase tracking-[0.3em] text-wine-300">
          {bottle.region}
        </div>
        <h1 className="font-display text-5xl text-wine-100">{bottle.name}</h1>
        <div className="flex flex-wrap items-baseline gap-x-4 text-wood-200/80">
          <span className="font-display text-3xl text-wood-100">
            {bottle.year}
          </span>
          <span>·</span>
          <span>{bottle.producer}</span>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rack-frame rounded-2xl p-6 space-y-3">
          <h2 className="font-display text-xl text-wood-100">Ficha</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-wood-200/60">Varietal</dt>
              <dd className="text-right text-wine-100">{bottle.varietal}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-wood-200/60">Productor</dt>
              <dd className="text-right text-wine-100">{bottle.producer}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-wood-200/60">Región</dt>
              <dd className="text-right text-wine-100">{bottle.region}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-wood-200/60">Cosecha</dt>
              <dd className="text-right text-wine-100">{bottle.year}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-wood-200/60">Beber antes de</dt>
              <dd className="text-right text-wine-100">
                {formatDate(bottle.drinkBy)}{" "}
                <span className="text-xs text-wood-200/60">
                  ({yearsLeft > 0 ? `${yearsLeft} años` : "ya"})
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="rack-frame rounded-2xl p-6 space-y-3">
          <h2 className="font-display text-xl text-wood-100">Ubicación</h2>
          <div className="flex items-center gap-4">
            <div className="bottle-slot bottle-slot--filled flex h-24 w-24 flex-col items-center justify-center rounded-lg">
              <span className="text-xs uppercase tracking-widest text-wood-200/70">
                Estante
              </span>
              <span className="font-display text-3xl text-wine-100">
                {bottle.position.rack}
              </span>
            </div>
            <div className="space-y-1 text-sm text-wood-200/80">
              <div>
                Fila:{" "}
                <strong className="text-wine-100">{bottle.position.row}</strong>
              </div>
              <div>
                Columna:{" "}
                <strong className="text-wine-100">{bottle.position.col}</strong>
              </div>
              <div className="text-xs text-wood-200/60">
                Código: {bottle.position.rack}-{bottle.position.row}-
                {bottle.position.col}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rack-frame rounded-2xl p-6 space-y-3">
        <h2 className="font-display text-xl text-wood-100">Notas</h2>
        <p className="text-wood-100/90 leading-relaxed">{bottle.notes}</p>
      </section>
    </article>
  );
}

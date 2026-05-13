import { getBottles, groupByRack } from "@/lib/bottles";
import RackGrid from "@/components/RackGrid";

export default function HomePage() {
  const bottles = getBottles();
  const byRack = groupByRack(bottles);
  const rackKeys = Object.keys(byRack).sort();

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="font-display text-5xl text-wine-100">
          La bodega del abuelo
        </h1>
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

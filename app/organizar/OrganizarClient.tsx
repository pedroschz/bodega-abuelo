"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Bottle } from "@/lib/types";

interface Props {
  bottles: Bottle[];
  availableRacks: string[];
  maxRows: number;
  maxCols: number;
}

interface RowState {
  rack: string;
  row: number;
  col: number;
  saving: boolean;
  error?: string;
}

export default function OrganizarClient({
  bottles,
  availableRacks,
  maxRows,
  maxCols,
}: Props) {
  const router = useRouter();
  const [items, setItems] = useState<Bottle[]>(bottles);
  const [state, setState] = useState<Record<string, RowState>>(() => {
    const defaults: Record<string, RowState> = {};
    for (const b of bottles) {
      defaults[b.id] = {
        rack: availableRacks[0],
        row: 1,
        col: 1,
        saving: false,
      };
    }
    return defaults;
  });

  const updateState = (id: string, patch: Partial<RowState>) => {
    setState((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const handleSave = async (id: string) => {
    const s = state[id];
    if (!s) return;
    updateState(id, { saving: true, error: undefined });
    try {
      const res = await fetch(`/api/bottles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          position: { rack: s.rack, row: s.row, col: s.col },
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? `Error ${res.status}`);
      }
      setItems((prev) => prev.filter((b) => b.id !== id));
      router.refresh();
    } catch (err) {
      updateState(id, {
        saving: false,
        error: err instanceof Error ? err.message : "Error al guardar",
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="space-y-2">
          <h1 className="font-display text-4xl text-wine-100">
            Organizar botellas
          </h1>
        </header>
        <div className="rack-frame rounded-2xl p-8 text-center">
          <p className="text-wood-100">
            Todas tus botellas están ubicadas en la bodega 🎉
          </p>
          <Link href="/" className="btn-ghost mt-4 inline-block">
            Volver a la bodega
          </Link>
        </div>
      </div>
    );
  }

  const rows = Array.from({ length: maxRows }, (_, i) => i + 1);
  const cols = Array.from({ length: maxCols }, (_, i) => i + 1);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-4xl text-wine-100">
          Organizar botellas
        </h1>
        <p className="text-wood-200/80">
          Asigna estantería, fila y columna a cada botella sin ubicar.
        </p>
      </header>

      <ul className="space-y-3">
        {items.map((b) => {
          const s = state[b.id];
          if (!s) return null;
          return (
            <li
              key={b.id}
              className="rack-frame flex flex-col gap-3 rounded-2xl p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0">
                <div className="truncate font-display text-xl text-wine-100">
                  {b.name}
                </div>
                <div className="text-sm text-wood-200/80">
                  {b.producer}
                  {b.year ? ` · ${b.year}` : ""}
                </div>
                {s.error && (
                  <div className="mt-1 text-xs text-wine-200">{s.error}</div>
                )}
              </div>

              <div className="flex flex-wrap items-end gap-2">
                <label className="space-y-1 text-xs uppercase tracking-widest text-wood-200/60">
                  <span>Estantería</span>
                  <select
                    className="input-cellar"
                    value={s.rack}
                    onChange={(e) => updateState(b.id, { rack: e.target.value })}
                  >
                    {availableRacks.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-xs uppercase tracking-widest text-wood-200/60">
                  <span>Fila</span>
                  <select
                    className="input-cellar"
                    value={s.row}
                    onChange={(e) =>
                      updateState(b.id, { row: Number(e.target.value) })
                    }
                  >
                    {rows.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-xs uppercase tracking-widest text-wood-200/60">
                  <span>Columna</span>
                  <select
                    className="input-cellar"
                    value={s.col}
                    onChange={(e) =>
                      updateState(b.id, { col: Number(e.target.value) })
                    }
                  >
                    {cols.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="btn-primary disabled:opacity-50"
                  disabled={s.saving}
                  onClick={() => handleSave(b.id)}
                >
                  {s.saving ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

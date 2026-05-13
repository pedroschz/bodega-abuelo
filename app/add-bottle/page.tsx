"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddBottlePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      year: Number(form.get("year")),
      region: form.get("region"),
      varietal: form.get("varietal"),
      producer: form.get("producer"),
      drinkBy: form.get("drinkBy"),
      rack: form.get("rack"),
      row: Number(form.get("row")),
      col: Number(form.get("col")),
      notes: form.get("notes") ?? "",
    };

    try {
      const res = await fetch("/api/bottles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? `Error ${res.status}`);
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-4xl text-wine-100">
          Añadir una botella
        </h1>
        <p className="text-wood-200/80">
          Rellena los datos de la botella que quieres guardar en la bodega.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-wine-300/40 bg-wine-300/10 px-4 py-3 text-sm text-wine-100"
        >
          No se pudo guardar la botella: {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rack-frame space-y-5 rounded-2xl p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre" name="name" placeholder="Viña Tondonia Gran Reserva" required />
          <Field label="Año" name="year" type="number" placeholder="2015" required />
          <Field label="Región" name="region" placeholder="Rioja Alta" required />
          <Field label="Varietal" name="varietal" placeholder="Tempranillo" required />
          <Field
            label="Productor"
            name="producer"
            placeholder="R. López de Heredia"
            required
          />
          <Field
            label="Beber antes de"
            name="drinkBy"
            type="date"
            required
          />
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm uppercase tracking-widest text-wood-200/60">
            Posición en la bodega
          </legend>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Estante" name="rack" placeholder="A" required />
            <Field
              label="Fila"
              name="row"
              type="number"
              placeholder="1"
              required
            />
            <Field
              label="Columna"
              name="col"
              type="number"
              placeholder="1"
              required
            />
          </div>
        </fieldset>

        <div className="space-y-2">
          <label className="text-sm uppercase tracking-widest text-wood-200/60">
            Notas
          </label>
          <textarea
            name="notes"
            rows={4}
            className="input-cellar"
            placeholder="Decantar, maridajes, recuerdos…"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <a href="/" className="btn-ghost">
            Cancelar
          </a>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Guardando…" : "Guardar botella"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="space-y-1 block">
      <span className="text-sm uppercase tracking-widest text-wood-200/60">
        {label}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="input-cellar"
      />
    </label>
  );
}

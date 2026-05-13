"use client";

import { useState } from "react";

export default function AddBottlePage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rack-frame mx-auto max-w-xl rounded-2xl p-8 text-center space-y-4">
        <h1 className="font-display text-3xl text-wine-100">
          ¡Botella registrada!
        </h1>
        <p className="text-wood-200/80">
          Hemos guardado los datos en local. En esta versión inicial la bodega
          usa <code className="text-wine-300">data/bottles.json</code> como
          almacenamiento, así que añade la nueva entrada al fichero para que
          aparezca en la vista de bodega.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="btn-ghost"
        >
          Añadir otra
        </button>
      </div>
    );
  }

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
          <button type="submit" className="btn-primary">
            Guardar botella
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

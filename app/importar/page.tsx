"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Papa from "papaparse";
import {
  validateBulkRow,
  type BulkInput,
  type NormalizedBottleInput,
} from "@/lib/bulk";

interface ParsedRow {
  raw: BulkInput;
  errors: string[];
  ok: boolean;
  value?: NormalizedBottleInput;
}

const TEMPLATE_CSV = `nombre,año,productor,region,variedad,rack,fila,col,notas,beber_antes
# Ejemplo: rellena una fila por botella. rack es una letra A-Z; fila y col son enteros.
# Si dejas rack/fila/col vacíos, la botella quedará "sin ubicar" y podrás colocarla luego.
Viña Tondonia Reserva,2012,R. López de Heredia,Rioja Alta,Tempranillo,A,1,1,Decantar 1 hora,2035-12-31
Mauro VS,2018,Bodegas Mauro,Castilla y León,Tinta de Toro,,,,Aún por colocar,2030-06-30
`;

function downloadTemplate() {
  const blob = new Blob([TEMPLATE_CSV], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bodega-plantilla.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ImportarPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [filename, setFilename] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<
    | { kind: "error" | "ok" | "info"; text: string }
    | null
  >(null);

  const counts = useMemo(() => {
    let valid = 0;
    let invalid = 0;
    for (const r of rows) {
      if (r.ok) valid++;
      else invalid++;
    }
    return { valid, invalid };
  }, [rows]);

  const handleFile = (file: File) => {
    setFilename(file.name);
    setBanner(null);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => h.replace(/^﻿/, "").trim(),
      comments: "#",
      delimitersToGuess: [",", ";", "\t"],
      complete: (results) => {
        const parsed: ParsedRow[] = results.data.map((row) => {
          const input = row as unknown as BulkInput;
          const result = validateBulkRow(input);
          return {
            raw: input,
            errors: result.errors,
            ok: result.ok,
            value: result.value,
          };
        });
        setRows(parsed);
        if (parsed.length === 0) {
          setBanner({
            kind: "info",
            text: "No se han encontrado filas en el archivo.",
          });
        }
      },
      error: (err) => {
        setBanner({
          kind: "error",
          text: `No se pudo leer el CSV: ${err.message}`,
        });
        setRows([]);
      },
    });
  };

  const handleSubmit = async () => {
    const payload = rows
      .filter((r) => r.ok && r.value)
      .map((r) => {
        const v = r.value!;
        return {
          nombre: v.name,
          año: v.year,
          productor: v.producer,
          region: v.region,
          variedad: v.varietal,
          rack: v.position?.rack ?? "",
          fila: v.position?.row ?? "",
          col: v.position?.col ?? "",
          notas: v.notes,
          beber_antes: v.drinkBy,
        };
      });
    if (payload.length === 0) return;
    setSubmitting(true);
    setBanner(null);
    try {
      const res = await fetch("/api/bottles/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bottles: payload }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? `Error ${res.status}`);
      }
      const data = (await res.json()) as {
        created: number;
        errors: { row: number; errors: string[] }[];
      };
      setBanner({
        kind: "ok",
        text: `Se han importado ${data.created} botellas.`,
      });
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 800);
    } catch (err) {
      setBanner({
        kind: "error",
        text:
          err instanceof Error ? err.message : "Error al importar las botellas",
      });
      setSubmitting(false);
    }
  };

  const preview = rows.slice(0, 20);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-4xl text-wine-100">
          Importar bodega desde CSV
        </h1>
        <p className="text-wood-200/80">
          Sube un archivo CSV con tus botellas. Puedes dejar la ubicación
          vacía y asignarla después en{" "}
          <Link className="underline" href="/organizar">
            Organizar
          </Link>
          .
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn-ghost" onClick={downloadTemplate}>
          Descargar plantilla
        </button>
        <label className="btn-primary cursor-pointer">
          Elegir archivo CSV
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </label>
        {filename && (
          <span className="text-sm text-wood-200/70">{filename}</span>
        )}
        <Link href="/" className="btn-ghost ml-auto">
          Cancelar
        </Link>
      </div>

      {banner && (
        <div
          role="alert"
          className={`rounded-lg px-4 py-3 text-sm ${
            banner.kind === "error"
              ? "border border-wine-300/40 bg-wine-300/10 text-wine-100"
              : banner.kind === "ok"
                ? "border border-emerald-400/40 bg-emerald-400/10 text-emerald-100"
                : "border border-wood-200/40 bg-wood-200/10 text-wood-100"
          }`}
        >
          {banner.text}
        </div>
      )}

      {rows.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-wood-200/80">
              <strong className="text-wine-100">{counts.valid}</strong> válidas,{" "}
              <strong className="text-wine-100">{counts.invalid}</strong> con
              errores
              {rows.length > 20 && (
                <span className="text-wood-200/60">
                  {" "}
                  · mostrando las primeras 20 filas
                </span>
              )}
            </p>
            <button
              type="button"
              className="btn-primary disabled:opacity-50"
              onClick={handleSubmit}
              disabled={counts.valid === 0 || submitting}
            >
              {submitting
                ? "Importando…"
                : `Importar ${counts.valid} filas válidas`}
            </button>
          </div>

          <div className="rack-frame overflow-x-auto rounded-2xl p-4">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-widest text-wood-200/60">
                <tr>
                  <th className="px-2 py-2">#</th>
                  <th className="px-2 py-2">Nombre</th>
                  <th className="px-2 py-2">Año</th>
                  <th className="px-2 py-2">Productor</th>
                  <th className="px-2 py-2">Región</th>
                  <th className="px-2 py-2">Variedad</th>
                  <th className="px-2 py-2">Ubicación</th>
                  <th className="px-2 py-2">Beber antes</th>
                  <th className="px-2 py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((r, i) => {
                  const raw = r.raw as Record<string, unknown>;
                  const pickRaw = (k: string) =>
                    raw[k] === undefined || raw[k] === null
                      ? ""
                      : String(raw[k]);
                  const ubic =
                    pickRaw("rack") || pickRaw("fila") || pickRaw("col")
                      ? `${pickRaw("rack") || "?"}-${pickRaw("fila") || "?"}-${pickRaw("col") || "?"}`
                      : "—";
                  return (
                    <tr
                      key={i}
                      className={`border-t border-wood-700/30 ${
                        r.ok ? "" : "bg-wine-300/10"
                      }`}
                    >
                      <td className="px-2 py-2 align-top text-wood-200/60">
                        {i + 1}
                      </td>
                      <td className="px-2 py-2 align-top text-wine-100">
                        {pickRaw("nombre")}
                      </td>
                      <td className="px-2 py-2 align-top">{pickRaw("año")}</td>
                      <td className="px-2 py-2 align-top">
                        {pickRaw("productor")}
                      </td>
                      <td className="px-2 py-2 align-top">
                        {pickRaw("region")}
                      </td>
                      <td className="px-2 py-2 align-top">
                        {pickRaw("variedad")}
                      </td>
                      <td className="px-2 py-2 align-top text-wood-200/80">
                        {ubic}
                      </td>
                      <td className="px-2 py-2 align-top">
                        {pickRaw("beber_antes")}
                      </td>
                      <td className="px-2 py-2 align-top">
                        {r.ok ? (
                          <span className="text-emerald-300">OK</span>
                        ) : (
                          <div className="space-y-1 text-xs text-wine-200">
                            {r.errors.map((err, j) => (
                              <div key={j}>· {err}</div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

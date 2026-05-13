# Bodega Abuelo

Visualizador de la bodega de vinos del abuelo. Una pequeña aplicación web hecha
con cariño para tener un mapa claro de las botellas guardadas, su ubicación en
las estanterías, y las notas de cata.

Construido con **Next.js 14 (App Router)**, **TypeScript** y **Tailwind CSS**.

## Funcionalidades

- Vista de bodega: rejilla por estanterías, filas y columnas.
- Detalle de botella: ficha completa con varietal, productor, región, cosecha,
  ubicación, notas y fecha sugerida para beberla.
- Formulario para añadir botellas (versión inicial: confirma los datos y
  conviene replicarlos en `data/bottles.json`).
- Datos iniciales con ~12 botellas españolas (Rioja, Ribera del Duero, etc.).
- Estética oscura de bodega: rojos vino profundos, maderas cálidas.

## Requisitos

- Node.js 18.17 o superior
- npm 9 o superior (o pnpm / yarn si lo prefieres)

## Puesta en marcha

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

## Estructura

```
app/
  page.tsx              # Vista principal de la bodega (rejilla)
  add-bottle/page.tsx   # Formulario de alta de botellas
  bottle/[id]/page.tsx  # Detalle de cada botella
  layout.tsx            # Layout común, navegación, fuentes
  globals.css           # Estilos globales y tema de bodega
components/
  RackGrid.tsx          # Componente que dibuja una estantería
lib/
  bottles.ts            # Lectura y agrupado de botellas
  types.ts              # Tipado de Botella
data/
  bottles.json          # Almacenamiento inicial de la bodega
```

## Añadir botellas

En esta primera versión la bodega se almacena como un JSON estático en
`data/bottles.json`. Para añadir una botella nueva:

1. Abre `data/bottles.json`.
2. Añade un objeto al array con esta forma:

```json
{
  "id": "identificador-unico",
  "name": "Nombre de la botella",
  "year": 2018,
  "region": "Rioja Alta",
  "varietal": "Tempranillo",
  "producer": "Nombre del productor",
  "position": { "rack": "A", "row": 1, "col": 1 },
  "notes": "Notas, maridajes, recuerdos…",
  "drinkBy": "2035-12-31"
}
```

3. Guarda el fichero. La rejilla se actualizará al recargar.

## Despliegue en Vercel

La forma más sencilla de publicar la bodega es con [Vercel](https://vercel.com).

1. Sube el repositorio a GitHub (ya está configurado en `origin/main`).
2. Entra en [vercel.com/new](https://vercel.com/new) e importa el repositorio.
3. Vercel detecta automáticamente Next.js. No necesitas configurar nada extra:
   - **Framework Preset**: Next.js
   - **Build Command**: `next build` (por defecto)
   - **Output Directory**: `.next` (por defecto)
4. Pulsa **Deploy**. En menos de un minuto la bodega estará en línea.

Cada `git push` a `main` despliega automáticamente una nueva versión.

### Despliegue desde la línea de comandos

Si prefieres la CLI:

```bash
npm install -g vercel
vercel
```

Sigue las instrucciones interactivas. Para producción:

```bash
vercel --prod
```

## Scripts disponibles

| Comando         | Descripción                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Arranca el servidor de desarrollo.       |
| `npm run build` | Compila la aplicación para producción.   |
| `npm run start` | Sirve la aplicación ya compilada.        |
| `npm run lint`  | Ejecuta ESLint con la config de Next.    |

## Ideas para más adelante

- API de escritura para que el formulario de "Añadir botella" persista directamente.
- Filtros por región, varietal o fecha de consumo.
- Importar / exportar la bodega a CSV.
- Modo "lista de la compra" con sugerencias por temporada.

---

Hecho con cariño para la bodega del abuelo.

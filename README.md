# Bodega Abuelo

Visualizador de la bodega de vinos del abuelo. Una pequeña aplicación web hecha
con cariño para tener un mapa claro de las botellas guardadas, su ubicación en
las estanterías, y las notas de cata.

Construido con **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS** y
**Vercel KV** (Upstash Redis) como capa de datos.

## Funcionalidades

- Vista de bodega: rejilla por estanterías, filas y columnas.
- Detalle de botella: ficha completa con varietal, productor, región, cosecha,
  ubicación, notas y fecha sugerida para beberla.
- Formulario para añadir botellas que persiste en la base de datos.
- API REST (`/api/bottles`) para crear, listar, leer, actualizar y borrar.
- Datos iniciales con ~12 botellas españolas (Rioja, Ribera del Duero, etc.).
- Estética oscura de bodega: rojos vino profundos, maderas cálidas.

## Requisitos

- Node.js 18.17 o superior
- npm 9 o superior (o pnpm / yarn si lo prefieres)
- Una base **Vercel KV** (Upstash Redis) con sus credenciales en `.env.local`

## Variables de entorno

`.env.local` (no se sube al repo) debe contener al menos:

```
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
KV_URL=...
```

En Vercel estas variables se inyectan automáticamente al conectar la base KV al
proyecto.

## Puesta en marcha

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

> La primera vez que arrancas el proyecto la base KV está vacía. Para cargar la
> bodega inicial con las 12 botellas, lanza la migración:
>
> ```bash
> npx tsx scripts/migrate.ts
> ```
>
> El script lee `data/bottles.json` y escribe cada botella en KV. Es idempotente:
> si una botella ya está en la base se omite. Carga las credenciales desde
> `.env.local` automáticamente.

## Capa de datos

La bodega se almacena en **Vercel KV** (Upstash Redis):

- Cada botella vive en un *hash* en la clave `bottle:{id}`.
- Un *sorted set* en `bottles:index` mantiene el orden de inserción y permite
  listar la bodega entera.

Las funciones tipadas del DAO están en `lib/db.ts`:

| Función                  | Qué hace                                    |
| ------------------------ | ------------------------------------------- |
| `listBottles()`          | Devuelve todas las botellas por orden.      |
| `getBottle(id)`          | Lee una botella concreta.                   |
| `createBottle(bottle)`   | Crea una botella y la añade al índice.      |
| `updateBottle(id, patch)`| Actualiza campos sueltos.                   |
| `deleteBottle(id)`       | Borra la botella y la saca del índice.      |

Las páginas (`app/page.tsx`, `app/bottle/[id]/page.tsx`) son *server components*
con `export const dynamic = "force-dynamic"`, así que cada petición vuelve a
consultar KV y siempre se ven los datos más recientes.

## API

| Método   | Ruta                  | Descripción                          |
| -------- | --------------------- | ------------------------------------ |
| `GET`    | `/api/bottles`        | Lista todas las botellas.            |
| `POST`   | `/api/bottles`        | Crea una botella nueva.              |
| `GET`    | `/api/bottles/[id]`   | Lee una botella.                     |
| `PATCH`  | `/api/bottles/[id]`   | Actualiza campos parciales.          |
| `DELETE` | `/api/bottles/[id]`   | Borra una botella.                   |

El formulario de **Añadir botella** hace `POST` a `/api/bottles` con `fetch`,
y redirige a la vista de bodega cuando termina. Las botellas nuevas aparecen
en cuanto se recarga el listado (las páginas siempre piden datos frescos).

## Estructura

```
app/
  page.tsx                 # Vista principal de la bodega (rejilla)
  add-bottle/page.tsx      # Formulario de alta (cliente, POST a la API)
  bottle/[id]/page.tsx     # Detalle de cada botella
  api/bottles/route.ts     # GET (lista) / POST (crear)
  api/bottles/[id]/route.ts# GET / PATCH / DELETE
  layout.tsx               # Layout común, navegación, fuentes
  globals.css              # Estilos globales y tema de bodega
components/
  RackGrid.tsx             # Componente que dibuja una estantería
lib/
  db.ts                    # Helpers tipados sobre Vercel KV
  bottles.ts               # Utilidades de agrupado por estantería
  types.ts                 # Tipado de Botella
data/
  bottles.json             # Semilla inicial (se carga vía scripts/migrate.ts)
scripts/
  migrate.ts               # Vuelca data/bottles.json en KV (idempotente)
```

## Despliegue en Vercel

1. Sube el repositorio a GitHub.
2. Importa el proyecto en [vercel.com/new](https://vercel.com/new).
3. Conecta una integración de **Upstash Redis** (Vercel Marketplace) al
   proyecto. Vercel inyectará las variables `KV_*` automáticamente en cada
   entorno (Production / Preview / Development).
4. Vercel detecta Next.js sin más configuración. Pulsa **Deploy**.
5. La primera vez, lanza la migración una vez (en local con las credenciales de
   producción cargadas, o desde una *Vercel Function* manual).

Cada `git push` a `main` despliega automáticamente una nueva versión.

## Scripts disponibles

| Comando                        | Descripción                                    |
| ------------------------------ | ---------------------------------------------- |
| `npm run dev`                  | Arranca el servidor de desarrollo.             |
| `npm run build`                | Compila la aplicación para producción.         |
| `npm run start`                | Sirve la aplicación ya compilada.              |
| `npm run lint`                 | Ejecuta ESLint con la config de Next.          |
| `npx tsx scripts/migrate.ts`   | Carga `data/bottles.json` en Vercel KV.        |

## Ideas para más adelante

- Edición y borrado de botellas desde la interfaz.
- Filtros por región, varietal o fecha de consumo.
- Importar / exportar la bodega a CSV.
- Modo "lista de la compra" con sugerencias por temporada.

---

Hecho con cariño para la bodega del abuelo.

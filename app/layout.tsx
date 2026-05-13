import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bodega Abuelo",
  description: "Visualizador de la bodega de vinos del abuelo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-ES">
      <body className="min-h-screen">
        <header className="border-b border-wood-700/40 bg-black/30 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="font-display text-3xl text-wine-100">Bodega</span>
              <span className="font-display text-3xl text-wood-200">Abuelo</span>
            </Link>
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/" className="btn-ghost">
                Bodega
              </Link>
              <Link href="/add-bottle" className="btn-primary">
                Añadir botella
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        <footer className="mt-16 border-t border-wood-700/40 py-6 text-center text-xs text-wood-200/60">
          Hecho con cariño para la bodega del abuelo · {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}

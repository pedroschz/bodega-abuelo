import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center space-y-4">
      <h1 className="font-display text-5xl text-wine-100">404</h1>
      <p className="text-wood-200/80">
        No encontramos esa botella en la bodega.
      </p>
      <Link href="/" className="btn-primary inline-block">
        Volver a la bodega
      </Link>
    </div>
  );
}

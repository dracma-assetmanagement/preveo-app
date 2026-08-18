import Link from "next/link";

export default function NoEncontrado() {
  return (
    <div className="contenedor flex min-h-dvh flex-col items-center justify-center text-center">
      <p className="text-[40px]">🍻</p>
      <h1 className="mt-4 font-display text-[22px] font-bold">Esta página no existe</h1>
      <p className="mt-2 text-[14px] text-mute">Volvé al inicio y armá la ronda.</p>
      <Link href="/" className="btn-principal mt-7 w-full max-w-[260px]">
        Ir al inicio
      </Link>
    </div>
  );
}

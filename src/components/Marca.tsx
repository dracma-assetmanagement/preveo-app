export function Marca({ compacta = false }: { compacta?: boolean }) {
  if (compacta) {
    return (
      <span className="font-display text-lg font-bold tracking-tight text-ambar">
        Preveo <span className="text-base">🍻</span>
      </span>
    );
  }
  return (
    <div className="text-center">
      <h1 className="font-display text-[44px] font-bold leading-none tracking-tight text-ambar">
        Preveo <span className="align-middle text-[38px]">🍻</span>
      </h1>
      <p className="mt-3 text-[15px] text-mute">El juego definitivo para las juntadas</p>
    </div>
  );
}

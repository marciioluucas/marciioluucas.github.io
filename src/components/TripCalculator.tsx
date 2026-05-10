import { useState } from 'react';
import { custoViagem, tanquesPorViagem } from '../lib/calc';

interface Props {
  custoGasolinaKm: number;
  custoEtanolKm: number;
  autonomiaGasolina: number;
  autonomiaEtanol: number;
  tanque: number;
}

export default function TripCalculator(p: Props) {
  const [km, setKm] = useState<number>(0);
  const fmt = (n: number) => n.toFixed(2).replace('.', ',');
  const valid = km > 0;
  return (
    <section className="mt-6 rounded-lg bg-surface p-4">
      <h3 className="text-lg font-semibold">Cálculo de viagem</h3>
      <label className="mt-3 block">
        <span className="text-sm text-muted">Quantos km vai rodar?</span>
        <input type="number" inputMode="decimal" min={0} step={1}
          value={km || ''} onChange={(e) => setKm(parseFloat(e.target.value) || 0)}
          className="mt-1 w-full rounded-md border border-border bg-bg p-3" />
      </label>
      {valid && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <p>Gasolina: <strong className="text-primary">R$ {fmt(custoViagem(km, p.custoGasolinaKm))}</strong> · {tanquesPorViagem(km, p.autonomiaGasolina, p.tanque)} tanque(s)</p>
          <p>Etanol: <strong className="text-accent">R$ {fmt(custoViagem(km, p.custoEtanolKm))}</strong> · {tanquesPorViagem(km, p.autonomiaEtanol, p.tanque)} tanque(s)</p>
        </div>
      )}
    </section>
  );
}

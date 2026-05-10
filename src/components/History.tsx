import { useEffect, useState } from 'react';
import { storage, type CalcHistoryEntry } from '../lib/storage';

function rel(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m} min atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  return `${Math.floor(h / 24)}d atrás`;
}

export default function History() {
  const [items, setItems] = useState<CalcHistoryEntry[]>([]);
  useEffect(() => { setItems(storage.getHistory()); }, []);
  if (items.length === 0) return null;
  return (
    <section className="mt-6">
      <h3 className="text-lg font-semibold">Histórico</h3>
      <ul className="mt-2 space-y-2">
        {items.map((e) => (
          <li key={e.ts} className="rounded-md border border-border bg-surface p-3 text-sm">
            <p className="text-muted">{rel(e.ts)} · {e.vehicleSlug}</p>
            <p>G R$ {e.prices.gasolina.toFixed(2)} · E R$ {e.prices.etanol.toFixed(2)}</p>
            <p className="text-muted">Cidade: {e.vencedorCidade} · Estrada: {e.vencedorEstrada}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

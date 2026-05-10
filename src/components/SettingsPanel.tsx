import { useEffect, useState } from 'react';
import { storage, type Settings } from '../lib/storage';

export default function SettingsPanel() {
  const [s, setS] = useState<Settings>({ regra70: 0.7, theme: 'dark' });
  const [hasVehicle, setHasVehicle] = useState(false);

  useEffect(() => {
    setS(storage.getSettings());
    setHasVehicle(!!storage.getUserVehicle());
  }, []);

  function update(patch: Partial<Settings>) {
    const next = { ...s, ...patch };
    setS(next);
    storage.setSettings(next);
  }

  return (
    <div className="container-app py-6 space-y-8">
      <section className="rounded-lg bg-surface p-4">
        <h2 className="text-lg font-semibold">Regra dos {Math.round(s.regra70 * 100)}%</h2>
        <p className="text-sm text-muted">Limite a partir do qual etanol deixa de compensar.</p>
        <input type="range" min={0.65} max={0.75} step={0.01}
          value={s.regra70}
          onChange={(e) => update({ regra70: parseFloat(e.target.value) })}
          className="mt-3 w-full" />
        <p className="mt-2 text-sm">Atual: <strong>{Math.round(s.regra70 * 100)}%</strong></p>
      </section>

      <section className="rounded-lg bg-surface p-4">
        <h2 className="text-lg font-semibold">Histórico</h2>
        <button type="button"
          onClick={() => { storage.clearHistory(); alert('Histórico limpo'); }}
          className="mt-3 rounded-md border border-border px-4 py-2 text-sm">
          Limpar histórico
        </button>
      </section>

      <section className="rounded-lg bg-surface p-4">
        <h2 className="text-lg font-semibold">Meu carro</h2>
        <p className="text-sm text-muted">{hasVehicle ? 'Salvo no navegador.' : 'Nenhum carro salvo.'}</p>
        {hasVehicle && (
          <button type="button"
            onClick={() => { storage.clearUserVehicle(); setHasVehicle(false); }}
            className="mt-3 rounded-md border border-danger px-4 py-2 text-sm text-danger">
            Remover meu carro
          </button>
        )}
      </section>
    </div>
  );
}

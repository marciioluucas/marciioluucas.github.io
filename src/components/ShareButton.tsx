import { useState } from 'react';
import { encodeShare } from '../lib/share';

interface Props {
  vehicleSlug: string;
  precoGasolina: number;
  precoEtanol: number;
}

export default function ShareButton(p: Props) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const qs = encodeShare({ v: p.vehicleSlug, g: p.precoGasolina, e: p.precoEtanol });
    const url = `${window.location.origin}${window.location.pathname}?${qs}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Cálculo de combustível', url }); return; } catch {}
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button type="button" onClick={share}
      className="mt-4 w-full rounded-md border border-border bg-surface py-3 text-sm">
      {copied ? '✓ Link copiado' : '🔗 Compartilhar resultado'}
    </button>
  );
}

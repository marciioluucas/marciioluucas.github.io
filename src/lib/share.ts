export type ShareParams = {
  v?: string; // vehicle slug
  g?: number; // preço gasolina
  e?: number; // preço etanol
};

export function encodeShare(p: ShareParams): string {
  const u = new URLSearchParams();
  if (p.v) u.set('v', p.v);
  if (p.g != null) u.set('g', p.g.toFixed(2));
  if (p.e != null) u.set('e', p.e.toFixed(2));
  return u.toString();
}

export function decodeShare(search: string): ShareParams {
  const u = new URLSearchParams(search);
  const out: ShareParams = {};
  const v = u.get('v'); if (v) out.v = v;
  const g = u.get('g'); if (g) out.g = parseFloat(g);
  const e = u.get('e'); if (e) out.e = parseFloat(e);
  return out;
}

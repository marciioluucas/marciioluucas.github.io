const NS = 'fuelcalc:';

export type StoredVehicle = {
  slug: string;
  marca: string;
  modelo: string;
  ano: number;
  tanque: number;
  autonomia: {
    gasolina: { cidade: number; estrada: number };
    etanol: { cidade: number; estrada: number };
  };
};

export type Settings = {
  regra70: number;
  theme: 'dark' | 'light';
};

export type CalcHistoryEntry = {
  ts: number;
  vehicleSlug: string;
  prices: { gasolina: number; etanol: number };
  vencedorCidade: 'gasolina' | 'etanol';
  vencedorEstrada: 'gasolina' | 'etanol';
};

const isBrowser = () => typeof window !== 'undefined';

function get<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const v = localStorage.getItem(NS + key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch { return fallback; }
}

function set<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try { localStorage.setItem(NS + key, JSON.stringify(value)); } catch {}
}

function remove(key: string): void {
  if (!isBrowser()) return;
  try { localStorage.removeItem(NS + key); } catch {}
}

export const storage = {
  getUserVehicle: (): StoredVehicle | null => get('user-vehicle', null),
  setUserVehicle: (v: StoredVehicle) => set('user-vehicle', v),
  clearUserVehicle: () => remove('user-vehicle'),

  getSettings: (): Settings => get('settings', { regra70: 0.7, theme: 'dark' }),
  setSettings: (s: Settings) => set('settings', s),

  getHistory: (): CalcHistoryEntry[] => get('history', []),
  pushHistory: (e: CalcHistoryEntry) => {
    const arr = get<CalcHistoryEntry[]>('history', []);
    arr.unshift(e);
    set('history', arr.slice(0, 5));
  },
  clearHistory: () => remove('history'),

  getLastPrices: () => get('last-prices', { gasolina: 0, etanol: 0 }),
  setLastPrices: (p: { gasolina: number; etanol: number }) =>
    set('last-prices', p),
};

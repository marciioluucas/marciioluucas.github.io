# Fuel Calculator v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever a calculadora de combustível como app Astro estático, mobile-first, multi-veículo (preset Civic EXL 2018 preservado), com SEO state-of-the-art e 3 slots AdSense, mantendo deploy no GitHub Pages.

**Architecture:** Astro 5 (output static) + Tailwind 4 + TypeScript estrito. Lógica de cálculo em módulo puro testável (Vitest). Persistência via localStorage. Geração estática de páginas por veículo via `getStaticPaths`. SEO via componente `<SEO>` reutilizável + JSON-LD + sitemap automático + OG images dinâmicas.

**Tech Stack:** Astro 5, Tailwind CSS 4, TypeScript, Vitest, Chart.js (lazy), @astrojs/sitemap, GitHub Actions.

**AdSense slots (publicador `ca-pub-4225671400356326`):**
- after-hero: `9152601323` (Display)
- in-article: `1798901087` (In-article)
- footer: `2582311903` (Display, existente)

---

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `astro.config.mjs` | Config Astro: site URL, integrations (sitemap), output static |
| `tailwind.config.ts` | Tokens de cor, fontes, breakpoints |
| `tsconfig.json` | TS estrito |
| `package.json` | Deps e scripts |
| `vitest.config.ts` | Config Vitest |
| `src/styles/globals.css` | Tailwind base + variáveis CSS |
| `src/lib/calc.ts` | Funções puras de cálculo |
| `src/lib/storage.ts` | Wrappers localStorage namespaced |
| `src/lib/share.ts` | Encode/decode query params para share |
| `src/lib/seo.ts` | Helpers JSON-LD |
| `src/lib/ads.ts` | Constantes dos slots AdSense |
| `src/data/vehicles.json` | Catálogo de veículos |
| `src/data/faq.json` | FAQ comum |
| `src/components/SEO.astro` | Meta tags + JSON-LD por página |
| `src/components/AdSlot.astro` | Wrapper AdSense |
| `src/components/Header.astro` | Header sticky mobile |
| `src/components/Footer.astro` | Footer com links |
| `src/components/FuelCalculator.astro` | Form + lógica de UI |
| `src/components/VehicleSelector.tsx` | Marca/modelo/ano + cadastro |
| `src/components/ResultsCards.astro` | Resultado mobile-first |
| `src/components/SavingsHighlight.astro` | Banner regra 70% |
| `src/components/History.tsx` | Últimos 5 cálculos |
| `src/components/TripCalculator.tsx` | Custo de viagem |
| `src/components/ShareButton.tsx` | navigator.share + clipboard fallback |
| `src/components/FAQ.astro` | FAQ visível casa com schema |
| `src/layouts/Layout.astro` | HTML shell + AdSense script |
| `src/pages/index.astro` | Home calculadora genérica |
| `src/pages/calculadora/[slug].astro` | Página por veículo |
| `src/pages/configuracoes.astro` | Settings |
| `src/pages/sobre.astro` | Sobre |
| `src/pages/404.astro` | 404 custom |
| `public/ads.txt` | Mantido como está |
| `public/robots.txt` | Permissivo + sitemap |
| `tests/calc.test.ts` | Testes Vitest |
| `.github/workflows/deploy.yml` | Build + deploy gh-pages |

---

## Task 1: Setup do projeto Astro

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `astro.config.mjs`
- Create: `.gitignore`
- Create: `src/pages/index.astro` (placeholder)

- [ ] **Step 1: Backup do index.html antigo**

```bash
git mv index.html legacy-index.html
git commit -m "chore: archive legacy index.html before v2 rewrite"
```

- [ ] **Step 2: Inicializar Node project**

Run: `npm init -y`

- [ ] **Step 3: Criar package.json final**

```json
{
  "name": "fuel-calc",
  "version": "2.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/react": "^4.0.0",
    "@astrojs/sitemap": "^3.2.0",
    "@astrojs/tailwind": "^5.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 4: Instalar deps**

Run: `npm install`
Expected: sem erros, `node_modules` criado

- [ ] **Step 5: Criar tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": ["src", "tests"],
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

- [ ] **Step 6: Criar astro.config.mjs**

```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://marciioluucas.github.io',
  output: 'static',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    react(),
    sitemap(),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
});
```

- [ ] **Step 7: Criar .gitignore**

```
node_modules/
dist/
.astro/
.env*
.DS_Store
coverage/
```

- [ ] **Step 8: Criar src/pages/index.astro placeholder**

```astro
---
---
<html lang="pt-BR">
  <head><meta charset="utf-8"><title>Fuel Calc v2</title></head>
  <body><h1>Setup OK</h1></body>
</html>
```

- [ ] **Step 9: Verificar build**

Run: `npm run build`
Expected: `dist/` criado, `dist/index.html` existe

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json tsconfig.json astro.config.mjs .gitignore src/
git commit -m "chore: bootstrap astro project"
```

---

## Task 2: Tailwind + design tokens

**Files:**
- Create: `tailwind.config.ts`
- Create: `src/styles/globals.css`
- Create: `public/fonts/` (placeholder)
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Criar tailwind.config.ts**

```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0B1220',
        surface: '#131C2E',
        border: '#1E293B',
        primary: '#F59E0B',
        accent: '#10B981',
        danger: '#EF4444',
        text: '#E5E7EB',
        muted: '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
} satisfies Config;
```

- [ ] **Step 2: Criar src/styles/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    color-scheme: dark;
  }
  html {
    font-size: 16px;
  }
  body {
    @apply bg-bg text-text font-sans antialiased;
  }
  input, button, select, textarea {
    font: inherit;
  }
}

@layer utilities {
  .container-app {
    @apply mx-auto w-full max-w-2xl px-4;
  }
}
```

- [ ] **Step 3: Atualizar src/pages/index.astro pra usar globals**

```astro
---
import '../styles/globals.css';
---
<html lang="pt-BR" class="dark">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Calculadora de Combustível</title>
  </head>
  <body>
    <main class="container-app py-8">
      <h1 class="text-3xl font-bold text-primary">Tailwind OK</h1>
      <p class="text-muted mt-2">Mobile-first base ativa.</p>
    </main>
  </body>
</html>
```

- [ ] **Step 4: Build e verificar visualmente**

Run: `npm run dev`
Verificar em http://localhost:4321 — fundo escuro, título amber, mobile responsivo

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts src/styles/ src/pages/index.astro
git commit -m "feat: tailwind tokens and base styles"
```

---

## Task 3: Lógica de cálculo (TDD)

**Files:**
- Create: `vitest.config.ts`
- Create: `src/lib/calc.ts`
- Create: `tests/calc.test.ts`

- [ ] **Step 1: Criar vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
```

- [ ] **Step 2: Escrever testes (failing)**

Create `tests/calc.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  custoPorKm,
  melhorCombustivel,
  economiaPorTanque,
  regraSetenta,
  custoViagem,
  tanquesPorViagem,
} from '../src/lib/calc';

describe('custoPorKm', () => {
  it('divide preço pela autonomia', () => {
    expect(custoPorKm(4.9, 10)).toBeCloseTo(0.49);
  });
  it('lança erro com autonomia zero', () => {
    expect(() => custoPorKm(4.9, 0)).toThrow();
  });
});

describe('melhorCombustivel', () => {
  it('escolhe gasolina quando custo é menor', () => {
    expect(melhorCombustivel(0.5, 0.6)).toBe('gasolina');
  });
  it('escolhe etanol quando custo é menor', () => {
    expect(melhorCombustivel(0.6, 0.5)).toBe('etanol');
  });
  it('empate fica com gasolina por convenção', () => {
    expect(melhorCombustivel(0.5, 0.5)).toBe('gasolina');
  });
});

describe('economiaPorTanque', () => {
  it('calcula economia em R$ usando o tanque do vencedor', () => {
    const r = economiaPorTanque({
      precoGasolina: 4.9, autonomiaGasolina: 10,
      precoEtanol: 3.79, autonomiaEtanol: 7,
      tanque: 56,
    });
    expect(r.vencedor).toBe('gasolina');
    expect(r.economiaRs).toBeGreaterThan(0);
  });
});

describe('regraSetenta', () => {
  it('vale quando ratio <= limite', () => {
    const r = regraSetenta(3.43, 4.9, 0.7);
    expect(r.ratio).toBeCloseTo(0.7);
    expect(r.vale).toBe(true);
  });
  it('não vale acima do limite', () => {
    const r = regraSetenta(3.6, 4.9, 0.7);
    expect(r.vale).toBe(false);
  });
});

describe('custoViagem', () => {
  it('multiplica km por custo/km', () => {
    expect(custoViagem(100, 0.49)).toBeCloseTo(49);
  });
});

describe('tanquesPorViagem', () => {
  it('arredonda para cima', () => {
    expect(tanquesPorViagem(1000, 10, 56)).toBe(2);
  });
});
```

- [ ] **Step 3: Rodar testes — devem falhar**

Run: `npm test`
Expected: FAIL — módulo não existe

- [ ] **Step 4: Implementar src/lib/calc.ts**

```ts
export type Combustivel = 'gasolina' | 'etanol';

export function custoPorKm(preco: number, autonomia: number): number {
  if (autonomia <= 0) throw new Error('autonomia deve ser > 0');
  return preco / autonomia;
}

export function melhorCombustivel(
  custoGasolina: number,
  custoEtanol: number
): Combustivel {
  return custoGasolina <= custoEtanol ? 'gasolina' : 'etanol';
}

export type EconomiaInput = {
  precoGasolina: number;
  autonomiaGasolina: number;
  precoEtanol: number;
  autonomiaEtanol: number;
  tanque: number;
};

export type EconomiaResult = {
  vencedor: Combustivel;
  custoGasolinaKm: number;
  custoEtanolKm: number;
  autonomiaTanqueGasolina: number;
  autonomiaTanqueEtanol: number;
  economiaRs: number;
};

export function economiaPorTanque(i: EconomiaInput): EconomiaResult {
  const cg = custoPorKm(i.precoGasolina, i.autonomiaGasolina);
  const ce = custoPorKm(i.precoEtanol, i.autonomiaEtanol);
  const vencedor = melhorCombustivel(cg, ce);
  const autoGas = i.autonomiaGasolina * i.tanque;
  const autoEta = i.autonomiaEtanol * i.tanque;
  const economiaRs = vencedor === 'gasolina'
    ? (ce - cg) * autoGas
    : (cg - ce) * autoEta;
  return {
    vencedor,
    custoGasolinaKm: cg,
    custoEtanolKm: ce,
    autonomiaTanqueGasolina: autoGas,
    autonomiaTanqueEtanol: autoEta,
    economiaRs: Math.max(0, economiaRs),
  };
}

export function regraSetenta(
  precoEtanol: number,
  precoGasolina: number,
  limite = 0.7
): { ratio: number; vale: boolean } {
  if (precoGasolina <= 0) throw new Error('preço gasolina deve ser > 0');
  const ratio = precoEtanol / precoGasolina;
  return { ratio, vale: ratio <= limite };
}

export function custoViagem(km: number, custoPorKm: number): number {
  return km * custoPorKm;
}

export function tanquesPorViagem(
  km: number,
  autonomia: number,
  tanque: number
): number {
  if (autonomia <= 0 || tanque <= 0) throw new Error('valores devem ser > 0');
  return Math.ceil(km / (autonomia * tanque));
}
```

- [ ] **Step 5: Rodar testes — devem passar**

Run: `npm test`
Expected: PASS — 9+ testes verdes

- [ ] **Step 6: Commit**

```bash
git add src/lib/calc.ts tests/calc.test.ts vitest.config.ts
git commit -m "feat: pure calculation module with vitest coverage"
```

---

## Task 4: Storage + Share + Ads helpers

**Files:**
- Create: `src/lib/storage.ts`
- Create: `src/lib/share.ts`
- Create: `src/lib/ads.ts`

- [ ] **Step 1: Criar src/lib/storage.ts**

```ts
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
```

- [ ] **Step 2: Criar src/lib/share.ts**

```ts
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
```

- [ ] **Step 3: Criar src/lib/ads.ts**

```ts
export const ADSENSE_CLIENT = 'ca-pub-4225671400356326';

export const AD_SLOTS = {
  afterHero: '9152601323',
  inArticle: '1798901087',
  footer: '2582311903',
} as const;
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/storage.ts src/lib/share.ts src/lib/ads.ts
git commit -m "feat: storage, share and ads helpers"
```

---

## Task 5: Vehicles dataset + FAQ

**Files:**
- Create: `src/data/vehicles.json`
- Create: `src/data/faq.json`
- Create: `src/lib/vehicles.ts`

- [ ] **Step 1: Criar src/data/vehicles.json**

```json
{
  "civic-2018": {
    "slug": "civic-2018",
    "marca": "Honda",
    "modelo": "Civic EXL",
    "ano": 2018,
    "tanque": 56,
    "autonomia": {
      "gasolina": { "cidade": 8.5, "estrada": 14.07 },
      "etanol":   { "cidade": 5.4, "estrada": 10.7 }
    }
  },
  "gol-1.0-2020": {
    "slug": "gol-1.0-2020",
    "marca": "Volkswagen",
    "modelo": "Gol 1.0",
    "ano": 2020,
    "tanque": 55,
    "autonomia": {
      "gasolina": { "cidade": 11.5, "estrada": 14.0 },
      "etanol":   { "cidade": 7.8, "estrada": 9.6 }
    }
  },
  "hb20-1.0-2022": {
    "slug": "hb20-1.0-2022",
    "marca": "Hyundai",
    "modelo": "HB20 1.0",
    "ano": 2022,
    "tanque": 50,
    "autonomia": {
      "gasolina": { "cidade": 11.8, "estrada": 14.4 },
      "etanol":   { "cidade": 8.2, "estrada": 9.9 }
    }
  },
  "onix-1.0-2023": {
    "slug": "onix-1.0-2023",
    "marca": "Chevrolet",
    "modelo": "Onix 1.0",
    "ano": 2023,
    "tanque": 44,
    "autonomia": {
      "gasolina": { "cidade": 11.3, "estrada": 14.6 },
      "etanol":   { "cidade": 7.9, "estrada": 10.1 }
    }
  },
  "corolla-xei-2022": {
    "slug": "corolla-xei-2022",
    "marca": "Toyota",
    "modelo": "Corolla XEi",
    "ano": 2022,
    "tanque": 60,
    "autonomia": {
      "gasolina": { "cidade": 9.8, "estrada": 13.5 },
      "etanol":   { "cidade": 6.7, "estrada": 9.3 }
    }
  },
  "compass-2021": {
    "slug": "compass-2021",
    "marca": "Jeep",
    "modelo": "Compass",
    "ano": 2021,
    "tanque": 60,
    "autonomia": {
      "gasolina": { "cidade": 7.8, "estrada": 11.5 },
      "etanol":   { "cidade": 5.5, "estrada": 8.1 }
    }
  },
  "renegade-2020": {
    "slug": "renegade-2020",
    "marca": "Jeep",
    "modelo": "Renegade",
    "ano": 2020,
    "tanque": 48,
    "autonomia": {
      "gasolina": { "cidade": 8.6, "estrada": 12.2 },
      "etanol":   { "cidade": 5.9, "estrada": 8.5 }
    }
  },
  "polo-2022": {
    "slug": "polo-2022",
    "marca": "Volkswagen",
    "modelo": "Polo",
    "ano": 2022,
    "tanque": 52,
    "autonomia": {
      "gasolina": { "cidade": 10.9, "estrada": 13.8 },
      "etanol":   { "cidade": 7.5, "estrada": 9.5 }
    }
  },
  "t-cross-2022": {
    "slug": "t-cross-2022",
    "marca": "Volkswagen",
    "modelo": "T-Cross",
    "ano": 2022,
    "tanque": 52,
    "autonomia": {
      "gasolina": { "cidade": 9.4, "estrada": 12.7 },
      "etanol":   { "cidade": 6.5, "estrada": 8.8 }
    }
  },
  "strada-2023": {
    "slug": "strada-2023",
    "marca": "Fiat",
    "modelo": "Strada",
    "ano": 2023,
    "tanque": 55,
    "autonomia": {
      "gasolina": { "cidade": 10.1, "estrada": 13.6 },
      "etanol":   { "cidade": 7.0, "estrada": 9.4 }
    }
  }
}
```

- [ ] **Step 2: Criar src/lib/vehicles.ts**

```ts
import vehiclesJson from '../data/vehicles.json';
import type { StoredVehicle } from './storage';

export type Vehicle = StoredVehicle;

export const vehicles: Record<string, Vehicle> = vehiclesJson as Record<string, Vehicle>;

export const DEFAULT_SLUG = 'civic-2018';

export function getVehicle(slug: string): Vehicle | undefined {
  return vehicles[slug];
}

export function listVehicles(): Vehicle[] {
  return Object.values(vehicles);
}

export function vehicleTitle(v: Vehicle): string {
  return `${v.marca} ${v.modelo} ${v.ano}`;
}
```

- [ ] **Step 3: Criar src/data/faq.json**

```json
[
  {
    "q": "Etanol ou gasolina: qual compensa mais?",
    "a": "Depende do preço relativo. A regra prática: se o etanol custa até 70% do preço da gasolina, ele compensa. Acima disso, a gasolina rende mais por real gasto. Mas o ideal é calcular com a autonomia real do seu carro."
  },
  {
    "q": "Como funciona a regra dos 70%?",
    "a": "Etanol tem cerca de 70% da eficiência energética da gasolina. Se ele estiver custando 70% ou menos do preço da gasolina, vale abastecer com etanol. Você pode ajustar esse limite em Configurações conforme seu carro."
  },
  {
    "q": "Como descubro a autonomia real do meu carro?",
    "a": "Ao abastecer, zere o hodômetro parcial. No próximo abastecimento, divida os km rodados pelos litros que entraram. Faça isso 3-4 vezes em condições parecidas (cidade ou estrada) e tire a média."
  },
  {
    "q": "Por que separar cidade e estrada?",
    "a": "Carros consomem diferente em cada situação. Cidade tem paradas, semáforos e baixa velocidade — consumo maior. Estrada tem velocidade constante — consumo menor. Calcular separado dá resultado mais preciso."
  },
  {
    "q": "Os preços salvos ficam onde?",
    "a": "Apenas no seu navegador (localStorage). Nada é enviado para servidores. Você pode limpar tudo em Configurações."
  },
  {
    "q": "Funciona para carros flex apenas?",
    "a": "Sim, a calculadora foi desenhada pra carros flex. Para carros 100% gasolina ou diesel, a comparação não se aplica."
  }
]
```

- [ ] **Step 4: Commit**

```bash
git add src/data/ src/lib/vehicles.ts
git commit -m "feat: vehicles dataset and faq content"
```

---

## Task 6: Layout base + Header + Footer + AdSense script

**Files:**
- Create: `src/layouts/Layout.astro`
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`
- Create: `src/components/AdSlot.astro`
- Create: `src/components/SEO.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Criar src/components/SEO.astro**

```astro
---
interface Props {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  jsonLd?: object | object[];
}
const { title, description, canonical, ogImage, jsonLd } = Astro.props;
const url = canonical ?? Astro.url.href;
const image = ogImage ?? new URL('/og-default.png', Astro.site).toString();
const ldArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
---
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={url} />
<meta property="og:type" content="website" />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={url} />
<meta property="og:image" content={image} />
<meta property="og:locale" content="pt_BR" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={image} />
{ldArray.map((ld) => (
  <script type="application/ld+json" set:html={JSON.stringify(ld)} />
))}
```

- [ ] **Step 2: Criar src/components/AdSlot.astro**

```astro
---
import { ADSENSE_CLIENT } from '../lib/ads';
interface Props {
  slot: string;
  format?: string;
  layout?: string;
  responsive?: boolean;
  testMode?: boolean;
}
const { slot, format = 'auto', layout, responsive = true, testMode = import.meta.env.DEV } = Astro.props;
---
{testMode ? (
  <div class="my-6 grid h-24 place-items-center rounded-md border border-dashed border-border bg-surface text-xs text-muted">
    AdSlot {slot} ({format})
  </div>
) : (
  <ins class="adsbygoogle my-6 block"
       style="display:block"
       data-ad-client={ADSENSE_CLIENT}
       data-ad-slot={slot}
       data-ad-format={format}
       data-ad-layout={layout}
       data-full-width-responsive={responsive ? 'true' : 'false'}></ins>
  <script is:inline>
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  </script>
)}
```

- [ ] **Step 3: Criar src/components/Header.astro**

```astro
---
---
<header class="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur">
  <div class="container-app flex h-14 items-center justify-between">
    <a href="/" class="text-base font-bold text-primary">⛽ Fuel Calc</a>
    <nav class="flex items-center gap-4 text-sm text-muted">
      <a href="/configuracoes" aria-label="Configurações">⚙</a>
      <a href="/sobre">Sobre</a>
    </nav>
  </div>
</header>
```

- [ ] **Step 4: Criar src/components/Footer.astro**

```astro
---
---
<footer class="mt-12 border-t border-border bg-surface py-6 text-center text-sm text-muted">
  <div class="container-app">
    <nav class="mb-3 flex flex-wrap justify-center gap-4">
      <a href="/" class="hover:text-text">Calculadora</a>
      <a href="/calculadora/civic-2018" class="hover:text-text">Civic 2018</a>
      <a href="/configuracoes" class="hover:text-text">Configurações</a>
      <a href="/sobre" class="hover:text-text">Sobre</a>
    </nav>
    <p>Feito com <span class="text-danger">♥</span> por <a class="underline hover:text-text" href="https://www.linkedin.com/in/marcio-lucas/">Márcio Lucas</a></p>
  </div>
</footer>
```

- [ ] **Step 5: Criar src/layouts/Layout.astro**

```astro
---
import '../styles/globals.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { ADSENSE_CLIENT } from '../lib/ads';
interface Props { title: string }
const { title } = Astro.props;
const isDev = import.meta.env.DEV;
---
<!doctype html>
<html lang="pt-BR" class="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#0B1220" />
    <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
    <link rel="apple-touch-icon" href="/apple-touch-icon-152x152.png" />
    <slot name="head" />
    {!isDev && (
      <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`} crossorigin="anonymous"></script>
    )}
  </head>
  <body class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-1"><slot /></main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 6: Atualizar src/pages/index.astro pra usar Layout**

```astro
---
import Layout from '../layouts/Layout.astro';
import SEO from '../components/SEO.astro';
import AdSlot from '../components/AdSlot.astro';
import { AD_SLOTS } from '../lib/ads';
---
<Layout title="Calculadora de Combustível">
  <SEO slot="head"
    title="Calculadora de Combustível: Etanol ou Gasolina? Calcule Já"
    description="Descubra qual combustível compensa pra seu carro. Calculadora rápida de etanol vs gasolina com regra dos 70% e preset Honda Civic 2018."
  />
  <section class="container-app py-8">
    <h1 class="text-3xl font-bold sm:text-4xl">Etanol ou Gasolina?</h1>
    <p class="mt-2 text-muted">Calcule qual combustível compensa pro seu carro.</p>
    <AdSlot slot={AD_SLOTS.afterHero} />
  </section>
</Layout>
```

- [ ] **Step 7: Verificar dev**

Run: `npm run dev`
Verificar: header sticky, footer com links, ad placeholder no dev

- [ ] **Step 8: Commit**

```bash
git add src/layouts/ src/components/ src/pages/index.astro
git commit -m "feat: base layout with seo, header, footer and ad component"
```

---

## Task 7: FuelCalculator + ResultsCards + SavingsHighlight

**Files:**
- Create: `src/components/FuelCalculator.astro`
- Create: `src/components/ResultsCards.astro`
- Create: `src/components/SavingsHighlight.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Criar src/components/SavingsHighlight.astro**

```astro
---
interface Props {
  ratio: number;
  vale: boolean;
  limite: number;
}
const { ratio, vale, limite } = Astro.props;
const pct = (ratio * 100).toFixed(0);
const limPct = (limite * 100).toFixed(0);
---
<div class={`mt-6 rounded-lg border p-4 ${vale ? 'border-accent bg-accent/10' : 'border-danger bg-danger/10'}`}>
  <p class="text-sm text-muted">Regra dos {limPct}%</p>
  <p class="mt-1 text-lg font-semibold">
    Etanol está em <strong>{pct}%</strong> do preço da gasolina —
    {vale ? <span class="text-accent">✅ Compensa</span> : <span class="text-danger">❌ Não compensa</span>}
  </p>
</div>
```

- [ ] **Step 2: Criar src/components/ResultsCards.astro**

Mobile: cards empilhados. Desktop (md+): tabela 2 colunas.

```astro
---
interface ContextoProps {
  titulo: string;
  vencedor: 'gasolina' | 'etanol';
  custoGasolinaKm: number;
  custoEtanolKm: number;
  autonomiaTanqueGasolina: number;
  autonomiaTanqueEtanol: number;
  economiaRs: number;
}
const p = Astro.props as ContextoProps;
const fmt = (n: number) => n.toFixed(2).replace('.', ',');
---
<section class="mt-6 rounded-lg bg-surface p-4">
  <h3 class="text-lg font-semibold">{p.titulo}</h3>
  <div class="mt-3 grid gap-3 sm:grid-cols-2">
    <article class={`rounded-md p-3 ${p.vencedor === 'gasolina' ? 'bg-primary/10 border border-primary/30' : 'bg-bg/40'}`}>
      <p class="text-xs uppercase tracking-wide text-muted">Gasolina {p.vencedor === 'gasolina' && <span aria-hidden="true">★</span>}</p>
      <p class="mt-1 text-2xl font-bold text-primary">R$ {fmt(p.custoGasolinaKm)}<span class="text-xs text-muted">/km</span></p>
      <p class="mt-1 text-sm text-muted">Tanque: {p.autonomiaTanqueGasolina.toFixed(0)} km</p>
    </article>
    <article class={`rounded-md p-3 ${p.vencedor === 'etanol' ? 'bg-accent/10 border border-accent/30' : 'bg-bg/40'}`}>
      <p class="text-xs uppercase tracking-wide text-muted">Etanol {p.vencedor === 'etanol' && <span aria-hidden="true">★</span>}</p>
      <p class="mt-1 text-2xl font-bold text-accent">R$ {fmt(p.custoEtanolKm)}<span class="text-xs text-muted">/km</span></p>
      <p class="mt-1 text-sm text-muted">Tanque: {p.autonomiaTanqueEtanol.toFixed(0)} km</p>
    </article>
  </div>
  {p.economiaRs > 0 && (
    <p class="mt-3 text-sm">Economia por tanque: <strong class="text-accent">R$ {fmt(p.economiaRs)}</strong></p>
  )}
</section>
```

- [ ] **Step 3: Criar src/components/FuelCalculator.astro**

```astro
---
import { vehicles, DEFAULT_SLUG } from '../lib/vehicles';
import AdSlot from './AdSlot.astro';
import { AD_SLOTS } from '../lib/ads';

interface Props { initialSlug?: string }
const { initialSlug = DEFAULT_SLUG } = Astro.props;
const v = vehicles[initialSlug] ?? vehicles[DEFAULT_SLUG];
---
<form id="combustivel-form" class="container-app py-4 space-y-6"
      data-tanque={v.tanque}>
  <div>
    <label class="block text-sm text-muted" for="vehicle-select">Veículo</label>
    <select id="vehicle-select" class="mt-1 w-full rounded-md border border-border bg-surface p-3">
      {Object.values(vehicles).map((veh) => (
        <option value={veh.slug} selected={veh.slug === v.slug}>
          {veh.marca} {veh.modelo} {veh.ano}
        </option>
      ))}
    </select>
  </div>

  <fieldset class="space-y-3">
    <legend class="text-base font-semibold">Cidade — autonomia (km/l)</legend>
    <div class="grid gap-3 sm:grid-cols-2">
      <label class="block">
        <span class="text-sm text-muted">Gasolina</span>
        <input id="ag-cidade" type="number" inputmode="decimal" step="0.01" min="0"
               value={v.autonomia.gasolina.cidade}
               class="mt-1 w-full rounded-md border border-border bg-surface p-3" />
      </label>
      <label class="block">
        <span class="text-sm text-muted">Etanol</span>
        <input id="ae-cidade" type="number" inputmode="decimal" step="0.01" min="0"
               value={v.autonomia.etanol.cidade}
               class="mt-1 w-full rounded-md border border-border bg-surface p-3" />
      </label>
    </div>
  </fieldset>

  <fieldset class="space-y-3">
    <legend class="text-base font-semibold">Estrada — autonomia (km/l)</legend>
    <div class="grid gap-3 sm:grid-cols-2">
      <label class="block">
        <span class="text-sm text-muted">Gasolina</span>
        <input id="ag-estrada" type="number" inputmode="decimal" step="0.01" min="0"
               value={v.autonomia.gasolina.estrada}
               class="mt-1 w-full rounded-md border border-border bg-surface p-3" />
      </label>
      <label class="block">
        <span class="text-sm text-muted">Etanol</span>
        <input id="ae-estrada" type="number" inputmode="decimal" step="0.01" min="0"
               value={v.autonomia.etanol.estrada}
               class="mt-1 w-full rounded-md border border-border bg-surface p-3" />
      </label>
    </div>
  </fieldset>

  <fieldset class="space-y-3">
    <legend class="text-base font-semibold">Preços (R$/litro)</legend>
    <div class="grid gap-3 sm:grid-cols-2">
      <label class="block">
        <span class="text-sm text-muted">Gasolina</span>
        <input id="preco-g" type="number" inputmode="decimal" step="0.01" min="0"
               value="4.90"
               class="mt-1 w-full rounded-md border border-border bg-surface p-3" />
      </label>
      <label class="block">
        <span class="text-sm text-muted">Etanol</span>
        <input id="preco-e" type="number" inputmode="decimal" step="0.01" min="0"
               value="3.79"
               class="mt-1 w-full rounded-md border border-border bg-surface p-3" />
      </label>
    </div>
  </fieldset>

  <button type="submit"
          class="w-full rounded-md bg-primary py-4 text-base font-bold text-bg active:scale-[0.99]">
    Calcular
  </button>
</form>

<div id="resultado" aria-live="polite"></div>

<script>
  import { economiaPorTanque, regraSetenta } from '../lib/calc';
  import { storage } from '../lib/storage';
  import { vehicles, DEFAULT_SLUG } from '../lib/vehicles';
  import { decodeShare } from '../lib/share';

  const form = document.getElementById('combustivel-form') as HTMLFormElement;
  const select = document.getElementById('vehicle-select') as HTMLSelectElement;
  const resultadoEl = document.getElementById('resultado')!;

  const $ = (id: string) => document.getElementById(id) as HTMLInputElement;

  function applyVehicle(slug: string) {
    const v = vehicles[slug];
    if (!v) return;
    $('ag-cidade').value = String(v.autonomia.gasolina.cidade);
    $('ae-cidade').value = String(v.autonomia.etanol.cidade);
    $('ag-estrada').value = String(v.autonomia.gasolina.estrada);
    $('ae-estrada').value = String(v.autonomia.etanol.estrada);
    form.dataset.tanque = String(v.tanque);
  }

  // restore from URL or last prices
  const params = decodeShare(window.location.search);
  if (params.v && vehicles[params.v]) {
    select.value = params.v;
    applyVehicle(params.v);
  }
  if (params.g) $('preco-g').value = params.g.toFixed(2);
  if (params.e) $('preco-e').value = params.e.toFixed(2);
  if (!params.g && !params.e) {
    const last = storage.getLastPrices();
    if (last.gasolina) $('preco-g').value = last.gasolina.toFixed(2);
    if (last.etanol) $('preco-e').value = last.etanol.toFixed(2);
  }

  select.addEventListener('change', () => applyVehicle(select.value));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const tanque = Number(form.dataset.tanque ?? 50);
    const precoG = parseFloat($('preco-g').value);
    const precoE = parseFloat($('preco-e').value);
    const cidade = economiaPorTanque({
      precoGasolina: precoG, autonomiaGasolina: parseFloat($('ag-cidade').value),
      precoEtanol: precoE, autonomiaEtanol: parseFloat($('ae-cidade').value),
      tanque,
    });
    const estrada = economiaPorTanque({
      precoGasolina: precoG, autonomiaGasolina: parseFloat($('ag-estrada').value),
      precoEtanol: precoE, autonomiaEtanol: parseFloat($('ae-estrada').value),
      tanque,
    });
    const settings = storage.getSettings();
    const r70 = regraSetenta(precoE, precoG, settings.regra70);

    storage.setLastPrices({ gasolina: precoG, etanol: precoE });
    storage.pushHistory({
      ts: Date.now(), vehicleSlug: select.value,
      prices: { gasolina: precoG, etanol: precoE },
      vencedorCidade: cidade.vencedor, vencedorEstrada: estrada.vencedor,
    });

    const fmt = (n: number) => n.toFixed(2).replace('.', ',');
    const tone = r70.vale ? 'border-accent bg-accent/10' : 'border-danger bg-danger/10';
    const valeLabel = r70.vale ? '<span class="text-accent">✅ Compensa</span>' : '<span class="text-danger">❌ Não compensa</span>';
    const card = (titulo: string, c: typeof cidade) => `
      <section class="mt-6 rounded-lg bg-surface p-4">
        <h3 class="text-lg font-semibold">${titulo}</h3>
        <div class="mt-3 grid gap-3 sm:grid-cols-2">
          <article class="${c.vencedor === 'gasolina' ? 'bg-primary/10 border border-primary/30' : 'bg-bg/40'} rounded-md p-3">
            <p class="text-xs uppercase tracking-wide text-muted">Gasolina ${c.vencedor === 'gasolina' ? '★' : ''}</p>
            <p class="mt-1 text-2xl font-bold text-primary">R$ ${fmt(c.custoGasolinaKm)}<span class="text-xs text-muted">/km</span></p>
            <p class="mt-1 text-sm text-muted">Tanque: ${c.autonomiaTanqueGasolina.toFixed(0)} km</p>
          </article>
          <article class="${c.vencedor === 'etanol' ? 'bg-accent/10 border border-accent/30' : 'bg-bg/40'} rounded-md p-3">
            <p class="text-xs uppercase tracking-wide text-muted">Etanol ${c.vencedor === 'etanol' ? '★' : ''}</p>
            <p class="mt-1 text-2xl font-bold text-accent">R$ ${fmt(c.custoEtanolKm)}<span class="text-xs text-muted">/km</span></p>
            <p class="mt-1 text-sm text-muted">Tanque: ${c.autonomiaTanqueEtanol.toFixed(0)} km</p>
          </article>
        </div>
        ${c.economiaRs > 0 ? `<p class="mt-3 text-sm">Economia por tanque: <strong class="text-accent">R$ ${fmt(c.economiaRs)}</strong></p>` : ''}
      </section>
    `;
    const lim = (settings.regra70 * 100).toFixed(0);
    const pct = (r70.ratio * 100).toFixed(0);
    resultadoEl.innerHTML = `
      <div class="container-app">
        <div class="mt-6 rounded-lg border p-4 ${tone}">
          <p class="text-sm text-muted">Regra dos ${lim}%</p>
          <p class="mt-1 text-lg font-semibold">Etanol em <strong>${pct}%</strong> do preço da gasolina — ${valeLabel}</p>
        </div>
        ${card('Cidade', cidade)}
        ${card('Estrada', estrada)}
      </div>
    `;
    resultadoEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
</script>
```

- [ ] **Step 4: Atualizar src/pages/index.astro**

```astro
---
import Layout from '../layouts/Layout.astro';
import SEO from '../components/SEO.astro';
import AdSlot from '../components/AdSlot.astro';
import FuelCalculator from '../components/FuelCalculator.astro';
import { AD_SLOTS } from '../lib/ads';
---
<Layout title="Calculadora de Combustível">
  <SEO slot="head"
    title="Calculadora de Combustível: Etanol ou Gasolina? — Vale a Pena"
    description="Calcule rápido qual combustível compensa: etanol ou gasolina. Mobile-first, com regra dos 70% e suporte a múltiplos veículos."
  />
  <section class="container-app pt-8 pb-2">
    <h1 class="text-3xl font-bold sm:text-4xl">Etanol ou Gasolina?</h1>
    <p class="mt-2 text-muted">Calcule em segundos qual combustível rende mais pro seu carro.</p>
    <AdSlot slot={AD_SLOTS.afterHero} />
  </section>
  <FuelCalculator />
  <div class="container-app">
    <AdSlot slot={AD_SLOTS.inArticle} format="fluid" layout="in-article" />
  </div>
  <div class="container-app">
    <AdSlot slot={AD_SLOTS.footer} />
  </div>
</Layout>
```

- [ ] **Step 5: Testar fluxo no dev**

Run: `npm run dev`
Verificar: form preenche com Civic, troca de veículo atualiza autonomias, calcular mostra 2 cards + banner regra 70%, scroll suave, mobile width 375px usa coluna única.

- [ ] **Step 6: Commit**

```bash
git add src/components/ src/pages/index.astro
git commit -m "feat: fuel calculator with results and 70% rule"
```

---

## Task 8: Página dinâmica `/calculadora/[slug]`

**Files:**
- Create: `src/pages/calculadora/[slug].astro`

- [ ] **Step 1: Criar página dinâmica**

```astro
---
import Layout from '../../layouts/Layout.astro';
import SEO from '../../components/SEO.astro';
import AdSlot from '../../components/AdSlot.astro';
import FuelCalculator from '../../components/FuelCalculator.astro';
import { listVehicles, getVehicle, vehicleTitle } from '../../lib/vehicles';
import { AD_SLOTS } from '../../lib/ads';

export function getStaticPaths() {
  return listVehicles().map((v) => ({ params: { slug: v.slug } }));
}

const { slug } = Astro.params;
const v = getVehicle(slug!);
if (!v) return Astro.redirect('/404');
const title = `Calculadora ${vehicleTitle(v)}: Etanol ou Gasolina?`;
const description = `Veja se etanol ou gasolina compensa pro ${vehicleTitle(v)}. Autonomias pré-configuradas e cálculo na hora.`;
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Vehicle',
  brand: { '@type': 'Brand', name: v.marca },
  model: v.modelo,
  modelDate: String(v.ano),
  fuelType: 'Flex (gasolina/etanol)',
  fuelEfficiency: [
    { '@type': 'QuantitativeValue', value: v.autonomia.gasolina.cidade, unitText: 'km/l (gasolina cidade)' },
    { '@type': 'QuantitativeValue', value: v.autonomia.gasolina.estrada, unitText: 'km/l (gasolina estrada)' },
    { '@type': 'QuantitativeValue', value: v.autonomia.etanol.cidade, unitText: 'km/l (etanol cidade)' },
    { '@type': 'QuantitativeValue', value: v.autonomia.etanol.estrada, unitText: 'km/l (etanol estrada)' },
  ],
};
---
<Layout title={title}>
  <SEO slot="head" title={title} description={description} jsonLd={jsonLd} />
  <section class="container-app pt-8 pb-2">
    <p class="text-sm text-muted"><a href="/" class="underline">← Calculadora</a></p>
    <h1 class="mt-2 text-3xl font-bold sm:text-4xl">{vehicleTitle(v)}</h1>
    <p class="mt-2 text-muted">Etanol ou gasolina pro seu {v.marca} {v.modelo}? Calcule abaixo.</p>
    <AdSlot slot={AD_SLOTS.afterHero} />
  </section>
  <FuelCalculator initialSlug={v.slug} />
  <div class="container-app">
    <AdSlot slot={AD_SLOTS.inArticle} format="fluid" layout="in-article" />
    <AdSlot slot={AD_SLOTS.footer} />
  </div>
</Layout>
```

- [ ] **Step 2: Build e verificar rotas**

Run: `npm run build`
Expected: `dist/calculadora/civic-2018/index.html` e demais slugs gerados

- [ ] **Step 3: Commit**

```bash
git add src/pages/calculadora/
git commit -m "feat: per-vehicle static routes with vehicle schema"
```

---

## Task 9: TripCalculator + ShareButton + History

**Files:**
- Create: `src/components/TripCalculator.tsx`
- Create: `src/components/ShareButton.tsx`
- Create: `src/components/History.tsx`
- Modify: `src/components/FuelCalculator.astro` (montar componentes)

- [ ] **Step 1: Criar src/components/TripCalculator.tsx**

```tsx
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
```

- [ ] **Step 2: Criar src/components/ShareButton.tsx**

```tsx
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
```

- [ ] **Step 3: Criar src/components/History.tsx**

```tsx
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
```

- [ ] **Step 4: Modificar FuelCalculator.astro pra montar History abaixo do form**

No final do template, antes do `<script>`, adicionar:

```astro
import History from './History.tsx';
...
<div class="container-app">
  <History client:idle />
</div>
```

E no final do bloco `<script>` (após popular `resultadoEl.innerHTML`), incluir mount React opcional via dynamic import — mais simples: re-renderizar History após push é dispensável (próxima visita carrega).

Para Trip e Share, adicionar containers no `resultadoEl.innerHTML` e fazer hydration manual:

Substituir o final do handler `submit` (após `resultadoEl.innerHTML = ...`) por:

```js
import('react').then((React) =>
  Promise.all([
    import('react-dom/client'),
    import('./TripCalculator.tsx'),
    import('./ShareButton.tsx'),
  ]).then(([{ createRoot }, Trip, Share]) => {
    const tripMount = document.getElementById('trip-mount');
    const shareMount = document.getElementById('share-mount');
    if (tripMount) {
      createRoot(tripMount).render(
        React.createElement(Trip.default, {
          custoGasolinaKm: cidade.custoGasolinaKm,
          custoEtanolKm: cidade.custoEtanolKm,
          autonomiaGasolina: parseFloat($('ag-cidade').value),
          autonomiaEtanol: parseFloat($('ae-cidade').value),
          tanque,
        })
      );
    }
    if (shareMount) {
      createRoot(shareMount).render(
        React.createElement(Share.default, {
          vehicleSlug: select.value,
          precoGasolina: precoG, precoEtanol: precoE,
        })
      );
    }
  })
);
```

E adicionar no template `resultadoEl.innerHTML`:

```html
<div id="trip-mount"></div>
<div id="share-mount"></div>
```

- [ ] **Step 5: Testar dev — calcular, ver Trip aparecer, share, history**

Run: `npm run dev`
Verificar: após calcular, TripCalculator e ShareButton aparecem; histórico aparece após 2º cálculo + reload.

- [ ] **Step 6: Commit**

```bash
git add src/components/
git commit -m "feat: trip calculator, share and history"
```

---

## Task 10: Página de configurações

**Files:**
- Create: `src/pages/configuracoes.astro`
- Create: `src/components/SettingsPanel.tsx`

- [ ] **Step 1: Criar src/components/SettingsPanel.tsx**

```tsx
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
```

- [ ] **Step 2: Criar src/pages/configuracoes.astro**

```astro
---
import Layout from '../layouts/Layout.astro';
import SEO from '../components/SEO.astro';
import SettingsPanel from '../components/SettingsPanel.tsx';
---
<Layout title="Configurações — Fuel Calc">
  <SEO slot="head"
    title="Configurações — Calculadora de Combustível"
    description="Ajuste a regra dos 70%, gerencie histórico e dados salvos no navegador."
  />
  <section class="container-app pt-8">
    <h1 class="text-3xl font-bold">Configurações</h1>
  </section>
  <SettingsPanel client:load />
</Layout>
```

- [ ] **Step 3: Testar — slider salva, limpar histórico funciona**

Run: `npm run dev` → /configuracoes

- [ ] **Step 4: Commit**

```bash
git add src/pages/configuracoes.astro src/components/SettingsPanel.tsx
git commit -m "feat: settings page with 70% rule slider"
```

---

## Task 11: Página /sobre + 404 + FAQ + JSON-LD home

**Files:**
- Create: `src/pages/sobre.astro`
- Create: `src/pages/404.astro`
- Create: `src/components/FAQ.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Criar src/components/FAQ.astro**

```astro
---
import faq from '../data/faq.json';
---
<section class="container-app mt-10">
  <h2 class="text-2xl font-bold">Perguntas frequentes</h2>
  <div class="mt-4 space-y-3">
    {faq.map((item) => (
      <details class="rounded-md border border-border bg-surface p-4">
        <summary class="cursor-pointer font-semibold">{item.q}</summary>
        <p class="mt-2 text-muted">{item.a}</p>
      </details>
    ))}
  </div>
</section>
```

- [ ] **Step 2: Atualizar src/pages/index.astro com FAQ + JSON-LD**

Adicionar após o FuelCalculator:

```astro
import FAQ from '../components/FAQ.astro';
import faq from '../data/faq.json';
...
const jsonLd = [
  { '@context': 'https://schema.org', '@type': 'WebApplication',
    name: 'Calculadora de Combustível', applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0' } },
  { '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
];
```

E passar `jsonLd` ao `<SEO>`. Renderizar `<FAQ />` antes do AdSlot footer.

- [ ] **Step 3: Criar src/pages/sobre.astro**

```astro
---
import Layout from '../layouts/Layout.astro';
import SEO from '../components/SEO.astro';
---
<Layout title="Sobre — Fuel Calc">
  <SEO slot="head" title="Sobre — Fuel Calc" description="Sobre a Calculadora de Combustível." />
  <section class="container-app py-8 prose prose-invert">
    <h1 class="text-3xl font-bold">Sobre</h1>
    <p class="mt-3 text-muted">Calculadora simples e rápida de etanol vs gasolina, criada por <a class="underline" href="https://www.linkedin.com/in/marcio-lucas/">Márcio Lucas</a>. Sem cadastros, sem coletas, tudo roda no seu navegador.</p>
  </section>
</Layout>
```

- [ ] **Step 4: Criar src/pages/404.astro**

```astro
---
import Layout from '../layouts/Layout.astro';
import SEO from '../components/SEO.astro';
---
<Layout title="Página não encontrada">
  <SEO slot="head" title="404" description="Página não encontrada." />
  <section class="container-app py-16 text-center">
    <h1 class="text-5xl font-bold text-primary">404</h1>
    <p class="mt-3 text-muted">Essa página não existe. Voltar pra <a class="underline text-text" href="/">calculadora</a>.</p>
  </section>
</Layout>
```

- [ ] **Step 5: Build e verificar todas rotas**

Run: `npm run build`
Expected: `dist/index.html`, `dist/sobre/index.html`, `dist/configuracoes/index.html`, `dist/404.html`, `dist/calculadora/<slug>/index.html`, `dist/sitemap-index.xml`

- [ ] **Step 6: Commit**

```bash
git add src/pages/ src/components/FAQ.astro
git commit -m "feat: faq, about, 404 and json-ld"
```

---

## Task 12: SEO técnico — robots, sitemap, OG default, meta refinements

**Files:**
- Create: `public/robots.txt`
- Create: `public/og-default.png` (gerar manualmente ou usar imagem genérica)
- Modify: `astro.config.mjs` (sitemap config)
- Move: assets antigos para `public/` se já não estiverem

- [ ] **Step 1: Criar public/robots.txt**

```
User-agent: *
Allow: /

Sitemap: https://marciioluucas.github.io/sitemap-index.xml
```

- [ ] **Step 2: Mover ícones existentes para public/**

```bash
git mv apple-touch-icon-*.png public/ 2>/dev/null || true
git mv favicon*.* public/ 2>/dev/null || true
git mv mstile-*.png public/ 2>/dev/null || true
git mv ads.txt public/
git mv sitemap.xml public/sitemap-old.xml
```

- [ ] **Step 3: Adicionar og-default.png em public/**

Usar imagem genérica 1200x630 com "Calculadora de Combustível" + cor primary. Pode ser gerada à mão (Canva/Figma) e salva como `public/og-default.png`. Se não houver tempo, usar `favicon-196x196.png` temporariamente.

- [ ] **Step 4: Build verifica sitemap-index.xml**

Run: `npm run build && cat dist/sitemap-index.xml | head -20`
Expected: lista todas rotas com URLs canônicas

- [ ] **Step 5: Commit**

```bash
git add public/ astro.config.mjs
git commit -m "feat: robots, og default and asset migration"
```

---

## Task 13: GitHub Actions deploy

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Criar workflow**

```yaml
name: Deploy

on:
  push:
    branches: [master, main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: ./dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Confirmar GitHub Pages aponta pra GitHub Actions**

Manualmente em: Settings → Pages → Source: GitHub Actions

- [ ] **Step 3: Commit + push**

```bash
git add .github/
git commit -m "ci: deploy via github actions to pages"
git push
```

- [ ] **Step 4: Verificar deploy verde no GitHub**

Aguardar workflow concluir, abrir https://marciioluucas.github.io e validar.

---

## Task 14: QA mobile real e Lighthouse

- [ ] **Step 1: Lighthouse mobile**

Run no Chrome DevTools (modo incognito): https://marciioluucas.github.io
Expected: Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.

Se < 95 em qualquer categoria: corrigir e fazer commit.

- [ ] **Step 2: Validar JSON-LD**

Abrir https://validator.schema.org/ → colar URL.
Expected: WebApplication + FAQPage detectados na home; Vehicle detectado em /calculadora/civic-2018.

- [ ] **Step 3: Testar em iPhone real (Safari) e Android (Chrome)**

Checklist:
- Form preenche e calcula
- Teclado decimal abre nos inputs numéricos
- Botão Calcular alcançável com polegar
- Resultado scrolla suave
- Compartilhar abre share sheet nativo no mobile
- Sem scroll horizontal em 375px width
- Ad placeholder não quebra layout

- [ ] **Step 4: Validar AdSense em produção**

Aguardar 24-48h após deploy. Verificar console por erros do `adsbygoogle.js`. Confirmar slots renderizando (mesmo que placeholder Google) nas 3 posições.

- [ ] **Step 5: Commit qualquer fix**

```bash
git add -A
git commit -m "fix: qa polish from real-device testing"
git push
```

---

## Task 15: Documentação README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Atualizar README**

```markdown
# Calculadora de Combustível v2

Calculadora estática mobile-first para comparar etanol vs gasolina. Astro + Tailwind, hospedada no GitHub Pages.

## Dev

```bash
npm install
npm run dev    # http://localhost:4321
npm test       # vitest
npm run build  # output em dist/
```

## Adicionar veículo

Editar `src/data/vehicles.json`. Cada chave é o slug usado em `/calculadora/[slug]`.

## AdSense

Slots configurados em `src/lib/ads.ts`. Cliente: `ca-pub-4225671400356326`.
- after-hero: `9152601323`
- in-article: `1798901087`
- footer: `2582311903`

Para adicionar slots novos: criar unidade no painel AdSense, copiar `data-ad-slot`, adicionar em `AD_SLOTS`.

## Deploy

Push para `master` dispara GitHub Action que builda e publica em GitHub Pages.
```

- [ ] **Step 2: Commit final**

```bash
git add README.md
git commit -m "docs: update readme for v2"
git push
```

---

## Self-Review Notes

- **Spec coverage:**
  - Stack Astro+Tailwind+TS → Task 1, 2
  - Mobile-first → Task 2 (tokens), 7 (form), 14 (QA)
  - Multi-veículo + Civic preset → Task 5, 7, 8
  - localStorage (meu carro / histórico / settings) → Task 4, 9, 10
  - Cálculo de viagem (c) → Task 9
  - Share (e) → Task 9
  - Regra 70% destacada (f) → Task 7, 10
  - Histórico (a) → Task 9
  - 3 ad slots (h) → Task 4 (constants), 6 (component), 7 (home), 8 (per-vehicle)
  - SEO completo → Task 6 (SEO component), 8 (Vehicle schema), 11 (FAQPage + WebApp), 12 (sitemap, robots, OG)
  - Configurações editáveis → Task 10
  - Lighthouse ≥ 95 + QA mobile real → Task 14
  - GitHub Actions deploy → Task 13

- **Placeholder scan:** sem TBD/TODO. OG image custom é responsabilidade manual (sinalizado no Step 3 da Task 12).

- **Type consistency:** `Combustivel`, `EconomiaInput`, `EconomiaResult`, `StoredVehicle`, `Settings`, `CalcHistoryEntry` definidos uma vez (Task 3, 4) e reutilizados.

- **Open question (não-bloqueante):** OG image dinâmica via Satori foi adiada — usando OG default na v2. Pode virar tarefa futura.

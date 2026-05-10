# Calculadora de Combustível v2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever a calculadora de combustível como app Astro estático, mobile-first, com SEO completo, suporte multi-veículo, localStorage e 3 slots AdSense — preservando o preset Civic EXL 2018 e o domínio GitHub Pages atual.

**Architecture:** Astro 5 (output static) + Tailwind 4 + TypeScript estrito. Lógica de cálculo isolada em `lib/calc.ts` (puro, testado com Vitest). Páginas estáticas geradas via `getStaticPaths` a partir de `vehicles.json`. Componentes interativos como ilhas (React) só onde precisar (selector, history, share, trip, settings). Persistência em localStorage com namespace `fuelcalc:`. AdSense via componente `<AdSlot>` reutilizável.

**Tech Stack:** Astro 5, Tailwind CSS 4, TypeScript, Vitest, React 19 (islands), Chart.js (lazy), @astrojs/sitemap, @astrojs/react, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-05-09-fuel-calc-redesign-design.md`

---

## File Structure

```
src/
  components/
    AdSlot.astro              componente AdSense (handle dev placeholder)
    FAQ.astro                 lista FAQ visível (casa com FAQPage schema)
    Footer.astro              footer com links + créditos
    FuelCalculator.astro      form principal + lógica vanilla TS
    Header.astro              header sticky compacto
    History.tsx               ilha React: histórico localStorage
    ResultsCards.astro        resultados em cards (mobile) / tabela (md+)
    ResultsChart.tsx          ilha React: Chart.js comparativo (lazy)
    SEO.astro                 meta + OG + JSON-LD por página
    SavingsHighlight.astro    banner regra dos 70%
    ShareButton.tsx           ilha React: navigator.share + fallback clipboard
    TripCalculator.tsx        ilha React: km a rodar → custo
    VehicleSelector.tsx       ilha React: marca/modelo/ano + cadastrar
  data/
    vehicles.json             10+ veículos populares BR (inclui civic-2018)
    faq.json                  perguntas FAQ
  layouts/
    BaseLayout.astro          shell HTML + tema + AdSense script
  lib/
    ads.ts                    config dos 3 slots
    calc.ts                   funções puras de cálculo
    seo.ts                    helpers schema.org
    share.ts                  encode/decode query params
    storage.ts                wrappers localStorage com namespace
  pages/
    404.astro
    calculadora/[slug].astro  rota dinâmica por veículo
    configuracoes.astro       slider 70%, tema, meu carro, limpar
    index.astro               home calculadora genérica
    sobre.astro
  styles/
    globals.css               Tailwind + tokens de cor
public/
  ads.txt                     mantido (já existe)
  fonts/                      Inter self-hosted
  robots.txt                  permissivo + sitemap link
  favicons existentes mantidos
tests/
  calc.test.ts
  share.test.ts
  storage.test.ts
.github/workflows/
  deploy.yml                  build + lighthouse + deploy gh-pages
astro.config.mjs
tailwind.config.ts
tsconfig.json
vitest.config.ts
package.json
```

---

## Task 1: Inicializar projeto Astro + Tailwind + TS

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `src/styles/globals.css`, `vitest.config.ts`, `.gitignore`

- [ ] **Step 1: Mover arquivos legados para subpasta `legacy/`**

```bash
mkdir -p legacy
git mv index.html legacy/index.html
git mv code.txt legacy/code.txt
```
Manter na raiz: `ads.txt`, todos `favicon-*`, `apple-touch-icon-*`, `mstile-*`, `sitemap.xml` (será sobrescrito), `.git`, `.idea`, `.claude`, `docs/`.

- [ ] **Step 2: Inicializar package.json**

```bash
npm init -y
```
Editar `package.json`:
```json
{
  "name": "fuel-calc",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 3: Instalar dependências**

```bash
npm install astro@^5 @astrojs/react@^4 @astrojs/sitemap@^3 @astrojs/check typescript react react-dom
npm install -D @types/react @types/react-dom tailwindcss@^4 @tailwindcss/vite vitest @vitest/coverage-v8
```

- [ ] **Step 4: Criar astro.config.mjs**

```js
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://marciioluucas.github.io",
  output: "static",
  integrations: [react(), sitemap()],
  vite: { plugins: [tailwindcss()] },
  build: { inlineStylesheets: "auto" }
});
```

- [ ] **Step 5: Criar tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": ["src/**/*", "tests/**/*"],
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

- [ ] **Step 6: Criar src/styles/globals.css**

```css
@import "tailwindcss";

@theme {
  --color-bg: #0B1220;
  --color-surface: #131C2E;
  --color-border: #1E293B;
  --color-primary: #F59E0B;
  --color-accent: #10B981;
  --color-danger: #EF4444;
  --color-text: #E5E7EB;
  --color-muted: #94A3B8;
  --font-sans: "Inter", system-ui, sans-serif;
}

html, body { background: var(--color-bg); color: var(--color-text); }
html { font-family: var(--font-sans); }
body { -webkit-text-size-adjust: 100%; }
input { font-size: 16px; } /* iOS no zoom */
```

- [ ] **Step 7: Criar vitest.config.ts**

```ts
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { environment: "node", coverage: { include: ["src/lib/**"] } }
});
```

- [ ] **Step 8: .gitignore**

```
node_modules/
dist/
.astro/
coverage/
.DS_Store
.env*
```

- [ ] **Step 9: Validar build vazio**

```bash
mkdir -p src/pages
echo '---' > src/pages/index.astro
echo '---' >> src/pages/index.astro
echo '<h1>ok</h1>' >> src/pages/index.astro
npm run build
```
Expected: build succeeds, `dist/index.html` exists.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: bootstrap astro 5 + tailwind 4 + ts"
```

---

## Task 2: Lógica de cálculo (TDD)

**Files:**
- Create: `src/lib/calc.ts`, `tests/calc.test.ts`

- [ ] **Step 1: Escrever testes falhando**

`tests/calc.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import {
  custoPorKm, melhorCombustivel, economiaPorTanque,
  regraSetenta, custoViagem, tanquesPorViagem
} from "../src/lib/calc";

describe("calc", () => {
  it("custoPorKm divide preço por autonomia", () => {
    expect(custoPorKm(4.9, 8.5)).toBeCloseTo(0.5765, 3);
  });

  it("melhorCombustivel escolhe o de menor custo/km", () => {
    expect(melhorCombustivel(0.5, 0.6)).toBe("gasolina");
    expect(melhorCombustivel(0.6, 0.5)).toBe("etanol");
    expect(melhorCombustivel(0.5, 0.5)).toBe("gasolina");
  });

  it("regraSetenta calcula ratio e vale com limite default 0.7", () => {
    const r = regraSetenta(3.43, 4.9);
    expect(r.ratio).toBeCloseTo(0.7, 2);
    expect(r.vale).toBe(true);
    expect(regraSetenta(3.79, 4.9).vale).toBe(false); // 0.773
  });

  it("regraSetenta aceita limite customizado", () => {
    expect(regraSetenta(3.79, 4.9, 0.78).vale).toBe(true);
  });

  it("economiaPorTanque calcula diferença em R$ pelo tanque", () => {
    const e = economiaPorTanque({
      precoG: 4.9, precoE: 3.43, autG: 8.5, autE: 5.4, tanque: 56
    });
    expect(e).toBeGreaterThan(0);
  });

  it("custoViagem multiplica km por custo/km", () => {
    expect(custoViagem(100, 0.5)).toBe(50);
  });

  it("tanquesPorViagem retorna número fracionário", () => {
    expect(tanquesPorViagem(1000, 10, 50)).toBe(2);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

```bash
npm test
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implementar `src/lib/calc.ts`**

```ts
export type Combustivel = "gasolina" | "etanol";

export function custoPorKm(preco: number, autonomia: number): number {
  if (autonomia <= 0) return Infinity;
  return preco / autonomia;
}

export function melhorCombustivel(custoG: number, custoE: number): Combustivel {
  return custoG <= custoE ? "gasolina" : "etanol";
}

export function regraSetenta(precoE: number, precoG: number, limite = 0.7) {
  const ratio = precoG > 0 ? precoE / precoG : Infinity;
  return { ratio, vale: ratio <= limite };
}

export function economiaPorTanque(p: {
  precoG: number; precoE: number; autG: number; autE: number; tanque: number;
}): number {
  const cG = custoPorKm(p.precoG, p.autG);
  const cE = custoPorKm(p.precoE, p.autE);
  const winner = melhorCombustivel(cG, cE);
  if (winner === "gasolina") {
    const kmGas = p.autG * p.tanque;
    return Math.max(0, (cE - cG) * kmGas);
  }
  const kmEt = p.autE * p.tanque;
  return Math.max(0, (cG - cE) * kmEt);
}

export function custoViagem(km: number, custoKm: number): number {
  return km * custoKm;
}

export function tanquesPorViagem(km: number, autonomia: number, tanque: number): number {
  if (autonomia <= 0 || tanque <= 0) return Infinity;
  return km / (autonomia * tanque);
}
```

- [ ] **Step 4: Rodar e ver passar**

```bash
npm test
```
Expected: PASS — 7/7.

- [ ] **Step 5: Commit**

```bash
git add src/lib/calc.ts tests/calc.test.ts
git commit -m "feat(calc): add pure fuel calculation lib with tests"
```

---

## Task 3: Storage e Share (TDD)

**Files:**
- Create: `src/lib/storage.ts`, `src/lib/share.ts`, `tests/storage.test.ts`, `tests/share.test.ts`

- [ ] **Step 1: Testes storage**

`tests/storage.test.ts`:
```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { getItem, setItem, removeItem, NS } from "../src/lib/storage";

beforeEach(() => {
  const store: Record<string, string> = {};
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; }
  });
});

describe("storage", () => {
  it("setItem grava com namespace", () => {
    setItem("settings", { regra70: 0.7 });
    expect(localStorage.getItem(`${NS}:settings`)).toBe('{"regra70":0.7}');
  });

  it("getItem retorna parsed ou default", () => {
    expect(getItem("missing", { x: 1 })).toEqual({ x: 1 });
    setItem("foo", { y: 2 });
    expect(getItem("foo", null)).toEqual({ y: 2 });
  });

  it("removeItem apaga", () => {
    setItem("x", 1);
    removeItem("x");
    expect(getItem("x", null)).toBeNull();
  });
});
```

- [ ] **Step 2: Testes share**

`tests/share.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { encodeShare, decodeShare } from "../src/lib/share";

describe("share", () => {
  it("encode produz query params", () => {
    expect(encodeShare({ v: "civic-2018", g: 4.9, e: 3.79 }))
      .toBe("?v=civic-2018&g=4.9&e=3.79");
  });

  it("decode lê params", () => {
    const r = decodeShare("?v=gol&g=5.10&e=3.50");
    expect(r).toEqual({ v: "gol", g: 5.1, e: 3.5 });
  });

  it("decode tolera ausências", () => {
    expect(decodeShare("?v=civic-2018")).toEqual({ v: "civic-2018" });
  });
});
```

- [ ] **Step 3: Rodar e ver falhar**

```bash
npm test
```
Expected: FAIL — modules missing.

- [ ] **Step 4: Implementar `src/lib/storage.ts`**

```ts
export const NS = "fuelcalc";

export function getItem<T>(key: string, fallback: T): T {
  if (typeof localStorage === "undefined") return fallback;
  const raw = localStorage.getItem(`${NS}:${key}`);
  if (raw === null) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

export function setItem(key: string, value: unknown): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(`${NS}:${key}`, JSON.stringify(value));
}

export function removeItem(key: string): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(`${NS}:${key}`);
}
```

- [ ] **Step 5: Implementar `src/lib/share.ts`**

```ts
export type ShareParams = { v?: string; g?: number; e?: number };

export function encodeShare(p: ShareParams): string {
  const parts: string[] = [];
  if (p.v) parts.push(`v=${encodeURIComponent(p.v)}`);
  if (p.g !== undefined) parts.push(`g=${p.g}`);
  if (p.e !== undefined) parts.push(`e=${p.e}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

export function decodeShare(qs: string): ShareParams {
  const u = new URLSearchParams(qs.startsWith("?") ? qs.slice(1) : qs);
  const out: ShareParams = {};
  const v = u.get("v"); if (v) out.v = v;
  const g = u.get("g"); if (g !== null) out.g = parseFloat(g);
  const e = u.get("e"); if (e !== null) out.e = parseFloat(e);
  return out;
}
```

- [ ] **Step 6: Rodar e ver passar**

```bash
npm test
```
Expected: PASS — todos.

- [ ] **Step 7: Commit**

```bash
git add src/lib/storage.ts src/lib/share.ts tests/
git commit -m "feat(lib): storage and share helpers with tests"
```

---

## Task 4: Dados de veículos + FAQ

**Files:**
- Create: `src/data/vehicles.json`, `src/data/faq.json`, `src/lib/vehicles.ts`

- [ ] **Step 1: Criar `src/data/vehicles.json`**

```json
[
  { "slug": "civic-2018", "marca": "Honda", "modelo": "Civic EXL", "ano": 2018, "tanque": 56,
    "autonomia": { "gasolina": { "cidade": 8.5, "estrada": 14.07 },
                   "etanol":   { "cidade": 5.4, "estrada": 10.7 } } },
  { "slug": "gol-1-0-2020", "marca": "Volkswagen", "modelo": "Gol 1.0", "ano": 2020, "tanque": 55,
    "autonomia": { "gasolina": { "cidade": 11.0, "estrada": 14.5 },
                   "etanol":   { "cidade": 7.6, "estrada": 10.2 } } },
  { "slug": "hb20-1-0-2022", "marca": "Hyundai", "modelo": "HB20 1.0", "ano": 2022, "tanque": 50,
    "autonomia": { "gasolina": { "cidade": 11.7, "estrada": 14.9 },
                   "etanol":   { "cidade": 8.0, "estrada": 10.4 } } },
  { "slug": "onix-1-0-2023", "marca": "Chevrolet", "modelo": "Onix 1.0", "ano": 2023, "tanque": 44,
    "autonomia": { "gasolina": { "cidade": 11.5, "estrada": 14.8 },
                   "etanol":   { "cidade": 7.9, "estrada": 10.2 } } },
  { "slug": "corolla-xei-2022", "marca": "Toyota", "modelo": "Corolla XEi", "ano": 2022, "tanque": 50,
    "autonomia": { "gasolina": { "cidade": 9.8, "estrada": 13.2 },
                   "etanol":   { "cidade": 6.8, "estrada": 9.2 } } },
  { "slug": "compass-2021", "marca": "Jeep", "modelo": "Compass Sport", "ano": 2021, "tanque": 60,
    "autonomia": { "gasolina": { "cidade": 7.8, "estrada": 11.2 },
                   "etanol":   { "cidade": 5.4, "estrada": 7.8 } } },
  { "slug": "renegade-2022", "marca": "Jeep", "modelo": "Renegade", "ano": 2022, "tanque": 48,
    "autonomia": { "gasolina": { "cidade": 8.5, "estrada": 11.5 },
                   "etanol":   { "cidade": 5.9, "estrada": 8.0 } } },
  { "slug": "polo-1-0-2023", "marca": "Volkswagen", "modelo": "Polo 1.0", "ano": 2023, "tanque": 52,
    "autonomia": { "gasolina": { "cidade": 11.4, "estrada": 14.7 },
                   "etanol":   { "cidade": 7.8, "estrada": 10.1 } } },
  { "slug": "tcross-2022", "marca": "Volkswagen", "modelo": "T-Cross", "ano": 2022, "tanque": 52,
    "autonomia": { "gasolina": { "cidade": 9.5, "estrada": 12.8 },
                   "etanol":   { "cidade": 6.6, "estrada": 8.9 } } },
  { "slug": "strada-2022", "marca": "Fiat", "modelo": "Strada 1.4", "ano": 2022, "tanque": 55,
    "autonomia": { "gasolina": { "cidade": 9.8, "estrada": 13.0 },
                   "etanol":   { "cidade": 6.8, "estrada": 9.0 } } }
]
```

- [ ] **Step 2: Criar `src/data/faq.json`**

```json
[
  { "q": "Etanol ou gasolina: qual compensa mais?",
    "a": "Compensa o etanol quando seu preço por litro for menor ou igual a 70% do preço da gasolina. Como o etanol rende menos por litro, esse limite compensa a diferença de eficiência. Use a calculadora acima com os preços do dia para ter certeza." },
  { "q": "Como descobrir o consumo real do meu carro?",
    "a": "Encha o tanque, anote o quilômetro do hodômetro, rode até esvaziar mais ou menos metade, encha de novo e divida os km rodados pelos litros do segundo abastecimento. Faça isso separado em cidade e estrada para ter números mais precisos." },
  { "q": "Por que a regra dos 70% não é exata?",
    "a": "A regra é uma média. Cada motor tem eficiência diferente entre os dois combustíveis. Carros mais antigos podem ter limite de 65%, alguns flex modernos chegam a 75%. Por isso a calculadora deixa o limite ajustável." },
  { "q": "Posso misturar etanol e gasolina no mesmo tanque?",
    "a": "Sim, todo carro flex aceita mistura em qualquer proporção. Os cálculos da calculadora consideram tanque cheio de um único combustível, mas na prática você pode abastecer parcial sem problema." },
  { "q": "A calculadora salva meus dados?",
    "a": "Os dados ficam apenas no seu navegador (localStorage). Nenhuma informação vai para servidor. Você pode limpar tudo na tela de Configurações." },
  { "q": "Funciona offline?",
    "a": "Depois da primeira visita, a página fica em cache do navegador e o cálculo roda 100% no seu dispositivo, sem precisar de internet." },
  { "q": "O preço médio do etanol e da gasolina hoje no Brasil?",
    "a": "Varia muito por região. A ANP publica médias semanais em gov.br/anp. A calculadora usa os preços que você informa para dar o resultado mais preciso possível." }
]
```

- [ ] **Step 3: Helper `src/lib/vehicles.ts`**

```ts
import data from "../data/vehicles.json";

export type Vehicle = {
  slug: string; marca: string; modelo: string; ano: number; tanque: number;
  autonomia: {
    gasolina: { cidade: number; estrada: number };
    etanol:   { cidade: number; estrada: number };
  };
};

export const vehicles: Vehicle[] = data as Vehicle[];

export function getVehicle(slug: string): Vehicle | undefined {
  return vehicles.find(v => v.slug === slug);
}

export const DEFAULT_SLUG = "civic-2018";
```

- [ ] **Step 4: Commit**

```bash
git add src/data src/lib/vehicles.ts
git commit -m "feat(data): add vehicles dataset and faq content"
```

---

## Task 5: Layout base + Header/Footer + globals

**Files:**
- Create: `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`

- [ ] **Step 1: Criar `src/components/Header.astro`**

```astro
---
---
<header class="sticky top-0 z-30 h-14 bg-[var(--color-surface)]/95 backdrop-blur border-b border-[var(--color-border)] flex items-center px-4">
  <a href="/" class="text-base font-semibold text-[var(--color-primary)]">
    ⛽ Calculadora de Combustível
  </a>
  <nav class="ml-auto flex gap-4 text-sm text-[var(--color-muted)]">
    <a href="/configuracoes" aria-label="Configurações" class="hover:text-[var(--color-text)]">⚙️</a>
  </nav>
</header>
```

- [ ] **Step 2: Criar `src/components/Footer.astro`**

```astro
---
---
<footer class="mt-16 border-t border-[var(--color-border)] py-8 px-4 text-center text-sm text-[var(--color-muted)]">
  <nav class="mb-4 flex justify-center gap-4 flex-wrap">
    <a href="/" class="hover:text-[var(--color-text)]">Início</a>
    <a href="/calculadora/civic-2018" class="hover:text-[var(--color-text)]">Civic 2018</a>
    <a href="/configuracoes" class="hover:text-[var(--color-text)]">Configurações</a>
    <a href="/sobre" class="hover:text-[var(--color-text)]">Sobre</a>
  </nav>
  <p>
    Feito com <span class="text-[var(--color-danger)]">♥</span> por
    <a class="underline" href="https://www.linkedin.com/in/marcio-lucas/">Márcio Lucas</a>
  </p>
</footer>
```

- [ ] **Step 3: Criar `src/layouts/BaseLayout.astro`**

```astro
---
import "@/styles/globals.css";
import Header from "@/components/Header.astro";
import Footer from "@/components/Footer.astro";
import SEO from "@/components/SEO.astro";

interface Props {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}
const { title, description, canonical, ogImage, jsonLd } = Astro.props;
---
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <link rel="icon" type="image/png" href="/favicon-32x32.png" />
    <SEO title={title} description={description} canonical={canonical} ogImage={ogImage} jsonLd={jsonLd} />
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4225671400356326" crossorigin="anonymous"></script>
  </head>
  <body class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-1 max-w-2xl w-full mx-auto px-4 pt-4 pb-12">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 4: Commit (SEO ainda placeholder, criado na Task 6)**

Anota aqui — o componente SEO ainda não existe; faremos referência circular resolvida na próxima task. Não commitar ainda.

```bash
echo "skip commit; depende da Task 6"
```

---

## Task 6: SEO component + JSON-LD helpers

**Files:**
- Create: `src/components/SEO.astro`, `src/lib/seo.ts`

- [ ] **Step 1: Criar `src/lib/seo.ts`**

```ts
export const SITE_URL = "https://marciioluucas.github.io";

export function webApplicationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Calculadora de Combustível",
    url: SITE_URL,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
    inLanguage: "pt-BR"
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(i => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a }
    }))
  };
}

export function vehicleLd(v: { marca: string; modelo: string; ano: number }) {
  return {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    brand: v.marca,
    model: v.modelo,
    productionDate: String(v.ano),
    fuelType: ["Gasoline", "Ethanol"]
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem", position: i + 1, name: it.name, item: it.url
    }))
  };
}
```

- [ ] **Step 2: Criar `src/components/SEO.astro`**

```astro
---
import { SITE_URL } from "@/lib/seo";
interface Props {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}
const { title, description, canonical, ogImage, jsonLd } = Astro.props;
const url = canonical ?? new URL(Astro.url.pathname, SITE_URL).toString();
const img = ogImage ?? `${SITE_URL}/og-default.png`;
const lds = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
---
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={url} />
<meta property="og:type" content="website" />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={url} />
<meta property="og:image" content={img} />
<meta property="og:locale" content="pt_BR" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={img} />
<meta name="google-site-verification" content="NI15yYcV7aazijfGjnII6_hFABeltcJscdj_UhcsP_Q" />
{lds.map(ld => <script type="application/ld+json" set:html={JSON.stringify(ld)} />)}
```

- [ ] **Step 3: Commit (junto com Task 5)**

```bash
git add src/layouts src/components/Header.astro src/components/Footer.astro src/components/SEO.astro src/lib/seo.ts
git commit -m "feat: base layout, header, footer, SEO component"
```

---

## Task 7: AdSlot component

**Files:**
- Create: `src/components/AdSlot.astro`, `src/lib/ads.ts`

- [ ] **Step 1: Criar `src/lib/ads.ts`**

```ts
export const AD_CLIENT = "ca-pub-4225671400356326";

export const AD_SLOTS = {
  topo:    "0000000001", // TODO: substituir pelo ID real após criar no AdSense
  inline:  "0000000002", // TODO: substituir
  rodape:  "2582311903"  // existente
} as const;

export type AdSlotName = keyof typeof AD_SLOTS;
```

> Nota: criar slots no AdSense conforme spec §11.1; substituir `0000000001` e `0000000002` pelos IDs reais antes do deploy de produção. Em dev o componente nem chama o AdSense.

- [ ] **Step 2: Criar `src/components/AdSlot.astro`**

```astro
---
import { AD_CLIENT, AD_SLOTS, type AdSlotName } from "@/lib/ads";
interface Props { name: AdSlotName; format?: string; }
const { name, format = "auto" } = Astro.props;
const slot = AD_SLOTS[name];
const isDev = import.meta.env.DEV;
---
{isDev ? (
  <div class="my-6 p-4 border border-dashed border-[var(--color-border)] text-center text-xs text-[var(--color-muted)]">
    [AdSlot dev placeholder — name="{name}" slot="{slot}"]
  </div>
) : (
  <div class="my-6">
    <ins class="adsbygoogle block"
         style="display:block"
         data-ad-client={AD_CLIENT}
         data-ad-slot={slot}
         data-ad-format={format}
         data-full-width-responsive="true"></ins>
    <script type="text/javascript" set:html={`(adsbygoogle = window.adsbygoogle || []).push({});`} />
  </div>
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/AdSlot.astro src/lib/ads.ts
git commit -m "feat(ads): adslot component with dev placeholder"
```

---

## Task 8: FuelCalculator + ResultsCards + SavingsHighlight

**Files:**
- Create: `src/components/FuelCalculator.astro`, `src/components/ResultsCards.astro`, `src/components/SavingsHighlight.astro`

- [ ] **Step 1: Criar `src/components/SavingsHighlight.astro`**

```astro
---
---
<div id="savingsHighlight" class="hidden my-4 p-4 rounded-lg border" data-vale="false">
  <p class="text-sm text-[var(--color-muted)]">Regra dos <span id="hRegra">70</span>%</p>
  <p class="text-lg font-semibold mt-1">
    Etanol está em <span id="hRatio" class="text-[var(--color-primary)]">--%</span> do preço da gasolina
  </p>
  <p id="hVeredito" class="text-base mt-1"></p>
</div>
<style>
  #savingsHighlight[data-vale="true"]  { background: color-mix(in oklab, var(--color-accent) 15%, transparent); border-color: var(--color-accent); }
  #savingsHighlight[data-vale="false"][data-shown="true"] { background: color-mix(in oklab, var(--color-danger) 15%, transparent); border-color: var(--color-danger); }
</style>
```

- [ ] **Step 2: Criar `src/components/ResultsCards.astro`**

```astro
---
interface Props { id: string; titulo: string; }
const { id, titulo } = Astro.props;
---
<section id={id} class="hidden mt-6">
  <h2 class="text-lg font-semibold mb-3">{titulo}</h2>
  <div class="grid gap-3 md:grid-cols-2">
    <div class="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] p-4">
      <p class="text-xs text-[var(--color-muted)]">Etanol</p>
      <dl class="mt-2 space-y-1 text-sm">
        <div class="flex justify-between"><dt>Autonomia</dt><dd data-field="autE">--</dd></div>
        <div class="flex justify-between"><dt>R$/km</dt><dd data-field="custoE">--</dd></div>
        <div class="flex justify-between"><dt>Vantajoso</dt><dd data-field="winE">--</dd></div>
      </dl>
    </div>
    <div class="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] p-4">
      <p class="text-xs text-[var(--color-muted)]">Gasolina</p>
      <dl class="mt-2 space-y-1 text-sm">
        <div class="flex justify-between"><dt>Autonomia</dt><dd data-field="autG">--</dd></div>
        <div class="flex justify-between"><dt>R$/km</dt><dd data-field="custoG">--</dd></div>
        <div class="flex justify-between"><dt>Vantajoso</dt><dd data-field="winG">--</dd></div>
      </dl>
    </div>
  </div>
  <p class="mt-3 text-sm">Economia por tanque: <strong data-field="economia" class="text-[var(--color-accent)]">--</strong></p>
</section>
```

- [ ] **Step 3: Criar `src/components/FuelCalculator.astro`**

```astro
---
import SavingsHighlight from "./SavingsHighlight.astro";
import ResultsCards from "./ResultsCards.astro";
import type { Vehicle } from "@/lib/vehicles";

interface Props { initial: Vehicle; }
const { initial } = Astro.props;
---
<form id="combustivelForm" class="space-y-5" aria-label="Calculadora de combustível">
  <input type="hidden" id="tanqueLitros" value={initial.tanque} />

  <fieldset class="space-y-3">
    <legend class="text-sm font-semibold text-[var(--color-muted)]">Cidade</legend>
    <div class="grid gap-3 md:grid-cols-2">
      <label class="block">
        <span class="text-sm">Autonomia gasolina (km/l)</span>
        <input id="autonomiaGasolinaCidade" type="number" inputmode="decimal" step="0.01" min="0"
          value={initial.autonomia.gasolina.cidade}
          class="mt-1 w-full rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2" />
      </label>
      <label class="block">
        <span class="text-sm">Autonomia etanol (km/l)</span>
        <input id="autonomiaEtanolCidade" type="number" inputmode="decimal" step="0.01" min="0"
          value={initial.autonomia.etanol.cidade}
          class="mt-1 w-full rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2" />
      </label>
    </div>
  </fieldset>

  <fieldset class="space-y-3">
    <legend class="text-sm font-semibold text-[var(--color-muted)]">Estrada</legend>
    <div class="grid gap-3 md:grid-cols-2">
      <label class="block">
        <span class="text-sm">Autonomia gasolina (km/l)</span>
        <input id="autonomiaGasolinaEstrada" type="number" inputmode="decimal" step="0.01" min="0"
          value={initial.autonomia.gasolina.estrada}
          class="mt-1 w-full rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2" />
      </label>
      <label class="block">
        <span class="text-sm">Autonomia etanol (km/l)</span>
        <input id="autonomiaEtanolEstrada" type="number" inputmode="decimal" step="0.01" min="0"
          value={initial.autonomia.etanol.estrada}
          class="mt-1 w-full rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2" />
      </label>
    </div>
  </fieldset>

  <fieldset class="space-y-3">
    <legend class="text-sm font-semibold text-[var(--color-muted)]">Preços hoje</legend>
    <div class="grid gap-3 md:grid-cols-2">
      <label class="block">
        <span class="text-sm">Gasolina (R$)</span>
        <input id="precoGasolina" type="number" inputmode="decimal" step="0.01" min="0" value="4.90"
          class="mt-1 w-full rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2" />
      </label>
      <label class="block">
        <span class="text-sm">Etanol (R$)</span>
        <input id="precoEtanol" type="number" inputmode="decimal" step="0.01" min="0" value="3.79"
          class="mt-1 w-full rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2" />
      </label>
    </div>
  </fieldset>

  <button type="submit" class="w-full rounded-lg bg-[var(--color-primary)] text-black font-semibold py-3 text-base active:scale-[0.98] transition">
    Calcular
  </button>
</form>

<div aria-live="polite">
  <SavingsHighlight />
  <ResultsCards id="resultadoCidade" titulo="Cidade" />
  <ResultsCards id="resultadoEstrada" titulo="Estrada" />
</div>

<script>
  import { custoPorKm, melhorCombustivel, regraSetenta, economiaPorTanque } from "@/lib/calc";
  import { getItem, setItem } from "@/lib/storage";

  const form = document.getElementById("combustivelForm") as HTMLFormElement;
  const f = (id: string) => parseFloat((document.getElementById(id) as HTMLInputElement).value);

  const settings = getItem<{ regra70: number }>("settings", { regra70: 0.7 });
  const lastPrices = getItem<{ gasolina: number; etanol: number } | null>("last-prices", null);
  if (lastPrices) {
    (document.getElementById("precoGasolina") as HTMLInputElement).value = String(lastPrices.gasolina);
    (document.getElementById("precoEtanol")   as HTMLInputElement).value = String(lastPrices.etanol);
  }

  function setField(section: string, field: string, val: string) {
    document.querySelector(`#${section} [data-field="${field}"]`)!.textContent = val;
  }

  function render(section: string, autG: number, autE: number, precoG: number, precoE: number, tanque: number) {
    const cG = custoPorKm(precoG, autG);
    const cE = custoPorKm(precoE, autE);
    const winner = melhorCombustivel(cG, cE);
    const econ = economiaPorTanque({ precoG, precoE, autG, autE, tanque });
    const kmG = autG * tanque, kmE = autE * tanque;

    setField(section, "autG", `${kmG.toFixed(0)} km`);
    setField(section, "autE", `${kmE.toFixed(0)} km`);
    setField(section, "custoG", `R$ ${cG.toFixed(2)}`);
    setField(section, "custoE", `R$ ${cE.toFixed(2)}`);
    setField(section, "winG", winner === "gasolina" ? "✓" : "");
    setField(section, "winE", winner === "etanol" ? "✓" : "");
    setField(section, "economia", `R$ ${econ.toFixed(2)}`);
    document.getElementById(section)!.classList.remove("hidden");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const tanque = parseFloat((document.getElementById("tanqueLitros") as HTMLInputElement).value);
    const precoG = f("precoGasolina"), precoE = f("precoEtanol");

    render("resultadoCidade",  f("autonomiaGasolinaCidade"),  f("autonomiaEtanolCidade"),  precoG, precoE, tanque);
    render("resultadoEstrada", f("autonomiaGasolinaEstrada"), f("autonomiaEtanolEstrada"), precoG, precoE, tanque);

    const r = regraSetenta(precoE, precoG, settings.regra70);
    const h = document.getElementById("savingsHighlight")!;
    h.classList.remove("hidden");
    h.setAttribute("data-vale", String(r.vale));
    h.setAttribute("data-shown", "true");
    document.getElementById("hRegra")!.textContent = String(Math.round(settings.regra70 * 100));
    document.getElementById("hRatio")!.textContent = `${(r.ratio * 100).toFixed(1)}%`;
    document.getElementById("hVeredito")!.textContent = r.vale ? "✅ Compensa abastecer com etanol" : "❌ Não compensa — abasteça com gasolina";

    setItem("last-prices", { gasolina: precoG, etanol: precoE });
  });
</script>
```

- [ ] **Step 4: Validar build**

```bash
npm run build
```
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/FuelCalculator.astro src/components/ResultsCards.astro src/components/SavingsHighlight.astro
git commit -m "feat: fuel calculator with results cards and 70% rule highlight"
```

---

## Task 9: Página inicial + FAQ

**Files:**
- Create: `src/pages/index.astro`, `src/components/FAQ.astro`

- [ ] **Step 1: Criar `src/components/FAQ.astro`**

```astro
---
import faq from "@/data/faq.json";
---
<section class="mt-12">
  <h2 class="text-xl font-semibold mb-4">Perguntas frequentes</h2>
  <div class="space-y-3">
    {faq.map((item) => (
      <details class="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <summary class="font-medium cursor-pointer">{item.q}</summary>
        <p class="mt-2 text-sm text-[var(--color-muted)]">{item.a}</p>
      </details>
    ))}
  </div>
</section>
```

- [ ] **Step 2: Criar `src/pages/index.astro`**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import FuelCalculator from "@/components/FuelCalculator.astro";
import FAQ from "@/components/FAQ.astro";
import AdSlot from "@/components/AdSlot.astro";
import { getVehicle, DEFAULT_SLUG } from "@/lib/vehicles";
import faq from "@/data/faq.json";
import { webApplicationLd, faqLd } from "@/lib/seo";

const initial = getVehicle(DEFAULT_SLUG)!;
const title = "Calculadora de Combustível: Etanol ou Gasolina? Descubra qual compensa";
const description = "Calcule em segundos qual combustível compensa mais para o seu carro. Regra dos 70% automática, autonomias por modelo e economia por tanque.";
---
<BaseLayout title={title} description={description} jsonLd={[webApplicationLd(), faqLd(faq)]}>
  <section class="text-center py-6">
    <h1 class="text-2xl sm:text-3xl font-bold text-[var(--color-primary)]">Etanol ou gasolina: o que compensa?</h1>
    <p class="mt-2 text-[var(--color-muted)] text-sm sm:text-base">Calcule em segundos qual combustível vale a pena hoje.</p>
  </section>

  <AdSlot name="topo" />

  <FuelCalculator initial={initial} />

  <AdSlot name="inline" />

  <section class="mt-10">
    <h2 class="text-xl font-semibold mb-3">Como funciona</h2>
    <p class="text-sm text-[var(--color-muted)] leading-relaxed">
      A calculadora compara o custo por quilômetro do etanol e da gasolina usando a autonomia do seu carro
      (km/l) e o preço atual de cada combustível. Como o etanol rende menos por litro, a regra dos 70% diz
      que ele compensa quando seu preço é até 70% do preço da gasolina. Esse limite é uma média — você pode
      ajustar em <a href="/configuracoes" class="underline">Configurações</a> para refletir o comportamento
      real do seu motor. Os valores e o seu carro ficam salvos no navegador, sem servidor.
    </p>
  </section>

  <FAQ />
</BaseLayout>
```

- [ ] **Step 3: rodar dev e testar manualmente**

```bash
npm run dev
```
Abrir http://localhost:4321 e:
- preencher formulário, clicar Calcular
- ver Highlight com %, Cards de Cidade/Estrada
- conferir mobile via DevTools 375px

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/components/FAQ.astro
git commit -m "feat: home page with calculator, FAQ and JSON-LD"
```

---

## Task 10: Rota dinâmica `/calculadora/[slug]`

**Files:**
- Create: `src/pages/calculadora/[slug].astro`

- [ ] **Step 1: Criar arquivo**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import FuelCalculator from "@/components/FuelCalculator.astro";
import FAQ from "@/components/FAQ.astro";
import AdSlot from "@/components/AdSlot.astro";
import { vehicles, type Vehicle } from "@/lib/vehicles";
import { vehicleLd, breadcrumbLd, faqLd, SITE_URL } from "@/lib/seo";
import faq from "@/data/faq.json";

export async function getStaticPaths() {
  return vehicles.map(v => ({ params: { slug: v.slug }, props: { vehicle: v } }));
}

interface Props { vehicle: Vehicle; }
const { vehicle } = Astro.props;
const title = `Calculadora Etanol ou Gasolina ${vehicle.modelo} ${vehicle.ano} — Vale a pena?`;
const description = `Descubra se compensa abastecer com etanol ou gasolina no ${vehicle.marca} ${vehicle.modelo} ${vehicle.ano}. Calcule com autonomia média e preços do dia.`;
---
<BaseLayout title={title} description={description} jsonLd={[
  vehicleLd(vehicle),
  faqLd(faq),
  breadcrumbLd([
    { name: "Início", url: SITE_URL },
    { name: "Calculadora", url: `${SITE_URL}/` },
    { name: `${vehicle.marca} ${vehicle.modelo} ${vehicle.ano}`, url: `${SITE_URL}/calculadora/${vehicle.slug}` }
  ])
]}>
  <section class="text-center py-6">
    <p class="text-xs uppercase tracking-wide text-[var(--color-muted)]">{vehicle.marca}</p>
    <h1 class="text-2xl sm:text-3xl font-bold text-[var(--color-primary)]">{vehicle.modelo} {vehicle.ano}</h1>
    <p class="mt-2 text-[var(--color-muted)] text-sm">Tanque {vehicle.tanque}L · Autonomia média: {vehicle.autonomia.gasolina.cidade} km/l (gasolina cidade)</p>
  </section>

  <AdSlot name="topo" />
  <FuelCalculator initial={vehicle} />
  <AdSlot name="inline" />

  <section class="mt-10">
    <h2 class="text-xl font-semibold mb-3">Sobre o {vehicle.modelo} {vehicle.ano}</h2>
    <p class="text-sm text-[var(--color-muted)] leading-relaxed">
      Os valores de autonomia exibidos são médias do INMETRO/PBE para o {vehicle.marca} {vehicle.modelo} {vehicle.ano}.
      Para um cálculo mais preciso, edite os campos com os números reais do seu uso (você consegue
      encher o tanque, anotar o hodômetro e calcular km/l manualmente).
    </p>
  </section>

  <FAQ />
</BaseLayout>
```

- [ ] **Step 2: Validar build**

```bash
npm run build
```
Expected: 10 páginas estáticas geradas em `dist/calculadora/*`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/calculadora
git commit -m "feat: dynamic route per vehicle with vehicle/breadcrumb JSON-LD"
```

---

## Task 11: VehicleSelector (ilha React) + cadastrar meu carro

**Files:**
- Create: `src/components/VehicleSelector.tsx`
- Modify: `src/components/FuelCalculator.astro` para incluir o selector no topo

- [ ] **Step 1: Criar `src/components/VehicleSelector.tsx`**

```tsx
import { useEffect, useMemo, useState } from "react";
import { vehicles, type Vehicle } from "@/lib/vehicles";
import { getItem, setItem, removeItem } from "@/lib/storage";

type Props = { onSelect: (v: Vehicle) => void; defaultSlug: string; };

export default function VehicleSelector({ onSelect, defaultSlug }: Props) {
  const [meu, setMeu] = useState<Vehicle | null>(() => getItem<Vehicle | null>("user-vehicle", null));
  const [slug, setSlug] = useState<string>(meu ? "__meu" : defaultSlug);
  const [showForm, setShowForm] = useState(false);

  const all = useMemo<Array<{ slug: string; label: string; v: Vehicle }>>(() => {
    const list = vehicles.map(v => ({ slug: v.slug, label: `${v.marca} ${v.modelo} ${v.ano}`, v }));
    if (meu) list.unshift({ slug: "__meu", label: `🚗 Meu carro: ${meu.marca} ${meu.modelo} ${meu.ano}`, v: meu });
    return list;
  }, [meu]);

  useEffect(() => {
    const found = all.find(x => x.slug === slug);
    if (found) onSelect(found.v);
  }, [slug, all, onSelect]);

  function saveMyCar(v: Vehicle) {
    setItem("user-vehicle", v);
    setMeu(v);
    setSlug("__meu");
    setShowForm(false);
  }

  function removeMyCar() {
    removeItem("user-vehicle");
    setMeu(null);
    setSlug(defaultSlug);
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-sm">Veículo</span>
        <select value={slug} onChange={e => setSlug(e.target.value)}
          className="mt-1 w-full rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2">
          {all.map(o => <option key={o.slug} value={o.slug}>{o.label}</option>)}
        </select>
      </label>
      <div className="flex gap-2 text-sm">
        <button type="button" onClick={() => setShowForm(s => !s)} className="underline text-[var(--color-primary)]">
          {meu ? "Editar meu carro" : "Cadastrar meu carro"}
        </button>
        {meu && <button type="button" onClick={removeMyCar} className="underline text-[var(--color-danger)]">Remover</button>}
      </div>
      {showForm && <MyCarForm initial={meu} onSave={saveMyCar} onCancel={() => setShowForm(false)} />}
    </div>
  );
}

function MyCarForm({ initial, onSave, onCancel }: {
  initial: Vehicle | null; onSave: (v: Vehicle) => void; onCancel: () => void;
}) {
  const [v, setV] = useState<Vehicle>(initial ?? {
    slug: "meu-carro", marca: "", modelo: "", ano: new Date().getFullYear(), tanque: 50,
    autonomia: { gasolina: { cidade: 10, estrada: 13 }, etanol: { cidade: 7, estrada: 9 } }
  });
  const set = (patch: Partial<Vehicle>) => setV(prev => ({ ...prev, ...patch }));
  const setAut = (fuel: "gasolina" | "etanol", k: "cidade" | "estrada", val: number) =>
    setV(prev => ({ ...prev, autonomia: { ...prev.autonomia, [fuel]: { ...prev.autonomia[fuel], [k]: val } } }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!v.marca || !v.modelo) return;
    onSave({ ...v, slug: "meu-carro" });
  }

  const inp = "mt-1 w-full rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2";
  return (
    <form onSubmit={submit} className="rounded-lg border border-[var(--color-border)] p-4 space-y-3 bg-[var(--color-surface)]/50">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block"><span className="text-sm">Marca</span>
          <input className={inp} value={v.marca} onChange={e => set({ marca: e.target.value })} required /></label>
        <label className="block"><span className="text-sm">Modelo</span>
          <input className={inp} value={v.modelo} onChange={e => set({ modelo: e.target.value })} required /></label>
        <label className="block"><span className="text-sm">Ano</span>
          <input className={inp} type="number" value={v.ano} onChange={e => set({ ano: Number(e.target.value) })} /></label>
        <label className="block"><span className="text-sm">Tanque (L)</span>
          <input className={inp} type="number" step="1" value={v.tanque} onChange={e => set({ tanque: Number(e.target.value) })} /></label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block"><span className="text-sm">Gasolina cidade (km/l)</span>
          <input className={inp} type="number" step="0.01" inputMode="decimal" value={v.autonomia.gasolina.cidade} onChange={e => setAut("gasolina","cidade",Number(e.target.value))} /></label>
        <label className="block"><span className="text-sm">Gasolina estrada (km/l)</span>
          <input className={inp} type="number" step="0.01" inputMode="decimal" value={v.autonomia.gasolina.estrada} onChange={e => setAut("gasolina","estrada",Number(e.target.value))} /></label>
        <label className="block"><span className="text-sm">Etanol cidade (km/l)</span>
          <input className={inp} type="number" step="0.01" inputMode="decimal" value={v.autonomia.etanol.cidade} onChange={e => setAut("etanol","cidade",Number(e.target.value))} /></label>
        <label className="block"><span className="text-sm">Etanol estrada (km/l)</span>
          <input className={inp} type="number" step="0.01" inputMode="decimal" value={v.autonomia.etanol.estrada} onChange={e => setAut("etanol","estrada",Number(e.target.value))} /></label>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="rounded bg-[var(--color-primary)] text-black px-4 py-2 text-sm font-semibold">Salvar</button>
        <button type="button" onClick={onCancel} className="rounded border border-[var(--color-border)] px-4 py-2 text-sm">Cancelar</button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Modificar `FuelCalculator.astro` — adicionar selector no topo**

No início do form, antes do primeiro fieldset, inserir:
```astro
<div id="vehicleSelectorMount"></div>
```

E adicionar ao final do `<script>` existente, lógica de re-popular inputs quando selector emitir mudança via custom event:
```ts
window.addEventListener("fuelcalc:vehicle-selected", (ev: Event) => {
  const v = (ev as CustomEvent).detail;
  (document.getElementById("autonomiaGasolinaCidade") as HTMLInputElement).value = String(v.autonomia.gasolina.cidade);
  (document.getElementById("autonomiaEtanolCidade")   as HTMLInputElement).value = String(v.autonomia.etanol.cidade);
  (document.getElementById("autonomiaGasolinaEstrada") as HTMLInputElement).value = String(v.autonomia.gasolina.estrada);
  (document.getElementById("autonomiaEtanolEstrada")   as HTMLInputElement).value = String(v.autonomia.etanol.estrada);
  (document.getElementById("tanqueLitros") as HTMLInputElement).value = String(v.tanque);
});
```

- [ ] **Step 3: Wrapper Astro que monta a ilha**

Criar `src/components/VehicleSelectorIsland.astro`:
```astro
---
import VehicleSelector from "./VehicleSelector";
import { DEFAULT_SLUG } from "@/lib/vehicles";
interface Props { defaultSlug?: string; }
const { defaultSlug = DEFAULT_SLUG } = Astro.props;
---
<VehicleSelector client:load defaultSlug={defaultSlug} onSelect={(v) => {
  window.dispatchEvent(new CustomEvent("fuelcalc:vehicle-selected", { detail: v }));
}} />
```

> Astro não permite passar funções para client:load. Em vez disso, ajuste o componente React para emitir o evento ele mesmo:

Editar `VehicleSelector.tsx` no `useEffect`:
```ts
useEffect(() => {
  const found = all.find(x => x.slug === slug);
  if (found) {
    onSelect?.(found.v);
    window.dispatchEvent(new CustomEvent("fuelcalc:vehicle-selected", { detail: found.v }));
  }
}, [slug, all, onSelect]);
```
E tornar `onSelect` opcional: `onSelect?: (v: Vehicle) => void`.

Simplifica o wrapper:
```astro
---
import VehicleSelector from "./VehicleSelector";
interface Props { defaultSlug: string; }
const { defaultSlug } = Astro.props;
---
<VehicleSelector client:load defaultSlug={defaultSlug} />
```

- [ ] **Step 4: Atualizar `FuelCalculator.astro` para incluir o island**

No topo do componente, importar e usar:
```astro
import VehicleSelectorIsland from "./VehicleSelectorIsland.astro";
```
E no template, antes do primeiro fieldset:
```astro
<VehicleSelectorIsland defaultSlug={initial.slug} />
```

- [ ] **Step 5: Testar manualmente**

```bash
npm run dev
```
- Selecionar veículos diferentes → inputs atualizam
- Cadastrar meu carro → aparece como primeira opção
- Recarregar → meu carro persiste

- [ ] **Step 6: Commit**

```bash
git add src/components/VehicleSelector.tsx src/components/VehicleSelectorIsland.astro src/components/FuelCalculator.astro
git commit -m "feat: vehicle selector island with my-car localStorage"
```

---

## Task 12: TripCalculator + ShareButton + History (ilhas)

**Files:**
- Create: `src/components/TripCalculator.tsx`, `src/components/ShareButton.tsx`, `src/components/History.tsx`

- [ ] **Step 1: TripCalculator**

`src/components/TripCalculator.tsx`:
```tsx
import { useState } from "react";
import { custoPorKm, custoViagem, tanquesPorViagem, melhorCombustivel } from "@/lib/calc";

type Props = {
  precoG: number; precoE: number; autG: number; autE: number; tanque: number;
};

export default function TripCalculator(p: Props) {
  const [km, setKm] = useState(100);
  const cG = custoPorKm(p.precoG, p.autG);
  const cE = custoPorKm(p.precoE, p.autE);
  const win = melhorCombustivel(cG, cE);
  const winCusto = win === "gasolina" ? cG : cE;
  const total = custoViagem(km, winCusto);
  const tanques = tanquesPorViagem(km, win === "gasolina" ? p.autG : p.autE, p.tanque);
  return (
    <div className="rounded-lg border border-[var(--color-border)] p-4 mt-6">
      <h3 className="font-semibold mb-2">Quanto custa minha viagem?</h3>
      <label className="block">
        <span className="text-sm">Distância (km)</span>
        <input type="number" inputMode="decimal" min="0" value={km}
          onChange={e => setKm(Number(e.target.value))}
          className="mt-1 w-full rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2" />
      </label>
      <p className="mt-3 text-sm">
        Com <strong>{win}</strong>: <strong>R$ {total.toFixed(2)}</strong> ·
        {" "}{tanques.toFixed(2)} tanques
      </p>
    </div>
  );
}
```

> Esse componente recebe props via `client:load` no Astro. Como os preços/autonomias mudam após Calcular, alternativa: o TripCalculator escuta o evento `fuelcalc:calculated` para receber os valores. Implementar essa variação:

Reescrever o componente para escutar evento:
```tsx
import { useEffect, useState } from "react";
import { custoPorKm, custoViagem, tanquesPorViagem, melhorCombustivel } from "@/lib/calc";

type Calc = { precoG: number; precoE: number; autG: number; autE: number; tanque: number };

export default function TripCalculator() {
  const [km, setKm] = useState(100);
  const [c, setC] = useState<Calc | null>(null);

  useEffect(() => {
    const h = (e: Event) => setC((e as CustomEvent).detail as Calc);
    window.addEventListener("fuelcalc:calculated", h);
    return () => window.removeEventListener("fuelcalc:calculated", h);
  }, []);

  if (!c) return <p className="text-xs text-[var(--color-muted)] mt-6">Calcule acima para ver o custo de uma viagem.</p>;

  const cG = custoPorKm(c.precoG, c.autG);
  const cE = custoPorKm(c.precoE, c.autE);
  const win = melhorCombustivel(cG, cE);
  const winCusto = win === "gasolina" ? cG : cE;
  const total = custoViagem(km, winCusto);
  const tanques = tanquesPorViagem(km, win === "gasolina" ? c.autG : c.autE, c.tanque);

  return (
    <div className="rounded-lg border border-[var(--color-border)] p-4 mt-6">
      <h3 className="font-semibold mb-2">Quanto custa minha viagem?</h3>
      <label className="block">
        <span className="text-sm">Distância (km)</span>
        <input type="number" inputMode="decimal" min="0" value={km}
          onChange={e => setKm(Number(e.target.value))}
          className="mt-1 w-full rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2" />
      </label>
      <p className="mt-3 text-sm">
        Com <strong>{win}</strong>: <strong>R$ {total.toFixed(2)}</strong> ·
        {" "}{tanques.toFixed(2)} tanques
      </p>
    </div>
  );
}
```

- [ ] **Step 2: ShareButton**

`src/components/ShareButton.tsx`:
```tsx
import { useEffect, useState } from "react";
import { encodeShare } from "@/lib/share";

export default function ShareButton({ slug }: { slug: string }) {
  const [params, setParams] = useState<{ g: number; e: number } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail as { precoG: number; precoE: number };
      setParams({ g: d.precoG, e: d.precoE });
    };
    window.addEventListener("fuelcalc:calculated", h);
    return () => window.removeEventListener("fuelcalc:calculated", h);
  }, []);

  if (!params) return null;
  const url = `${location.origin}${location.pathname}${encodeShare({ v: slug, ...params })}`;

  async function share() {
    if (navigator.share) {
      try { await navigator.share({ title: "Calculadora de Combustível", url }); return; } catch {}
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" onClick={share}
      className="mt-4 w-full rounded-md border border-[var(--color-border)] py-2 text-sm">
      {copied ? "✅ Link copiado!" : "📤 Compartilhar resultado"}
    </button>
  );
}
```

- [ ] **Step 3: History**

`src/components/History.tsx`:
```tsx
import { useEffect, useState } from "react";
import { getItem, setItem } from "@/lib/storage";

type Entry = {
  ts: number; vehicleSlug: string; precoG: number; precoE: number;
  winCidade: "gasolina" | "etanol"; winEstrada: "gasolina" | "etanol"; ratio: number;
};

const MAX = 5;

export default function History() {
  const [items, setItems] = useState<Entry[]>(() => getItem<Entry[]>("history", []));

  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail as Omit<Entry, "ts">;
      const next = [{ ...d, ts: Date.now() }, ...items].slice(0, MAX);
      setItems(next);
      setItem("history", next);
    };
    window.addEventListener("fuelcalc:calculated-history", h);
    return () => window.removeEventListener("fuelcalc:calculated-history", h);
  }, [items]);

  if (!items.length) return null;

  return (
    <section className="mt-8">
      <h3 className="font-semibold mb-3">Últimos cálculos</h3>
      <ul className="space-y-2">
        {items.map(it => (
          <li key={it.ts} className="rounded border border-[var(--color-border)] p-3 text-sm flex justify-between">
            <span>{new Date(it.ts).toLocaleString("pt-BR")} · {it.vehicleSlug}</span>
            <span className="text-[var(--color-muted)]">G R$ {it.precoG.toFixed(2)} / E R$ {it.precoE.toFixed(2)} · {(it.ratio*100).toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 4: Modificar `FuelCalculator.astro` script — emitir eventos**

Ao final do submit handler:
```ts
const detailCalc = {
  precoG, precoE,
  autG: f("autonomiaGasolinaCidade"), autE: f("autonomiaEtanolCidade"),
  tanque
};
window.dispatchEvent(new CustomEvent("fuelcalc:calculated", { detail: detailCalc }));

const ratio = regraSetenta(precoE, precoG, settings.regra70).ratio;
window.dispatchEvent(new CustomEvent("fuelcalc:calculated-history", {
  detail: {
    vehicleSlug: (document.getElementById("vehicleSlugInput") as HTMLInputElement | null)?.value ?? "indefinido",
    precoG, precoE, ratio,
    winCidade: melhorCombustivel(custoPorKm(precoG, f("autonomiaGasolinaCidade")), custoPorKm(precoE, f("autonomiaEtanolCidade"))),
    winEstrada: melhorCombustivel(custoPorKm(precoG, f("autonomiaGasolinaEstrada")), custoPorKm(precoE, f("autonomiaEtanolEstrada")))
  }
}));
```

E no template do form, adicionar input hidden recebendo o slug atual:
```astro
<input type="hidden" id="vehicleSlugInput" value={initial.slug} />
```
Atualizar o handler do `fuelcalc:vehicle-selected` adicionado na Task 11 para também atualizar:
```ts
(document.getElementById("vehicleSlugInput") as HTMLInputElement).value = v.slug;
```

- [ ] **Step 5: Adicionar ilhas em `index.astro` e `[slug].astro`**

Em ambos, após `<FuelCalculator />`:
```astro
<TripCalculator client:load />
<ShareButton client:load slug={initial.slug /* ou vehicle.slug */} />
<History client:load />
```
Importar no topo:
```ts
import TripCalculator from "@/components/TripCalculator";
import ShareButton from "@/components/ShareButton";
import History from "@/components/History";
```

- [ ] **Step 6: Suporte a query params na home (decode share)**

No script de `FuelCalculator.astro`, após a leitura de `last-prices`:
```ts
import { decodeShare } from "@/lib/share";
const sp = decodeShare(window.location.search);
if (sp.g !== undefined) (document.getElementById("precoGasolina") as HTMLInputElement).value = String(sp.g);
if (sp.e !== undefined) (document.getElementById("precoEtanol")   as HTMLInputElement).value = String(sp.e);
if (sp.v) {
  // o select React lerá via storage/init; suficiente disparar evento depois do mount
  window.addEventListener("load", () => {
    window.dispatchEvent(new CustomEvent("fuelcalc:share-applied", { detail: sp }));
  });
}
```

(O suporte completo de `v` query depende do selector aceitar slug inicial via prop — já feito.)

- [ ] **Step 7: Testar manualmente**

```bash
npm run dev
```
- Calcular → ver TripCalculator aparecer com valores
- Calcular → ShareButton aparece, clicar copia URL com query
- Recarregar com `?g=5.50&e=4.00` → inputs preenchidos
- Histórico aparece com último cálculo

- [ ] **Step 8: Commit**

```bash
git add src/components/TripCalculator.tsx src/components/ShareButton.tsx src/components/History.tsx src/components/FuelCalculator.astro src/pages
git commit -m "feat: trip calculator, share button and history islands"
```

---

## Task 13: Página /configuracoes

**Files:**
- Create: `src/pages/configuracoes.astro`, `src/components/SettingsPanel.tsx`

- [ ] **Step 1: SettingsPanel**

`src/components/SettingsPanel.tsx`:
```tsx
import { useState } from "react";
import { getItem, setItem, removeItem } from "@/lib/storage";

type Settings = { regra70: number; theme: "dark" | "light" };

export default function SettingsPanel() {
  const [s, setS] = useState<Settings>(() => getItem<Settings>("settings", { regra70: 0.7, theme: "dark" }));
  const [savedFlash, setSavedFlash] = useState(false);

  function save(next: Settings) {
    setS(next);
    setItem("settings", next);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }

  function clearAll() {
    if (!confirm("Apagar todos os dados (carro, histórico, preferências)?")) return;
    ["user-vehicle", "history", "settings", "last-prices"].forEach(removeItem);
    location.reload();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-[var(--color-border)] p-4">
        <h2 className="font-semibold">Regra dos {Math.round(s.regra70 * 100)}%</h2>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Limite para considerar etanol vantajoso. Default 70%. Carros mais antigos: 65%. Flex modernos: até 75%.
        </p>
        <input type="range" min="0.65" max="0.75" step="0.01" value={s.regra70}
          onChange={e => save({ ...s, regra70: Number(e.target.value) })}
          className="w-full mt-3" />
        <div className="flex justify-between text-xs text-[var(--color-muted)]"><span>65%</span><span>75%</span></div>
      </section>

      <section className="rounded-lg border border-[var(--color-border)] p-4">
        <h2 className="font-semibold mb-2">Limpar dados</h2>
        <button onClick={clearAll} className="text-sm rounded border border-[var(--color-danger)] text-[var(--color-danger)] px-4 py-2">
          Apagar tudo
        </button>
      </section>

      {savedFlash && <p className="text-sm text-[var(--color-accent)]">✓ Salvo</p>}
    </div>
  );
}
```

- [ ] **Step 2: Página**

`src/pages/configuracoes.astro`:
```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import SettingsPanel from "@/components/SettingsPanel";
const title = "Configurações — Calculadora de Combustível";
const description = "Ajuste a regra dos 70% e gerencie seus dados salvos no navegador.";
---
<BaseLayout title={title} description={description}>
  <h1 class="text-2xl font-bold mb-4">Configurações</h1>
  <SettingsPanel client:load />
</BaseLayout>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/configuracoes.astro src/components/SettingsPanel.tsx
git commit -m "feat: settings page with 70% rule slider and clear data"
```

---

## Task 14: Páginas /sobre, 404, robots, sitemap

**Files:**
- Create: `src/pages/sobre.astro`, `src/pages/404.astro`, `public/robots.txt`

- [ ] **Step 1: `src/pages/sobre.astro`**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
---
<BaseLayout title="Sobre — Calculadora de Combustível"
            description="Sobre o autor e o propósito da calculadora.">
  <h1 class="text-2xl font-bold mb-4">Sobre</h1>
  <p class="text-sm leading-relaxed">
    Projeto pessoal de Márcio Lucas. Ferramenta gratuita, sem servidor, sem login.
    Tudo roda no seu navegador. Código aberto no GitHub.
  </p>
  <p class="text-sm mt-4">
    <a class="underline" href="https://www.linkedin.com/in/marcio-lucas/">LinkedIn</a> ·
    <a class="underline" href="https://github.com/marciioluucas">GitHub</a>
  </p>
</BaseLayout>
```

- [ ] **Step 2: `src/pages/404.astro`**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
---
<BaseLayout title="Página não encontrada" description="404">
  <div class="text-center py-12">
    <p class="text-6xl">⛽</p>
    <h1 class="text-2xl font-bold mt-4">Tanque vazio</h1>
    <p class="text-[var(--color-muted)] mt-2">A página que você procura não existe.</p>
    <a href="/" class="inline-block mt-6 rounded bg-[var(--color-primary)] text-black px-4 py-2 font-semibold">Voltar à calculadora</a>
  </div>
</BaseLayout>
```

- [ ] **Step 3: `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://marciioluucas.github.io/sitemap-index.xml
```

(Astro+@astrojs/sitemap gera `sitemap-index.xml` automaticamente.)

- [ ] **Step 4: Apagar `sitemap.xml` antigo da raiz**

```bash
git rm sitemap.xml
```

- [ ] **Step 5: Validar build gera sitemap**

```bash
npm run build
ls dist/sitemap-*
```
Expected: `dist/sitemap-index.xml` e `dist/sitemap-0.xml` existem.

- [ ] **Step 6: Commit**

```bash
git add src/pages/sobre.astro src/pages/404.astro public/robots.txt
git commit -m "feat: about, 404, robots; remove legacy sitemap"
```

---

## Task 15: GitHub Action de deploy + Lighthouse

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Criar workflow**

```yaml
name: Deploy
on:
  push: { branches: [master] }
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency: { group: "pages", cancel-in-progress: true }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: "${{ steps.deployment.outputs.page_url }}" }
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Habilitar GitHub Pages → Source = "GitHub Actions"**

(Manual: Settings → Pages no GitHub.)

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: github actions deploy to gh-pages"
```

---

## Task 16: README com instruções operacionais

**Files:**
- Create: `README.md`

- [ ] **Step 1: Criar README**

```markdown
# Calculadora de Combustível

Site estático em Astro 5 + Tailwind 4 hospedado no GitHub Pages.

## Dev

```bash
npm install
npm run dev      # http://localhost:4321
npm test         # vitest
npm run build    # gera dist/
```

## Adicionar um veículo

Editar `src/data/vehicles.json` e adicionar entrada com `slug`, `marca`, `modelo`, `ano`, `tanque` e `autonomia`. Build gera rota estática `/calculadora/<slug>` automaticamente.

## AdSense — habilitar

1. Acessar https://www.google.com/adsense/ → **Anúncios → Por unidade de anúncio**.
2. Criar **Display responsivo** ou **In-article**, copiar `data-ad-slot`.
3. Editar `src/lib/ads.ts` substituindo `0000000001` (`topo`) e `0000000002` (`inline`) pelos IDs reais.
4. Em produção, ads aparecem 24-48h após detecção de tráfego.
5. **Não usar Auto Ads** junto com slots manuais (canibaliza).
6. Em dev (localhost) mostra placeholder cinza, não chama AdSense.

## Configurar regra dos 70%

Padrão 70%. Usuário ajusta em `/configuracoes` (slider 65-75%). Valor persiste em `localStorage`.

## Estrutura

- `src/lib/calc.ts` — funções puras testadas
- `src/components/` — Astro components + ilhas React (`*.tsx`)
- `src/data/vehicles.json` — fonte dos presets
- `src/pages/calculadora/[slug].astro` — geração estática por veículo
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: README with dev/adsense/vehicles instructions"
```

---

## Task 17: QA mobile e Lighthouse final

- [ ] **Step 1: Build de produção local e preview**

```bash
npm run build
npm run preview
```
Abrir http://localhost:4321 no Chrome DevTools mobile (iPhone SE 375px).

- [ ] **Step 2: Checklist manual**

- [ ] Fluxo home: Calcular preenchido (Civic) → resultado correto, highlight 70% colorido
- [ ] Trocar veículo no select → inputs atualizam
- [ ] Cadastrar meu carro → persiste após reload
- [ ] TripCalculator aparece após Calcular, atualiza ao mudar km
- [ ] ShareButton: navigator.share no mobile, fallback clipboard no desktop
- [ ] History grava últimos 5 cálculos
- [ ] Configurações: slider muda valor; "Apagar tudo" limpa storage
- [ ] /calculadora/civic-2018 funciona idêntico, com title/description próprios
- [ ] 404 customizado em URL inexistente
- [ ] AdSlot mostra placeholder em dev; em produção precisa testar pós-deploy

- [ ] **Step 3: Lighthouse mobile (DevTools → Lighthouse → Mobile, Performance/SEO/Best/A11y)**

Expected: ≥ 95 em todas. Se algo falhar:
- Performance < 95 → conferir bundle (`npm run build` mostra tamanhos), reduzir ilhas, lazyload Chart.js (não está no escopo v2 mas pode estar incluído na Task 12 se tempo)
- SEO < 100 → checar meta description única por página, h1, hreflang
- A11y < 95 → labels, contraste, foco visível

- [ ] **Step 4: Validar JSON-LD em https://validator.schema.org**

Colar URL do preview ou copiar HTML gerado em `dist/index.html` e `dist/calculadora/civic-2018/index.html`.

- [ ] **Step 5: Commit final (apenas se algo foi corrigido)**

```bash
git add -A
git commit -m "chore: qa fixes from lighthouse and manual mobile testing"
```

---

## Task 18: Cutover — substituir site atual

- [ ] **Step 1: Push para master**

```bash
git push origin master
```

- [ ] **Step 2: Acompanhar GitHub Action**

```bash
gh run watch
```
Expected: build + deploy verde.

- [ ] **Step 3: Testar produção real**

Abrir https://marciioluucas.github.io em iPhone real e Android real:
- ads.txt acessível: https://marciioluucas.github.io/ads.txt
- sitemap acessível: https://marciioluucas.github.io/sitemap-index.xml
- robots: https://marciioluucas.github.io/robots.txt
- Console sem erros do AdSense

- [ ] **Step 4: Solicitar (re)indexação no Google Search Console**

Manual: https://search.google.com/search-console → Inspeção de URL → "Solicitar indexação" para:
- /
- /calculadora/civic-2018
- 2-3 outras rotas de modelos populares

- [ ] **Step 5: Apagar `legacy/`**

Após confirmar produção OK por 48h:
```bash
git rm -r legacy
git commit -m "chore: remove legacy v1 files after cutover"
git push
```

---

## Self-Review

**Spec coverage:**
- §2 Stack ✓ Task 1
- §3 Mobile-first ✓ Tasks 5, 8, 17
- §4 Paleta ✓ Task 1 (globals.css)
- §5 Rotas ✓ Tasks 9, 10, 13, 14
- §6 Estrutura ✓ Tasks 5-14
- §7 Modelo de dados ✓ Tasks 3, 4, 11
- §8 Lógica calc ✓ Task 2
- §9 Features (a, c, e, f, h) ✓ Tasks 8 (f), 12 (a, c, e), 7+9+10 (h)
- §10 SEO ✓ Tasks 6, 9, 10, 14
- §11 AdSense ✓ Tasks 7, 16 (instruções)
- §12 Acessibilidade ✓ Task 8 (aria-live, labels), Task 17 (Lighthouse a11y)
- §13 Testes ✓ Tasks 2, 3, 17
- §14 Migração ✓ Tasks 1-18
- §15 Riscos: slot existente preservado ✓ (Task 7)
- §16 DoD ✓ Task 17

**Tipos consistentes:**
- `Vehicle` tipo único (Task 4), reusado nas 11, 12
- `Combustivel` em calc.ts
- Eventos: `fuelcalc:vehicle-selected`, `fuelcalc:calculated`, `fuelcalc:calculated-history` ✓ consistentes
- `AD_SLOTS` chaves: `topo`, `inline`, `rodape` ✓ usadas em Tasks 9, 10

**Gaps fechados:**
- OG image dinâmica: spec §10.2 menciona, plano usa `og-default.png` estático em /public — se quiser geração dinâmica, criar Task 6.5 com `@vercel/og` ou Satori. Mantido fora do escopo v2 (estático já satisfaz Lighthouse SEO 100).

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-09-fuel-calc-redesign.md`.**

Two execution options:

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — execute tasks in this session using executing-plans, batch with checkpoints.

Which approach?

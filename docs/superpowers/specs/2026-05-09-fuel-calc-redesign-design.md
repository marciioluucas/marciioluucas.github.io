# Calculadora de Combustível v2 — Design Spec

**Data:** 2026-05-09
**Autor:** Márcio Lucas (com Claude)
**Status:** Aprovado para implementação
**Repo:** marciioluucas.github.io (GitHub Pages)

## 1. Contexto e motivação

O projeto atual é um único `index.html` com Materialize 1.0.0 (sem manutenção desde 2017), JavaScript inline e cálculo hardcoded para Honda Civic EXL 2018 (tanque de 56L). SEO é limitado a meta tags básicas e existe um único slot AdSense no final da página.

**Objetivos:**
- Reescrever em stack moderno mantendo deploy estático no GitHub Pages.
- SEO de alto nível (structured data, OG images, sitemap, Core Web Vitals).
- Suportar múltiplos veículos preservando o preset Civic EXL 2018.
- **Mobile-first rigoroso** — base de usuários majoritariamente iPhone/Android.
- Adicionar 3 slots AdSense estratégicos sem poluir UX.
- Configuração da regra dos 70% editável pelo usuário.

**Não-objetivos (v2):**
- Backend, autenticação, contas de usuário.
- Blog (estrutura preparada, conteúdo em fase futura).
- Banner LGPD elaborado (versão simples opcional).
- App nativo / PWA offline-first (apenas meta básica).

## 2. Stack

| Camada | Escolha | Justificativa |
|---|---|---|
| Framework | **Astro 5** (output: static) | HTML estático, zero JS por padrão, SEO ideal, compatível com GitHub Pages |
| Styling | **Tailwind CSS 4** | bundle enxuto, controle total, mobile-first nativo (`sm: md: lg:`) |
| Linguagem | **TypeScript estrito** | segurança em `lib/calc.ts` |
| Charts | **Chart.js** (lazy import) | comparativo etanol vs gasolina, carregado sob demanda |
| Componentes interativos | Astro + Islands (React onde precisar) | minimizar JS no cliente |
| Persistência | `localStorage` puro | sem libs |
| Testes | **Vitest** | cálculos puros |
| Deploy | GitHub Actions → branch `gh-pages` | mantém domínio atual |

**Materialize é removido.**

## 3. Mobile-first — princípios não-negociáveis

- Layout começa em **375px** (iPhone SE) e expande progressivamente.
- Breakpoints: padrão Tailwind (`sm: 640`, `md: 768`, `lg: 1024`).
- Tipografia base 16px (evita zoom automático no iOS em inputs).
- **Inputs numéricos** com `inputmode="decimal"` e `pattern` correto — abre teclado numérico no mobile.
- Botão CTA primário **full-width** no mobile, fixo perto do polegar (área de toque ≥ 44x44px).
- Tabela de resultados vira **cards empilhados** em < 640px (sem scroll horizontal).
- Form numa coluna no mobile, duas colunas a partir de `md:`.
- Imagens responsivas com `srcset` e formato AVIF/WebP.
- Sem hover-only interactions (tudo precisa funcionar em touch).
- Header compacto (sticky, ~56px de altura).
- Performance budget: LCP < 1.5s em **3G simulado**, JS inicial < 30kb.
- Lighthouse mobile ≥ 95 em todas categorias antes do merge.

## 4. Paleta e identidade visual

Tema dark default (vibe painel de carro à noite). Toggle dark/light em /configuracoes.

| Token | Cor | Uso |
|---|---|---|
| `--bg` | `#0B1220` | fundo |
| `--surface` | `#131C2E` | cards |
| `--border` | `#1E293B` | divisores |
| `--primary` | `#F59E0B` (amber) | gasolina, CTAs |
| `--accent` | `#10B981` (emerald) | etanol, "vantajoso" |
| `--danger` | `#EF4444` | "não compensa" |
| `--text` | `#E5E7EB` | texto |
| `--muted` | `#94A3B8` | labels |

Tipografia: **Inter** self-hosted (sem Google Fonts blocking).

## 5. Rotas

```
/                                    Calculadora genérica + hero + FAQ
/calculadora/civic-2018              Preset Civic EXL 2018 (preservado)
/calculadora/[slug]                  Geradas via getStaticPaths a partir de vehicles.json
/configuracoes                       Regra 70% (slider 0.65-0.75), tanque, tema, meu carro
/sobre                               Autor, contato, LinkedIn
/404                                 Custom
```

Modelos iniciais em `vehicles.json`: Civic EXL 2018, Gol 1.0, HB20 1.0, Onix 1.0, Corolla XEi, Compass, Renegade, Polo, T-Cross, Strada — total ~10. Cada slug vira URL estática indexável.

## 6. Estrutura de diretórios

```
src/
  components/
    FuelCalculator.astro
    VehicleSelector.tsx
    ResultsCards.astro          (mobile-first, vira tabela em md+)
    ResultsChart.tsx            (lazy)
    SavingsHighlight.astro
    History.tsx
    TripCalculator.tsx
    ShareButton.tsx
    AdSlot.astro
    SEO.astro
    Header.astro
    Footer.astro
    FAQ.astro
  data/
    vehicles.json
    faq.json
  lib/
    calc.ts
    storage.ts
    seo.ts
    share.ts
  pages/
    index.astro
    calculadora/[slug].astro
    configuracoes.astro
    sobre.astro
    404.astro
  styles/
    globals.css                 (Tailwind + tokens)
public/
  fonts/
  ads.txt                       (mantido)
  robots.txt
  sitemap.xml                   (gerado por @astrojs/sitemap)
tests/
  calc.test.ts
```

## 7. Modelo de dados

```ts
// vehicles.json
type Vehicle = {
  slug: string;
  marca: string;
  modelo: string;
  ano: number;
  tanque: number;
  autonomia: {
    gasolina: { cidade: number; estrada: number };
    etanol:   { cidade: number; estrada: number };
  };
};

// localStorage keys (namespace fuelcalc:)
"fuelcalc:user-vehicle"   → Vehicle | null
"fuelcalc:history"        → CalcResult[] (máx 5, FIFO)
"fuelcalc:settings"       → { regra70: number; theme: "dark"|"light" }
"fuelcalc:last-prices"    → { gasolina: number; etanol: number }

type CalcResult = {
  ts: number;
  vehicleSlug: string;
  prices: { gasolina: number; etanol: number };
  winner: { cidade: "gasolina"|"etanol"; estrada: "gasolina"|"etanol" };
  ratio: number; // preço etanol / preço gasolina
};
```

## 8. Lógica de cálculo (`lib/calc.ts`)

Funções puras testáveis:

```ts
custoPorKm(preco: number, autonomia: number): number
melhorCombustivel(custos): "gasolina" | "etanol"
economiaPorTanque(...): number
regraSetenta(precoEtanol: number, precoGasolina: number, limite=0.7): {
  ratio: number;
  vale: boolean;
}
custoViagem(km: number, custoPorKm: number): number
tanquesPorViagem(km: number, autonomia: number, tanque: number): number
```

Tudo coberto por testes Vitest.

## 9. Features (escopo v2)

### 9.1 Calculadora principal
Mantém form com autonomia cidade/estrada (gasolina + etanol) e preços. Botão "Calcular" exibe resultado em cards (mobile) ou tabela (desktop).

### 9.2 Seletor de veículo
Componente VehicleSelector: dropdowns Marca → Modelo → Ano. Auto-preenche autonomias e tanque. Botão "Cadastrar meu carro" abre modal/seção que salva em `fuelcalc:user-vehicle`. "Meu carro" aparece como primeira opção em sessões futuras.

### 9.3 Histórico
Componente History exibe os últimos 5 cálculos como cards compactos com timestamp relativo ("há 2h"). Cada card pode ser re-aplicado.

### 9.4 Cálculo de viagem
Input "Vou rodar quantos km?" → calcula custo total com o combustível vencedor + nº de tanques + custo total nos dois combustíveis.

### 9.5 Compartilhar
Botão gera URL com query params (`?v=civic-2018&g=4.90&e=3.79`). Usa `navigator.share` quando disponível (mobile), fallback copia pra clipboard. Página inicial lê params e pré-preenche.

### 9.6 Regra dos 70% — destaque
Após calcular, banner destacado: "Etanol está em **68%** do preço da gasolina → ✅ Compensa" (verde) ou "❌ Não compensa" (vermelho). Limite default 0.70, configurável em /configuracoes via slider 0.65–0.75.

### 9.7 Configurações
- Slider regra dos 70% (0.65 a 0.75, step 0.01)
- Toggle tema (dark/light)
- Editar/remover "meu carro"
- Limpar histórico
- Limpar todos os dados

## 10. SEO

### 10.1 Por página (componente SEO.astro)
- `<title>` único e otimizado
- `meta description` único
- Open Graph (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`)
- Twitter Cards (`summary_large_image`)
- `canonical` absoluto
- `lang="pt-BR"`

### 10.2 OG Images dinâmicas
Geradas em build com `@vercel/og` ou Satori (compatível com Astro). 1200x630, mostram modelo do veículo + chamada ("Civic 2018 — vale a pena etanol?").

### 10.3 JSON-LD
- `WebApplication` na home
- `FAQPage` (FAQ visível na home casa com schema)
- `BreadcrumbList` em rotas internas
- `Vehicle` em /calculadora/[slug]

### 10.4 Técnico
- `@astrojs/sitemap` (sitemap.xml automático com prioridades)
- `robots.txt` permitindo tudo, apontando para sitemap
- URLs limpas, sem `.html` nem query strings (queries só pra share)
- Fonts self-hosted, preload das críticas
- Imagens AVIF/WebP via `astro:assets`
- Performance: LCP <1.5s, CLS <0.05, INP <100ms
- Lighthouse mobile ≥ 95 em todas categorias

### 10.5 Conteúdo on-page
- H1 descritivo por página
- Seção "Como funciona" (300-500 palavras, keywords naturais)
- FAQ com 5-7 perguntas comuns ("Etanol ou gasolina?", "Como calcular consumo do meu carro?", "Quando vale a regra dos 70%?", etc)
- Internal linking entre páginas de modelos
- Footer com links pras rotas principais

## 11. AdSense

### 11.1 Como habilitar (instruções operacionais)
1. Acessar https://www.google.com/adsense/ → Anúncios → Por unidade de anúncio.
2. Criar unidades **Display responsivo** ou **In-article** — cada uma gera um `data-ad-slot` numérico.
3. Adicionar slot IDs no array de configuração `src/lib/ads.ts`.
4. Em produção (não funciona em localhost), o Google leva 24–48h após detectar tráfego para servir ads reais.
5. Auto Ads: ligar em "Anúncios → Por site" se quiser. **Não misturar** com slots manuais (canibaliza receita).
6. `ads.txt` já existe (`pub-4225671400356326`) — manter na raiz.

### 11.2 Slots
Cliente atual: `ca-pub-4225671400356326`.

| Posição | Slot ID | Formato | Quando aparece |
|---|---|---|---|
| Após hero, antes do form | criar novo | Display responsivo | Sempre |
| Entre form e resultado | criar novo | In-article | Após primeiro cálculo |
| Final da página | `2582311903` (existente) | Display responsivo | Sempre |

### 11.3 Componente AdSlot
```astro
<AdSlot slot="2582311903" format="auto" responsive />
```
- Encapsula `<ins class="adsbygoogle">` + push.
- Em dev, renderiza placeholder cinza com texto "AdSlot 2582311903" (sem chamar AdSense).
- Carrega script `adsbygoogle.js` uma única vez no Layout principal.

### 11.4 Posicionamento mobile
No mobile o ad in-article fica espaçado (margin vertical >=24px), nunca sobreposto ao CTA, evitando políticas de "accidental clicks".

## 12. Acessibilidade

- WCAG AA mínimo
- Contrastes verificados (paleta dark testada)
- Labels associados a todos inputs
- `aria-live="polite"` na região de resultados (anuncia ao recalcular)
- Foco visível, navegação por teclado
- `prefers-reduced-motion` respeitado

## 13. Testes e qualidade

- **Vitest** cobrindo `lib/calc.ts` (100% das funções puras)
- **Lighthouse CI** rodando no GitHub Action — bloqueia merge se < 95 mobile
- Testes manuais em iPhone real (Safari) e Android (Chrome) antes do release
- HTML validado (W3C)

## 14. Migração — fases ordenadas

1. **Setup Astro + Tailwind + TS** — projeto novo na branch `v2`, scripts de build/dev.
2. **Portar lógica para `lib/calc.ts`** com testes Vitest passando.
3. **Layout base + paleta + Header/Footer** mobile-first.
4. **FuelCalculator** + ResultsCards + Highlight da regra 70%.
5. **VehicleSelector + vehicles.json + rota dinâmica `[slug]`** (Civic preservado).
6. **localStorage**: meu carro, histórico, configurações.
7. **TripCalculator + ShareButton**.
8. **SEO completo**: SEO.astro, JSON-LD, sitemap, robots, OG images.
9. **AdSense**: AdSlot.astro nos 3 pontos, instruções no README.
10. **GitHub Action** de deploy + Lighthouse CI.
11. **QA mobile real** em iPhone e Android.
12. **Cutover**: substitui `index.html` antigo via deploy do Astro.

## 15. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| AdSense bloqueia conta por mudança brusca | Manter slot existente `2582311903`, criar novos progressivamente |
| Quebra de SEO (URLs antigas) | URL canônica `/` mantida; `/civic-2018` → 301 para `/calculadora/civic-2018` |
| Bundle Astro maior que esperado | Lighthouse CI bloqueia, ilhas React só onde necessário |
| OG image generation pesado em build | Cachear, gerar só em produção |

## 16. Definition of Done

- [ ] Lighthouse mobile ≥ 95 nas 4 categorias
- [ ] Vitest verde, cobertura `lib/calc.ts` 100%
- [ ] Testado em iPhone Safari e Android Chrome reais
- [ ] sitemap.xml acessível, robots.txt correto
- [ ] JSON-LD validado em https://validator.schema.org
- [ ] Civic EXL 2018 preset funciona idêntico ao atual
- [ ] AdSense: 3 slots em produção, ads.txt acessível
- [ ] README com instruções de adicionar novos veículos e criar slots de ad
- [ ] Deploy automatizado via GitHub Actions

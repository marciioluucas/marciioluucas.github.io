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

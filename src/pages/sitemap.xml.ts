import type { APIRoute } from 'astro';
import { listVehicles } from '../lib/vehicles';

export const GET: APIRoute = async ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') ?? 'https://marciioluucas.github.io';
  const today = new Date().toISOString().split('T')[0];

  const staticPaths = ['/', '/sobre/', '/privacidade/', '/configuracoes/'];
  const vehiclePaths = listVehicles().map((v) => `/calculadora/${v.slug}/`);
  const allPaths = [...staticPaths, ...vehiclePaths];

  const urlEntries = allPaths
    .map((path) => {
      const priority = path === '/' ? '1.0' : path.startsWith('/calculadora/') ? '0.8' : '0.5';
      return `  <url>
    <loc>${base}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};

import type { APIRoute } from 'astro';
import { renderOgPng } from '../../lib/og';

export const GET: APIRoute = async () => {
  const png = await renderOgPng({
    title: 'Etanol ou gasolina?',
    subtitle: 'Calcule em segundos qual combustível compensa pro seu carro',
  });
  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};

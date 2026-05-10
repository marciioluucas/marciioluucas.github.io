import type { APIRoute, GetStaticPaths } from 'astro';
import { renderOgPng } from '../../lib/og';
import { listVehicles, getVehicle, vehicleTitle } from '../../lib/vehicles';

export const getStaticPaths: GetStaticPaths = () =>
  listVehicles().map((v) => ({ params: { slug: v.slug } }));

export const GET: APIRoute = async ({ params }) => {
  const v = getVehicle(params.slug as string);
  if (!v) return new Response('not found', { status: 404 });
  const png = await renderOgPng({
    badge: `${v.ano}`,
    title: vehicleTitle(v),
    subtitle: 'Etanol ou gasolina? Veja qual compensa.',
  });
  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};

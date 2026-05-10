import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const fontsDir = resolve(process.cwd(), 'src/assets/fonts');
const fontRegular = readFileSync(resolve(fontsDir, 'Inter-Regular.ttf'));
const fontBold = readFileSync(resolve(fontsDir, 'Inter-Bold.ttf'));

export type OgInput = {
  title: string;
  subtitle?: string;
  badge?: string;
};

export async function renderOgPng(input: OgInput): Promise<Buffer> {
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          background: 'linear-gradient(135deg, #0B1220 0%, #131C2E 100%)',
          fontFamily: 'Inter',
          color: '#E5E7EB',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                fontSize: '32px',
                color: '#F59E0B',
                fontWeight: 700,
              },
              children: [
                { type: 'span', props: { children: '⛽' } },
                { type: 'span', props: { children: 'Calculadora de Combustível' } },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              },
              children: [
                input.badge
                  ? {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignSelf: 'flex-start',
                          background: '#10B981',
                          color: '#0B1220',
                          padding: '8px 20px',
                          borderRadius: '999px',
                          fontSize: '24px',
                          fontWeight: 700,
                        },
                        children: input.badge,
                      },
                    }
                  : null,
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '78px',
                      fontWeight: 700,
                      lineHeight: 1.1,
                      color: '#FFFFFF',
                    },
                    children: input.title,
                  },
                },
                input.subtitle
                  ? {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '32px',
                          color: '#94A3B8',
                          fontWeight: 400,
                        },
                        children: input.subtitle,
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '24px',
                color: '#94A3B8',
              },
              children: [
                { type: 'span', props: { children: 'marciioluucas.github.io' } },
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', gap: '32px' },
                    children: [
                      {
                        type: 'span',
                        props: {
                          style: { color: '#F59E0B', fontWeight: 700 },
                          children: 'Gasolina',
                        },
                      },
                      { type: 'span', props: { children: 'vs' } },
                      {
                        type: 'span',
                        props: {
                          style: { color: '#10B981', fontWeight: 700 },
                          children: 'Etanol',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    } as any,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: fontRegular, weight: 400, style: 'normal' },
        { name: 'Inter', data: fontBold, weight: 700, style: 'normal' },
      ],
    }
  );

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  return resvg.render().asPng();
}

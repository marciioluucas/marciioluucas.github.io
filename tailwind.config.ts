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

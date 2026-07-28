import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'oklch(var(--canvas) / <alpha-value>)',
        panel: 'oklch(var(--panel) / <alpha-value>)',
        panel2: 'oklch(var(--panel-2) / <alpha-value>)',
        ink: 'oklch(var(--ink) / <alpha-value>)',
        muted: 'oklch(var(--muted) / <alpha-value>)',
        line: 'oklch(var(--line) / <alpha-value>)',
        accent: 'oklch(var(--accent) / <alpha-value>)',
        accentInk: 'oklch(var(--accent-ink) / <alpha-value>)',
        success: 'oklch(var(--success) / <alpha-value>)',
        danger: 'oklch(var(--danger) / <alpha-value>)',
        warning: 'oklch(var(--warning) / <alpha-value>)'
      },
      boxShadow: {
        soft: '0 18px 50px oklch(0.28 0.02 230 / 0.12)'
      }
    }
  },
  plugins: []
} satisfies Config;


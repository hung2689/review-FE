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
        warning: 'oklch(var(--warning) / <alpha-value>)',
        tealPrimary: 'oklch(var(--color-teal-primary) / <alpha-value>)',
        tealDark: 'oklch(var(--color-teal-dark) / <alpha-value>)',
        tealHover: 'oklch(var(--teal-hover) / <alpha-value>)',
        tealSoft: 'oklch(var(--teal-soft) / <alpha-value>)',
        mint: 'oklch(var(--color-mint) / <alpha-value>)',
        emerald: 'oklch(var(--color-emerald) / <alpha-value>)',
        gold: 'oklch(var(--color-gold) / <alpha-value>)',
        goldPrimary: 'oklch(var(--gold-primary) / <alpha-value>)',
        goldSoft: 'oklch(var(--gold-soft) / <alpha-value>)',
        bgPage: 'oklch(var(--bg-page) / <alpha-value>)',
        bgSurface: 'oklch(var(--bg-surface) / <alpha-value>)',
        bgSurfaceElevated: 'oklch(var(--bg-surface-elevated) / <alpha-value>)',
        bgSurfaceSoft: 'oklch(var(--bg-surface-soft) / <alpha-value>)',
        surface: 'oklch(var(--surface) / <alpha-value>)',
        textPrimary: 'oklch(var(--color-text-primary) / <alpha-value>)',
        textSecondary: 'oklch(var(--color-text-secondary) / <alpha-value>)',
        textMuted: 'oklch(var(--text-muted) / <alpha-value>)',
        borderSubtle: 'oklch(var(--border-subtle) / <alpha-value>)',
        borderStrong: 'oklch(var(--border-strong) / <alpha-value>)'
      },
      borderRadius: {
        card: 'var(--radius-card)'
      },
      boxShadow: {
        soft: '0 18px 50px oklch(0.28 0.02 230 / 0.12)',
        card: 'var(--shadow-card)',
        glow: 'var(--shadow-glow)'
      }
    }
  },
  plugins: []
} satisfies Config;

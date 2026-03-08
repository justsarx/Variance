import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0A0A0A',
        'bg-surface': '#111111',
        'bg-elevated': '#1A1A1A',
        'bg-subtle': '#222222',
        'border-default': '#2A2A2A',
        'border-active': '#3D3D3D',
        'accent': '#F97316',
        'accent-primary': '#F97316',
        'accent-glow': 'rgba(249,115,22,0.15)',
        'text-primary': '#F5F5F5',
        'text-secondary': '#A3A3A3',
        'text-muted': '#525252',
        'success': '#22C55E',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        ui: ['"Inter"', 'sans-serif'],
        display: ['"DM Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
} satisfies Config

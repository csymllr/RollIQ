import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'

export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        'paper-2': 'var(--paper-2)',
        ink: {
          DEFAULT: 'var(--ink)',
          2: 'var(--ink-2)',
          3: 'var(--ink-3)',
        },
        rule: {
          DEFAULT: 'var(--rule)',
          2: 'var(--rule-2)',
        },
        'rq-cyan': {
          DEFAULT: 'var(--cyan)',
          soft: 'var(--cyan-soft)',
        },
        'rq-amber': {
          DEFAULT: 'var(--amber)',
          soft: 'var(--amber-soft)',
        },
        'rq-red': 'var(--red)',
      },
      fontFamily: {
        hand: ['Caveat', 'cursive'],
        label: ['Architects Daughter', 'cursive'],
        display: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [forms],
} satisfies Config

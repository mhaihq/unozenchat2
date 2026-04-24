/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-0':    'var(--bg-0)',
        'bg-000':  'var(--bg-000)',
        'bg-100':  'var(--bg-100)',
        'bg-200':  'var(--bg-200)',
        'bg-300':  'var(--bg-300)',
        'text-100': 'var(--text-100)',
        'text-200': 'var(--text-200)',
        'text-300': 'var(--text-300)',
        'text-400': 'var(--text-400)',
        'text-500': 'var(--text-500)',
        'accent':       'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
      },
      fontFamily: {
        sans:  ['Inter', 'Onest', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
      boxShadow: {
        input:       '0 1px 2px -1px rgba(0,0,0,0.08), 0 2px 8px -2px rgba(0,0,0,0.04)',
        'input-hover':'0 1px 2px -1px rgba(0,0,0,0.08), 0 4px 12px -2px rgba(0,0,0,0.08)',
        'input-focus':'0 0 0 2px rgba(217,119,87,0.1), 0 4px 12px -2px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};

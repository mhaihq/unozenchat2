/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:           '#FAFAF7',
        surface:      '#FFFFFF',
        surface2:     '#F4F2EC',
        border:       'rgba(20,20,20,0.08)',
        'border-strong': 'rgba(20,20,20,0.16)',
        tx:           '#1A1A1A',
        muted:        '#4A4A4A',
        faint:        '#7A7A7A',
        accent:       '#0F6E56',
        'accent-soft':'#E1F5EE',
        'accent-deep':'#04342C',
        'purple-soft':'#EEEDFE',
        'purple-deep':'#3C3489',
        'pink-soft':  '#FBEAF0',
        'pink-deep':  '#993556',
        'blue-soft':  '#E6F1FB',
        'blue-deep':  '#185FA5',
      },
      fontFamily: {
        sans:  ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '1.4', letterSpacing: '0.1em' }],
        xs:    ['11px', { lineHeight: '1.5', letterSpacing: '0.03em' }],
        sm:    ['13px', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        base:  ['14px', { lineHeight: '1.55', letterSpacing: '0.025em' }],
        lg:    ['15px', { lineHeight: '1.5', letterSpacing: '0.02em' }],
        xl:    ['22px', { lineHeight: '1.2', letterSpacing: '0.01em' }],
        '2xl': ['28px', { lineHeight: '1.1', letterSpacing: '0em' }],
        '3xl': ['38px', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
};

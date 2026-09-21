import type { Config } from 'tailwindcss'

/**
 * Tokens de design — ver docs/09-design-system.md
 * As cores são declaradas como variáveis CSS em app/globals.css para
 * permitir tema claro/escuro sem duplicar a paleta.
 */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        azul: {
          50: '#EEF3FF', 100: '#D9E4FF', 200: '#B7CBFF', 300: '#8AA8FF',
          400: '#5A80FB', 500: '#1B4FD8', 600: '#153FAE', 700: '#113186',
          800: '#0D2564', 900: '#0A1B4A',
        },
        coral: {
          50: '#FFF1ED', 100: '#FFDDD3', 200: '#FFBBA8', 300: '#FF957A',
          400: '#FF6B4A', 500: '#F04A24', 600: '#C93917', 700: '#9E2C12',
        },
        mata: { 400: '#34C68F', 500: '#0E9F6E', 600: '#0A7B55' },
        tinta: {
          50: '#F7F8FB', 100: '#EDEFF5', 200: '#DDE1EC', 300: '#B9C0D4',
          400: '#8A93AD', 500: '#5D6782', 600: '#3D465F', 700: '#272E42',
          800: '#171D2E', 900: '#0B1020',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.25rem', '3xl': '1.75rem' },
      boxShadow: {
        card: '0 1px 2px rgba(11,16,32,.04), 0 8px 24px -8px rgba(11,16,32,.12)',
        cardHover: '0 2px 4px rgba(11,16,32,.06), 0 16px 40px -12px rgba(11,16,32,.22)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: { 'fade-up': 'fade-up .5s cubic-bezier(.22,1,.36,1) both' },
    },
  },
  plugins: [],
} satisfies Config

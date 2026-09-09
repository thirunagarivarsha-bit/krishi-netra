/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        earth: {
          50: '#FAF9F6',
          100: '#F4F3EE',
          200: '#E8E5DC',
          300: '#D5D0C2',
          400: '#AFA895',
          500: '#8A826D',
          800: '#3D382B',
          900: '#232018',
        },
        krishi: {
          50: '#F2F8F4',
          100: '#E2EFE7',
          200: '#C5DFD0',
          300: '#99C7AB',
          400: '#67A881',
          500: '#40916C',
          600: '#2D7A4D',
          700: '#20613C',
          800: '#1B4D31',
          900: '#143C26',
          dark: '#0E281A',
        },
        charcoal: {
          50: '#F9FAFA',
          100: '#F1F3F2',
          200: '#E2E6E4',
          500: '#64746D',
          700: '#33413B',
          800: '#212B26',
          900: '#141A17',
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Noto Sans Telugu"', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'card': '0 4px 16px rgba(20, 60, 38, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03)',
        'elevated': '0 10px 30px rgba(20, 60, 38, 0.1), 0 2px 6px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}

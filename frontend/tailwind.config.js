/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pragmatica', 'Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        pelindo: {
          blue:   '#0066CC',
          orange: '#FF6B00',
          dark:   '#003366',
          light:  '#E8F4FD'
        }
      }
    }
  },
  plugins: []
}

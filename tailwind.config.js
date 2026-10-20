/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#141414',
        paper: '#faf9f6',
        stone: '#8a8578',
        // Store accent colour: a store on a plan with custom branding can override --brand.
        moss: 'rgb(var(--brand, 74 82 64) / <alpha-value>)',
        rust: '#a8562e',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

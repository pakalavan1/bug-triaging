/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px -4px rgba(15, 23, 42, 0.12), 0 8px 16px -8px rgba(15, 23, 42, 0.08)',
        lift: '0 12px 40px -12px rgba(15, 23, 42, 0.18)',
      },
    },
  },
  plugins: [],
}

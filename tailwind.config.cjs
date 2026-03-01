/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f8fafc',
          100: '#eef2ff',
          500: '#334155',
          700: '#1e293b'
        }
      }
    }
  },
  plugins: []
};

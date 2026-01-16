/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-green': '#0D5F11',
        'brand-black': '#000000',
        'brand-slate': '#303D3C',
        'brand-teal': '#94A6A5',
      },
    },
  },
  plugins: [],
}

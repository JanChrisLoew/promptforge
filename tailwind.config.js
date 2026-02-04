/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Mulish', 'sans-serif'],
      },
      colors: {
        txt: {
          primary: 'var(--color-txt-primary)',
          secondary: 'var(--color-txt-secondary)',
          muted: 'var(--color-txt-muted)',
        },
        accent: {
          1: 'var(--color-accent-1)',
          2: 'var(--color-accent-2)',
          3: 'var(--color-accent-3)',
        },
        canvas: {
          base: 'var(--color-canvas-base)',
          card: 'var(--color-canvas-card)',
          hover: 'var(--color-canvas-hover)',
        }
      }
    },
  },
  plugins: [],
}
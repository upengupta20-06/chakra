/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        meteor: {
          950: '#070b13',
          900: '#0b1220',
          850: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          cyan: '#06b6d4',
          teal: '#14b8a6',
          amber: '#f59e0b',
          rose: '#f43f5e',
          emerald: '#10b981'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ciudadania: { DEFAULT: '#3B82F6', light: '#EFF6FF', dark: '#1D4ED8' },
        salud:      { DEFAULT: '#10B981', light: '#ECFDF5', dark: '#059669' },
        deporte:    { DEFAULT: '#F97316', light: '#FFF7ED', dark: '#EA580C' },
        sexualidad: { DEFAULT: '#EC4899', light: '#FDF2F8', dark: '#DB2777' },
        arte:       { DEFAULT: '#8B5CF6', light: '#F5F3FF', dark: '#7C3AED' },
      },
    },
  },
  plugins: [],
}

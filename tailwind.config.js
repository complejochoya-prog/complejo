/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "gold": "#fbbf24",
        "action-green": "#22c55e",
        "background-light": "#f8f8f5",
        "background-dark": "#020617",
        "slate-950": "#020617",
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"],
        "inter": ["Inter", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "3xl": "32px", // Master requirement
        "full": "9999px"
      },
    },
  },
  plugins: [],
}
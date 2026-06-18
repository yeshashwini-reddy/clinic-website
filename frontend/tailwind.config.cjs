/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgb(var(--primary-color-rgb) / <alpha-value>)",
          dark: "rgb(var(--primary-hover-rgb) / <alpha-value>)",
          light: "rgb(var(--accent-color-rgb) / <alpha-value>)",
        },
        secondary: "rgb(var(--bg-secondary-rgb) / <alpha-value>)",
        slate: {
          50: "rgb(var(--bg-color-rgb) / <alpha-value>)",
          100: "rgb(var(--border-color-rgb) / <alpha-value>)",
          200: "rgb(var(--border-color-rgb) / <alpha-value>)",
          300: "rgb(var(--text-secondary-rgb) / <alpha-value>)",
          400: "rgb(var(--text-secondary-rgb) / <alpha-value>)",
          500: "rgb(var(--text-secondary-rgb) / <alpha-value>)",
          600: "rgb(var(--text-secondary-rgb) / <alpha-value>)",
          700: "rgb(var(--text-color-rgb) / <alpha-value>)",
          800: "rgb(var(--text-color-rgb) / <alpha-value>)",
          900: "rgb(var(--card-color-rgb) / <alpha-value>)",
        },
        gray: {
          50: "rgb(var(--bg-color-rgb) / <alpha-value>)",
          100: "rgb(var(--border-color-rgb) / <alpha-value>)",
          200: "rgb(var(--border-color-rgb) / <alpha-value>)",
          300: "rgb(var(--text-secondary-rgb) / <alpha-value>)",
          400: "rgb(var(--text-secondary-rgb) / <alpha-value>)",
          500: "rgb(var(--text-secondary-rgb) / <alpha-value>)",
          600: "rgb(var(--text-secondary-rgb) / <alpha-value>)",
          700: "rgb(var(--text-color-rgb) / <alpha-value>)",
          800: "rgb(var(--text-color-rgb) / <alpha-value>)",
          900: "rgb(var(--card-color-rgb) / <alpha-value>)",
        },
        theme: {
          bg: "rgb(var(--bg-color-rgb) / <alpha-value>)",
          "bg-secondary": "rgb(var(--bg-secondary-rgb) / <alpha-value>)",
          card: "rgb(var(--card-color-rgb) / <alpha-value>)",
          navbar: "rgb(var(--navbar-color-rgb) / <alpha-value>)",
          "navbar-scrolled": "rgb(var(--navbar-color-rgb) / <alpha-value>)",
          text: "rgb(var(--text-color-rgb) / <alpha-value>)",
          "text-secondary": "rgb(var(--text-secondary-rgb) / <alpha-value>)",
          border: "rgb(var(--border-color-rgb) / <alpha-value>)",
          accent: "rgb(var(--accent-color-rgb) / <alpha-value>)",
        }
      },
      borderRadius: {
        xl: "12px",
      },
      boxShadow: {
        'theme-shadow': 'var(--shadow-main)',
        'theme-shadow-hover': 'var(--shadow-hover)',
      }
    },
  },
  plugins: [],
};

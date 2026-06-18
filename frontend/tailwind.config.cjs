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
          DEFAULT: "var(--primary-color)",
          dark: "var(--primary-hover)",
          light: "var(--accent-color)",
        },
        secondary: "var(--bg-secondary)",
        slate: {
          50: "var(--bg-color)",
          100: "var(--border-color)",
          200: "var(--border-color)",
          300: "var(--text-secondary)",
          400: "var(--text-secondary)",
          500: "var(--text-secondary)",
          600: "var(--text-secondary)",
          700: "var(--text-color)",
          800: "var(--text-color)",
          900: "var(--card-color)",
        },
        gray: {
          50: "var(--bg-color)",
          100: "var(--border-color)",
          200: "var(--border-color)",
          300: "var(--text-secondary)",
          400: "var(--text-secondary)",
          500: "var(--text-secondary)",
          600: "var(--text-secondary)",
          700: "var(--text-color)",
          800: "var(--text-color)",
          900: "var(--card-color)",
        },
        theme: {
          bg: "var(--bg-color)",
          "bg-secondary": "var(--bg-secondary)",
          card: "var(--card-color)",
          navbar: "var(--navbar-color)",
          "navbar-scrolled": "var(--navbar-scrolled)",
          text: "var(--text-color)",
          "text-secondary": "var(--text-secondary)",
          border: "var(--border-color)",
          accent: "var(--accent-color)",
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

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
          DEFAULT: "#3b82f6", // blue-500
          dark: "#2563eb",   // blue-600
        },
        secondary: "#f3f4f6", // gray-100 as secondary background
      },
      borderRadius: {
        xl: "12px",
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1F2430",
        slate: "#64748B",
        paper: "#F7F6F3",
        indigo: {
          DEFAULT: "#1E1B4B",
          light: "#2D2A6E",
          dark: "#141233",
        },
        amber: {
          DEFAULT: "#F5A623",
          light: "#FDECC8",
        },
        ok: "#16A34A",
        warn: "#D97706",
        bad: "#DC2626",
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

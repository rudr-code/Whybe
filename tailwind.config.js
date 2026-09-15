/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#ECEEE9",
        ink: "#17211C",
        line: "#D6D2C2",
        ledger: {
          DEFAULT: "#2F5D4E",
          dark: "#20423A",
          light: "#E4EBE7",
        },
        brass: {
          DEFAULT: "#B8863C",
          light: "#F3E6CC",
        },
        brick: {
          DEFAULT: "#A13D2E",
          light: "#F3DED9",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        none: "0px",
        sm: "2px",
        DEFAULT: "3px",
      },
    },
  },
  plugins: [],
};

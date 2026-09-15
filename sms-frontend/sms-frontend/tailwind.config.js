/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0A",
        slate: "#737373",
        paper: "#FAFAFA",
        platinum: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          DEFAULT: "#E5E5E5",
        },
        emerald: {
          DEFAULT: "#10B981",
          light: "#34D399",
          dark: "#059669",
          darker: "#047857",
          50: "#ECFDF5",
          100: "#D1FAE5",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
        },
        crimson: {
          DEFAULT: "#DC2626",
          light: "#F87171",
          dark: "#B91C1C",
          50: "#FEF2F2",
          100: "#FEE2E2",
        },
        jet: {
          DEFAULT: "#0A0A0A",
          50: "#262626",
          100: "#171717",
          200: "#1A1A1A",
        },
        ok: "#10B981",
        warn: "#F59E0B",
        bad: "#DC2626",
      },
      fontFamily: {
        heading: ["Outfit", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-right": "slideRight 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideRight: {
          "0%": { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(16, 185, 129, 0.15)" },
          "50%": { boxShadow: "0 0 20px 4px rgba(16, 185, 129, 0.2)" },
        },
      },
    },
  },
  plugins: [],
};

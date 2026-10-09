import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#855970",
          dark: "#6d475c",
          deep: "#57384a",
          light: "#a67f95",
          pale: "#c9a9bb",
        },
        rose: {
          brand: "#DB949F",
          soft: "#f2d3d8",
          pale: "#fae9ec",
        },
        sand: {
          DEFAULT: "#D0B8A8",
          light: "#e6d7c8",
          pale: "#f3ece3",
          cream: "#faf7f2",
        },
        ink: "#3d3238",
        muted: "#8a7a82",
      },
      fontFamily: {
        sans: [
          '"IBM Plex Sans Arabic"',
          "Tajawal",
          '"Segoe UI"',
          "Tahoma",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(85, 60, 75, 0.05), 0 8px 28px -12px rgba(133, 89, 112, 0.22)",
        "card-hover":
          "0 2px 4px rgba(85, 60, 75, 0.06), 0 18px 44px -14px rgba(133, 89, 112, 0.32)",
        glow: "0 0 0 3px rgba(219, 148, 159, 0.22), 0 12px 34px -10px rgba(219, 148, 159, 0.45)",
        live: "0 0 0 3px rgba(133, 89, 112, 0.16), 0 14px 38px -12px rgba(133, 89, 112, 0.5)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "soft-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(0.8)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "soft-pulse": "soft-pulse 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

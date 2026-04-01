import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7f4",
          100: "#d9ede2",
          200: "#b5dbc7",
          300: "#85c2a5",
          400: "#5ba886",
          500: "#3d8d6c",
          600: "#2d7156",
          700: "#265b47",
          800: "#21493a",
          900: "#1d3d31",
          950: "#0f221b",
        },
        accent: {
          50: "#fdf8f0",
          100: "#f9eddb",
          200: "#f2d8b5",
          300: "#e9bc85",
          400: "#df9a53",
          500: "#d88032",
          600: "#c96828",
          700: "#a75023",
          800: "#864122",
          900: "#6d371e",
          950: "#3a1b0e",
        },
        calm: {
          50: "#f5f7fa",
          100: "#ebeef3",
          200: "#d2d9e5",
          300: "#aab8cf",
          400: "#7c93b4",
          500: "#5c769c",
          600: "#485e82",
          700: "#3b4d6a",
          800: "#334259",
          900: "#2e3a4c",
          950: "#1f2633",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        heading: [
          "var(--font-heading)",
          "Georgia",
          "serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;

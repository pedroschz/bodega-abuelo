import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wine: {
          50: "#fbeaea",
          100: "#f3c9c9",
          200: "#e69a9a",
          300: "#d56a6a",
          400: "#b94545",
          500: "#8e1b2b",
          600: "#6f1320",
          700: "#561019",
          800: "#3d0a11",
          900: "#26060a",
          950: "#170306",
        },
        wood: {
          50: "#f7efe2",
          100: "#ecdcc0",
          200: "#d8b88a",
          300: "#c19560",
          400: "#a37642",
          500: "#825a31",
          600: "#674527",
          700: "#4d3320",
          800: "#36241a",
          900: "#241710",
        },
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "Georgia", "serif"],
      },
      boxShadow: {
        cellar: "0 8px 30px rgba(0,0,0,0.45)",
      },
    },
  },
  plugins: [],
};

export default config;

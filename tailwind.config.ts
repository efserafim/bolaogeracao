import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d9ecff",
          200: "#bcddff",
          300: "#8ec8ff",
          400: "#59a8ff",
          500: "#3385fc",
          600: "#1d66f1",
          700: "#1650de",
          800: "#1842b4",
          900: "#1a3c8e",
          950: "#142657",
        },
        accent: {
          400: "#ffc24b",
          500: "#ffaf1f",
          600: "#f59300",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pop": {
          "0%": { transform: "scale(0.96)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out both",
        "pop": "pop 0.3s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;

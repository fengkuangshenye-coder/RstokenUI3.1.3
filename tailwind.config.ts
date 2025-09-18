import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(214 32% 22%)",
        input: "hsl(214 32% 22%)",
        ring: "hsl(199 89% 48%)",
        background: "hsl(222 47% 11%)",
        foreground: "hsl(210 40% 98%)",
        primary: {
          DEFAULT: "hsl(199 89% 48%)",
          foreground: "hsl(222 47% 11%)",
        },
        secondary: {
          DEFAULT: "hsl(226 70% 55%)",
          foreground: "hsl(210 40% 98%)",
        },
        muted: {
          DEFAULT: "hsl(217 33% 17%)",
          foreground: "hsl(215 20% 65%)",
        },
        card: {
          DEFAULT: "hsl(217 33% 14%)",
          foreground: "hsl(210 40% 98%)",
        },
        accent: {
          DEFAULT: "hsl(188 94% 43%)",
          foreground: "hsl(210 40% 98%)",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        glow: "0 0 32px rgba(34,211,238,.35), inset 0 0 12px rgba(255,255,255,.15)",
      },
    },
  },
  plugins: [],
} satisfies Config;



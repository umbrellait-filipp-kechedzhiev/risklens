import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "#d8dee8",
        background: "#f7f9fc",
        foreground: "#172033",
        muted: "#667085",
        primary: "#14532d",
        accent: "#0f766e"
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(16, 24, 40, 0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;

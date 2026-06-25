import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "#d9e4f7",
        background: "#f4f7ff",
        foreground: "#061532",
        muted: "#61708a",
        primary: "#0050ff",
        accent: "#0038b8"
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(6, 21, 50, 0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;

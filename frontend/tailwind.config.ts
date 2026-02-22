import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "hsl(var(--bg))",
        card: "hsl(var(--card))",
        text: "hsl(var(--text))",
        muted: "hsl(var(--muted))",
        accent: "hsl(var(--accent))",
        low: "hsl(var(--low))",
        medium: "hsl(var(--medium))",
        high: "hsl(var(--high))",
      },
      boxShadow: {
        panel: "0 12px 40px rgba(13, 17, 23, 0.12)",
      },
      backgroundImage: {
        grid: "radial-gradient(circle at 1px 1px, rgba(132, 146, 166, 0.2) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};

export default config;

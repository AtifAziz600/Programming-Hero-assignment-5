import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb", // Blue
          light: "#3b82f6",
          dark: "#1d4ed8",
          50: "#eff6ff",
          100: "#dbeafe",
        },
        secondary: {
          DEFAULT: "#dc2626", // Red
          light: "#ef4444",
          dark: "#b91c1c",
          50: "#fef2f2",
          100: "#fee2e2",
        },
        tertiary: {
          DEFAULT: "#eab308", // Yellow
          light: "#facc15",
          dark: "#ca8a04",
          50: "#fefce8",
          100: "#fef9c3",
        },
        quaternary: {
          DEFAULT: "#ffffff", // White
          light: "#f8fafc",
          dark: "#f1f5f9",
        },
        dark: "#0f172a",
      },
    },
  },
  plugins: [],
};
export default config;
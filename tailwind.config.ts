import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1D5A8C",       // Dark Blue
        secondary: "#2BB3B6",     // Teal
        accent: "#E89D3E",        // Orange
        success: "#3A9C77",       // Green
        highlight: "#F4CD53",     // Yellow
      },
    },
  },
  plugins: [],
};
export default config;

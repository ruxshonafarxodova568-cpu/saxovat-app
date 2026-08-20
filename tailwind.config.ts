import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        teal: { 900: "#0B3B36", 700: "#0E6B5D", 600: "#128A76" },
        mint: { 100: "#E9F3EC" },
        cream: { 50: "#FBF7EC" },
        amber: { 500: "#D3A24B" },
        ink: { DEFAULT: "#16231F", soft: "#4B5C56" },
        line: { DEFAULT: "#D9E4DD" },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: { xl2: "18px" },
    },
  },
  plugins: [],
};
export default config;

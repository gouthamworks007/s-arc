import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: "#171717",
          dark: "#101010",
          light: "#262626",
          surface: "#1f1f1f",
        },
        warm: {
          grey: "#F5F4F1",
          border: "#E8E6E2",
          card: "#FAFAF9",
          muted: "#EDECE8",
        },
        copper: {
          DEFAULT: "#AD8065",
          hover: "#996F56",
          dark: "#875F49",
          light: "#C59B81",
          subtle: "#F6F1ED",
        },
        mutedText: "#777777",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Space Grotesk", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
        heading: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
        display: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
      },
      letterSpacing: {
        widestExtra: "0.2em",
        architectural: "0.15em",
        tightStructured: "-0.015em",
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
        card: "0 10px 30px -10px rgba(0, 0, 0, 0.05)",
        floating: "0 20px 40px -15px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;

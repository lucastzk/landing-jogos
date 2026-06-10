import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./config/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "#070708",
        night: "#0c0c0e",
        panel: "#121215",
        line: "#212126",
        bone: "#f4f3f0",
        red: {
          400: "#ff5a5a",
          500: "#ff3535",
          600: "#f01010",
          700: "#c20810",
        },
      },
      fontFamily: {
        // Display marcante (Space Grotesk) para títulos; Sora para o corpo
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tight: "-0.02em",
        tighter: "-0.035em",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      boxShadow: {
        soft: "0 24px 70px -24px rgba(0, 0, 0, 0.7)",
        red: "0 20px 60px -16px rgba(240, 16, 16, 0.5)",
        "red-soft": "0 16px 50px -20px rgba(255, 53, 53, 0.55)",
      },
      keyframes: {
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-18px)" },
        },
        "float-x": {
          "0%, 100%": { transform: "translate(0,0)" },
          "50%": { transform: "translate(28px,-24px)" },
        },
        aurora: {
          "0%, 100%": { transform: "translate(0,0) scale(1)", opacity: "0.7" },
          "50%": { transform: "translate(40px,-30px) scale(1.15)", opacity: "1" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        blink: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.3" } },
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        float: "float 7s ease-in-out infinite",
        "float-slow": "float 11s ease-in-out infinite",
        "float-x": "float-x 16s ease-in-out infinite",
        aurora: "aurora 14s ease-in-out infinite",
        "gradient-pan": "gradient-pan 7s ease infinite",
        blink: "blink 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

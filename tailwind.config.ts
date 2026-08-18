import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#08080A",
        panel: "#121214",
        panel2: "#17171B",
        line: "#232328",
        ambar: "#F5A623",
        ambarsoft: "#FFC46B",
        texto: "#F4F4F6",
        mute: "#8A8A94",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        subir: {
          "0%": { opacity: "0", transform: "translateY(14px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        latir: {
          "0%,100%": { opacity: "0.35" },
          "50%": { opacity: "0.85" },
        },
      },
      animation: {
        subir: "subir 340ms cubic-bezier(0.22,1,0.36,1) both",
        latir: "latir 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;

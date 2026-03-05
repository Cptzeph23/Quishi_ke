/**
 * FILE:     frontend/tailwind.config.js
 * PURPOSE:  Tailwind CSS config — custom colours, fonts, shadows, animations
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Brand colour scale ──────────────────────────────────────────────
      colors: {
        brand: {
          50:  "#f0f4ff",
          100: "#dde6ff",
          200: "#c4d1ff",
          300: "#a4b8fb",
          400: "#7b96f7",
          500: "#4f6ef7",   // primary action
          600: "#3451e8",   // hover
          700: "#2a40cc",
          800: "#1e2fa0",
          900: "#172175",
        },
      },

      // ── Custom fonts (loaded in globals.css via Google Fonts) ───────────
      fontFamily: {
        sans:    ["var(--font-dm-sans)",   "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia",   "serif"],
      },

      // ── Elevation shadows ───────────────────────────────────────────────
      boxShadow: {
        card:      "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        "card-lg": "0 4px 12px rgba(0,0,0,0.08), 0 12px 40px rgba(0,0,0,0.08)",
        glass:     "0 8px 32px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.12)",
      },

      // ── Entrance animations ─────────────────────────────────────────────
      animation: {
        "fade-up":   "fadeUp 0.5s ease forwards",
        "fade-in":   "fadeIn 0.3s ease forwards",
        "slide-in":  "slideIn 0.4s ease forwards",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%":   { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },

      // ── Border radius extras ────────────────────────────────────────────
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
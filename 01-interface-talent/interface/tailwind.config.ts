// @improved Configure Tailwind content scope, dark mode, and forms plugin via ESM-friendly config
import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [forms],
};

export default config;

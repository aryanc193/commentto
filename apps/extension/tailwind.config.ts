import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx,html}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;

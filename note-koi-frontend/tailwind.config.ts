import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        state: {
          pending: "#f59e0b",
          in_review: "#2563eb",
          approved: "#16a34a",
          rejected: "#dc2626",
          superseded: "#64748b",
          del_requested: "#f97316",
          deleted: "#475569"
        },
        visibility: {
          platform: "#8b5cf6",
          college: "#64748b"
        }
      }
    }
  },
  plugins: []
};

export default config;

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
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: '#520C77',
          50: '#F4EBF7',
          100: '#E8D7EF',
          500: '#520C77',
          600: '#430A62',
          700: '#34084D',
        },
        accent: {
          DEFAULT: '#9E26B5',
          500: '#9E26B5',
          600: '#8B1FA0',
        },
      },
    },
  },
  plugins: [],
};
export default config;

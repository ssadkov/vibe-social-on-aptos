/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./frontend/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0db9f2",
        "background-light": "#f5f8f8",
        "background-dark": "#101e22",
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};

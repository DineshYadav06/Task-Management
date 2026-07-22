/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1600px",
      },
    },
    extend: {
      colors: {
        border: "var(--border)",
        divider: "var(--divider)",
        input: "var(--border)",
        ring: "var(--primary)",
        background: "var(--background)",
        sidebar: "var(--sidebar)",
        navbar: "var(--navbar)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--foreground)",
        },
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          pressed: "var(--primary-pressed)",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground, #0F172A)",
        },
        destructive: {
          DEFAULT: "var(--danger)",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "var(--success)",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "var(--warning)",
          foreground: "#FFFFFF",
        },
        danger: {
          DEFAULT: "var(--danger)",
          foreground: "#FFFFFF",
        },
        purple: {
          DEFAULT: "var(--purple)",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted)",
          bg: "var(--muted-bg)",
        },
        accent: {
          DEFAULT: "var(--muted-bg)",
          foreground: "var(--heading)",
        },
        popover: {
          DEFAULT: "var(--surface)",
          foreground: "var(--foreground)",
        },
        // Direct exact hex aliases for rapid utility application
        brand: {
          bg: "#F8FAFC",
          sidebar: "#FFFFFF",
          navbar: "#FFFFFF",
          card: "#FFFFFF",
          surface: "#FFFFFF",
          primary: "#2563EB",
          hover: "#1D4ED8",
          pressed: "#1E40AF",
          slate: "#64748B",
          gray: "#94A3B8",
          border: "#E2E8F0",
          divider: "#CBD5E1",
        },
        status: {
          success: "#22C55E",
          warning: "#F59E0B",
          danger: "#EF4444",
          purple: "#8B5CF6",
          info: "#3B82F6",
        },
        text: {
          DEFAULT: "#0F172A",
          heading: "#0F172A",
          secondary: "#64748B",
          body: "#0F172A",
          muted: "#64748B",
          disabled: "#94A3B8",
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        xl: "12px",
        lg: "10px",
        md: "8px",
        sm: "6px",
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'sm': '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'md': '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        'lg': '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
        'card': '0 1px 3px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03)',
        'card-hover': '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fadeIn": "fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
}

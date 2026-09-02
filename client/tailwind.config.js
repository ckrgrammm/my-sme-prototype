/** @type {import('tailwindcss').Config} */
function rgb(varName) {
  return `rgb(var(${varName}) / <alpha-value>)`;
}

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    container: { center: true, padding: '2rem' },
    extend: {
      colors: {
        border: rgb('--border'),
        input: rgb('--input'),
        ring: rgb('--ring'),
        background: rgb('--background'),
        foreground: rgb('--foreground'),
        muted: {
          DEFAULT: rgb('--muted'),
          foreground: rgb('--muted-foreground'),
        },
        card: {
          DEFAULT: rgb('--card'),
          foreground: rgb('--card-foreground'),
        },
        primary: {
          DEFAULT: rgb('--primary'),
          foreground: rgb('--primary-foreground'),
        },
        secondary: {
          DEFAULT: rgb('--secondary'),
          foreground: rgb('--secondary-foreground'),
        },
        success: {
          DEFAULT: rgb('--success'),
          foreground: rgb('--success-foreground'),
        },
        warning: {
          DEFAULT: rgb('--warning'),
          foreground: rgb('--warning-foreground'),
        },
        destructive: {
          DEFAULT: rgb('--destructive'),
          foreground: rgb('--destructive-foreground'),
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 3px)',
        sm: 'calc(var(--radius) - 5px)',
        xl: 'calc(var(--radius) + 5px)',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.05), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
        popover: '0 10px 30px -5px rgb(0 0 0 / 0.15), 0 4px 10px -6px rgb(0 0 0 / 0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '"PingFang SC"', '"Microsoft YaHei"', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

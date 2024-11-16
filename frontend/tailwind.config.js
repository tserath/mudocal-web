// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ffffff',
          dark: '#1A1B1E',
        },
        secondary: {
          DEFAULT: '#f3f4f6',
          dark: '#25262B',
        },
        accent: {
          DEFAULT: '#2563eb',
          dark: '#2C2E33',
          hover: {
            DEFAULT: '#1d4ed8',
            dark: '#373A40'
          }
        },
        border: {
          DEFAULT: '#e5e7eb',
          dark: '#373A40',
        },
        text: {
          DEFAULT: '#111827',
          dark: '#A6A7AB',
          muted: {
            DEFAULT: '#6b7280',
            dark: '#909296'
          }
        }
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        smooth: '200ms',
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
};
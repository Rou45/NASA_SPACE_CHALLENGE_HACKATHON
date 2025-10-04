/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        nasa: {
          blue: '#0B3D91',
          red: '#FC3D21',
          gray: '#5C6670',
          silver: '#C4C4C4',
        },
        mars: {
          50: '#fef7f7',
          100: '#fcecec',
          200: '#f9dcdc',
          300: '#f4c0c0',
          400: '#ed9595',
          500: '#e47070',
          600: '#d14747',
          700: '#b03636',
          800: '#922f2f',
          900: '#7a2c2c',
          950: '#421313',
        }
      },
      fontFamily: {
        space: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'orbit': 'orbit 20s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(50px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(50px) rotate(-360deg)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(14, 165, 233, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(14, 165, 233, 0.8)' },
        }
      },
      gridTemplateColumns: {
        'layout': 'minmax(300px, 1fr) 3fr minmax(300px, 1fr)',
      }
    },
  },
  plugins: [],
}
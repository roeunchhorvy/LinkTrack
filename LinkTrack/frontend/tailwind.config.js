/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // class-based dark mode so we can toggle with a button (see ThemeContext)
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#b7cdff',
          300: '#8aafff',
          400: '#5a8bff',
          500: '#3669ff',
          600: '#234ee0',
          700: '#1d3eb4',
          800: '#1c358d',
          900: '#1a306f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

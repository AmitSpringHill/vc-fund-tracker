/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        springhill: {
          accent: '#6b7280', // Gray-500
          'accent-hover': '#4b5563', // Gray-600
        },
      },
    },
  },
  plugins: [],
}
